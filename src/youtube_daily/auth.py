"""Refresh token'dan Google API kimlik bilgisi üretir."""

from __future__ import annotations

import os

from google.oauth2.credentials import Credentials

TOKEN_URI = "https://oauth2.googleapis.com/token"

# Yükleme için gereken minimum yetkiler.
YOUTUBE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/youtube.upload"
DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly"
DRIVE_FULL_SCOPE = "https://www.googleapis.com/auth/drive"

REQUIRED_ENV = ("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN")


class AuthError(RuntimeError):
    """Kimlik bilgileri eksik ya da hatalı olduğunda fırlatılır."""


def credentials_from_env() -> Credentials:
    """Ortam değişkenlerinden (GitHub secrets) yenilenebilir kimlik bilgisi kurar."""
    missing = [name for name in REQUIRED_ENV if not os.environ.get(name, "").strip()]
    if missing:
        raise AuthError(
            "Eksik ortam değişkeni: "
            + ", ".join(missing)
            + ". Bu değerleri repo ayarlarında GitHub secret olarak tanımlayın "
            "(scripts/get_refresh_token.py bunları üretir)."
        )

    return Credentials(
        token=None,
        refresh_token=os.environ["GOOGLE_REFRESH_TOKEN"].strip(),
        client_id=os.environ["GOOGLE_CLIENT_ID"].strip(),
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"].strip(),
        token_uri=TOKEN_URI,
    )
