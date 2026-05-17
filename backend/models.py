from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(Integer, primary_key=True, index=True)
    github_owner = Column(String, nullable=False, index=True)
    github_repo = Column(String, nullable=False, index=True)
    github_token = Column(String, nullable=False)
    webhook_secret = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    pull_requests = relationship("PullRequest", back_populates="repository", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Repository {self.github_owner}/{self.github_repo}>"

class PullRequest(Base):
    __tablename__ = "pull_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False, index=True)
    pr_number = Column(Integer, nullable=False, index=True)
    pr_title = Column(String, nullable=False)
    pr_author = Column(String, nullable=False)
    pr_url = Column(String, nullable=False)
    base_branch = Column(String, nullable=False)
    head_branch = Column(String, nullable=False)
    diff_content = Column(Text, nullable=True)
    status = Column(String, default="pending", index=True)
    risk_level = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    analyzed_at = Column(DateTime, nullable=True)
    
    repository = relationship("Repository", back_populates="pull_requests")
    analysis_reports = relationship("AnalysisReport", back_populates="pull_request", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<PullRequest #{self.pr_number} - {self.pr_title}>"

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    pull_request_id = Column(Integer, ForeignKey("pull_requests.id"), nullable=False, index=True)
    report_type = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    github_comment_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    pull_request = relationship("PullRequest", back_populates="analysis_reports")
    
    def __repr__(self):
        return f"<AnalysisReport {self.report_type} for PR #{self.pull_request_id}>"

# Made with Bob
