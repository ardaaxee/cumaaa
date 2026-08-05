"""Instagram Graph API istemcisi.

Yalnızca resmi Meta Graph API kullanılır: scraping, oturum taklidi veya
parola ile giriş yoktur.
"""

from __future__ import annotations

import logging
import re
import time
from typing import Any
from urllib.parse import urlencode

import requests

from .config import Settings

log = logging.getLogger(__name__)

# İstisna metinleri istek URL'sini içerir; URL'de de token vardır.
# Loglara veya hata çıktısına asla ham token düşmemeli.
_TOKEN_PATTERN = re.compile(r"(access_token|input_token)=[^&\s'\"]+")


def redact(text: object) -> str:
    """Metindeki token değerlerini maskeler."""
    return _TOKEN_PATTERN.sub(r"\1=<REDACTED>", str(text))

# Bu hatalarda tekrar denemek anlamlı: geçici sunucu/limit sorunları.
RETRYABLE_STATUS = {429, 500, 502, 503, 504}
# Graph API'nin oran limiti kodları.
RATE_LIMIT_CODES = {4, 17, 32, 613}


class GraphAPIError(RuntimeError):
    """Graph API bir hata gövdesi döndürdü."""

    def __init__(self, status: int, payload: dict[str, Any]) -> None:
        err = payload.get("error", {}) if isinstance(payload, dict) else {}
        self.status = status
        self.code = err.get("code")
        self.subcode = err.get("error_subcode")
        self.type = err.get("type")
        self.message = redact(err.get("message", "bilinmeyen hata"))
        super().__init__(f"[HTTP {status}] kod={self.code} {self.message}")

    @property
    def is_auth_error(self) -> bool:
        # 190: token geçersiz/süresi dolmuş. 102: oturum yeniden doğrulama gerekli.
        return self.code in {190, 102} or self.status == 401

    @property
    def is_permission_error(self) -> bool:
        # 200/10: uygulamanın istenen izni yok.
        return self.code in {200, 10} or self.status == 403


