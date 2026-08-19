"""OAuth bağlantı akışı.

Akış: `/connect` → Meta yetkilendirme sayfası → `/oauth/callback` → kısa
ömürlü token → uzun ömürlü token → hesap kaydı.

CSRF'e karşı `state` parametresi kullanılır ve oturumda saklanır.
"""

from __future__ import annotations

import secrets

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from .config import get_settings
from .database import session_scope
from .errors import InstaFlowError, InstagramAPIError, NotConfiguredError
from .instagram import auth as ig_auth
from .logging_setup import get_logger
from .models import Account
from .routes_web import flash
from .services import account_service

logger = get_logger("oauth")

router = APIRouter(include_in_schema=False)

STATE_KEY = "oauth_state"


@router.get("/connect")
async def connect(request: Request):
    """Kullanıcıyı Meta yetkilendirme sayfasına yönlendirir."""
    settings = get_settings()
    try:
        state = secrets.token_urlsafe(16)
        request.session[STATE_KEY] = state
        url = ig_auth.build_authorize_url(settings, state=state)
    except NotConfiguredError as exc:
        flash(request, str(exc), "error")
        return RedirectResponse(url="/settings", status_code=303)

    logger.info("OAuth yetkilendirmesi başlatıldı (%s kipi).", settings.instagram_login_mode)
    return RedirectResponse(url=url, status_code=303)


@router.get("/oauth/callback")
async def oauth_callback(
    request: Request,
    code: str = "",
    state: str = "",
    error: str = "",
    error_description: str = "",
):
    """Meta'nın geri dönüşünü işler ve hesabı kaydeder."""
    settings = get_settings()
    expected_state = request.session.pop(STATE_KEY, "")

    if error:
        flash(request, f"Yetkilendirme reddedildi: {error_description or error}", "error")
        return RedirectResponse(url="/settings", status_code=303)
    if not code:
        flash(request, "Yetkilendirme kodu alınamadı.", "error")
        return RedirectResponse(url="/settings", status_code=303)
    if not expected_state or not secrets.compare_digest(state, expected_state):
        flash(request, "Güvenlik doğrulaması başarısız (state uyuşmuyor).", "error")
        return RedirectResponse(url="/settings", status_code=303)

    try:
        short_lived = await ig_auth.exchange_code(code, settings)
        long_lived = await ig_auth.exchange_for_long_lived(short_lived.access_token, settings)
        ig_user_id = short_lived.user_id or await ig_auth.discover_ig_user_id(
            long_lived.access_token, settings
        )
    except (InstagramAPIError, NotConfiguredError, InstaFlowError) as exc:
        logger.error("OAuth akışı başarısız: %s", exc)
        flash(request, str(exc), "error")
        return RedirectResponse(url="/settings", status_code=303)

    with session_scope() as session:
        # Aynı hesap yeniden bağlanıyorsa üzerine yazılır.
        existing = session.scalar(select(Account).where(Account.ig_user_id == ig_user_id))
        info = {"id": ig_user_id}
        if existing is not None:
            info.update(
                {
                    "username": existing.username,
                    "name": existing.name,
                    "account_type": existing.account_type,
                }
            )
        account_service.upsert_account(session, info, token=long_lived, settings=settings)

    flash(
        request,
        "Instagram hesabı bağlandı. Token 60 gün geçerli; süresi dolmadan "
        "otomatik yenilenecek.",
        "success",
    )
    logger.info("Instagram hesabı bağlandı: %s", ig_user_id)
    return RedirectResponse(url="/settings", status_code=303)
