import json
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks

from models import Repository, PullRequest, AnalysisReport
from github_client import GitHubClient
from bob_analyzer import BobAnalyzer
from security import decrypt_secret

github_client = GitHubClient()
bob_analyzer = BobAnalyzer()

def handle_pull_request_event(payload: Dict[str, Any], db: Session, background_tasks: BackgroundTasks) -> Dict[str, str]:
    """
    Handle incoming GitHub pull request webhook events.
    
    Args:
        payload: The webhook payload from GitHub
        db: Database session
        background_tasks: FastAPI background tasks
        
    Returns:
        Response dictionary with status
    """
    action = payload.get("action")
    
    if action not in ["opened", "synchronize", "reopened"]:
        return {"status": "ignored", "reason": f"Action '{action}' not handled"}
    
    pr_data = payload.get("pull_request", {})
    repo_data = payload.get("repository", {})
    
    pr_number = pr_data.get("number") or payload.get("number")
    pr_title = pr_data.get("title", "Untitled PR")
    pr_author = pr_data.get("user", {}).get("login", "unknown")
    pr_url = pr_data.get("html_url", "")
    base_branch = pr_data.get("base", {}).get("ref", "main")
    head_branch = pr_data.get("head", {}).get("ref", "feature")
    
    repo_owner = repo_data.get("owner", {}).get("login", "")
    repo_name = repo_data.get("name", "")
    
    repository = db.query(Repository).filter(
        Repository.github_owner == repo_owner,
        Repository.github_repo == repo_name
    ).first()
    
    if not repository:
        return {"status": "error", "reason": "Repository not found in database"}
    
    existing_pr = db.query(PullRequest).filter(
        PullRequest.repository_id == repository.id,
        PullRequest.pr_number == pr_number
    ).first()
    
    if existing_pr:
        existing_pr.status = "pending"
        existing_pr.pr_title = pr_title
        existing_pr.analyzed_at = None
        db.commit()
        pr_id = existing_pr.id
    else:
        new_pr = PullRequest(
            repository_id=repository.id,
            pr_number=pr_number,
            pr_title=pr_title,
            pr_author=pr_author,
            pr_url=pr_url,
            base_branch=base_branch,
            head_branch=head_branch,
            status="pending"
        )
        db.add(new_pr)
        db.commit()
        db.refresh(new_pr)
        pr_id = new_pr.id
    
    background_tasks.add_task(run_analysis, pr_id, repository.id)
    
    return {"status": "success", "pr_id": pr_id, "message": "Analysis started"}

def run_analysis(pr_id: int, repo_id: int):
    """
    Background task to analyze a pull request using IBM Bob.
    
    Args:
        pr_id: Pull request database ID
        repo_id: Repository database ID
    """
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
        repository = db.query(Repository).filter(Repository.id == repo_id).first()
        
        if not pr or not repository:
            print(f"PR or Repository not found: pr_id={pr_id}, repo_id={repo_id}")
            return
        
        pr.status = "analyzing"
        db.commit()
        
        github_token = decrypt_secret(repository.github_token)

        diff_content = github_client.get_pull_request_diff(
            repository.github_owner,
            repository.github_repo,
            pr.pr_number,
            github_token,
        )
        
        if not diff_content:
            diff_content = 'diff --git a/auth.py b/auth.py\n+def login(username, password):\n+    user = db.query("SELECT * FROM users WHERE username=" + username)\n+    if user and user.password == password:\n+        return generate_token(user.id)\n+    return None'
            print(f"Using mock diff for demo PR #{pr.pr_number}")
        
        pr.diff_content = diff_content
        db.commit()
        
        analysis_result = bob_analyzer.analyze_pull_request(diff_content)
        
        pr.risk_level = analysis_result.get("risk_level", "medium")
        pr.analyzed_at = datetime.utcnow()
        db.commit()
        
        report_types = {
            "impact": analysis_result.get("impact", {}),
            "security": analysis_result.get("security", {}),
            "tests": analysis_result.get("tests", {}),
            "documentation": analysis_result.get("documentation", {}),
            "junior_guide": analysis_result.get("junior_guide", {})
        }
        
        for report_type, report_data in report_types.items():
            report_content = json.dumps({
                "pr_summary": analysis_result.get("pr_summary", ""),
                "risk_level": analysis_result.get("risk_level", "medium"),
                **report_data
            }, indent=2)
            
            existing_report = db.query(AnalysisReport).filter(
                AnalysisReport.pull_request_id == pr_id,
                AnalysisReport.report_type == report_type
            ).first()
            
            if existing_report:
                existing_report.content = report_content
                existing_report.created_at = datetime.utcnow()
            else:
                new_report = AnalysisReport(
                    pull_request_id=pr_id,
                    report_type=report_type,
                    content=report_content
                )
                db.add(new_report)
            
            db.commit()
            
            comment_body = format_report_comment(report_type, report_data, analysis_result)
            
            comment_id = github_client.post_pr_comment(
                repository.github_owner,
                repository.github_repo,
                pr.pr_number,
                github_token,
                comment_body,
            )
            
            if comment_id and existing_report:
                existing_report.github_comment_id = comment_id
                db.commit()
            elif comment_id:
                report = db.query(AnalysisReport).filter(
                    AnalysisReport.pull_request_id == pr_id,
                    AnalysisReport.report_type == report_type
                ).first()
                if report:
                    report.github_comment_id = comment_id
                    db.commit()
        
        pr.status = "complete"
        db.commit()
        
        print(f"Successfully analyzed PR #{pr.pr_number}")
        
    except Exception as e:
        print(f"Error analyzing PR {pr_id}: {e}")
        pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
        if pr:
            pr.status = "failed"
            db.commit()
    finally:
        db.close()

