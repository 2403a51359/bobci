import requests
import hmac
import hashlib
from typing import Optional, Dict, List, Any

class GitHubClient:
    """
    GitHub API client for interacting with repositories and pull requests.
    Handles authentication, webhook verification, and API calls.
    """
    
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "BobCI/1.0"
        }
    
    def get_pull_request_diff(self, owner: str, repo: str, pr_number: int, token: str) -> Optional[str]:
        """
        Fetch the full diff of a pull request from GitHub.
        
        Args:
            owner: Repository owner (e.g., "facebook")
            repo: Repository name (e.g., "react")
            pr_number: Pull request number
            token: GitHub personal access token
            
        Returns:
            The diff content as a string, or None if the request fails
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
        headers = {
            **self.headers,
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3.diff"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"Error fetching PR diff: {e}")
            return None
    
    def post_pr_comment(self, owner: str, repo: str, pr_number: int, token: str, comment_body: str) -> Optional[str]:
        """
        Post a comment to a GitHub pull request.
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: Pull request number
            token: GitHub personal access token
            comment_body: The comment text (supports Markdown)
            
        Returns:
            The comment ID as a string, or None if the request fails
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/issues/{pr_number}/comments"
        headers = {
            **self.headers,
            "Authorization": f"token {token}"
        }
        payload = {"body": comment_body}
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            return str(response.json().get("id"))
        except requests.exceptions.RequestException as e:
            print(f"Error posting PR comment: {e}")
            return None
    
    def update_pr_comment(self, owner: str, repo: str, comment_id: str, token: str, comment_body: str) -> bool:
        """
        Update an existing GitHub pull request comment.
        
        Args:
            owner: Repository owner
            repo: Repository name
            comment_id: The ID of the comment to update
            token: GitHub personal access token
            comment_body: The new comment text
            
        Returns:
            True if successful, False otherwise
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/issues/comments/{comment_id}"
        headers = {
            **self.headers,
            "Authorization": f"token {token}"
        }
        payload = {"body": comment_body}
        
        try:
            response = requests.patch(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"Error updating PR comment: {e}")
            return False
    
    def get_pr_files(self, owner: str, repo: str, pr_number: int, token: str) -> List[Dict[str, Any]]:
        """
        Get the list of files changed in a pull request.
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: Pull request number
            token: GitHub personal access token
            
        Returns:
            List of file objects with filename, status, additions, deletions, etc.
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/files"
        headers = {
            **self.headers,
            "Authorization": f"token {token}"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching PR files: {e}")
            return []
    
    def verify_webhook_signature(self, payload_body: bytes, signature: str, secret: str) -> bool:
        """
        Verify the HMAC signature of a GitHub webhook payload.
        This ensures the webhook request actually came from GitHub.
        
        Args:
            payload_body: The raw request body as bytes
            signature: The X-Hub-Signature-256 header value
            secret: The webhook secret configured in GitHub
            
        Returns:
            True if the signature is valid, False otherwise
        """
        if not signature or not secret:
            return False
        
        if not signature.startswith("sha256="):
            return False
        
        expected_signature = "sha256=" + hmac.new(
            secret.encode('utf-8'),
            payload_body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def get_pull_request_details(self, owner: str, repo: str, pr_number: int, token: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a pull request.
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: Pull request number
            token: GitHub personal access token
            
        Returns:
            Dictionary with PR details, or None if the request fails
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
        headers = {
            **self.headers,
            "Authorization": f"token {token}"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching PR details: {e}")
            return None

# Made with Bob
