# 🚀 Running BobCI Project - Step by Step Guide

## ✅ Setup Complete!

I've prepared everything you need to run the BobCI project. Here's what has been set up:

### Backend Setup ✓
- ✅ Virtual environment created at `bobci/backend/venv`
- ✅ Environment variables configured in `bobci/backend/.env`
- ✅ Database file exists at `bobci/backend/bobci.db`
- ✅ Run script created: `bobci/backend/run_backend.bat`

### Frontend Setup ✓
- ✅ Environment variables configured in `bobci/frontend/.env.local`
- ✅ Run script created: `bobci/frontend/run_frontend.bat`

---

## 🎯 How to Run the Project

### Option 1: Using the Batch Scripts (Easiest)

#### Step 1: Start the Backend
1. Open a **new Command Prompt** or **PowerShell** window
2. Navigate to the backend directory:
   ```cmd
   cd c:\Projects\Hackathon-Lablab\bobci\backend
   ```
3. Run the backend script:
   ```cmd
   run_backend.bat
   ```
4. Wait for the message: `🚀 BobCI API is running on http://0.0.0.0:8000`
5. **Keep this window open**

#### Step 2: Start the Frontend
1. Open **another new Command Prompt** or **PowerShell** window
2. Navigate to the frontend directory:
   ```cmd
   cd c:\Projects\Hackathon-Lablab\bobci\frontend
   ```
3. Run the frontend script:
   ```cmd
   run_frontend.bat
   ```
4. Wait for the message: `ready - started server on 0.0.0.0:3000`
5. **Keep this window open**

#### Step 3: Access the Application
Open your browser and go to:
**http://localhost:3000**

---

### Option 2: Manual Commands

#### Backend (Terminal 1)
```cmd
cd c:\Projects\Hackathon-Lablab\bobci\backend
venv\Scripts\python.exe -m pip install -r requirements.txt
venv\Scripts\python.exe main.py
```

#### Frontend (Terminal 2)
```cmd
cd c:\Projects\Hackathon-Lablab\bobci\frontend
npm install
npm run dev
```

---

## 🧪 Testing the Application

### 1. Check Backend Health
Open a browser or use curl:
```
http://localhost:8000/health
```
Expected response: `{"status":"healthy","service":"BobCI API"}`

### 2. View API Documentation
```
http://localhost:8000/docs
```
This shows the interactive API documentation (Swagger UI)

### 3. Access the Dashboard
```
http://localhost:3000
```
You should see the BobCI dashboard with demo data

### 4. Test Features
- **View Pull Requests**: The homepage shows demo PRs
- **Click on a PR**: See detailed analysis
- **Check Reports**: Security, Testing, Documentation, Impact analysis
- **Junior Developer Guide**: AI-powered guidance for junior developers

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: "ModuleNotFoundError: No module named 'fastapi'"**
```cmd
cd bobci\backend
venv\Scripts\python.exe -m pip install -r requirements.txt
```

**Problem: "Port 8000 already in use"**
```cmd
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Problem: "Database error"**
```cmd
cd bobci\backend
del bobci.db
venv\Scripts\python.exe main.py
```

### Frontend Issues

**Problem: "npm: command not found" or script execution error**
- Make sure Node.js is installed: `node --version`
- Try running from Command Prompt instead of PowerShell
- Or enable PowerShell script execution:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

**Problem: "Port 3000 already in use"**
```cmd
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Problem: "Cannot connect to backend"**
- Make sure backend is running on port 8000
- Check `bobci/frontend/.env.local` has correct backend URL
- Verify backend is accessible: http://localhost:8000/health

---

## 📊 What to Expect

### Backend Console Output
```
✅ Database initialized
🚀 BobCI API is running
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Frontend Console Output
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully
wait  - compiling...
event - compiled client and server successfully
```

---

## 🎉 Success Indicators

✅ Backend running: http://localhost:8000/health returns healthy status
✅ Frontend running: http://localhost:3000 shows the dashboard
✅ Demo data visible: Pull requests are displayed on the homepage
✅ Navigation works: Can click through different pages
✅ API accessible: http://localhost:8000/docs shows Swagger UI

---

## 🔄 Stopping the Servers

### To stop the servers:
1. Go to each terminal window
2. Press `CTRL+C`
3. Close the terminal windows

---

## 📝 Notes

- **Demo Mode**: The application runs with demo data by default
- **No GitHub Required**: You can test without GitHub integration
- **watsonx.ai**: Optional - demo keys are configured for testing
- **Bob Shell**: Not required for basic testing with demo data

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console output for error messages
3. Verify both backend and frontend are running
4. Check the QUICK_START.md for detailed setup instructions

---

## 🚀 Next Steps

After successfully running the project:
1. Explore the dashboard at http://localhost:3000
2. Check the API documentation at http://localhost:8000/docs
3. Review the demo pull requests
4. Test different features (Security, Testing, Docs reports)
5. Read DEPLOYMENT.md for production deployment

---

**Ready to run? Follow the steps in "Option 1: Using the Batch Scripts" above!**