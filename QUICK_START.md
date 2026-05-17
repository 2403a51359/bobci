# 🚀 BobCI Quick Start Guide

Get BobCI up and running in 5 minutes!

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Python 3.9+** installed
- ✅ **Node.js 18+** installed
- ✅ **Git** installed
- ✅ **IBM Bob Shell** installed and accessible
- ✅ **GitHub Personal Access Token** (optional, for GitHub integration)
- ✅ **watsonx.ai API Key** (optional, for enhanced AI features)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
# If from GitHub
git clone https://github.com/yourusername/bobci.git
cd bobci

# Or if running locally
cd bobci
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# (See configuration section below)
```

### Step 3: Configure Environment Variables

Edit `backend/.env`:

```env
# Minimal configuration for local testing
GITHUB_WEBHOOK_SECRET=
DATABASE_URL=sqlite:///./bobci.db
BOB_SHELL_PATH=bob
WATSONX_API_KEY=your_watsonx_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
FRONTEND_URL=http://localhost:3000
```

**Note**: You can leave `GITHUB_WEBHOOK_SECRET` empty for local testing.

### Step 4: Start Backend Server

```bash
# Make sure you're in the backend directory with venv activated
python main.py
```

You should see:
```
✅ Database initialized
🚀 BobCI API is running
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Frontend Setup (New Terminal)

```bash
# Open a new terminal
cd bobci/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 6: Access the Application

Open your browser and navigate to:

**🌐 http://localhost:3000**

You should see the BobCI dashboard!

---

## 🎯 Testing the Application

### Option 1: Use Demo Data (Easiest)

The application comes with demo data built-in. Just:

1. Open http://localhost:3000
2. You'll see demo pull requests
3. Click on any PR to see the analysis

### Option 2: Test with Webhook (Advanced)

1. **Install ngrok** (for local webhook testing):
   ```bash
   # Download from https://ngrok.com/download
   ngrok http 8000
   ```

2. **Configure GitHub Webhook**:
   - Go to your GitHub repository
   - Settings → Webhooks → Add webhook
   - Payload URL: `https://your-ngrok-url.ngrok.io/webhook/github`
   - Content type: `application/json`
   - Events: Select "Pull requests"
   - Add webhook

3. **Add Repository to BobCI**:
   - Go to http://localhost:3000/setup
   - Enter repository details
   - Add your GitHub token
   - Save

4. **Open a Pull Request**:
   - Create a PR in your GitHub repository
   - BobCI will automatically analyze it
   - View results in the dashboard

---

## 🔧 Configuration Details

### Backend Environment Variables

```env
# GitHub Integration (Optional for testing)
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Database (Default is fine for development)
DATABASE_URL=sqlite:///./bobci.db

# IBM Bob (Required for AI analysis)
BOB_SHELL_PATH=bob

# watsonx.ai (Optional - enhances junior developer guide)
WATSONX_API_KEY=your_watsonx_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_API_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2

# CORS (Default is fine for development)
FRONTEND_URL=http://localhost:3000
```

### Getting API Keys

**GitHub Personal Access Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `write:discussion`
4. Copy the token

**watsonx.ai API Key:**
1. Go to https://cloud.ibm.com/
2. Navigate to watsonx.ai
3. Create a project
4. Get API key from project settings
5. Copy API key and project ID

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Solution: Make sure virtual environment is activated
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Then reinstall dependencies
pip install -r requirements.txt
```

**Problem**: `Database connection error`
```bash
# Solution: Delete the database and restart
rm bobci.db
python main.py
```

**Problem**: `Bob shell not found`
```bash
# Solution: Install IBM Bob or update BOB_SHELL_PATH in .env
# Check if Bob is installed:
bob --version

# If not installed, install Bob from IBM
```

### Frontend Issues

**Problem**: `npm install` fails
```bash
# Solution: Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `Port 3000 already in use`
```bash
# Solution: Use a different port
npm run dev -- -p 3001

# Or kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

**Problem**: `API connection refused`
```bash
# Solution: Make sure backend is running on port 8000
# Check backend terminal for errors
# Verify NEXT_PUBLIC_API_URL in frontend/.env.local
```

### Common Issues

**Problem**: No data showing in dashboard
```bash
# Solution: The app uses demo data by default
# If you want real data, set up GitHub webhook integration
# Or manually trigger analysis via API
```

**Problem**: Analysis not working
```bash
# Solution: Check if Bob is installed and accessible
bob --version

# Check backend logs for errors
# Verify watsonx.ai credentials if using enhanced features
```

---

## 📊 Verifying Installation

### Check Backend

```bash
# Test API health
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"BobCI API"}

# Test API root
curl http://localhost:8000/

# Expected: JSON with API information
```

### Check Frontend

1. Open http://localhost:3000
2. You should see the BobCI dashboard
3. Navigation should work
4. Demo data should be visible

### Check Database

```bash
# From backend directory
python -c "from database import SessionLocal; db = SessionLocal(); print('✅ Database connected')"
```

---

## 🎨 Development Mode Features

### Backend (FastAPI)

- **Auto-reload**: Code changes automatically reload the server
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative API docs**: http://localhost:8000/redoc

### Frontend (Next.js)

- **Fast Refresh**: Changes appear instantly
- **Error overlay**: Helpful error messages
- **Development tools**: React DevTools compatible

---

## 🚀 Production Deployment

For production deployment, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [GITHUB_UPLOAD_GUIDE.md](GITHUB_UPLOAD_GUIDE.md) - GitHub setup

---

## 📚 Next Steps

After getting the app running:

1. **Explore the Dashboard**: http://localhost:3000
2. **Read the Documentation**: [PROJECT_INDEX.md](PROJECT_INDEX.md)
3. **Try the API**: http://localhost:8000/docs
4. **Set up GitHub Integration**: [DEPLOYMENT.md](DEPLOYMENT.md)
5. **Watch the Demo**: [demo/DEMO_SCRIPT.md](demo/DEMO_SCRIPT.md)

---

## 🆘 Getting Help

- **Documentation**: [PROJECT_INDEX.md](PROJECT_INDEX.md)
- **API Reference**: [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md)
- **Architecture**: [architecture/SYSTEM_ARCHITECTURE.md](architecture/SYSTEM_ARCHITECTURE.md)
- **Issues**: GitHub Issues
- **Security**: [SECURITY.md](SECURITY.md)

---

## ⚡ Quick Commands Reference

### Backend
```bash
# Start backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py

# Run tests
pytest

# Check code style
flake8 .
```

### Frontend
```bash
# Start frontend
cd frontend
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database
```bash
# Reset database
cd backend
rm bobci.db
python main.py
```

---

## 🎉 Success!

If you can see the BobCI dashboard at http://localhost:3000, you're all set!

**Next**: Try analyzing a pull request or explore the demo data.

---

*Need help? Check [PROJECT_INDEX.md](PROJECT_INDEX.md) for complete documentation.*