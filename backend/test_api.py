"""
Test script to verify database has data and API is working
"""
import requests
import json
from database import SessionLocal
from models import Repository, PullRequest, AnalysisReport

def test_database():
    """Check if database has data"""
    print("🔍 Checking database...")
    db = SessionLocal()
    
    try:
        repo_count = db.query(Repository).count()
        pr_count = db.query(PullRequest).count()
        report_count = db.query(AnalysisReport).count()
        
        print(f"📊 Database Status:")
        print(f"   Repositories: {repo_count}")
        print(f"   Pull Requests: {pr_count}")
        print(f"   Analysis Reports: {report_count}")
        
        if pr_count > 0:
            print("\n📋 Pull Requests in database:")
            prs = db.query(PullRequest).all()
            for pr in prs:
                print(f"   - PR #{pr.pr_number}: {pr.pr_title} ({pr.risk_level})")
        
        return pr_count > 0
    finally:
        db.close()

def test_api():
    """Test if API is accessible"""
    print("\n🌐 Testing API...")
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"   Health check: {response.status_code}")
        
        # Test pull requests endpoint with API key
        headers = {"X-API-Key": "demo_api_key_for_testing"}
        response = requests.get("http://localhost:8000/api/pull-requests", headers=headers, timeout=5)
        print(f"   Pull requests endpoint: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Returned {len(data)} pull requests")
            if len(data) > 0:
                print(f"\n   First PR: {json.dumps(data[0], indent=2)}")
        else:
            print(f"   Error: {response.text}")
        
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("BobCI API Test")
    print("=" * 50)
    
    has_data = test_database()
    api_works = test_api()
    
    print("\n" + "=" * 50)
    if has_data and api_works:
        print("✅ Everything looks good!")
        print("\nNext steps:")
        print("1. Make sure frontend is running: npm run dev")
        print("2. Open http://localhost:3000")
        print("3. Check browser console for errors (F12)")
    elif not has_data:
        print("❌ No data in database!")
        print("\nRun: seed_demo.bat")
    elif not api_works:
        print("❌ API not working!")
        print("\nMake sure backend is running: run_backend.bat")
    print("=" * 50)

# Made with Bob
