"""OAuth ve token yaşam döngüsü.

Bu modül **yalnızca** Meta'nın resmî OAuth mekanizmasını kullanır. Kullanıcı
adı/parola ile giriş, çerez/oturum taşıma veya web arayüzü otomasyonu
bilinçli olarak yoktur ve eklenmemelidir.

İki giriş kipi desteklenir (`INSTAGRAM_LOGIN_MODE`):

``instagram``
    "Instagram API with Instagram Login". Yetkilendirme Instagram üzerinden
    yapılır, çağrılar `graph.instagram.com` adresine gider. Facebook sayfası
    gerekmez.

``facebook``
    "Instagram API with Facebook Login". Yetkilendirme Facebook üzerinden
    yapılır, çağrılar `graph.facebook.com` adresine gider ve Instagram hesabı
    bir Facebook sayfasına bağlı olmalıdır.

Uzun ömürlü token 60 gün geçerlidir ve kendiliğinden yenilenmez; süresi
dolmadan yenilenmezse kullanıcının yeniden yetkilendirmesi gerekir.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import Any
from urllib.parse import urlencode

import httpx

from ..config import Settings, get_settings
from ..errors import InstagramAPIError, NotConfiguredError
from ..logging_setup import get_logger
from ..security import redact_secrets
from ..timeutils import utcnow

logger = get_logger("instagram.auth")

#: Uzun ömürlü token'ın yenilenebilmesi için en az bu kadar yaşlanması gerekir.
MIN_TOKEN_AGE = timedelta(hours=24)
#: Bu eşiğin altına inince kullanıcı uyarılır.
TOKEN_WARNING_DAYS = 10


@dataclass(frozen=True)
class TokenInfo:
    """Bir erişim token'ının bilinen durumu."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int | None = None
    user_id: str = ""
    permissions: tuple[str, ...] = ()

    @property
    def expires_at(self):
        """Naive UTC bitiş zamanı (bilinmiyorsa None)."""
        if self.expires_in is None:
            return None
        return utcnow() + timedelta(seconds=self.expires_in)


def build_authorize_url(settings: Settings | None = None, *, state: str = "") -> str:
    """Kullanıcının yönlendirileceği yetkilendirme adresini üretir.

    Raises:
        NotConfiguredError: META_APP_ID veya OAUTH_REDIRECT_URI eksikse.
    """
    cfg = settings or get_settings()
    if not cfg.meta_app_id or not cfg.oauth_redirect_uri:
        raise NotConfiguredError(
            "OAuth için META_APP_ID ve OAUTH_REDIRECT_URI gerekli."
        )

    params: dict[str, str] = {
        "client_id": cfg.meta_app_id,
        "redirect_uri": cfg.oauth_redirect_uri,
        "scope": cfg.oauth_scopes,
        "response_type": "code",
    }
    if state:
        params["state"] = state

    if cfg.instagram_login_mode == "instagram":
        base = cfg.instagram_oauth_authorize_url
    else:
        base = f"{cfg.facebook_oauth_authorize_url.rstrip('/')}"
        params["client_id"] = cfg.meta_app_id
    return f"{base}?{urlencode(params)}"


