"""Hesap bağlantısı ve sistem durumu.

Bu modül hiçbir zaman token değeri döndürmez; yalnızca "bağlı mı, ne zaman
sona eriyor" gibi türetilmiş bilgiler üretir.
"""

from __future__ import annotations

from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import get_default_user, session_scope
from ..errors import InstaFlowError, InstagramAPIError, NotConfiguredError
from ..instagram.auth import TokenInfo, token_days_left
from ..instagram.client import InstagramClient
from ..instagram.insights import InsightsService
from ..logging_setup import get_logger
from ..models import Account, LogEntry
from ..schemas import AccountStatus, SystemStatus
from ..timeutils import utcnow
from . import content_service

logger = get_logger("services.account")


def get_active_account(session: Session) -> Account | None:
    """Bağlı hesap kaydı (varsa)."""
    return session.scalar(
        select(Account).where(Account.is_active.is_(True)).order_by(Account.id.asc())
    )


def local_status(session: Session, settings: Settings | None = None) -> AccountStatus:
    """Ağa çıkmadan, yerel bilgilerle durum üretir."""
    cfg = settings or get_settings()
    account = get_active_account(session)

    if not cfg.is_instagram_configured and account is None:
        return AccountStatus(
            configured=False,
            connected=False,
            login_mode=cfg.instagram_login_mode,
            api_version=cfg.instagram_api_version,
            message="Instagram API credentials yapılandırılmamış.",
        )

    expires_at = account.token_expires_at if account else None
    return AccountStatus(
        configured=True,
        connected=account is not None,
        login_mode=cfg.instagram_login_mode,
        api_version=cfg.instagram_api_version,
        ig_user_id=account.ig_user_id if account else cfg.instagram_user_id,
        username=account.username if account else "",
        account_type=account.account_type if account else "",
        followers_count=account.followers_count if account else 0,
        media_count=account.media_count if account else 0,
        token_expires_at=expires_at,
        token_days_left=token_days_left(expires_at),
        message=(
            "Yerel kayıt var; canlı doğrulama için 'instagram-test' çalıştırın."
            if account
            else "Token .env üzerinden geldi; henüz doğrulanmadı."
        ),
    )


async def verify_connection(
    *,
    client: InstagramClient | None = None,
    settings: Settings | None = None,
    persist: bool = True,
) -> AccountStatus:
    """Canlı API çağrısıyla bağlantıyı doğrular.

    Returns:
        Doğrulanmış hesap durumu; hata olursa `connected=False` ve nedeni.
    """
    cfg = settings or get_settings()

    owns_client = client is None
    try:
        active = client or InstagramClient.from_settings(cfg)
    except NotConfiguredError as exc:
        return AccountStatus(
            configured=False,
            connected=False,
            login_mode=cfg.instagram_login_mode,
            api_version=cfg.instagram_api_version,
            message=str(exc),
        )

    try:
        info = await InsightsService(active, cfg).get_account_info()
    except InstagramAPIError as exc:
        logger.error("Instagram bağlantı doğrulaması başarısız: %s", exc.message)
        return AccountStatus(
            configured=True,
            connected=False,
            login_mode=cfg.instagram_login_mode,
            api_version=cfg.instagram_api_version,
            ig_user_id=cfg.instagram_user_id,
            message=exc.message,
        )
    finally:
        if owns_client:
            await active.aclose()

    if persist:
        with session_scope() as session:
            upsert_account(session, info, settings=cfg)

    return AccountStatus(
        configured=True,
        connected=True,
        login_mode=cfg.instagram_login_mode,
        api_version=cfg.instagram_api_version,
        ig_user_id=str(info.get("id", cfg.instagram_user_id)),
        username=str(info.get("username", "")),
        account_type=str(info.get("account_type", "")),
        followers_count=int(info.get("followers_count", 0) or 0),
        media_count=int(info.get("media_count", 0) or 0),
        message="Bağlantı doğrulandı.",
    )


def upsert_account(
    session: Session,
    info: dict,
    *,
    token: TokenInfo | None = None,
    settings: Settings | None = None,
) -> Account:
    """Hesap kaydını oluşturur veya günceller."""
    cfg = settings or get_settings()
    ig_user_id = str(info.get("id") or cfg.instagram_user_id)
    if not ig_user_id:
        raise InstaFlowError("Instagram hesap kimliği belirlenemedi.")

    account = session.scalar(select(Account).where(Account.ig_user_id == ig_user_id))
    if account is None:
        account = Account(
            user_id=get_default_user(session).id,
            ig_user_id=ig_user_id,
            login_mode=cfg.instagram_login_mode,
        )
        session.add(account)

    account.username = str(info.get("username", account.username or ""))
    account.name = str(info.get("name", account.name or ""))
    account.account_type = str(info.get("account_type", account.account_type or ""))
    account.profile_picture_url = str(
        info.get("profile_picture_url", account.profile_picture_url or "")
    )
    account.followers_count = int(info.get("followers_count", account.followers_count) or 0)
    account.media_count = int(info.get("media_count", account.media_count) or 0)
    account.login_mode = cfg.instagram_login_mode
    account.is_active = True

    if token is not None and token.access_token:
        account.access_token = token.access_token
        account.token_type = token.token_type
        account.token_expires_at = token.expires_at
    elif not account.access_token and cfg.instagram_access_token:
        account.access_token = cfg.instagram_access_token

    session.flush()
    return account


def build_system_status(
    session: Session,
    *,
    scheduler_running: bool,
    settings: Settings | None = None,
) -> SystemStatus:
    """`run.py status` ve dashboard için toplu durum."""
    cfg = settings or get_settings()
    counts = content_service.count_by_status(session)
    database_path = cfg.resolved_database_url.replace("sqlite:///", "")

    return SystemStatus(
        app_name=cfg.app_name,
        app_env=cfg.app_env,
        database_ok=True,
        database_path=database_path,
        instagram=local_status(session, cfg),
        ai_provider=cfg.ai_provider,
        ai_configured=cfg.is_ai_configured,
        scheduler_running=scheduler_running,
        counts=counts,
        timezone=cfg.timezone,
    )


def recent_errors(session: Session, limit: int = 10) -> list[LogEntry]:
    """Dashboard'da gösterilen son hatalar."""
    return list(
        session.scalars(
            select(LogEntry)
            .where(LogEntry.level.in_(("WARNING", "ERROR", "CRITICAL")))
            .order_by(LogEntry.created_at.desc())
            .limit(limit)
        )
    )


def prune_logs(session: Session, *, keep_days: int = 30) -> int:
    """Eski log kayıtlarını siler (Termux'ta disk dostu)."""
    cutoff = utcnow() - timedelta(days=keep_days)
    rows = list(session.scalars(select(LogEntry).where(LogEntry.created_at < cutoff)))
    for row in rows:
        session.delete(row)
    return len(rows)
