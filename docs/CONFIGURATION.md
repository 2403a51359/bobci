# Secure Configuration Guide

## Quick setup

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` and replace every `YOUR_*` placeholder with real values.

2. **Frontend**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```
   Set `BOBCI_API_KEY` to the same value as in the backend `.env`.

3. **Generate keys**
   ```bash
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   openssl rand -hex 32
   ```

## Required variables

| Variable | Purpose |
|----------|---------|
| `GITHUB_WEBHOOK_SECRET` | HMAC validation for GitHub webhooks |
| `BOBCI_API_KEY` | Protects `/api/*` routes |
| `SECRET_ENCRYPTION_KEY` | Encrypts GitHub tokens in SQLite |
| `FRONTEND_URL` | CORS allowed origin |

## Optional (IBM watsonx)

| Variable | Purpose |
|----------|---------|
| `WATSONX_API_KEY` | IBM watsonx.ai API key |
| `WATSONX_PROJECT_ID` | watsonx project ID |

## Production checklist

- Set `ENVIRONMENT=production`
- Set `ALLOW_INSECURE_WEBHOOKS=false`
- Use PostgreSQL (`DATABASE_URL`) instead of SQLite
- Use HTTPS for `BACKEND_URL` and `FRONTEND_URL`
- Never commit `.env` or `.env.local`
- Rotate `BOBCI_API_KEY` and webhook secrets regularly

## What never goes in git

- `.env`, `.env.local`
- `*.db` database files
- `bob_sessions/*.md`, screenshots (except `.gitkeep`)
- `venv/`, `node_modules/`, `.next/`
