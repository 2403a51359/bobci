# 📡 BobCI API Reference

## Overview

BobCI provides a RESTful API built with FastAPI for managing repositories, pull requests, and analysis reports.

**Base URL**: `http://localhost:8000` (development)  
**Production URL**: `https://api.bobci.dev` (when deployed)

---

## 🔐 Authentication

### GitHub Token

Most endpoints require a GitHub personal access token for repository access.

**Required Scopes:**
- `repo` - Full repository access
- `read:org` - Read organization data
- `write:discussion` - Post PR comments

---

## 📋 Endpoints

### Root

#### GET `/`

Get API information and available endpoints.

**Response:**
```json
{
  "name": "BobCI API",
  "version": "1.0.0",
  "description": "AI-powered Pull Request intelligence system",
  "endpoints": {
    "webhook": "/webhook/github",
    "repositories": "/api/repositories",
    "pull_requests": "/api/pull-requests",
    "stats": "/api/stats"
  }
}
```

---

### Webhooks

#### POST `/webhook/github`

Receive GitHub webhook events for pull requests.

**Headers:**
```
X-Hub-Signature-256: sha256=<signature>
X-GitHub-Event: pull_request
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "opened",
  "pull_request": {
    "number": 123,
    "title": "Add login feature",
    "user": {
      "login": "developer"
    },
    "html_url": "https://github.com/owner/repo/pull/123",
    "base": {
      "ref": "main"
    },
    "head": {
      "ref": "feature/login"
    }
  },
  "repository": {
    "owner": {
      "login": "owner"
    },
    "name": "repo"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "pr_id": 1,
  "message": "Analysis started"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid JSON payload
- `401` - Invalid webhook signature
- `500` - Server error

---

### Repositories

#### GET `/api/repositories`

Get all connected repositories.

**Response:**
```json
[
  {
    "id": 1,
    "owner": "facebook",
    "repo": "react",
    "created_at": "2026-05-17T00:00:00",
    "is_active": true,
    "pr_count": 5
  }
]
```

---

#### POST `/api/repositories`

Connect a new GitHub repository.

**Request Body:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "github_token": "ghp_xxxxxxxxxxxx",
  "webhook_secret": "random_secret_string"
}
```

