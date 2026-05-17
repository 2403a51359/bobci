# Security Policy

## Supported Versions

Currently supported versions of BobCI:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of BobCI seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues by:

1. **GitHub Security Advisories** (Preferred)
   - Go to the repository's Security tab
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email** (Alternative)
   - Create a GitHub issue with title "Security: Request for private disclosure"
   - We will provide a secure communication channel

### 📋 What to Include

Please include the following information in your report:

- **Description**: Clear description of the vulnerability
- **Impact**: What an attacker could achieve
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Components**: Which parts of the system are affected
- **Suggested Fix**: If you have ideas for fixing it (optional)
- **Your Contact Info**: How we can reach you for follow-up

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 🏆 Recognition

We appreciate security researchers who help keep BobCI secure:

- We will acknowledge your contribution in our security advisories (unless you prefer to remain anonymous)
- For significant findings, we may feature you in our CONTRIBUTORS.md file

## Security Best Practices

### For Users

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique secrets for webhooks
   - Rotate credentials regularly

2. **GitHub Tokens**
   - Use tokens with minimal required permissions
   - Use fine-grained personal access tokens when possible
   - Rotate tokens every 90 days

3. **Webhook Security**
   - Always configure webhook secrets
   - Use HTTPS endpoints only
   - Validate webhook signatures

4. **Database Security**
   - Use PostgreSQL in production (not SQLite)
   - Enable encryption at rest
   - Regular backups
   - Restrict database access

5. **API Security**
   - Implement rate limiting
   - Use HTTPS only
   - Enable CORS properly
   - Monitor for suspicious activity

### For Developers

1. **Code Review**
   - All PRs require security review
   - Use automated security scanning
   - Follow OWASP guidelines

2. **Dependencies**
   - Keep dependencies updated
   - Use Dependabot alerts
   - Audit dependencies regularly
   - Pin dependency versions

3. **Secrets Management**
   - Never hardcode credentials
   - Use environment variables
   - Consider secrets management tools (Vault, AWS Secrets Manager)

4. **Input Validation**
   - Validate all user inputs
   - Use Pydantic models for API validation
   - Sanitize data before database operations
   - Prevent SQL injection with parameterized queries

5. **Authentication & Authorization**
   - Implement proper authentication
   - Use JWT tokens securely
   - Implement rate limiting
   - Log security events

## Known Security Considerations

### Current Implementation

1. **API authentication**
   - Set `BOBCI_API_KEY` to protect `/api/*` routes
   - The Next.js server proxy (`frontend/pages/api/bobci/`) injects the key so it is not exposed in the browser

2. **Secret storage**
   - GitHub tokens are encrypted at rest when `SECRET_ENCRYPTION_KEY` is set
   - Use a secrets manager in production instead of flat `.env` files

3. **Webhook validation**
   - Set `ALLOW_INSECURE_WEBHOOKS=true` only for local development
   - Production requires `GITHUB_WEBHOOK_SECRET` and rejects unsigned webhooks

4. **Rate limiting**
   - Not currently implemented; add before high-traffic production use

5. **Database**
   - SQLite is for development only; use PostgreSQL in production

6. **CORS**
   - Restricted to `FRONTEND_URL`; update for your production domain

## Security Updates

Security updates will be released as:

- **Patch versions** (1.0.x) for security fixes
- **Security advisories** for critical vulnerabilities
- **Release notes** documenting all security changes

Subscribe to repository releases to stay informed about security updates.

## Compliance

BobCI follows these security standards:

- OWASP Top 10 guidelines
- GitHub Security Best Practices
- Secure coding practices for Python and JavaScript
- Regular security audits

## Third-Party Security

BobCI integrates with:

- **GitHub API**: Follow GitHub's security best practices
- **IBM Bob**: Ensure Bob Shell is from trusted sources
- **watsonx.ai**: Protect API keys and project IDs

## Questions?

For general security questions (not vulnerabilities), you can:

- Open a GitHub Discussion
- Check our documentation
- Review this security policy

---

**Last Updated**: 2026-05-17  
**Version**: 1.0.0

*This security policy is subject to change. Check back regularly for updates.*