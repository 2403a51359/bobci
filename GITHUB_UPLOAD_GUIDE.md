# 🚀 GitHub Upload Guide - BobCI

This guide will help you prepare and upload the BobCI project to GitHub safely and professionally.

## ✅ Pre-Upload Checklist

### 1. Security Cleanup (CRITICAL)

Run the cleanup script to remove sensitive files:

**Windows (PowerShell):**
```powershell
cd bobci
.\cleanup_before_github.ps1
```

**Linux/Mac (Bash):**
```bash
cd bobci
chmod +x cleanup_before_github.sh
./cleanup_before_github.sh
```

**Manual Cleanup (if scripts don't work):**
```bash
# Remove sensitive files
rm backend/.env
rm backend/bobci.db
rm "bob_sessions/bob_task_may-16-2026_3-45-54-pm.md"
rm "bob_sessions/Screenshot 2026-05-16 154716.png"
rm "backend/Dict[str"
rm backend/str
```

### 2. Verify .gitignore

Ensure `.gitignore` is working properly:

```bash
# Check what will be committed
git status

# These should NOT appear:
# - backend/.env
# - backend/bobci.db
# - bob_sessions/*.md (except .gitkeep)
# - bob_sessions/*.png
# - node_modules/
# - __pycache__/
```

### 3. Update Repository Information

Edit `README.md` and replace placeholders:

- [ ] Replace `<your-repo-url>` with actual GitHub URL
- [ ] Replace `yourusername` with your GitHub username
- [ ] Update demo video link (or remove if not available)
- [ ] Update screenshot paths (or remove if not available)
- [ ] Verify all links work

### 4. Review Documentation

- [ ] Read `SECURITY_AUDIT.md` - understand all issues
- [ ] Review `SECURITY.md` - security policy is clear
- [ ] Check `README.md` - all information is accurate
- [ ] Verify `LICENSE` file exists (add if needed)

---

## 🎯 Step-by-Step Upload Process

### Step 1: Initialize Git Repository

```bash
cd bobci
git init
```

### Step 2: Add Files

```bash
# Add all files (respecting .gitignore)
git add .

# Verify what will be committed
git status

# Check for sensitive files
git status | grep -E "(\.env|\.db|bob_sessions.*\.(md|png))"
# This should return nothing
```

### Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: BobCI - AI-Powered PR Intelligence System

- Multi-agent AI analysis system
- IBM Bob + watsonx.ai integration
- Security scanning and vulnerability detection
- Automated test generation
- Impact analysis and risk assessment
- Junior developer mentoring
- Beautiful Next.js frontend with animations
- FastAPI backend with SQLAlchemy
- Comprehensive documentation"
```

### Step 4: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `bobci` (or your preferred name)
3. Description: "AI-Powered Pull Request Intelligence System using IBM Bob and watsonx.ai"
4. Choose: **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

### Step 5: Connect and Push

```bash
# Add remote (replace with your actual URL)
git remote add origin https://github.com/yourusername/bobci.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 6: Configure GitHub Repository

#### Enable Security Features

1. Go to repository **Settings** → **Security**
2. Enable:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Code scanning (GitHub Advanced Security)
   - ✅ Secret scanning

#### Set Up Branch Protection

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

#### Add Repository Secrets (for CI/CD)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `WATSONX_API_KEY` - Your watsonx.ai API key
   - `WATSONX_PROJECT_ID` - Your watsonx.ai project ID
   - `GITHUB_TOKEN` - Automatically provided by GitHub

#### Configure Topics

1. Go to repository main page
2. Click ⚙️ next to "About"
3. Add topics:
   - `ai`
   - `ibm-bob`
   - `watsonx`
   - `code-review`
   - `pull-request`
   - `fastapi`
   - `nextjs`
   - `security-scanning`
   - `hackathon`

---

## 📝 Post-Upload Tasks

### 1. Create Additional Files

#### LICENSE
If not already present, add a license:
```bash
# MIT License is recommended for open source
# Create LICENSE file with MIT license text
```

#### CONTRIBUTING.md
```markdown
# Contributing to BobCI

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

See README.md for development setup.
```

#### CODE_OF_CONDUCT.md
Use GitHub's template or create your own.

### 2. Set Up GitHub Pages (Optional)

If you want to host documentation:
1. Go to **Settings** → **Pages**
2. Source: Deploy from branch `main` → `/docs`
3. Create `docs/` directory with documentation

### 3. Add Badges to README

Update README.md with actual badges:

```markdown
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/bobci?style=social)](https://github.com/yourusername/bobci)
[![License](https://img.shields.io/github/license/yourusername/bobci)](LICENSE)
[![Issues](https://img.shields.io/github/issues/yourusername/bobci)](https://github.com/yourusername/bobci/issues)
```

### 4. Create Releases

1. Go to **Releases** → **Create a new release**
2. Tag: `v1.0.0`
3. Title: "BobCI v1.0.0 - Initial Release"
4. Description: Highlight key features
5. Attach any binaries or assets

---

## 🔒 Security Reminders

### Never Commit:

- ❌ `.env` files
- ❌ Database files (*.db, *.sqlite)
- ❌ API keys or tokens
- ❌ Personal information
- ❌ Screenshots with sensitive data
- ❌ Session logs with credentials

### Always:

- ✅ Use `.env.example` for templates
- ✅ Document required environment variables
- ✅ Use GitHub Secrets for CI/CD
- ✅ Review commits before pushing
- ✅ Enable security scanning
- ✅ Keep dependencies updated

---

## 🎓 Best Practices

### Commit Messages

Follow conventional commits:
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Pull Requests

- Write clear descriptions
- Reference issues
- Add screenshots for UI changes
- Request reviews
- Keep PRs focused and small

### Issues

- Use issue templates
- Add labels
- Link to PRs
- Close when resolved

---

## 🆘 Troubleshooting

### "File too large" error

```bash
# Check file sizes
find . -type f -size +50M

# Remove large files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large/file' \
  --prune-empty --tag-name-filter cat -- --all
```

### Accidentally committed sensitive file

```bash
# Remove from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - only if repository is new)
git push origin --force --all
```

### Need to change commit message

```bash
# Last commit
git commit --amend -m "New message"

# Older commits
git rebase -i HEAD~3  # Last 3 commits
```

---

## 📚 Additional Resources

- [GitHub Docs](https://docs.github.com)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Semantic Versioning](https://semver.org)
- [Keep a Changelog](https://keepachangelog.com)
- [Conventional Commits](https://www.conventionalcommits.org)

---

## ✅ Final Checklist

Before making repository public:

- [ ] All sensitive files removed
- [ ] .gitignore working correctly
- [ ] README updated with correct information
- [ ] SECURITY.md in place
- [ ] LICENSE file added
- [ ] All links in README work
- [ ] No placeholder text remains
- [ ] Security features enabled on GitHub
- [ ] Repository description set
- [ ] Topics added
- [ ] Initial release created

---

**Ready to upload?** Follow the steps above carefully, and your project will be GitHub-ready! 🚀

For questions or issues, refer to `SECURITY_AUDIT.md` or create a GitHub Discussion.

---

*Last Updated: 2026-05-17*