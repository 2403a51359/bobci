# Contributing to BobCI

Thank you for your interest in contributing to BobCI.

## Getting started

1. Fork the repository and clone your fork.
2. Copy environment templates:
   - `backend/.env.example` → `backend/.env`
   - `frontend/.env.local.example` → `frontend/.env.local`
3. Install dependencies:
   ```bash
   cd backend && python -m venv venv && pip install -r requirements.txt
   cd ../frontend && npm install
   ```
4. Run the stack locally (see `README.md`).

## Security requirements for contributors

- **Never** commit `.env`, API keys, tokens, or database files.
- **Never** include real credentials in docs, tests, or screenshots.
- Use placeholders: `YOUR_API_KEY`, `YOUR_TOKEN`, `YOUR_EMAIL`.
- Run `cleanup_before_github.ps1 -Force` before opening a PR if you generated local artifacts.

## Pull request process

1. Create a feature branch from `main`.
2. Keep changes focused; include tests when applicable.
3. Update documentation for user-facing changes.
4. Ensure CI passes (when configured) and no secrets appear in the diff.
5. Request review; address feedback promptly.

## Code style

- **Python**: Follow existing patterns in `backend/`; use type hints where practical.
- **JavaScript**: Match Next.js/React conventions in `frontend/`.
- Avoid drive-by refactors unrelated to your change.

## Reporting issues

- Use GitHub Issues for bugs and feature requests.
- For **security vulnerabilities**, follow [SECURITY.md](SECURITY.md) — do not file public issues with exploit details.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
