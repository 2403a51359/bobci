# 🚀 BobCI Deployment Guide

Complete guide for deploying BobCI to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [GitHub Integration](#github-integration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required
- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **Git** for version control
- **IBM Bob Shell** installed
- **GitHub Account** with admin access to repositories

### Optional (Enhanced Features)
- **watsonx.ai API Key** - For AI-powered analysis
- **PostgreSQL** - For production database (recommended over SQLite)
- **Redis** - For caching and job queues
- **Docker** - For containerized deployment

---

## 💻 Local Development

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/bobci.git
cd bobci
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Unix/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Initialize database
python -c "from database import init_db; init_db()"

# Start development server
python main.py
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Verify Installation

```bash
# Test backend
curl http://localhost:8000/health

# Test frontend
# Open browser to http://localhost:3000
```

---

## 🌐 Production Deployment

### Option 1: Traditional Server (VPS/EC2)

#### Backend Deployment

```bash
# Install system dependencies
sudo apt update
sudo apt install python3.9 python3-pip nginx supervisor

# Clone repository
cd /opt
sudo git clone https://github.com/yourusername/bobci.git
cd bobci/backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
sudo nano .env
# Add production credentials

# Setup Supervisor for process management
sudo nano /etc/supervisor/conf.d/bobci.conf
```

**Supervisor Configuration:**
```ini
[program:bobci]
directory=/opt/bobci/backend
command=/opt/bobci/backend/venv/bin/python main.py
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/bobci/err.log
stdout_logfile=/var/log/bobci/out.log
environment=PATH="/opt/bobci/backend/venv/bin"
```

```bash
# Start service
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start bobci
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.bobci.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Frontend Deployment

```bash
cd /opt/bobci/frontend

# Build for production
npm run build

# Serve with PM2
npm install -g pm2
pm2 start npm --name "bobci-frontend" -- start
pm2 save
pm2 startup
```

**Nginx Configuration for Frontend:**
```nginx
server {
    listen 80;
    server_name bobci.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Docker Deployment

#### Backend Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/bobci
      - WATSONX_API_KEY=${WATSONX_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=bobci
      - POSTGRES_USER=bobci
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Railway/Render (Backend)

1. Connect GitHub repository
2. Select `backend` directory
3. Add environment variables
4. Deploy automatically on push

---

## ⚙️ Environment Configuration

### Backend Environment Variables

```env
# Required
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
DATABASE_URL=postgresql://user:pass@host:5432/bobci
BOB_SHELL_PATH=/usr/local/bin/bob
FRONTEND_URL=https://bobci.yourdomain.com

# Optional - Enhanced AI
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_API_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2

# Optional - Performance
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379

# Optional - Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=INFO
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.bobci.yourdomain.com
NEXT_PUBLIC_GITHUB_APP_URL=https://github.com/apps/bobci
```

---

## 🗄️ Database Setup

### PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE bobci;
CREATE USER bobci WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE bobci TO bobci;
\q

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://bobci:secure_password@localhost:5432/bobci
```

### Database Migrations

```bash
# Run migrations
cd backend
python -c "from database import init_db; init_db()"
```

### Backup Strategy

```bash
# Automated daily backups
sudo crontab -e

# Add this line:
0 2 * * * pg_dump bobci > /backups/bobci_$(date +\%Y\%m\%d).sql
```

---

## 🔗 GitHub Integration

### 1. Create GitHub App

1. Go to GitHub Settings → Developer Settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in details:
   - **Name:** BobCI
   - **Homepage URL:** https://bobci.yourdomain.com
   - **Webhook URL:** https://api.bobci.yourdomain.com/webhook/github
   - **Webhook Secret:** Generate a secure secret
4. Permissions:
   - **Pull requests:** Read & Write
   - **Contents:** Read
   - **Metadata:** Read
5. Subscribe to events:
   - Pull request
6. Create app and note the App ID

### 2. Generate Private Key

1. In your GitHub App settings
2. Scroll to "Private keys"
3. Click "Generate a private key"
4. Save the `.pem` file securely

### 3. Install App

1. Go to your GitHub App page
2. Click "Install App"
3. Select repositories
4. Authorize

### 4. Configure Webhook

The webhook URL should be:
```
https://api.bobci.yourdomain.com/webhook/github
```

Test the webhook:
```bash
curl -X POST https://api.bobci.yourdomain.com/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "test"}'
```

---

## 📊 Monitoring & Logging

### Application Logs

```bash
# Backend logs
tail -f /var/log/bobci/out.log
tail -f /var/log/bobci/err.log

# Frontend logs (PM2)
pm2 logs bobci-frontend
```

### Health Checks

```bash
# Backend health
curl https://api.bobci.yourdomain.com/health

# Frontend health
curl https://bobci.yourdomain.com
```

### Monitoring Tools

#### Sentry (Error Tracking)

```python
# backend/main.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0
)
```

#### Prometheus (Metrics)

```python
# Add to requirements.txt
prometheus-client==0.19.0

# backend/main.py
from prometheus_client import Counter, Histogram
from prometheus_client import make_asgi_app

# Add metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Backend Won't Start

```bash
# Check logs
tail -f /var/log/bobci/err.log

# Common fixes:
# - Verify Python version: python --version
# - Check virtual environment is activated
# - Verify all environment variables are set
# - Check database connection
```

#### 2. Frontend Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### 3. Webhook Not Triggering

```bash
# Check GitHub webhook deliveries
# Go to GitHub App → Advanced → Recent Deliveries

# Verify webhook secret matches
# Check firewall allows GitHub IPs
# Test webhook manually:
curl -X POST https://api.bobci.yourdomain.com/webhook/github \
  -H "X-GitHub-Event: pull_request" \
  -d @test_payload.json
```

#### 4. Database Connection Issues

```bash
# Test connection
psql -h localhost -U bobci -d bobci

# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL format
# postgresql://user:password@host:port/database
```

#### 5. IBM Bob Not Found

```bash
# Verify Bob installation
which bob
bob --version

# Update BOB_SHELL_PATH in .env
BOB_SHELL_PATH=/usr/local/bin/bob
```

### Performance Optimization

#### Enable Caching

```python
# Install Redis
pip install redis

# Add to backend
from redis import Redis
redis_client = Redis.from_url(os.getenv("REDIS_URL"))
```

#### Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_pr_status ON pull_requests(status);
CREATE INDEX idx_pr_created ON pull_requests(created_at DESC);
CREATE INDEX idx_repo_active ON repositories(is_active);
```

#### Frontend Optimization

```bash
# Enable compression
npm install compression

# Optimize images
npm install next-optimized-images
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate credentials regularly

### 2. HTTPS
- Always use HTTPS in production
- Use Let's Encrypt for free SSL certificates

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bobci.yourdomain.com
```

### 3. Rate Limiting

```python
# Add to backend
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/pull-requests")
@limiter.limit("100/minute")
async def get_prs():
    ...
```

### 4. CORS Configuration

```python
# Restrict CORS to your domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bobci.yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
```

### Load Balancing

```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Monitoring setup
- [ ] Backup strategy in place

### Post-Deployment
- [ ] Health checks passing
- [ ] Webhooks working
- [ ] Logs being collected
- [ ] Metrics being tracked
- [ ] Error tracking active
- [ ] Documentation updated

---

## 📞 Support

For deployment issues:
- 📧 Email: devops@bobci.dev
- 💬 Discord: [Join our community](https://discord.gg/bobci)
- 📖 Docs: [docs.bobci.dev](https://docs.bobci.dev)

---

**Made with ❤️ for production deployments**