async def exchange_code(
    code: str,
    settings: Settings | None = None,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> TokenInfo:
    """Yetkilendirme kodunu kısa ömürlü token'a çevirir.

    Raises:
        NotConfiguredError: Uygulama kimlik bilgileri eksikse.
        InstagramAPIError: Meta hata döndürürse.
    """
    cfg = settings or get_settings()
    _require_app_credentials(cfg)

    if cfg.instagram_login_mode == "instagram":
        payload = await _post_form(
            cfg.instagram_oauth_token_url,
            {
                "client_id": cfg.meta_app_id,
                "client_secret": cfg.meta_app_secret,
                "grant_type": "authorization_code",
                "redirect_uri": cfg.oauth_redirect_uri,
                "code": code,
            },
            cfg,
            http_client,
        )
        return TokenInfo(
            access_token=str(payload.get("access_token", "")),
            user_id=str(payload.get("user_id", "")),
            permissions=tuple(payload.get("permissions", []) or ()),
        )

    payload = await _get_json(
        f"{cfg.facebook_graph_host.rstrip('/')}/{cfg.instagram_api_version}/oauth/access_token",
        {
            "client_id": cfg.meta_app_id,
            "client_secret": cfg.meta_app_secret,
            "redirect_uri": cfg.oauth_redirect_uri,
            "code": code,
        },
        cfg,
        http_client,
    )
    return TokenInfo(
        access_token=str(payload.get("access_token", "")),
        token_type=str(payload.get("token_type", "bearer")),
        expires_in=_as_int(payload.get("expires_in")),
    )


async def exchange_for_long_lived(
    short_lived_token: str,
    settings: Settings | None = None,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> TokenInfo:
    """Kısa ömürlü token'ı 60 günlük uzun ömürlü token'a çevirir."""
    cfg = settings or get_settings()
    _require_app_credentials(cfg)

    if cfg.instagram_login_mode == "instagram":
        payload = await _get_json(
            f"{cfg.instagram_graph_host.rstrip('/')}/access_token",
            {
                "grant_type": "ig_exchange_token",
                "client_secret": cfg.meta_app_secret,
                "access_token": short_lived_token,
            },
            cfg,
            http_client,
        )
    else:
        payload = await _get_json(
            f"{cfg.facebook_graph_host.rstrip('/')}/{cfg.instagram_api_version}/oauth/access_token",
            {
                "grant_type": "fb_exchange_token",
                "client_id": cfg.meta_app_id,
                "client_secret": cfg.meta_app_secret,
                "fb_exchange_token": short_lived_token,
            },
            cfg,
            http_client,
        )
    return TokenInfo(
        access_token=str(payload.get("access_token", "")),
        token_type=str(payload.get("token_type", "bearer")),
        expires_in=_as_int(payload.get("expires_in")),
    )


async def refresh_long_lived_token(
    long_lived_token: str,
    settings: Settings | None = None,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> TokenInfo:
    """Uzun ömürlü token'ı 60 gün daha uzatır.

    Yalnızca ``instagram`` kipinde mümkündür. Facebook kipinde uzun ömürlü
    sayfa token'ları süresizdir; kullanıcı token'ı için yeniden yetkilendirme
    gerekir.

    Raises:
        InstagramAPIError: Yenileme reddedilirse.
    """
    cfg = settings or get_settings()
    if cfg.instagram_login_mode != "instagram":
        raise InstagramAPIError(
            "Bu özellik mevcut API izinleriyle desteklenmiyor: Facebook Login "
            "kipinde uzun ömürlü kullanıcı token'ı yenilenemez, yeniden "
            "yetkilendirme gerekir."
        )
    payload = await _get_json(
        f"{cfg.instagram_graph_host.rstrip('/')}/refresh_access_token",
        {"grant_type": "ig_refresh_token", "access_token": long_lived_token},
        cfg,
        http_client,
    )
    return TokenInfo(
        access_token=str(payload.get("access_token", "")),
        token_type=str(payload.get("token_type", "bearer")),
        expires_in=_as_int(payload.get("expires_in")),
    )


async def inspect_token(
    access_token: str,
    settings: Settings | None = None,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    """Token'ın geçerliliğini kontrol eder.

    Facebook kipinde `debug_token` ucu kullanılır (uygulama token'ı ile).
    Instagram kipinde böyle bir uç yoktur; token bir `me` çağrısıyla
    denenir ve sonuç sadeleştirilmiş biçimde döndürülür.
    """
    cfg = settings or get_settings()

    if cfg.instagram_login_mode == "facebook":
        _require_app_credentials(cfg)
        payload = await _get_json(
            f"{cfg.facebook_graph_host.rstrip('/')}/debug_token",
            {
                "input_token": access_token,
                "access_token": f"{cfg.meta_app_id}|{cfg.meta_app_secret}",
            },
            cfg,
            http_client,
        )
        data = payload.get("data", {}) if isinstance(payload, dict) else {}
        return {
            "valid": bool(data.get("is_valid")),
            "expires_at": _as_int(data.get("expires_at")),
            "scopes": tuple(data.get("scopes", []) or ()),
            "source": "debug_token",
        }

    payload = await _get_json(
        f"{cfg.instagram_graph_host.rstrip('/')}/me",
        {"fields": "id,username", "access_token": access_token},
        cfg,
        http_client,
    )
    return {
        "valid": bool(payload.get("id")),
        "expires_at": None,
        "scopes": (),
        "source": "me",
        "username": payload.get("username", ""),
        "id": payload.get("id", ""),
    }


async def discover_ig_user_id(
    access_token: str,
    settings: Settings | None = None,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> str:
    """Bağlı Instagram Professional hesabının kimliğini bulur.

    ``instagram`` kipinde token zaten hesaba aittir (`/me`).
    ``facebook`` kipinde sayfalar taranır ve `instagram_business_account`
    alanı aranır.

    Raises:
        InstagramAPIError: Hiçbir Instagram Professional hesabı bulunamazsa.
    """
    cfg = settings or get_settings()

    if cfg.instagram_login_mode == "instagram":
        payload = await _get_json(
            f"{cfg.instagram_graph_host.rstrip('/')}/me",
            {"fields": "id,username", "access_token": access_token},
            cfg,
            http_client,
        )
        ig_id = str(payload.get("id", ""))
        if not ig_id:
            raise InstagramAPIError("Instagram hesap kimliği alınamadı.")
        return ig_id

    payload = await _get_json(
        f"{cfg.facebook_graph_host.rstrip('/')}/{cfg.instagram_api_version}/me/accounts",
        {"fields": "instagram_business_account,name", "access_token": access_token},
        cfg,
        http_client,
    )
    for page in payload.get("data", []) or []:
        linked = page.get("instagram_business_account") or {}
        if linked.get("id"):
            logger.info("Instagram hesabı bulundu (sayfa: %s).", page.get("name", "?"))
            return str(linked["id"])
    raise InstagramAPIError(
        "Facebook sayfalarınıza bağlı bir Instagram Professional hesabı "
        "bulunamadı. Instagram hesabını bir Facebook sayfasına bağlayın."
    )


def token_days_left(expires_at) -> int | None:
    """Token'ın bitişine kaç gün kaldığı."""
    if expires_at is None:
        return None
    delta = expires_at - utcnow()
    return int(delta.total_seconds() // 86400)


def should_refresh(expires_at) -> bool:
    """Token yenilenmeli mi (eşik: `TOKEN_WARNING_DAYS`)."""
    days = token_days_left(expires_at)
    return days is not None and days <= TOKEN_WARNING_DAYS


# --------------------------------------------------------------------- yardımcı
def _require_app_credentials(cfg: Settings) -> None:
    if not cfg.meta_app_id or not cfg.meta_app_secret:
        raise NotConfiguredError(
            "META_APP_ID ve META_APP_SECRET yapılandırılmamış."
        )


async def _get_json(
    url: str,
    params: dict[str, Any],
    cfg: Settings,
    http_client: httpx.AsyncClient | None,
) -> dict[str, Any]:
    return await _call(url, cfg, http_client, method="GET", params=params)


async def _post_form(
    url: str,
    data: dict[str, Any],
    cfg: Settings,
    http_client: httpx.AsyncClient | None,
) -> dict[str, Any]:
    return await _call(url, cfg, http_client, method="POST", data=data)


async def _call(
    url: str,
    cfg: Settings,
    http_client: httpx.AsyncClient | None,
    *,
    method: str,
    params: dict[str, Any] | None = None,
    data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """OAuth uçlarına tek seferlik istek (bu uçlarda yeniden deneme yapılmaz)."""
    owns_client = http_client is None
    client = http_client or httpx.AsyncClient(
        timeout=httpx.Timeout(cfg.http_timeout_seconds), follow_redirects=True
    )
    try:
        if method == "GET":
            response = await client.get(url, params=params)
        else:
            response = await client.post(url, data=data)
    except httpx.HTTPError as exc:
        raise InstagramAPIError(
            "Meta kimlik doğrulama sunucusuna ulaşılamadı.",
            detail=redact_secrets(str(exc)),
        ) from exc
    finally:
        if owns_client:
            await client.aclose()

    try:
        payload = response.json()
    except ValueError as exc:
        raise InstagramAPIError(
            "Kimlik doğrulama yanıtı okunamadı.",
            status_code=response.status_code,
            detail=redact_secrets(response.text[:300]),
        ) from exc

    if response.status_code >= 400 or "error" in payload or "error_message" in payload:
        message = (
            payload.get("error", {}).get("message")
            if isinstance(payload.get("error"), dict)
            else payload.get("error_message") or payload.get("error_description")
        )
        raise InstagramAPIError(
            f"Kimlik doğrulama başarısız: {message or 'bilinmeyen hata'}",
            status_code=response.status_code,
            payload=payload if isinstance(payload, dict) else {},
        )
    return payload if isinstance(payload, dict) else {"data": payload}


def _as_int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
