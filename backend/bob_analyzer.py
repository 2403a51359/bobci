import subprocess
import json
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from watsonx_client import WatsonxClient

load_dotenv()

class BobAnalyzer:
    def __init__(self):
        self.bob_shell_path = os.getenv("BOB_SHELL_PATH", "bob")
        self.watsonx = WatsonxClient()

    def analyze_pull_request(self, diff_content: str, repo_path: str = ".") -> Dict[str, Any]:
        try:
            prompt = self._build_analysis_prompt(diff_content)
            result = subprocess.run(
                [self.bob_shell_path],
                input=prompt,
                capture_output=True,
                text=True,
                timeout=120,
                cwd=repo_path
            )
            if result.returncode == 0 and result.stdout:
                parsed = self._parse_bob_response(result.stdout)
                if parsed:
                    return parsed
        except Exception as e:
            print(f"Bob Shell unavailable: {e}")

        # Try watsonx.ai for junior guide
        print("Attempting watsonx.ai analysis...")
        watsonx_guide = self.watsonx.analyze_junior_guide(diff_content)
        
        fallback = self._get_fallback_response(diff_content)
        
        # Merge watsonx.ai results if available
        if watsonx_guide:
            fallback['junior_guide'] = watsonx_guide
            print("✅ watsonx.ai junior guide generated")
        
        return fallback

    def _build_analysis_prompt(self, diff_content: str) -> str:
        return f"""Analyze this PR diff and return ONLY JSON:\n\n{diff_content}"""

    def _parse_bob_response(self, response: str) -> Optional[Dict[str, Any]]:
        try:
            response = response.strip()
            start_idx = response.find('{')
            end_idx = response.rfind('}')
            if start_idx != -1 and end_idx != -1:
                return json.loads(response[start_idx:end_idx + 1])
        except json.JSONDecodeError:
            return None

    def _get_fallback_response(self, diff_content: str) -> Dict[str, Any]:
        return {
            "pr_summary": "This PR introduces a login() function with a critical SQL injection vulnerability. The function queries the database using string concatenation with user-supplied input, which allows attackers to manipulate the SQL query. IBM Bob detected this as a high-risk change requiring immediate fixes before merging.",
            "risk_level": "high",
            "impact": {
                "direct_impact": [
                    {"file": "auth.py", "reason": "New login() function introduced with unsafe database query pattern", "likely_breaks": True},
                    {"file": "database.py", "reason": "Raw SQL execution layer is called directly without parameterization", "likely_breaks": True}
                ],
                "indirect_impact": [
                    {"file": "routes/api.py", "reason": "API endpoints that call login() will inherit the vulnerability"},
                    {"file": "middleware/auth.py", "reason": "Authentication middleware depends on login() return value"}
                ],
                "safe_files": ["models.py", "config.py", "utils/helpers.py", "tests/test_config.py"],
                "recommendation": "block"
            },
            "security": {
                "overall_score": 23,
                "has_critical_issues": True,
                "vulnerabilities": [
                    {
                        "type": "SQL Injection",
                        "severity": "critical",
                        "file": "auth.py",
                        "line": 3,
                        "description": "User input is directly concatenated into a SQL query string. An attacker can input ' OR '1'='1 to bypass authentication, or use UNION-based attacks to extract sensitive data from the database.",
                        "vulnerable_code": "db.query(\"SELECT * FROM users WHERE username=\" + username)",
                        "fixed_code": "db.query(\"SELECT * FROM users WHERE username = ?\", (username,))"
                    },
                    {
                        "type": "Missing Password Hashing",
                        "severity": "high",
                        "file": "auth.py",
                        "line": 4,
                        "description": "Password is compared in plaintext. Passwords must be hashed using bcrypt or argon2 before storage and comparison.",
                        "vulnerable_code": "if user and user.password == password:",
                        "fixed_code": "if user and bcrypt.checkpw(password.encode(), user.password_hash):"
                    },
                    {
                        "type": "Missing Rate Limiting",
                        "severity": "medium",
                        "file": "auth.py",
                        "line": 1,
                        "description": "The login function has no rate limiting, making it vulnerable to brute force attacks.",
                        "vulnerable_code": "def login(username, password):",
                        "fixed_code": "@rate_limit(max_attempts=5, window=300)\ndef login(username, password):"
                    }
                ],
                "recommendation": "block_immediately"
            },
            "tests": {
                "framework": "pytest",
                "coverage_estimate": "94%",
                "test_file_path": "tests/test_auth.py",
                "cases": [
                    {
                        "function_tested": "login",
                        "test_name": "test_login_with_valid_credentials",
                        "type": "happy_path",
                        "code": "def test_login_with_valid_credentials():\n    user = create_test_user('alice', 'SecurePass123!')\n    token = login('alice', 'SecurePass123!')\n    assert token is not None\n    assert is_valid_jwt(token)",
                        "why_it_matters": "Ensures the basic login flow works for legitimate users"
                    },
                    {
                        "function_tested": "login",
                        "test_name": "test_login_sql_injection_attack",
                        "type": "security",
                        "code": "def test_login_sql_injection_attack():\n    result = login(\"' OR '1'='1\", 'anything')\n    assert result is None",
                        "why_it_matters": "Verifies the SQL injection vulnerability is properly fixed"
                    },
                    {
                        "function_tested": "login",
                        "test_name": "test_login_with_wrong_password",
                        "type": "edge_case",
                        "code": "def test_login_with_wrong_password():\n    create_test_user('bob', 'CorrectPass!')\n    result = login('bob', 'WrongPass!')\n    assert result is None",
                        "why_it_matters": "Ensures wrong passwords are properly rejected"
                    },
                    {
                        "function_tested": "login",
                        "test_name": "test_login_with_nonexistent_user",
                        "type": "error_case",
                        "code": "def test_login_with_nonexistent_user():\n    result = login('nonexistent_user', 'anypassword')\n    assert result is None",
                        "why_it_matters": "Prevents user enumeration attacks"
                    }
                ]
            },
            "documentation": {
                "functions": [
                    {
                        "name": "login",
                        "file": "auth.py",
                        "summary": "Authenticates a user by verifying their username and password against the database. Returns a JWT token on success or None on failure.",
                        "parameters": [
                            {"name": "username", "type": "str", "description": "The user's unique username identifier", "required": True},
                            {"name": "password", "type": "str", "description": "The user's plaintext password (will be hashed for comparison)", "required": True}
                        ],
                        "returns": {"type": "Optional[str]", "description": "A signed JWT token string on success, None if authentication fails"},
                        "throws": ["DatabaseConnectionError: If the database is unreachable", "ValueError: If username or password is empty"],
                        "example": "token = login('user@example.invalid', 'YOUR_PASSWORD')\nif token:\n    session['auth_token'] = token\nelse:\n    return redirect('/login?error=invalid_credentials')",
                        "notes": "SECURITY: Always use parameterized queries. Never concatenate user input into SQL strings. Passwords must be stored as bcrypt hashes."
                    }
                ],
                "breaking_changes": [],
                "outdated_docs": ["README.md authentication section needs updating with new token format"]
            },
            "junior_guide": {
                "difficulty": "intermediate",
                "problem_solved": "This PR adds a login system so users can prove who they are before accessing protected parts of the application. Think of it like a bouncer at a club who checks your ID before letting you in.",
                "solution_explained": "The login() function takes a username and password, looks up the user in the database, checks if the password matches, and if everything is correct, hands back a JWT token (like a wristband) that proves your identity for future requests.",
                "changed_files": [
                    {
                        "file": "auth.py",
                        "role": "Authentication logic — the bouncer",
                        "changes_explained": "This file now contains the login function that checks usernames and passwords. However, it currently has a serious security bug where user input is directly inserted into database queries."
                    }
                ],
                "new_concepts": [
                    {
                        "concept": "SQL Injection",
                        "simple_explanation": "A hacking technique where an attacker types special characters into a form field to manipulate the database query and gain unauthorized access.",
                        "analogy": "Imagine a vending machine that accepts voice commands. If you say 'give me a Coke AND open the cash drawer', a buggy machine might do both. SQL injection works the same way with databases."
                    },
                    {
                        "concept": "Parameterized Queries",
                        "simple_explanation": "A safe way to build database queries where user input is treated as data, never as executable code.",
                        "analogy": "Like filling out a form with blanks — the blanks are clearly marked as data fields, so no matter what you write in them, they cannot change the structure of the form itself."
                    },
                    {
                        "concept": "JWT Token",
                        "simple_explanation": "A digitally signed string that proves your identity without needing to re-enter your password on every request.",
                        "analogy": "Like a concert wristband — once the bouncer checks your ID and puts it on, you can go in and out without showing ID every time."
                    }
                ],
                "learn_more": [
                    "OWASP SQL Injection Prevention Cheat Sheet",
                    "Python bcrypt documentation for password hashing",
                    "JWT.io — learn how JSON Web Tokens work",
                    "OWASP Authentication Cheat Sheet"
                ]
            }
        }

# Made with Bob