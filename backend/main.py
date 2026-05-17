from fastapi import FastAPI, Request, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import json
import os
from dotenv import load_dotenv

from database import get_db, init_db
from models import Repository, PullRequest, AnalysisReport
from github_client import GitHubClient
from webhook_handler import handle_pull_request_event
from security import (
    decrypt_secret,
    encrypt_secret,
    require_webhook_secret,
    validate_environment,
    verify_api_key,
    webhook_validation_enabled,
)
from schemas import RepositoryCreate

load_dotenv()
validate_environment()

app = FastAPI(
    title="BobCI API",
    description="AI-powered Pull Request intelligence system using IBM Bob",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") != "production" else None,
    redoc_url=None,
)

_frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)

github_client = GitHubClient()


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    init_db()
    print("Database initialized")
    print("BobCI API is running")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "BobCI API",
        "version": "1.0.0",
        "description": "AI-powered Pull Request intelligence system",
        "endpoints": {
            "webhook": "/webhook/github",
            "repositories": "/api/repositories",
            "pull_requests": "/api/pull-requests",
            "stats": "/api/stats",
        },
    }


@app.post("/webhook/github")
async def github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Handle incoming GitHub webhook events.
    Verifies HMAC signature and processes pull request events.
    """
    signature = request.headers.get("X-Hub-Signature-256", "")
    event_type = request.headers.get("X-GitHub-Event", "")

    body = await request.body()
    webhook_secret = os.getenv("GITHUB_WEBHOOK_SECRET", "").strip()

    if require_webhook_secret() and not webhook_secret:
        raise HTTPException(
            status_code=503,
            detail="GITHUB_WEBHOOK_SECRET must be configured",
        )

    if webhook_validation_enabled():
        if not webhook_secret or not signature:
            raise HTTPException(status_code=401, detail="Webhook signature required")
        if not github_client.verify_webhook_signature(body, signature, webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
    elif webhook_secret and signature:
        if not github_client.verify_webhook_signature(body, signature, webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    if event_type == "pull_request":
        return handle_pull_request_event(payload, db, background_tasks)

    return {"status": "ignored", "event": event_type}


@app.get("/api/repositories", dependencies=[Depends(verify_api_key)])
async def get_repositories(db: Session = Depends(get_db)):
    """Get all connected repositories (tokens are never returned)."""
    repositories = db.query(Repository).filter(Repository.is_active == True).all()

    return [
        {
            "id": repo.id,
            "owner": repo.github_owner,
            "repo": repo.github_repo,
            "created_at": repo.created_at.isoformat(),
            "is_active": repo.is_active,
            "pr_count": len(repo.pull_requests),
        }
        for repo in repositories
    ]


@app.post("/api/repositories", dependencies=[Depends(verify_api_key)])
async def add_repository(data: RepositoryCreate, db: Session = Depends(get_db)):
    """Connect a new GitHub repository."""
    owner = data.owner
    repo = data.repo
    github_token = encrypt_secret(data.github_token)
    webhook_secret = encrypt_secret(data.webhook_secret)

    existing = (
        db.query(Repository)
        .filter(Repository.github_owner == owner, Repository.github_repo == repo)
        .first()
    )

    if existing:
        existing.github_token = github_token
        existing.webhook_secret = webhook_secret
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        repository = existing
    else:
        repository = Repository(
            github_owner=owner,
            github_repo=repo,
            github_token=github_token,
            webhook_secret=webhook_secret,
            is_active=True,
        )
        db.add(repository)
        db.commit()
        db.refresh(repository)

    return {
        "id": repository.id,
        "owner": repository.github_owner,
        "repo": repository.github_repo,
        "created_at": repository.created_at.isoformat(),
        "webhook_url": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/webhook/github",
        "message": "Repository connected successfully",
    }


@app.get("/api/pull-requests", dependencies=[Depends(verify_api_key)])
async def get_pull_requests(
    repo_id: int = None,
    status: str = None,
    risk_level: str = None,
    db: Session = Depends(get_db),
):
    """Get all pull requests with optional filters."""
    query = db.query(PullRequest)

    if repo_id:
        query = query.filter(PullRequest.repository_id == repo_id)
    if status:
        query = query.filter(PullRequest.status == status)
    if risk_level:
        query = query.filter(PullRequest.risk_level == risk_level)

    pull_requests = query.order_by(PullRequest.created_at.desc()).all()

    return [
        {
            "id": pr.id,
            "repository_id": pr.repository_id,
            "repository_name": f"{pr.repository.github_owner}/{pr.repository.github_repo}",
            "pr_number": pr.pr_number,
            "pr_title": pr.pr_title,
            "pr_author": pr.pr_author,
            "pr_url": pr.pr_url,
            "base_branch": pr.base_branch,
            "head_branch": pr.head_branch,
            "status": pr.status,
            "risk_level": pr.risk_level,
            "created_at": pr.created_at.isoformat(),
            "analyzed_at": pr.analyzed_at.isoformat() if pr.analyzed_at else None,
            "report_count": len(pr.analysis_reports),
        }
        for pr in pull_requests
    ]


@app.get("/api/pull-requests/{pr_id}", dependencies=[Depends(verify_api_key)])
async def get_pull_request(pr_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific pull request including all reports."""
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()

    if not pr:
        raise HTTPException(status_code=404, detail="Pull request not found")

    reports = {}
    for report in pr.analysis_reports:
        try:
            reports[report.report_type] = json.loads(report.content)
        except json.JSONDecodeError:
            reports[report.report_type] = {"error": "Failed to parse report"}

    return {
        "id": pr.id,
        "repository_id": pr.repository_id,
        "repository_name": f"{pr.repository.github_owner}/{pr.repository.github_repo}",
        "pr_number": pr.pr_number,
        "pr_title": pr.pr_title,
        "pr_author": pr.pr_author,
        "pr_url": pr.pr_url,
        "base_branch": pr.base_branch,
        "head_branch": pr.head_branch,
        "status": pr.status,
        "risk_level": pr.risk_level,
        "created_at": pr.created_at.isoformat(),
        "analyzed_at": pr.analyzed_at.isoformat() if pr.analyzed_at else None,
        "diff_content": pr.diff_content,
        "reports": reports,
    }


