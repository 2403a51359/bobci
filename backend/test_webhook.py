import requests
import json

# Test webhook payload
payload = {
    "action": "opened",
    "number": 1,
    "pull_request": {
        "number": 1,
        "title": "Test PR - BobCI Integration",
        "user": {"login": "your-github-username"},
        "html_url": "https://github.com/your-github-username/your-repo-name/pull/1",
        "base": {"ref": "main"},
        "head": {"ref": "feature/test-bobci"}
    },
    "repository": {
        "owner": {"login": "your-github-username"},
        "name": "your-repo-name"
    }
}

headers = {
    "Content-Type": "application/json",
    "X-GitHub-Event": "pull_request"
}

print("🚀 Sending test webhook to http://localhost:8000/webhook/github")
print(f"📦 Payload: {json.dumps(payload, indent=2)}")
print()

try:
    response = requests.post(
        "http://localhost:8000/webhook/github",
        json=payload,
        headers=headers
    )
    
    print(f"✅ Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
    
    if response.status_code == 200:
        print("\n🎉 SUCCESS! Check your dashboard at http://localhost:3000")
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n⚠️  Make sure the backend is running: python main.py")

# Made with Bob
