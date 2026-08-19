"""Zamanlanmış işler.

Üç iş çalışır:

* **publish_due_job** — her dakika: zamanı gelmiş gönderileri yayınlar.
* **sync_analytics_job** — günde bir: istatistikleri çeker.
* **token_check_job** — günde bir: token bitişini kontrol eder, gerekiyorsa
  yeniler ve yenilenemiyorsa kullanıcıyı uyarır.

Scheduler, web sunucusuyla aynı olay döngüsünde (`AsyncIOScheduler`) çalışır;
Termux'ta ayrı bir süreç açmamak için bilinçli bir tercih.
"""

from __future__ import annotations

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from ..config import Settings, get_settings
from ..database import session_scope
from ..errors import InstaFlowError, InstagramAPIError, NotConfiguredError
from ..instagram.auth import refresh_long_lived_token, should_refresh
from ..logging_setup import get_logger
from ..services import account_service, analytics_service, publishing_service

logger = get_logger("scheduler")

#: Veritabanındaki log kayıtları bu kadar gün saklanır (telefon diski dostu).
LOG_RETENTION_DAYS = 30

JOB_PUBLISH = "publish_due"
JOB_ANALYTICS = "sync_analytics"
JOB_TOKEN = "token_check"

_scheduler: AsyncIOScheduler | None = None


async def publish_due_job() -> None:
    """Zamanı gelmiş gönderileri yayınlar."""
    try:
        results = await publishing_service.publish_due()
    except Exception as exc:  # noqa: BLE001 - iş hiçbir koşulda scheduler'ı durdurmamalı
        logger.exception("Yayın işi beklenmedik şekilde başarısız: %s", exc)
        return

    for result in results:
        if result.success:
            logger.info("İçerik %s yayınlandı (%s).", result.content_id, result.ig_media_id)
        elif not result.skipped:
            logger.error("İçerik %s yayınlanamadı: %s", result.content_id, result.message)


async def sync_analytics_job() -> None:
    """Gönderi ve hesap istatistiklerini çeker, eski logları temizler."""
    try:
        with session_scope() as session:
            removed = account_service.prune_logs(session, keep_days=LOG_RETENTION_DAYS)
        if removed:
            logger.info("%d eski log kaydı temizlendi.", removed)
    except Exception as exc:  # noqa: BLE001 - temizlik asıl işi engellememeli
        logger.warning("Log temizliği başarısız: %s", exc)

    try:
        report = await analytics_service.sync_insights()
    except Exception as exc:  # noqa: BLE001
        logger.exception("İstatistik işi başarısız: %s", exc)
        return

    if report.unsupported:
        logger.warning(
            "Desteklenmeyen metrikler: %s", ", ".join(sorted(report.unsupported))
        )
    for error in report.errors:
        logger.warning("İstatistik hatası: %s", error)


async def token_check_job() -> None:
    """Token bitişini kontrol eder ve mümkünse yeniler."""
    settings = get_settings()
    with session_scope() as session:
        account = account_service.get_active_account(session)
        expires_at = account.token_expires_at if account else None
        token = account.access_token if account else settings.instagram_access_token
        account_id = account.id if account else None

    if not token or expires_at is None:
        logger.debug("Token bitiş tarihi bilinmiyor; kontrol atlandı.")
        return
    if not should_refresh(expires_at):
        return

    try:
        refreshed = await refresh_long_lived_token(token, settings)
    except (InstagramAPIError, NotConfiguredError, InstaFlowError) as exc:
        logger.error(
            "Erişim token'ı yenilenemedi (%s). Süresi dolmadan yeniden "
            "yetkilendirme yapmanız gerekiyor.",
            exc,
        )
        return

    with session_scope() as session:
        from ..models import Account

        record = session.get(Account, account_id) if account_id else None
        if record is not None:
            record.access_token = refreshed.access_token
            record.token_expires_at = refreshed.expires_at
            logger.info("Erişim token'ı yenilendi.")


def create_scheduler(settings: Settings | None = None) -> AsyncIOScheduler:
    """İşleri kayıtlı bir scheduler örneği üretir."""
    cfg = settings or get_settings()
    scheduler = AsyncIOScheduler(timezone="UTC")

    scheduler.add_job(
        publish_due_job,
        trigger=IntervalTrigger(seconds=cfg.scheduler_interval_seconds),
        id=JOB_PUBLISH,
        name="Zamanı gelen gönderileri yayınla",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=cfg.scheduler_interval_seconds * 5,
        replace_existing=True,
    )
    scheduler.add_job(
        sync_analytics_job,
        trigger=CronTrigger(hour=cfg.analytics_sync_hour, minute=0, timezone="UTC"),
        id=JOB_ANALYTICS,
        name="İstatistikleri eşitle",
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )
    scheduler.add_job(
        token_check_job,
        trigger=CronTrigger(hour=cfg.token_check_hour, minute=30, timezone="UTC"),
        id=JOB_TOKEN,
        name="Token bitişini kontrol et",
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )
    return scheduler


def start_scheduler(settings: Settings | None = None) -> AsyncIOScheduler:
    """Scheduler'ı başlatır (zaten çalışıyorsa mevcut örneği döndürür)."""
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        return _scheduler
    _scheduler = create_scheduler(settings)
    _scheduler.start()
    logger.info(
        "Scheduler başlatıldı (%s sn aralık).",
        (settings or get_settings()).scheduler_interval_seconds,
    )
    return _scheduler


def shutdown_scheduler() -> None:
    """Scheduler'ı durdurur."""
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler durduruldu.")
    _scheduler = None


def is_running() -> bool:
    """Scheduler çalışıyor mu?"""
    return _scheduler is not None and _scheduler.running


def job_summary() -> list[dict[str, str]]:
    """Kayıtlı işlerin sonraki çalışma zamanları."""
    if _scheduler is None:
        return []
    return [
        {
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else "-",
        }
        for job in _scheduler.get_jobs()
    ]
