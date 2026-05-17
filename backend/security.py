"""
Security utilities: secret encryption at rest, API key auth, env validation.
"""

import base64
import hashlib
import hmac
import os
import re
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken
from fastapi import Header, HTTPException, Request

PLACEHOLDER_PATTERNS = re.compile(
    r"^(your_|changeme|example|placeholder|xxx+|test_?key|dummy)",
    re.IGNORECASE,
)

SENSITIVE_ENV_KEYS = (
    "GITHUB_WEBHOOK_SECRET",
    "WATSONX_API_KEY",
    "WATSONX_PROJECT_ID",
    "BOBCI_API_KEY",
    "SECRET_ENCRYPTION_KEY",
)


def _derive_fernet_key(raw_key: str) -> bytes:
    """Derive a Fernet-compatible key from an arbitrary secret string."""
    digest = hashlib.sha256(raw_key.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


def get_fernet() -> Optional[Fernet]:
    raw = os.getenv("SECRET_ENCRYPTION_KEY", "").strip()
    if not raw:
        return None
    try:
        if len(raw) == 44 and raw.endswith("="):
            return Fernet(raw.encode("utf-8"))
    except (ValueError, TypeError):
        pass
    return Fernet(_derive_fernet_key(raw))


def encrypt_secret(value: str) -> str:
    if not value:
        return value
    fernet = get_fernet()
    if not fernet:
        return value
    return "enc:" + fernet.encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value: str) -> str:
    if not value:
        return value
    if not value.startswith("enc:"):
        return value
    fernet = get_fernet()
    if not fernet:
        raise ValueError("SECRET_ENCRYPTION_KEY required to decrypt stored secrets")
    try:
        return fernet.decrypt(value[4:].encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise ValueError("Failed to decrypt stored secret") from exc


def is_placeholder_secret(value: str) -> bool:
    if not value or not value.strip():
        return True
    return bool(PLACEHOLDER_PATTERNS.match(value.strip()))


def validate_environment() -> None:
    """Warn on insecure or placeholder configuration (does not exit)."""
    env = os.getenv("ENVIRONMENT", "development").lower()
    warnings = []

    for key in SENSITIVE_ENV_KEYS:
        val = os.getenv(key, "")
        if val and is_placeholder_secret(val):
            warnings.append(f"{key} appears to be a placeholder")

    if env == "production":
        if not os.getenv("GITHUB_WEBHOOK_SECRET"):
            warnings.append("GITHUB_WEBHOOK_SECRET is required in production")
        if not os.getenv("BOBCI_API_KEY"):
            warnings.append("BOBCI_API_KEY is required in production")
        if not os.getenv("SECRET_ENCRYPTION_KEY"):
            warnings.append("SECRET_ENCRYPTION_KEY is required in production")
        if os.getenv("ALLOW_INSECURE_WEBHOOKS", "").lower() == "true":
            warnings.append("ALLOW_INSECURE_WEBHOOKS must be false in production")

    for msg in warnings:
        print(f"SECURITY WARNING: {msg}")


def webhook_validation_enabled() -> bool:
    if os.getenv("ALLOW_INSECURE_WEBHOOKS", "").lower() == "true":
        return False
    return True


def require_webhook_secret() -> bool:
    env = os.getenv("ENVIRONMENT", "development").lower()
    if env == "production":
        return True
    return webhook_validation_enabled()


async def verify_api_key(
    request: Request,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> None:
    """Enforce API key on protected routes when BOBCI_API_KEY is configured."""
    expected = os.getenv("BOBCI_API_KEY", "").strip()
    if not expected or is_placeholder_secret(expected):
        env = os.getenv("ENVIRONMENT", "development").lower()
        if env == "production":
            raise HTTPException(
                status_code=503,
                detail="API authentication is not configured",
            )
        return

    provided = x_api_key or request.headers.get("x-api-key")
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