class InstagramClient:
    """Yeniden deneme, loglama ve sayfalama içeren ince Graph API sarmalayıcısı."""

    def __init__(self, settings: Settings, session: requests.Session | None = None) -> None:
        self.settings = settings
        self.session = session or requests.Session()

    # --- düşük seviye ------------------------------------------------------

    def get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Tek bir GET isteği; üstel geri çekilmeli yeniden deneme ile."""
        url = f"{self.settings.base_url}/{path.lstrip('/')}"
        query = dict(params or {})
        query["access_token"] = self.settings.access_token

        last_error: Exception | None = None
        for attempt in range(self.settings.max_retries):
            if attempt:
                delay = 2**attempt
                log.warning("Yeniden deneme %s/%s, %ss bekleniyor (%s)",
                            attempt, self.settings.max_retries - 1, delay, path)
                time.sleep(delay)
            try:
                resp = self.session.get(url, params=query, timeout=self.settings.timeout)
            except requests.RequestException as exc:  # ağ katmanı hatası
                last_error = redact(exc)
                log.warning("Ağ hatası (%s): %s", path, last_error)
                continue

            # Loglarda token asla görünmemeli.
            log.debug("GET %s?%s -> %s", url,
                      urlencode({k: v for k, v in query.items() if k != "access_token"}),
                      resp.status_code)

            if resp.ok:
                return resp.json()

            try:
                payload = resp.json()
            except ValueError:
                payload = {"error": {"message": resp.text[:500]}}

            error = GraphAPIError(resp.status_code, payload)
            # Kimlik/izin hatalarında beklemek işe yaramaz; hemen bildir.
            if error.is_auth_error or error.is_permission_error:
                raise error
            if resp.status_code in RETRYABLE_STATUS or error.code in RATE_LIMIT_CODES:
                last_error = error
                continue
            raise error

        raise GraphAPIError(503, {"error": {"message": f"Denemeler tükendi: {last_error}"}})

    def paginate(self, path: str, params: dict[str, Any] | None = None,
                 limit: int | None = None) -> list[dict[str, Any]]:
        """`data` dizisini sayfalar boyunca toplar. `limit` toplam kayıt sınırıdır."""
        items: list[dict[str, Any]] = []
        page = self.get(path, params)
        while True:
            items.extend(page.get("data", []))
            if limit is not None and len(items) >= limit:
                return items[:limit]
            nxt = page.get("paging", {}).get("next")
            if not nxt:
                return items
            # `next` tam URL'dir (token dahil); doğrudan çağırıyoruz.
            resp = self.session.get(nxt, timeout=self.settings.timeout)
            if not resp.ok:
                log.warning("Sayfalama durdu: HTTP %s", resp.status_code)
                return items
            page = resp.json()

    # --- keşif -------------------------------------------------------------

    def debug_token(self) -> dict[str, Any]:
        """Token'ın geçerliliğini, kapsamlarını ve son kullanma tarihini döndürür."""
        return self.get("debug_token", {"input_token": self.settings.access_token})

    def list_pages(self) -> list[dict[str, Any]]:
        """Token'ın eriştiği Facebook sayfaları ve bağlı IG hesapları."""
        return self.paginate(
            "me/accounts",
            {"fields": "id,name,instagram_business_account{id,username}"},
        )

    def resolve_ig_user_id(self) -> str:
        """IG Business hesap kimliğini bulur: önce ayar, sonra sayfa keşfi."""
        if self.settings.ig_user_id:
            return self.settings.ig_user_id

        if self.settings.page_id:
            page = self.get(self.settings.page_id, {"fields": "instagram_business_account"})
            ig = page.get("instagram_business_account")
            if ig:
                return ig["id"]
            raise GraphAPIError(400, {"error": {"message":
                f"Sayfa {self.settings.page_id} bir Instagram Business hesabına bağlı değil."}})

        for page in self.list_pages():
            ig = page.get("instagram_business_account")
            if ig:
                log.info("IG hesabı bulundu: @%s (sayfa: %s)",
                         ig.get("username", "?"), page.get("name"))
                return ig["id"]

        raise GraphAPIError(400, {"error": {"message":
            "Token'a bağlı hiçbir sayfada Instagram Business hesabı yok. "
            "Hesabın Business/Creator'a çevrildiğini ve bir Facebook Sayfası'na "
            "bağlandığını doğrulayın."}})

    # --- veri --------------------------------------------------------------

    PROFILE_FIELDS = (
        "id,username,name,biography,website,followers_count,"
        "follows_count,media_count,profile_picture_url"
    )

    MEDIA_FIELDS = (
        "id,caption,media_type,media_product_type,permalink,timestamp,"
        "like_count,comments_count,thumbnail_url"
    )

    def profile(self, ig_user_id: str) -> dict[str, Any]:
        return self.get(ig_user_id, {"fields": self.PROFILE_FIELDS})

    def recent_media(self, ig_user_id: str, limit: int = 25) -> list[dict[str, Any]]:
        return self.paginate(
            f"{ig_user_id}/media",
            {"fields": self.MEDIA_FIELDS, "limit": min(limit, 50)},
            limit=limit,
        )

    def account_insights(self, ig_user_id: str, metrics: list[str],
                         period: str = "day", days: int = 28) -> dict[str, Any]:
        """Hesap düzeyi metrikler.

        Not: Metrik adları Graph API sürümleri arasında değişir (ör. `impressions`
        yeni sürümlerde kaldırıldı). Hata durumunda çağıran taraf bilgilendirilir.
        """
        now = int(time.time())
        return self.get(
            f"{ig_user_id}/insights",
            {
                "metric": ",".join(metrics),
                "period": period,
                "metric_type": "total_value",
                "since": now - days * 86400,
                "until": now,
            },
        )

    def media_insights(self, media_id: str, metrics: list[str]) -> dict[str, Any]:
        return self.get(f"{media_id}/insights", {"metric": ",".join(metrics)})
