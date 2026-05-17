# 🎯 BobCI Demo Testing Guide - Windows

## 🚀 Quick Start Testing

After you've successfully installed the dependencies and started both servers, follow this guide to test BobCI with demo data.

---

## ✅ Prerequisites

Make sure both servers are running:
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3000

---

## 🎬 Option 1: View Pre-loaded Demo Data (Easiest)

The application comes with demo data already loaded in the database.

### Step 1: Open the Dashboard
1. Open your browser
2. Navigate to: **http://localhost:3000**
3. You should see the BobCI dashboard with demo pull requests

### Step 2: Explore a Demo PR
1. Click on any PR card (e.g., "Add API key authentication")
2. You'll see the full analysis with:
   - **Merge Safety Score** - Animated risk assessment
   - **Impact Radius** - Visual dependency graph
   - **What Could Break?** - Predictive failure analysis
   - **Security Report** - Vulnerability detection
   - **Test Report** - Generated test cases
   - **Documentation** - Auto-generated docs
   - **Junior Guide** - AI-powered explanations

### Step 3: Test Each Feature

#### A. Merge Safety Score
- Watch the animated score circle fill up
- Check the risk level (SAFE/RISKY/CRITICAL)
- Review the risk factor breakdown

#### B. Impact Radius Visualization
- See the interactive dependency graph
- Hover over nodes to see details
- Notice the color coding (red = breaking, orange = impacted)

#### C. What Could Break?
- Read the AI-generated failure predictions
- Check probability percentages
- Review mitigation strategies

#### D. Security Report
- View detected vulnerabilities
- See severity levels (CRITICAL/HIGH/MEDIUM/LOW)
- Check before/after code comparisons

#### E. Test Report
- Review generated test cases
- See test coverage recommendations
- Check edge cases identified

#### F. Documentation Report
- View auto-generated documentation
- Check function descriptions
- Review parameter documentation

#### G. Junior Developer Guide
- Read simplified explanations
- Check real-world analogies
- Review learning resources

---

## 🎬 Option 2: Create a New Demo PR (Advanced)

If you want to test the full webhook flow, you can simulate a GitHub webhook.

### Step 1: Check Backend Health
```cmd
curl http://localhost:8000/health
```
Expected response: `{"status":"healthy","service":"BobCI API"}`

### Step 2: View API Documentation
Open in browser: **http://localhost:8000/docs**

This shows the interactive Swagger UI where you can test API endpoints.

### Step 3: Create a Test PR via API

Open PowerShell and run:

```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    repository = @{
        owner = "demo"
        name = "test-repo"
    }
    pull_request = @{
        number = 123
        title = "Test PR - Security Vulnerabilities"
        user = @{
            login = "test-developer"
        }
        html_url = "https://github.com/demo/test-repo/pull/123"
        base = @{
            ref = "main"
        }
        head = @{
            ref = "feature/test"
        }
    }
    diff = @"
diff --git a/auth.py b/auth.py
index 1234567..abcdefg 100644
--- a/auth.py
+++ b/auth.py
@@ -1,10 +1,15 @@
 import hashlib
+import os
 
+# Hardcoded API key
+API_KEY = "sk_live_1234567890abcdef"
+
 def authenticate_user(username, password):
-    # Using secure bcrypt
-    return check_password(username, password)
+    # Using MD5 (insecure)
+    hashed = hashlib.md5(password.encode()).hexdigest()
+    query = f"SELECT * FROM users WHERE username='{username}'"
+    return True
"@
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/api/analyze" -Method Post -Headers $headers -Body $body
```

### Step 4: View the Results
1. Go to http://localhost:3000
2. Refresh the page
3. You should see your new PR in the list
4. Click on it to see the analysis

---

## 🎯 Demo Scenarios to Test

### Scenario 1: High-Risk PR
**What to look for:**
- Merge Safety Score < 40 (CRITICAL)
- Multiple security vulnerabilities
- High impact radius
- Multiple failure predictions

**Expected findings:**
- SQL injection vulnerabilities
- Hardcoded credentials
- Weak password hashing
- Missing authentication

### Scenario 2: Medium-Risk PR
**What to look for:**
- Merge Safety Score 40-70 (RISKY)
- Some security issues
- Moderate impact
- Few failure predictions

### Scenario 3: Low-Risk PR
**What to look for:**
- Merge Safety Score > 70 (SAFE)
- No critical issues
- Low impact
- Minimal predictions