def format_report_comment(report_type: str, report_data: Dict[str, Any], full_analysis: Dict[str, Any]) -> str:
    """
    Format a report as a beautiful GitHub comment with markdown.
    
    Args:
        report_type: Type of report (impact, security, tests, documentation, junior_guide)
        report_data: The report data
        full_analysis: The complete analysis result
        
    Returns:
        Formatted markdown comment
    """
    risk_level = full_analysis.get("risk_level", "medium").upper()
    risk_emoji = {
        "LOW": "🟢",
        "MEDIUM": "🟡",
        "HIGH": "🟠",
        "CRITICAL": "🔴"
    }.get(risk_level, "⚪")
    
    if report_type == "impact":
        return format_impact_comment(report_data, risk_emoji, risk_level)
    elif report_type == "security":
        return format_security_comment(report_data, risk_emoji, risk_level)
    elif report_type == "tests":
        return format_tests_comment(report_data, risk_emoji, risk_level)
    elif report_type == "documentation":
        return format_documentation_comment(report_data, risk_emoji, risk_level)
    elif report_type == "junior_guide":
        return format_junior_guide_comment(report_data, risk_emoji, risk_level)
    
    return f"## {risk_emoji} BobCI Report\n\n{json.dumps(report_data, indent=2)}\n\n---\n*Powered by IBM Bob + BobCI*"

def format_impact_comment(data: Dict[str, Any], emoji: str, risk: str) -> str:
    """Format impact analysis as markdown."""
    recommendation = data.get("recommendation", "request_changes").replace("_", " ").title()
    
    comment = f"""## {emoji} BobCI Impact Analysis
**Risk Level:** {risk}
**Recommendation:** {recommendation}

### Direct Impact
| File | Reason | Breaks? |
|------|--------|---------|
"""
    
    for item in data.get("direct_impact", []):
        breaks = "✅ Yes" if item.get("likely_breaks") else "❌ No"
        comment += f"| {item.get('file', 'N/A')} | {item.get('reason', 'N/A')} | {breaks} |\n"
    
    if data.get("indirect_impact"):
        comment += "\n### Indirect Impact\n"
        for item in data.get("indirect_impact", []):
            comment += f"- **{item.get('file', 'N/A')}**: {item.get('reason', 'N/A')}\n"
    
    if data.get("safe_files"):
        comment += f"\n### Safe Files ({len(data.get('safe_files', []))} files)\n"
        comment += "<details><summary>Click to expand</summary>\n\n"
        for file in data.get("safe_files", [])[:10]:
            comment += f"- {file}\n"
        if len(data.get("safe_files", [])) > 10:
            comment += f"\n*...and {len(data.get('safe_files', [])) - 10} more*\n"
        comment += "\n</details>\n"
    
    comment += "\n---\n*Powered by IBM Bob + BobCI*"
    return comment

def format_security_comment(data: Dict[str, Any], emoji: str, risk: str) -> str:
    """Format security scan as markdown."""
    score = data.get("overall_score", 0)
    has_critical = data.get("has_critical_issues", False)
    recommendation = data.get("recommendation", "fix_before_merge").replace("_", " ").title()
    
    comment = f"""## {emoji} BobCI Security Scan
**Security Score:** {score}/100
**Critical Issues:** {"⚠️ YES" if has_critical else "✅ NO"}
**Recommendation:** {recommendation}

"""
    
    vulnerabilities = data.get("vulnerabilities", [])
    if vulnerabilities:
        comment += f"### Found {len(vulnerabilities)} Vulnerabilities\n\n"
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "medium").upper()
            severity_emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(severity, "⚪")
            
            comment += f"#### {severity_emoji} {vuln.get('type', 'Unknown')} ({severity})\n"
            comment += f"**File:** `{vuln.get('file', 'N/A')}` (Line {vuln.get('line', 0)})\n\n"
            comment += f"{vuln.get('description', 'No description')}\n\n"
            
            if vuln.get("vulnerable_code") or vuln.get("fixed_code"):
                comment += "<details><summary>View Code Fix</summary>\n\n"
                if vuln.get("vulnerable_code"):
                    comment += "**Vulnerable:**\n```\n" + vuln.get("vulnerable_code", "") + "\n```\n\n"
                if vuln.get("fixed_code"):
                    comment += "**Fixed:**\n```\n" + vuln.get("fixed_code", "") + "\n```\n"
                comment += "\n</details>\n\n"
    else:
        comment += "✅ No vulnerabilities detected!\n\n"
    
    comment += "---\n*Powered by IBM Bob + BobCI*"
    return comment