**Response:**
```json
{
  "id": 1,
  "owner": "facebook",
  "repo": "react",
  "created_at": "2026-05-17T00:00:00",
  "webhook_url": "http://localhost:8000/webhook/github",
  "message": "Repository connected successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing required fields
- `500` - Server error

---

#### DELETE `/api/repositories/{repo_id}`

Deactivate a repository.

**Parameters:**
- `repo_id` (path, required) - Repository ID

**Response:**
```json
{
  "message": "Repository deactivated successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Repository not found

---

### Pull Requests

#### GET `/api/pull-requests`

Get all pull requests with optional filters.

**Query Parameters:**
- `repo_id` (optional) - Filter by repository ID
- `status` (optional) - Filter by status: `pending`, `analyzing`, `complete`, `failed`
- `risk_level` (optional) - Filter by risk: `low`, `medium`, `high`, `critical`

**Response:**
```json
[
  {
    "id": 1,
    "repository_id": 1,
    "repository_name": "facebook/react",
    "pr_number": 123,
    "pr_title": "Add login feature",
    "pr_author": "developer",
    "pr_url": "https://github.com/facebook/react/pull/123",
    "base_branch": "main",
    "head_branch": "feature/login",
    "status": "complete",
    "risk_level": "high",
    "created_at": "2026-05-17T00:00:00",
    "analyzed_at": "2026-05-17T00:00:05",
    "report_count": 5
  }
]
```

---

#### GET `/api/pull-requests/{pr_id}`

Get detailed information about a specific pull request including all reports.

**Parameters:**
- `pr_id` (path, required) - Pull request ID

**Response:**
```json
{
  "id": 1,
  "repository_id": 1,
  "repository_name": "facebook/react",
  "pr_number": 123,
  "pr_title": "Add login feature",
  "pr_author": "developer",
  "pr_url": "https://github.com/facebook/react/pull/123",
  "base_branch": "main",
  "head_branch": "feature/login",
  "status": "complete",
  "risk_level": "high",
  "created_at": "2026-05-17T00:00:00",
  "analyzed_at": "2026-05-17T00:00:05",
  "diff_content": "diff --git a/auth.py...",
  "reports": {
    "security": {
      "overall_score": 23,
      "has_critical_issues": true,
      "vulnerabilities": [...]
    },
    "impact": {
      "direct_impact": [...],
      "indirect_impact": [...],
      "blast_radius": 10
    },
    "tests": {
      "framework": "pytest",
      "coverage_estimate": "94%",
      "cases": [...]
    },
    "documentation": {
      "functions": [...],
      "breaking_changes": []
    },
    "junior_guide": {
      "difficulty": "intermediate",
      "problem_solved": "...",
      "concepts": [...]
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Pull request not found

---

### Statistics

#### GET `/api/stats`

Get dashboard statistics.

**Response:**
```json
{
  "total_prs": 50,
  "prs_by_risk": {
    "low": 20,
    "medium": 15,
    "high": 10,
    "critical": 5
  },
  "total_vulnerabilities": 125,
  "total_tests_generated": 450,
  "average_security_score": 67.5,
  "repositories_connected": 5
}
```

---

### Health Check

#### GET `/health`

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "BobCI API"
}
```

---

## 📊 Data Models

### Repository

```python
{
  "id": int,
  "github_owner": str,
  "github_repo": str,
  "github_token": str,  # Stored encrypted at rest (Fernet) when SECRET_ENCRYPTION_KEY is set
  "webhook_secret": str,  # Stored encrypted at rest; never returned by GET endpoints
  "is_active": bool,
  "created_at": datetime
}
```

### Pull Request

```python
{
  "id": int,
  "repository_id": int,
  "pr_number": int,
  "pr_title": str,
  "pr_author": str,
  "pr_url": str,
  "base_branch": str,
  "head_branch": str,
  "status": str,  # pending, analyzing, complete, failed
  "risk_level": str,  # low, medium, high, critical
  "diff_content": str,
  "created_at": datetime,
  "analyzed_at": datetime
}
```

### Analysis Report

```python
{
  "id": int,
  "pull_request_id": int,
  "report_type": str,  # security, impact, tests, documentation, junior_guide
  "content": json,
  "github_comment_id": str,
  "created_at": datetime
}
```

---

## 🔒 Security Report Schema

```json
{
  "overall_score": 0-100,
  "has_critical_issues": boolean,
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "critical|high|medium|low",
      "file": "auth.py",
      "line": 3,
      "description": "Detailed description",
      "vulnerable_code": "Bad code",
      "fixed_code": "Good code"
    }
  ],
  "recommendation": "block_immediately|fix_before_merge|review_carefully|approve"
}
```

---

## 📊 Impact Report Schema

```json
{
  "direct_impact": [
    {
      "file": "database.py",
      "reason": "Called by changed function",
      "likely_breaks": true
    }
  ],
  "indirect_impact": [
    {
      "file": "api.py",
      "reason": "Depends on changed module"
    }
  ],
  "safe_files": ["config.py", "utils.py"],
  "blast_radius": 10,
  "recommendation": "block|request_changes|approve"
}
```

---

## 🧪 Test Report Schema

```json
{
  "framework": "pytest",
  "coverage_estimate": "94%",
  "test_file_path": "tests/test_auth.py",
  "cases": [
    {
      "function_tested": "login",
      "test_name": "test_login_with_valid_credentials",
      "type": "happy_path|edge_case|error_case|security",
      "code": "def test_...",
      "why_it_matters": "Explanation"
    }
  ]
}
```

---

## 📚 Documentation Report Schema

```json
{
  "functions": [
    {
      "name": "login",
      "file": "auth.py",
      "summary": "Authenticates a user",
      "parameters": [
        {
          "name": "username",
          "type": "str",
          "description": "User's username",
          "required": true
        }
      ],
      "returns": {
        "type": "Optional[str]",
        "description": "JWT token or None"
      },
      "example": "token = login('alice', 'pass')"
    }
  ],
  "breaking_changes": [],
  "outdated_docs": []
}
```

---

## 🎓 Junior Guide Schema

```json
{
  "difficulty": "beginner|intermediate|advanced",
  "problem_solved": "What problem does this solve?",
  "solution_explained": "How does it work?",
  "changed_files": [
    {
      "file": "auth.py",
      "role": "Authentication logic",
      "changes_explained": "Detailed explanation"
    }
  ],
  "new_concepts": [
    {
      "concept": "SQL Injection",
      "simple_explanation": "Easy explanation",
      "analogy": "Real-world analogy"
    }
  ],
  "learn_more": ["Resource 1", "Resource 2"]
}
```

---

## ⚠️ Error Responses

### Standard Error Format

```json
{
  "detail": "Error message"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid credentials)
- `404` - Not Found (resource doesn't exist)
- `422` - Validation Error (invalid data format)
- `500` - Internal Server Error

---

## 🚀 Rate Limiting

**Current**: No rate limiting (development)  
**Planned**: 100 requests per minute per IP

---

## 📝 Examples

### Python Client

```python
import requests

BASE_URL = "http://localhost:8000"

# Get all repositories
response = requests.get(f"{BASE_URL}/api/repositories")
repos = response.json()

# Get PR details
pr_id = 1
response = requests.get(f"{BASE_URL}/api/pull-requests/{pr_id}")
pr_data = response.json()

# Get statistics
response = requests.get(f"{BASE_URL}/api/stats")
stats = response.json()
```

### JavaScript Client

```javascript
const BASE_URL = 'http://localhost:8000';

// Get all repositories
const repos = await fetch(`${BASE_URL}/api/repositories`)
  .then(res => res.json());

// Get PR details
const prId = 1;
const prData = await fetch(`${BASE_URL}/api/pull-requests/${prId}`)
  .then(res => res.json());

// Get statistics
const stats = await fetch(`${BASE_URL}/api/stats`)
  .then(res => res.json());
```

### cURL Examples

```bash
# Get repositories
curl http://localhost:8000/api/repositories

# Get PR details
curl http://localhost:8000/api/pull-requests/1

# Add repository
curl -X POST http://localhost:8000/api/repositories \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "facebook",
    "repo": "react",
    "github_token": "ghp_xxx",
    "webhook_secret": "secret"
  }'

# Get statistics
curl http://localhost:8000/api/stats
```

---

## 🔗 Related Documentation

- [System Architecture](../../architecture/SYSTEM_ARCHITECTURE.md)
- [Multi-Agent System](../MULTI_AGENT_SYSTEM.md)
- [IBM Bob Usage](../IBM_BOB_USAGE.md)
- [Security Policy](../../SECURITY.md)

---

*Last Updated: 2026-05-17*  
*API Version: 1.0.0*