---

## 🧪 Testing Checklist

### Visual Components
- [ ] Dashboard loads correctly
- [ ] PR cards display properly
- [ ] Animations are smooth
- [ ] Colors and styling look good
- [ ] Icons and badges render correctly

### Functional Components
- [ ] Can click on PR cards
- [ ] Can navigate between tabs
- [ ] Can view all reports
- [ ] Graphs and visualizations work
- [ ] Hover effects work

### Data Display
- [ ] Merge Safety Score shows correctly
- [ ] Risk levels are accurate
- [ ] Vulnerabilities are listed
- [ ] Test cases are generated
- [ ] Documentation is complete
- [ ] Junior guide is helpful

### Performance
- [ ] Pages load quickly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] API responses are fast

---

## 🎨 Demo Presentation Tips

### For Judges/Stakeholders

1. **Start with the Dashboard**
   - Show the overview
   - Highlight the stats
   - Point out the beautiful UI

2. **Open a Critical PR**
   - Show the risk badge
   - Emphasize the low safety score
   - Explain the multi-agent analysis

3. **Walk Through Each Report**
   - Security: Show vulnerabilities with fixes
   - Impact: Show the dependency graph
   - Predictions: Show "What Could Break?"
   - Tests: Show generated test cases
   - Docs: Show auto-generated documentation
   - Guide: Show junior developer explanations

4. **Highlight Key Features**
   - Real-time analysis (< 6 seconds)
   - 7 specialized AI agents
   - IBM Bob integration
   - watsonx.ai powered insights
   - Beautiful visualizations

5. **End with Impact**
   - Show the business value
   - Emphasize productivity gains
   - Highlight security improvements

---

## 📊 Expected Demo Results

### For the Pre-loaded Demo PR

**Merge Safety Score:** 23/100 (CRITICAL)

**Security Findings:**
- 3 CRITICAL vulnerabilities
- 2 HIGH vulnerabilities
- 1 MEDIUM vulnerability

**Impact Analysis:**
- 1 file changed
- 4 files directly impacted
- 6 files indirectly affected
- Blast radius: HIGH

**Failure Predictions:**
- Database compromise: 85% probability
- Authentication bypass: 78% probability
- Data leak: 65% probability

**Test Coverage:**
- 0% current coverage
- 12 test cases recommended
- 8 edge cases identified

---

## 🐛 Troubleshooting Demo Issues

### Issue: No PRs showing on dashboard
**Solution:**
1. Check if backend is running: http://localhost:8000/health
2. Check database: `bobci/backend/bobci.db` should exist
3. Restart backend server

### Issue: PR details not loading
**Solution:**
1. Check browser console for errors (F12)
2. Verify API is accessible: http://localhost:8000/docs
3. Check frontend environment variables

### Issue: Animations not working
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+F5)
3. Try a different browser

### Issue: Graphs not rendering
**Solution:**
1. Check browser console for errors
2. Ensure React Flow dependencies are installed
3. Try refreshing the page

---

## 🎥 Recording a Demo Video

### Preparation
1. Close unnecessary browser tabs
2. Maximize browser window
3. Set zoom to 100%
4. Disable notifications
5. Test all features work smoothly

### Recording Tips
1. Start with the dashboard overview
2. Click on a high-risk PR
3. Show each tab slowly
4. Pause on key visualizations
5. Highlight unique features
6. End with the impact summary

### What to Emphasize
- Beautiful, professional UI
- Real-time AI analysis
- Predictive intelligence
- IBM Bob integration
- Business value

---

## ✅ Success Indicators

You've successfully tested BobCI if:
- ✅ Dashboard loads with demo PRs
- ✅ Can view PR details
- ✅ All tabs work correctly
- ✅ Animations are smooth
- ✅ Graphs render properly
- ✅ No console errors
- ✅ API responds quickly

---

## 🚀 Next Steps

After testing:
1. Review the demo scripts in `DEMO_SCRIPT.md`
2. Practice the presentation flow
3. Prepare for questions
4. Record a demo video
5. Share with stakeholders

---

## 📞 Need Help?

If you encounter issues:
1. Check `RUN_PROJECT.md` for setup instructions
2. Review `PYTHON_313_FIX.md` for dependency issues
3. Check `QUICK_START.md` for detailed setup
4. Review backend logs for errors
5. Check frontend console for errors

---

**Ready to demo? Open http://localhost:3000 and start exploring!** 🎉