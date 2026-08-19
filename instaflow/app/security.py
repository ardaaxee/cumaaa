"""Güvenlik yardımcıları: dosya adı temizleme, yol sınırlama, CSRF.

Medya doğrulaması `instagram/media.py` içindedir; buradaki işlevler
uygulamanın tüm giriş noktalarında (web upload, CLI, servis katmanı)
ortak kullanılır.
"""

from __future__ import annotations

import hmac
import re
import secrets
import unicodedata
from pathlib import Path

from itsdangerous import BadSignature, URLSafeTimedSerializer

from .config import get_settings
from .errors import MediaValidationError

#: Dosya adında yalnızca bu karakterlere izin verilir.
_SAFE_CHARS = re.compile(r"[^A-Za-z0-9._-]+")
_MULTI_DASH = re.compile(r"-{2,}")
MAX_FILENAME_LENGTH = 96

CSRF_SALT = "instaflow-csrf"
CSRF_MAX_AGE_SECONDS = 60 * 60 * 8


def sanitize_filename(raw: str) -> str:
    """Kullanıcıdan gelen dosya adını güvenli bir ada dönüştürür.

    Türkçe karakterler ASCII karşılığına indirgenir, yol ayıracı ve gizli
    karakterler tamamen atılır. Sonuç asla `..`, `/` veya boş olamaz.

    Raises:
        MediaValidationError: Ad tamamen geçersizse.
    """
    name = Path(raw.strip()).name  # yol bileşenlerini at
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = _SAFE_CHARS.sub("-", name)
    name = _MULTI_DASH.sub("-", name).strip("-._")

    if not name or name in {".", ".."}:
        raise MediaValidationError("Dosya adı geçersiz.")

    stem, dot, suffix = name.rpartition(".")
    if dot:
        stem = stem[: MAX_FILENAME_LENGTH - len(suffix) - 1] or "dosya"
        name = f"{stem}.{suffix.lower()}"
    else:
        name = name[:MAX_FILENAME_LENGTH]
    return name


def unique_filename(directory: Path, filename: str) -> Path:
    """Var olan bir dosyanın üzerine yazmayan benzersiz yol üretir."""
    candidate = directory / filename
    if not candidate.exists():
        return candidate
    stem = candidate.stem
    suffix = candidate.suffix
    for _ in range(100):
        token = secrets.token_hex(3)
        candidate = directory / f"{stem}-{token}{suffix}"
        if not candidate.exists():
            return candidate
    raise MediaValidationError("Benzersiz dosya adı üretilemedi.")


def resolve_within(base: Path, candidate: str | Path) -> Path:
    """`candidate` yolunun `base` altında kaldığını garanti eder.

    Path traversal (`../../etc/passwd`) girişimlerini burada kesiyoruz.

    Raises:
        MediaValidationError: Yol taban dizinin dışına çıkıyorsa.
    """
    base_resolved = base.resolve()
    target = Path(candidate)
    if not target.is_absolute():
        target = base_resolved / target
    target = target.resolve()
    if target != base_resolved and base_resolved not in target.parents:
        raise MediaValidationError("Dosya yolu izin verilen dizinin dışında.")
    return target


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(get_settings().secret_key, salt=CSRF_SALT)


def issue_csrf_token(session_id: str) -> str:
    """Oturuma bağlı, zaman damgalı CSRF token'ı üretir."""
    return _serializer().dumps({"sid": session_id})


def verify_csrf_token(token: str | None, session_id: str) -> bool:
    """CSRF token'ını doğrular (oturum kimliği ve yaş kontrolü ile)."""
    if not token:
        return False
    try:
        data = _serializer().loads(token, max_age=CSRF_MAX_AGE_SECONDS)
    except BadSignature:
        return False
    except Exception:  # noqa: BLE001 - bozuk token güvenli şekilde reddedilir
        return False
    return hmac.compare_digest(str(data.get("sid", "")), session_id)


def new_session_id() -> str:
    """Yeni bir oturum kimliği."""
    return secrets.token_urlsafe(24)


def mask_secret(value: str, visible: int = 4) -> str:
    """Gizli değeri arayüzde göstermek için maskeler."""
    if not value:
        return ""
    if len(value) <= visible * 2:
        return "•" * len(value)
    return f"{value[:visible]}…{value[-visible:]}"
