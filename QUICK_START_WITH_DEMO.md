# 🚀 BobCI Quick Start with Demo Data

## Complete Setup in 5 Minutes!

---

## Step 1: Fix Python 3.13 Dependencies

The original requirements.txt has compatibility issues with Python 3.13. This has been fixed!

### Clean and Recreate Virtual Environment

```cmd
cd c:\Projects\Hackathon-Lablab\bobci\backend
rmdir /s /q venv
python -m venv venv
```

---

## Step 2: Install Backend Dependencies

```cmd
cd c:\Projects\Hackathon-Lablab\bobci\backend
venv\Scripts\python.exe -m pip install -r requirements.txt
```

This should now install successfully without requiring Visual Studio Build Tools!

---

## Step 3: Seed Demo Data

**IMPORTANT:** Do this BEFORE starting the backend server.

```cmd
cd c:\Projects\Hackathon-Lablab\bobci\backend
seed_demo.bat
```

This will create:
- ✅ 1 demo repository
- ✅ 3 pull requests (Critical, Medium, Low risk)
- ✅ Multiple analysis reports with realistic data

---

## Step 4: Start Backend Server

```cmd
cd c:\Projects\Hackathon-Lablab\bobci\backend
run_backend.bat
```

Wait for:
```
✅ Database initialized
🚀 BobCI API is running
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!**

---

## Step 5: Start Frontend Server

Open a **NEW** terminal:

```cmd
cd c:\Projects\Hackathon-Lablab\bobci\frontend
run_frontend.bat
```

Wait for:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Keep this terminal open too!**

---

## Step 6: View the Dashboard

Open your browser and go to:

**http://localhost:3000**

You should now see:
- ✅ 3 pull requests on the dashboard
- ✅ Risk badges (Critical, Medium, Low)
- ✅ Beautiful dark UI
- ✅ Stats and metrics

---

## Step 7: Explore Demo PRs

### PR #42: "Add API key authentication" (CRITICAL)

Click on this PR to see:

1. **Merge Safety Score: 23/100** (CRITICAL)
   - Animated risk assessment
   - 7-factor analysis breakdown

2. **Security Report**
   - 6 vulnerabilities found
   - 3 CRITICAL, 2 HIGH, 1 MEDIUM
   - Before/after code comparisons
   - Fix suggestions

3. **Impact Analysis**
   - 1 file changed
   - 10 files impacted
   - High blast radius
   - Dependency visualization

4. **Testing Report**
   - 0% current coverage
   - 8 test cases recommended
   - 8 edge cases identified

5. **Documentation Report**
   - Missing docs for 3 functions
   - Auto-generated documentation
   - Parameter descriptions

6. **Junior Developer Guide**
   - SQL Injection explained
   - Hardcoded secrets explained
   - Weak password hashing explained
   - Real-world analogies
   - Code examples

### PR #43: "Update user profile endpoint" (MEDIUM)

Medium risk PR with minor security concerns.

### PR #44: "Fix typo in README" (LOW)

Low risk documentation change.

---

## 🎯 What to Test

### Dashboard Features
- [ ] View all PRs
- [ ] Filter by risk level (All, Low, Medium, High, Critical)
- [ ] Search PRs by title
- [ ] Click on PR cards

### PR Detail Page
- [ ] View Merge Safety Score animation
- [ ] Check Security Report
- [ ] View Impact Analysis
- [ ] Read failure predictions
- [ ] Check Test Report
- [ ] View Documentation
- [ ] Read Junior Guide

### Visual Elements
- [ ] Smooth animations
- [ ] Color-coded risk badges
- [ ] Interactive graphs
- [ ] Hover effects
- [ ] Responsive layout

---

## 🐛 Troubleshooting

### Issue: Dashboard is empty

**Solution:**
1. Stop the backend server (Ctrl+C)
2. Run the seed script:
   ```cmd
   cd c:\Projects\Hackathon-Lablab\bobci\backend
   seed_demo.bat
   ```
3. Start the backend again:
   ```cmd
   run_backend.bat
   ```
4. Refresh the frontend: http://localhost:3000

### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Solution:**
```cmd
cd c:\Projects\Hackathon-Lablab\bobci\backend
rmdir /s /q venv
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Issue: Backend won't start

**Solution:**
1. Check if port 8000 is in use:
   ```cmd
   netstat -ano | findstr :8000
   ```
2. Kill the process if needed:
   ```cmd
   taskkill /PID <PID> /F
   ```
3. Try starting again

### Issue: Frontend won't start

**Solution:**
1. Check if port 3000 is in use:
   ```cmd
   netstat -ano | findstr :3000
   ```
2. Kill the process if needed:
   ```cmd
   taskkill /PID <PID> /F
   ```
3. Try starting again

### Issue: Can't install npm packages

**Solution:**
Try running from Command Prompt instead of PowerShell, or enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📊 Expected Results

### Dashboard Stats
- **Total PRs:** 3
- **Critical:** 1
- **Medium:** 1
- **Low:** 1

### PR #42 Details
- **Merge Safety Score:** 23/100
- **Risk Level:** CRITICAL
- **Security Score:** 23/100
- **Vulnerabilities:** 6 (3 Critical, 2 High, 1 Medium)
- **Test Coverage:** 0%
- **Documentation Score:** 10/100

---

## 🎬 Demo Presentation Flow

1. **Show Dashboard** (10 seconds)
   - Point out the 3 PRs
   - Highlight the risk badges
   - Show the beautiful UI

2. **Open Critical PR** (20 seconds)
   - Click on PR #42
   - Show the CRITICAL badge
   - Point out the low safety score

3. **Security Report** (30 seconds)
   - Scroll through vulnerabilities
   - Show before/after code
   - Highlight severity levels

4. **Impact Analysis** (20 seconds)
   - Show dependency graph
   - Point out blast radius
   - Explain the ripple effect

5. **Junior Guide** (20 seconds)
   - Show SQL injection explanation
   - Read the analogy
   - Show code examples

6. **Wrap Up** (10 seconds)
   - Emphasize the value
   - Highlight IBM Bob integration
   - Show the vision

**Total Time:** ~2 minutes

---

## 🚀 Next Steps

After successfully running the demo:

1. **Read the full demo script:** `DEMO_SCRIPT.md`
2. **Review testing guide:** `DEMO_TESTING_GUIDE.md`
3. **Check architecture:** `architecture/SYSTEM_ARCHITECTURE.md`
4. **Explore API docs:** http://localhost:8000/docs
5. **Practice the presentation**

---

## 📝 Quick Commands Reference

### Backend
```cmd
# Seed demo data (backend must be stopped)
cd bobci\backend
seed_demo.bat

# Start backend
run_backend.bat

# Check health
curl http://localhost:8000/health
```

### Frontend
```cmd
# Start frontend
cd bobci\frontend
run_frontend.bat

# View in browser
start http://localhost:3000
```

### Database
```cmd
# Reset database (backend must be stopped)
cd bobci\backend
del bobci.db
seed_demo.bat
```

---

## ✅ Success Checklist

- [ ] Backend dependencies installed
- [ ] Demo data seeded
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Dashboard shows 3 PRs
- [ ] Can view PR details
- [ ] All reports display correctly
- [ ] Animations work smoothly
- [ ] No console errors

---

## 🎉 You're Ready!

If you can see the dashboard with 3 PRs and all the features work, you're ready to demo BobCI!

**Dashboard:** http://localhost:3000  
**API Docs:** http://localhost:8000/docs

---

*Built with IBM Bob • Powered by watsonx.ai • Ready to transform code review*