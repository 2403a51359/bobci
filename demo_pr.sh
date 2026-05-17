#!/bin/bash

echo "🎬 BobCI Demo Script"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKEND_URL="http://localhost:8000"
WEBHOOK_URL="$BACKEND_URL/webhook/github"

echo -e "${BLUE}This script will:${NC}"
echo "1. Create a test repository with intentional issues"
echo "2. Generate a sample PR payload"
echo "3. Send it to your local BobCI instance"
echo "4. Trigger the full analysis pipeline"
echo ""

# Check if backend is running
echo -e "${BLUE}Checking if backend is running...${NC}"
if ! curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running at $BACKEND_URL${NC}"
    echo -e "${YELLOW}Please start the backend first:${NC}"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  python main.py"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"

# Create temporary test directory
TEST_DIR=$(mktemp -d)
echo -e "${BLUE}Creating test repository in $TEST_DIR${NC}"

cd "$TEST_DIR"

# Initialize git repo
git init
git config user.name "Demo User"
git config user.email "demo@example.com"

# Create a vulnerable file
cat > auth.py << 'EOF'
import hashlib

def authenticate_user(username, password):
    # SECURITY ISSUE: Hardcoded credentials
    ADMIN_PASSWORD = "admin123"
    
    # SECURITY ISSUE: Using MD5 for password hashing
    hashed = hashlib.md5(password.encode()).hexdigest()
    
    # SECURITY ISSUE: SQL injection vulnerability
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{hashed}'"
    
    # Missing: No input validation
    # Missing: No rate limiting
    # Missing: No logging
    
    return True  # Placeholder

def get_user_data(user_id):
    # SECURITY ISSUE: No authentication check
    # SECURITY ISSUE: Potential SQL injection
    query = f"SELECT * FROM users WHERE id={user_id}"
    return {"id": user_id, "name": "User"}

# Missing: No tests for this module
EOF

# Create initial commit
git add auth.py
git commit -m "Initial commit with authentication module"

# Create a branch and make changes
git checkout -b feature/add-api-key-auth

# Modify the file with more issues
cat > auth.py << 'EOF'
import hashlib
import os

# SECURITY ISSUE: Hardcoded API key
API_KEY = "sk_live_1234567890abcdef"

def authenticate_user(username, password):
    # SECURITY ISSUE: Still using MD5
    hashed = hashlib.md5(password.encode()).hexdigest()
    
    # SECURITY ISSUE: SQL injection still present
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{hashed}'"
    
    # SECURITY ISSUE: Logging sensitive data
    print(f"Login attempt: {username}:{password}")
    
    return True

def authenticate_api_key(key):
    # SECURITY ISSUE: Timing attack vulnerability
    if key == API_KEY:
        return True
    return False

def get_user_data(user_id):
    # SECURITY ISSUE: No authentication
    # SECURITY ISSUE: SQL injection
    query = f"SELECT * FROM users WHERE id={user_id}"
    
    # SECURITY ISSUE: Exposing sensitive data
    return {
        "id": user_id,
        "name": "User",
        "email": "user@example.com",
        "password_hash": "abc123",  # Should never be exposed
        "api_key": API_KEY
    }

# Still missing: Tests, documentation, error handling
EOF

git add auth.py
git commit -m "Add API key authentication (DEMO: intentionally vulnerable)"

# Get the diff
DIFF=$(git diff HEAD~1 HEAD)

# Create webhook payload
PAYLOAD=$(cat << EOF
{
  "action": "opened",
  "number": 42,
  "pull_request": {
    "number": 42,
    "title": "Add API key authentication",
    "user": {
      "login": "demo-developer"
    },
    "html_url": "https://github.com/demo/test-repo/pull/42",
    "base": {
      "ref": "main"
    },
    "head": {
      "ref": "feature/add-api-key-auth"
    }
  },
  "repository": {
    "name": "test-repo",
    "owner": {
      "login": "demo"
    }
  }
}
EOF
)

echo ""
echo -e "${GREEN}✓ Test repository created${NC}"
echo -e "${BLUE}Diff preview:${NC}"
echo "----------------------------------------"
echo "$DIFF" | head -20
echo "..."
echo "----------------------------------------"
echo ""

# First, we need to add the repository to BobCI
echo -e "${BLUE}Step 1: Adding repository to BobCI...${NC}"

# Generate a random webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)

REPO_PAYLOAD=$(cat << EOF
{
  "owner": "demo",
  "repo": "test-repo",
  "github_token": "demo_token_not_used_for_local_test",
  "webhook_secret": "$WEBHOOK_SECRET"
}
EOF
)

REPO_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/repositories" \
  -H "Content-Type: application/json" \
  -d "$REPO_PAYLOAD")

if echo "$REPO_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✓ Repository added to BobCI${NC}"
else
    echo -e "${YELLOW}⚠️  Repository might already exist or there was an error${NC}"
    echo "$REPO_RESPONSE"
fi

echo ""
echo -e "${BLUE}Step 2: Sending webhook to BobCI...${NC}"

# Send the webhook
RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d "$PAYLOAD")

echo -e "${GREEN}✓ Webhook sent${NC}"
echo ""
echo -e "${BLUE}Response:${NC}"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Demo PR Created Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}What happens next:${NC}"
echo ""
echo "1. BobCI received the webhook"
echo "2. IBM Bob is analyzing the PR (this takes 30-60 seconds)"
echo "3. Five reports will be generated:"
echo "   • Impact Analysis"
echo "   • Security Scan (will find 7+ vulnerabilities)"
echo "   • Test Cases (will generate test scenarios)"
echo "   • Documentation (will document all functions)"
echo "   • Junior Guide (will explain in simple terms)"
echo ""
echo -e "${YELLOW}View the results:${NC}"
echo "• Dashboard: ${BLUE}http://localhost:3000${NC}"
echo "• API: ${BLUE}$BACKEND_URL/api/pull-requests${NC}"
echo ""
echo -e "${BLUE}Expected findings:${NC}"
echo "• Hardcoded API key"
echo "• SQL injection vulnerabilities"
echo "• Weak password hashing (MD5)"
echo "• Sensitive data logging"
echo "• Missing authentication checks"
echo "• Timing attack vulnerability"
echo "• Missing tests and documentation"
echo ""
echo -e "${YELLOW}Tip: Refresh the dashboard to see the analysis progress${NC}"
echo ""

# Cleanup
cd - > /dev/null
rm -rf "$TEST_DIR"
echo -e "${GREEN}✓ Cleaned up test repository${NC}"

# Made with Bob
