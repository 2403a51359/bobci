"""
Seed the database with demo data for testing BobCI.
Report shapes match bob_analyzer / webhook_handler output so the UI renders correctly.
"""
import json
from datetime import datetime, timedelta

from bob_analyzer import BobAnalyzer
from database import SessionLocal, init_db
from models import AnalysisReport, PullRequest, Repository


def _report_payload(analysis: dict, section: str) -> str:
    """Same envelope as webhook_handler.run_analysis."""
    return json.dumps(
        {
            "pr_summary": analysis.get("pr_summary", ""),
            "risk_level": analysis.get("risk_level", "medium"),
            **analysis.get(section, {}),
        },
        indent=2,
    )


def _seed_reports(db, pr_id: int, analysis: dict) -> None:
    for report_type in ("impact", "security", "tests", "documentation", "junior_guide"):
        db.add(
            AnalysisReport(
                pull_request_id=pr_id,
                report_type=report_type,
                content=_report_payload(analysis, report_type),
            )
        )


def create_demo_data():
    print("🌱 Seeding demo data...")

    init_db()
    db = SessionLocal()
    analyzer = BobAnalyzer()
    now = datetime.utcnow()

    try:
        existing_prs = db.query(PullRequest).count()
        if existing_prs > 0:
            print(f"⚠️  Database already has {existing_prs} PRs. Clearing old data...")
            db.query(AnalysisReport).delete()
            db.query(PullRequest).delete()
            db.query(Repository).delete()
            db.commit()

        repo = Repository(
            github_owner="demo",
            github_repo="test-repo",
            github_token="demo_token",
            webhook_secret="demo_secret",
            is_active=True,
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)
        print(f"✅ Created repository: {repo.github_owner}/{repo.github_repo}")

        # PR #42 — full analysis (matches Bob fallback / UI expectations)
        pr1_analysis = analyzer._get_fallback_response("")
        pr1_analysis["risk_level"] = "critical"
        pr1_analysis["security"]["vulnerabilities"].extend(
            [
                {
                    "type": "Hardcoded API Key",
                    "severity": "critical",
                    "file": "auth.py",
                    "line": 5,
                    "description": "API key is hardcoded in source code and exposed in the repository.",
                    "vulnerable_code": 'API_KEY = "sk_live_1234567890abcdef"',
                    "fixed_code": "API_KEY = os.environ.get('API_KEY')",
                },
                {
                    "type": "Sensitive Data Logging",
                    "severity": "high",
                    "file": "auth.py",
                    "line": 12,
                    "description": "Passwords are logged in plaintext during login attempts.",
                    "vulnerable_code": 'print(f"Login attempt: {username}:{password}")',
                    "fixed_code": 'logger.info("Login attempt for user: %s", username)',
                },
            ]
        )

        pr1 = PullRequest(
            repository_id=repo.id,
            pr_number=42,
            pr_title="Add API key authentication",
            pr_author="demo-developer",
            status="complete",
            risk_level="critical",
            pr_url="https://github.com/demo/test-repo/pull/42",
            base_branch="main",
            head_branch="feature/add-api-key-auth",
            created_at=now - timedelta(hours=2),
            analyzed_at=now - timedelta(hours=1, minutes=55),
        )
        db.add(pr1)
        db.commit()
        db.refresh(pr1)
        _seed_reports(db, pr1.id, pr1_analysis)
        db.commit()
        print(f"✅ Created PR #{pr1.pr_number}: {pr1.pr_title} with 5 analysis reports")

        # PR #43 — medium risk
        pr2_analysis = {
            "pr_summary": "Updates the user profile endpoint with new validation logic.",
            "risk_level": "medium",
            "impact": {
                "direct_impact": [
                    {
                        "file": "api/profile.py",
                        "reason": "Profile update handler modified",
                        "likely_breaks": False,
                    }
                ],
                "indirect_impact": [
                    {"file": "serializers/user.py", "reason": "Response shape may change"}
                ],
                "safe_files": ["models/user.py", "tests/test_profile.py"],
                "recommendation": "request_changes",
            },
            "security": {
                "overall_score": 65,
                "has_critical_issues": False,
                "vulnerabilities": [
                    {
                        "type": "Missing Input Validation",
                        "severity": "medium",
                        "file": "api/profile.py",
                        "line": 18,
                        "description": "User input is not validated before processing.",
                        "vulnerable_code": "data = request.json",
                        "fixed_code": "data = ProfileUpdateSchema(**request.json)",
                    }
                ],
                "recommendation": "fix_before_merge",
            },
            "tests": {
                "framework": "pytest",
                "coverage_estimate": "72%",
                "test_file_path": "tests/test_profile.py",
                "cases": [
                    {
                        "function_tested": "update_profile",
                        "test_name": "test_update_profile_valid_payload",
                        "type": "happy_path",
                        "code": "def test_update_profile_valid_payload():\n    ...",
                        "why_it_matters": "Ensures valid updates persist",
                    }
                ],
            },
            "documentation": {
                "functions": [
                    {
                        "name": "update_profile",
                        "file": "api/profile.py",
                        "summary": "Updates the authenticated user's profile fields.",
                        "parameters": [],
                        "returns": {"type": "dict", "description": "Updated user record"},
                    }
                ],
                "breaking_changes": [],
                "outdated_docs": [],
            },
            "junior_guide": {
                "difficulty": "beginner",
                "problem_solved": "Lets users change their display name and email safely.",
                "solution_explained": "The endpoint validates input, updates the database, and returns the new profile.",
                "changed_files": [
                    {
                        "file": "api/profile.py",
                        "role": "HTTP handler",
                        "changes_explained": "Adds validation before saving profile fields.",
                    }
                ],
                "new_concepts": [],
                "learn_more": ["FastAPI request validation", "Pydantic models"],
            },
        }

        pr2 = PullRequest(
            repository_id=repo.id,
            pr_number=43,
            pr_title="Update user profile endpoint",
            pr_author="senior-dev",
            status="complete",
            risk_level="medium",
            pr_url="https://github.com/demo/test-repo/pull/43",
            base_branch="main",
            head_branch="feature/update-profile",
            created_at=now - timedelta(hours=5),
            analyzed_at=now - timedelta(hours=4, minutes=50),
        )
        db.add(pr2)
        db.commit()
        db.refresh(pr2)
        _seed_reports(db, pr2.id, pr2_analysis)
        db.commit()
        print(f"✅ Created PR #{pr2.pr_number}: {pr2.pr_title}")

        # PR #44 — low risk
        pr3_analysis = {
            "pr_summary": "Fixes a typo in the README; no code changes.",
            "risk_level": "low",
            "impact": {
                "direct_impact": [],
                "indirect_impact": [],
                "safe_files": ["README.md"],
                "recommendation": "approve",
            },
            "security": {
                "overall_score": 98,
                "has_critical_issues": False,
                "vulnerabilities": [],
                "recommendation": "safe_to_merge",
            },
            "tests": {
                "framework": "pytest",
                "coverage_estimate": "N/A",
                "test_file_path": "N/A",
                "cases": [],
            },
            "documentation": {
                "functions": [],
                "breaking_changes": [],
                "outdated_docs": [],
            },
            "junior_guide": {
                "difficulty": "beginner",
                "problem_solved": "Improves documentation clarity for new contributors.",
                "solution_explained": "Only markdown text changed; no runtime behavior affected.",
                "changed_files": [
                    {
                        "file": "README.md",
                        "role": "Project documentation",
                        "changes_explained": "Corrected spelling and clarified setup steps.",
                    }
                ],
                "new_concepts": [],
                "learn_more": ["Markdown style guides"],
            },
        }

        pr3 = PullRequest(
            repository_id=repo.id,
            pr_number=44,
            pr_title="Fix typo in README",
            pr_author="contributor",
            status="complete",
            risk_level="low",
            pr_url="https://github.com/demo/test-repo/pull/44",
            base_branch="main",
            head_branch="fix/readme-typo",
            created_at=now - timedelta(hours=1),
            analyzed_at=now - timedelta(minutes=55),
        )
        db.add(pr3)
        db.commit()
        db.refresh(pr3)
        _seed_reports(db, pr3.id, pr3_analysis)
        db.commit()
        print(f"✅ Created PR #{pr3.pr_number}: {pr3.pr_title}")

        print("\n🎉 Demo data seeded successfully!")
        print(f"📊 Created {db.query(PullRequest).count()} pull requests")
        print(f"📋 Created {db.query(AnalysisReport).count()} analysis reports")
        print("\n🌐 Open http://localhost:3000 to view the dashboard")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_demo_data()