def format_tests_comment(data: Dict[str, Any], emoji: str, risk: str) -> str:
    """Format test report as markdown."""
    framework = data.get("framework", "Unknown")
    coverage = data.get("coverage_estimate", "0%")
    test_file = data.get("test_file_path", "N/A")
    
    comment = f"""## {emoji} BobCI Test Report
**Framework:** {framework}
**Estimated Coverage:** {coverage}
**Test File:** `{test_file}`

### Generated Test Cases ({len(data.get('cases', []))})

"""
    
    for case in data.get("cases", []):
        test_type = case.get("type", "unknown").replace("_", " ").title()
        type_emoji = {
            "Happy Path": "✅",
            "Edge Case": "⚠️",
            "Error Case": "❌",
            "Security": "🔒"
        }.get(test_type, "📝")
        
        comment += f"#### {type_emoji} {case.get('test_name', 'Unnamed Test')}\n"
        comment += f"**Tests:** `{case.get('function_tested', 'N/A')}`\n"
        comment += f"**Type:** {test_type}\n\n"
        comment += f"```\n{case.get('code', '# No code provided')}\n```\n\n"
        comment += f"💡 **Why it matters:** {case.get('why_it_matters', 'N/A')}\n\n"
    
    comment += "---\n*Powered by IBM Bob + BobCI*"
    return comment

def format_documentation_comment(data: Dict[str, Any], emoji: str, risk: str) -> str:
    """Format documentation report as markdown."""
    comment = f"""## {emoji} BobCI Documentation Report

### Functions Documented ({len(data.get('functions', []))})

"""
    
    for func in data.get("functions", []):
        comment += f"#### `{func.get('name', 'unnamed')}` ({func.get('file', 'N/A')})\n\n"
        comment += f"{func.get('summary', 'No summary')}\n\n"
        
        if func.get("parameters"):
            comment += "**Parameters:**\n"
            for param in func.get("parameters", []):
                required = "required" if param.get("required") else "optional"
                comment += f"- `{param.get('name', 'N/A')}` ({param.get('type', 'any')}, {required}): {param.get('description', 'N/A')}\n"
            comment += "\n"
        
        if func.get("returns"):
            returns = func.get("returns", {})
            comment += f"**Returns:** `{returns.get('type', 'void')}` - {returns.get('description', 'N/A')}\n\n"
        
        if func.get("example"):
            comment += f"**Example:**\n```\n{func.get('example', '')}\n```\n\n"
    
    if data.get("breaking_changes"):
        comment += "### ⚠️ Breaking Changes\n"
        for change in data.get("breaking_changes", []):
            comment += f"- {change}\n"
        comment += "\n"
    
    if data.get("outdated_docs"):
        comment += "### 📝 Outdated Documentation\n"
        for doc in data.get("outdated_docs", []):
            comment += f"- {doc}\n"
        comment += "\n"
    
    comment += "---\n*Powered by IBM Bob + BobCI*"
    return comment

def format_junior_guide_comment(data: Dict[str, Any], emoji: str, risk: str) -> str:
    """Format junior developer guide as markdown."""
    difficulty = data.get("difficulty", "intermediate").title()
    difficulty_emoji = {"Beginner": "🟢", "Intermediate": "🟡", "Advanced": "🔴"}.get(difficulty, "⚪")
    
    comment = f"""## {emoji} BobCI Junior Developer Guide
**Difficulty:** {difficulty_emoji} {difficulty}

### What Problem Does This Solve?
{data.get('problem_solved', 'N/A')}

### How Does It Work?
{data.get('solution_explained', 'N/A')}

"""
    
    if data.get("changed_files"):
        comment += "### Changed Files\n"
        for file_info in data.get("changed_files", []):
            comment += f"#### `{file_info.get('file', 'N/A')}`\n"
            comment += f"**Role:** {file_info.get('role', 'N/A')}\n\n"
            comment += f"{file_info.get('changes_explained', 'N/A')}\n\n"
    
    if data.get("new_concepts"):
        comment += "### New Concepts to Learn\n"
        for concept in data.get("new_concepts", []):
            comment += f"#### 💡 {concept.get('concept', 'Unknown')}\n"
            comment += f"{concept.get('simple_explanation', 'N/A')}\n\n"
            if concept.get("analogy"):
                comment += f"*{concept.get('analogy', '')}*\n\n"
    
    if data.get("learn_more"):
        comment += "### Learn More\n"
        for resource in data.get("learn_more", []):
            comment += f"- {resource}\n"
        comment += "\n"
    
    comment += "---\n*Powered by IBM Bob + BobCI*"
    return comment

# Made with Bob
