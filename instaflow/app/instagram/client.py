"""Graph API HTTP istemcisi.

Tek sorumluluğu: istek göndermek, hataları anlamlı tiplere çevirmek ve
yeniden denemeyi disiplinli yapmak. İş mantığı `publishing.py` ve
`insights.py` içindedir.

Yeniden deneme politikası:

* Ağ hatası / zaman aşımı / 5xx → üstel geri çekilme (jitter'lı), en fazla
  `http_max_retries` deneme.
* 429 (kota) → **saldırgan deneme yok**: en fazla `rate_limit_max_retries`
  kez, uzun sabit bekleme ile. Meta `Retry-After` verirse ona uyulur.
* 4xx (429 dışı) → hiç denenmez, doğrudan hata.
"""

from __future__ import annotations

import asyncio
import random
from typing import Any, Literal

import httpx

from ..config import Settings, get_settings
from ..errors import (
    InstagramAPIError,
    InstagramAuthError,
    InstagramRateLimitError,
    NotConfiguredError,
)
from ..logging_setup import get_logger
from ..security import redact_secrets

logger = get_logger("instagram.client")

#: Meta'nın token/izin ile ilgili hata kodları.
AUTH_ERROR_CODES = {102, 190, 200, 803}
#: Meta'nın kota/throttle hata kodları.
RATE_LIMIT_ERROR_CODES = {4, 17, 32, 613}

HTTPMethod = Literal["GET", "POST", "DELETE"]


