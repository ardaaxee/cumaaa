"""Yapılandırma yükleme.

Tüm gizli değerler ortam değişkenlerinden okunur. Depoya asla token yazılmaz.
`.env` dosyası varsa yüklenir (python-dotenv opsiyoneldir; yoksa sessizce atlanır).
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

# Meta, Graph API sürümlerini yaklaşık 2 yıl destekler. Varsayılanı sabit tutuyoruz
# ki metrik davranışı bir gecede değişmesin; güncelleme bilinçli bir karar olsun.
DEFAULT_API_VERSION = "v21.0"
GRAPH_BASE_URL = "https://graph.facebook.com"


class ConfigError(RuntimeError):
    """Eksik veya geçersiz yapılandırma."""


def _load_dotenv(path: Path) -> None:
    """.env dosyasını ortama yükler (mevcut ortam değişkenlerini ezmeden)."""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


@dataclass(frozen=True)
class Settings:
    access_token: str
    api_version: str
    ig_user_id: str | None
    page_id: str | None
    timeout: float
    max_retries: int

    @property
    def base_url(self) -> str:
        return f"{GRAPH_BASE_URL}/{self.api_version}"

    @property
    def token_fingerprint(self) -> str:
        """Loglarda token'ı tanımlamak için güvenli kısa kimlik."""
        if len(self.access_token) < 10:
            return "***"
        return f"{self.access_token[:4]}…{self.access_token[-4:]}"


def load_settings(env_file: str | os.PathLike[str] | None = ".env") -> Settings:
    """Ayarları yükler; zorunlu alan eksikse ConfigError yükseltir."""
    if env_file is not None:
        _load_dotenv(Path(env_file))

    token = os.environ.get("IG_ACCESS_TOKEN", "").strip()
    if not token:
        raise ConfigError(
            "IG_ACCESS_TOKEN tanımlı değil. `.env.example` dosyasını `.env` olarak "
            "kopyalayıp Meta uygulamanızdan aldığınız uzun ömürlü token'ı girin."
        )

    return Settings(
        access_token=token,
        api_version=os.environ.get("IG_API_VERSION", DEFAULT_API_VERSION).strip(),
        ig_user_id=os.environ.get("IG_USER_ID", "").strip() or None,
        page_id=os.environ.get("FB_PAGE_ID", "").strip() or None,
        timeout=float(os.environ.get("IG_HTTP_TIMEOUT", "30")),
        max_retries=int(os.environ.get("IG_MAX_RETRIES", "4")),
    )