@app.get("/api/stats", dependencies=[Depends(verify_api_key)])
async def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total_prs = db.query(func.count(PullRequest.id)).scalar()

    prs_by_risk = (
        db.query(PullRequest.risk_level, func.count(PullRequest.id))
        .filter(PullRequest.risk_level.isnot(None))
        .group_by(PullRequest.risk_level)
        .all()
    )

    risk_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for risk_level, count in prs_by_risk:
        if risk_level in risk_counts:
            risk_counts[risk_level] = count

    total_vulnerabilities = 0
    total_tests = 0
    security_scores = []

    security_reports = (
        db.query(AnalysisReport).filter(AnalysisReport.report_type == "security").all()
    )

    for report in security_reports:
        try:
            content = json.loads(report.content)
            total_vulnerabilities += len(content.get("vulnerabilities", []))
            score = content.get("overall_score", 0)
            if score > 0:
                security_scores.append(score)
        except json.JSONDecodeError:
            pass

    test_reports = db.query(AnalysisReport).filter(AnalysisReport.report_type == "tests").all()
    for report in test_reports:
        try:
            content = json.loads(report.content)
            total_tests += len(content.get("cases", []))
        except json.JSONDecodeError:
            pass

    avg_security_score = (
        sum(security_scores) / len(security_scores) if security_scores else 0
    )

    return {
        "total_prs": total_prs,
        "prs_by_risk": risk_counts,
        "total_vulnerabilities": total_vulnerabilities,
        "total_tests_generated": total_tests,
        "average_security_score": round(avg_security_score, 1),
        "repositories_connected": db.query(func.count(Repository.id))
        .filter(Repository.is_active == True)
        .scalar(),
    }


@app.delete("/api/repositories/{repo_id}", dependencies=[Depends(verify_api_key)])
async def delete_repository(repo_id: int, db: Session = Depends(get_db)):
    """Deactivate a repository."""
    repository = db.query(Repository).filter(Repository.id == repo_id).first()

    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")

    repository.is_active = False
    db.commit()

    return {"message": "Repository deactivated successfully"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "BobCI API"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("API_HOST", "127.0.0.1")
    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