class InstagramClient:
    """Instagram Graph API istemcisi.

    Args:
        access_token: Uzun ömürlü erişim token'ı.
        ig_user_id: Instagram Professional hesap kimliği.
        settings: Yapılandırma; verilmezse süreç ayarları kullanılır.
        http_client: Test/mock için dışarıdan verilen httpx istemcisi.
    """

    def __init__(
        self,
        access_token: str,
        ig_user_id: str = "",
        *,
        settings: Settings | None = None,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.access_token = access_token
        self.ig_user_id = ig_user_id
        self._external_client = http_client is not None
        self._client = http_client

    # ------------------------------------------------------------- yaşam döngüsü
    @classmethod
    def from_settings(
        cls,
        settings: Settings | None = None,
        *,
        http_client: httpx.AsyncClient | None = None,
    ) -> "InstagramClient":
        """`.env` değerlerinden istemci kurar.

        Raises:
            NotConfiguredError: Token veya kullanıcı kimliği eksikse.
        """
        cfg = settings or get_settings()
        if not cfg.is_instagram_configured:
            raise NotConfiguredError(
                "Instagram API credentials yapılandırılmamış. "
                ".env dosyasına INSTAGRAM_ACCESS_TOKEN ve INSTAGRAM_USER_ID ekleyin."
            )
        return cls(
            cfg.instagram_access_token,
            cfg.instagram_user_id,
            settings=cfg,
            http_client=http_client,
        )

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.settings.http_timeout_seconds),
                follow_redirects=True,
            )
        return self._client

    async def aclose(self) -> None:
        """Dışarıdan verilmediyse HTTP istemcisini kapatır."""
        if self._client is not None and not self._external_client:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "InstagramClient":
        self._ensure_client()
        return self

    async def __aexit__(self, *_exc: object) -> None:
        await self.aclose()

    # ------------------------------------------------------------------ istekler
    async def get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """GET isteği."""
        return await self.request("GET", path, params=params)

    async def post(
        self,
        path: str,
        data: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """POST isteği (form gövdesi)."""
        return await self.request("POST", path, params=params, data=data)

    async def request(
        self,
        method: HTTPMethod,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Yeniden denemeli istek.

        Returns:
            Yanıt gövdesi (JSON sözlük).

        Raises:
            InstagramAuthError: Token geçersiz/süresi dolmuş veya izin yok.
            InstagramRateLimitError: Kota aşıldı.
            InstagramAPIError: Diğer tüm API/ağ hataları.
        """
        url = self._build_url(path)
        query = dict(params or {})
        query.setdefault("access_token", self.access_token)
        body = dict(data or {})

        attempt = 0
        rate_limit_hits = 0
        last_error: InstagramAPIError | None = None

        while True:
            attempt += 1
            try:
                response = await self._send(method, url, query, body)
            except httpx.TimeoutException as exc:
                last_error = InstagramAPIError(
                    "Instagram API zaman aşımına uğradı.",
                    is_retryable=True,
                    detail=redact_secrets(str(exc)),
                )
            except httpx.HTTPError as exc:
                last_error = InstagramAPIError(
                    "Instagram API'ye bağlanılamadı (ağ hatası).",
                    is_retryable=True,
                    detail=redact_secrets(str(exc)),
                )
            else:
                if response.status_code < 400:
                    return _parse_json(response)
                last_error = _map_error(response)

            if isinstance(last_error, InstagramRateLimitError):
                rate_limit_hits += 1
                if rate_limit_hits > self.settings.rate_limit_max_retries:
                    raise last_error
                delay = last_error.payload.get("retry_after") or (
                    self.settings.rate_limit_backoff_seconds
                )
                logger.warning(
                    "Kota sınırına takıldı; %.0f sn bekleniyor (deneme %d).",
                    delay,
                    rate_limit_hits,
                )
                await asyncio.sleep(float(delay))
                continue

            if not last_error.is_retryable or attempt > self.settings.http_max_retries:
                raise last_error

            delay = self._backoff_delay(attempt)
            logger.warning(
                "Instagram API hatası (%s); %.1f sn sonra tekrar denenecek (%d/%d).",
                last_error.message,
                delay,
                attempt,
                self.settings.http_max_retries,
            )
            await asyncio.sleep(delay)

    async def _send(
        self,
        method: HTTPMethod,
        url: str,
        params: dict[str, Any],
        data: dict[str, Any],
    ) -> httpx.Response:
        client = self._ensure_client()
        if method == "GET":
            return await client.get(url, params=params)
        if method == "DELETE":
            return await client.delete(url, params=params)
        return await client.post(url, params=params, data=data)

    def _build_url(self, path: str) -> str:
        if path.startswith("http://") or path.startswith("https://"):
            return path
        return f"{self.settings.graph_base_url}/{path.lstrip('/')}"

    def _backoff_delay(self, attempt: int) -> float:
        """Jitter'lı üstel geri çekilme."""
        base = self.settings.http_backoff_base_seconds * (2 ** (attempt - 1))
        capped = min(base, self.settings.http_backoff_max_seconds)
        return capped * (0.5 + random.random() / 2)


def _parse_json(response: httpx.Response) -> dict[str, Any]:
    """Yanıtı JSON'a çevirir; JSON değilse anlaşılır hata verir."""
    try:
        payload = response.json()
    except ValueError as exc:
        raise InstagramAPIError(
            "Instagram API beklenmedik bir yanıt döndürdü (JSON değil).",
            status_code=response.status_code,
            detail=redact_secrets(response.text[:500]),
        ) from exc
    if isinstance(payload, dict):
        return payload
    return {"data": payload}


def _map_error(response: httpx.Response) -> InstagramAPIError:
    """HTTP yanıtını uygun hata tipine çevirir."""
    status = response.status_code
    try:
        payload = response.json()
    except ValueError:
        payload = {}
    error = payload.get("error", {}) if isinstance(payload, dict) else {}
    code = error.get("code")
    subcode = error.get("error_subcode")
    api_message = redact_secrets(error.get("message", "") or response.text[:300])

    retry_after = _retry_after_seconds(response)
    common = {
        "status_code": status,
        "error_code": code,
        "error_subcode": subcode,
        "payload": {"error": error, "retry_after": retry_after},
        "detail": api_message,
    }

    if status == 429 or code in RATE_LIMIT_ERROR_CODES:
        return InstagramRateLimitError(
            "Instagram istek kotası aşıldı. Bir süre beklemek gerekiyor.", **common
        )
    if status in (401, 403) or code in AUTH_ERROR_CODES:
        return InstagramAuthError(_auth_message(subcode, api_message), **common)
    if status == 400:
        return InstagramAPIError(
            f"Instagram isteği reddetti: {api_message or 'geçersiz istek'}", **common
        )
    if status >= 500:
        return InstagramAPIError(
            "Instagram sunucu hatası. Daha sonra tekrar denenecek.",
            is_retryable=True,
            **common,
        )
    return InstagramAPIError(
        f"Instagram API hatası ({status}): {api_message or 'bilinmeyen hata'}", **common
    )


def _auth_message(subcode: int | None, api_message: str) -> str:
    """Yetki hatalarını kullanıcıya anlaşılır anlatır."""
    if subcode == 463:
        return "Erişim token'ının süresi dolmuş. Yeniden bağlanmanız gerekiyor."
    if subcode == 467:
        return "Erişim token'ı geçersiz kılınmış. Yeniden bağlanmanız gerekiyor."
    if "permission" in api_message.lower() or "scope" in api_message.lower():
        return (
            "Bu işlem için gerekli izin verilmemiş. Meta uygulamanızda ilgili "
            "izinleri onaylayın."
        )
    return "Instagram erişim token'ı geçersiz veya yetersiz."


def _retry_after_seconds(response: httpx.Response) -> float | None:
    """`Retry-After` başlığını saniyeye çevirir."""
    raw = response.headers.get("retry-after")
    if not raw:
        return None
    try:
        return float(raw)
    except ValueError:
        return None
