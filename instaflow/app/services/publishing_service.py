"""Yayınlama akışının orkestrasyonu.

Mükerrer yayını üç katman engeller:

1. **Durum kilidi** — içerik `publishing` durumuna tek bir `UPDATE ... WHERE
   status IN (...)` ile geçirilir. İkinci çağrı 0 satır günceller ve atlanır.
2. **Benzersiz kısıt** — `published_posts` tablosunda `content_id` ve
   `ig_media_id` benzersizdir.
3. **Ön kontrol** — akışın başında zaten yayınlanmış içerik aranır.

Ayrıca 24 saatlik yerel bir yayın sınırı vardır; Meta'nın kotasını zorlamak
yerine önce burada durulur.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import timedelta

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import session_scope
from ..errors import (
    InstaFlowError,
    InstagramAPIError,
    NotConfiguredError,
    PublishingError,
)
from ..instagram.client import InstagramClient
from ..instagram.publishing import PublishingService, PublishRequest
from ..logging_setup import get_logger
from ..models import (
    Account,
    Content,
    ContentStatus,
    ContentType,
    PublishedPost,
    ScheduledPost,
    ScheduleStatus,
)
from ..schemas import PublishResult
from ..timeutils import utcnow
from . import content_service

logger = get_logger("services.publishing")


@dataclass
class _PublishPlan:
    """Yayın için gereken, oturumdan bağımsız veri."""

    content_id: int
    content_type: str
    caption: str
    media_url: str
    children_urls: list[str] = field(default_factory=list)
    cover_url: str = ""
    share_to_feed: bool = True
    account_id: int | None = None
    schedule_id: int | None = None
    #: Medya adresi çözülemediyse kullanıcıya gösterilecek açıklama.
    error_hint: str = ""


async def publish_content(
    content_id: int,
    *,
    client: InstagramClient | None = None,
    settings: Settings | None = None,
) -> PublishResult:
    """Tek bir içeriği yayınlar.

    Returns:
        Sonuç; `skipped=True` ise içerik zaten yayınlanmış ya da başka bir
        çalışan tarafından alınmıştır.
    """
    cfg = settings or get_settings()

    try:
        plan = _claim(content_id, cfg)
    except InstaFlowError as exc:
        return PublishResult(
            content_id=content_id, success=False, message=str(exc), skipped=True
        )
    if plan is None:
        return PublishResult(
            content_id=content_id,
            success=False,
            skipped=True,
            message="İçerik zaten yayınlanmış ya da şu anda yayınlanıyor.",
        )

    if plan.error_hint:
        # Yapılandırma eksikliği her denemede aynı sonucu verir; sonsuz
        # yeniden deneme yerine içerik başarısız işaretlenir.
        logger.error("Yayın yapılamıyor (içerik %s): %s", content_id, plan.error_hint)
        _mark_failed(plan, plan.error_hint, cfg, exhaust=True)
        return PublishResult(
            content_id=content_id, success=False, message=plan.error_hint
        )

    owns_client = client is None
    try:
        active_client = client or InstagramClient.from_settings(cfg)
    except NotConfiguredError as exc:
        _mark_failed(plan, str(exc), cfg)
        return PublishResult(content_id=content_id, success=False, message=str(exc))

    try:
        service = PublishingService(active_client, cfg)
        request = PublishRequest(
            content_type=plan.content_type,
            caption=plan.caption,
            media_url=plan.media_url,
            children_urls=plan.children_urls,
            cover_url=plan.cover_url,
            share_to_feed=plan.share_to_feed,
        )
        outcome = await service.publish(request)
    except (PublishingError, InstagramAPIError, InstaFlowError) as exc:
        message = getattr(exc, "message", str(exc))
        logger.error("Yayın başarısız (içerik %s): %s", content_id, message)
        _mark_failed(plan, message, cfg)
        return PublishResult(content_id=content_id, success=False, message=message)
    finally:
        if owns_client:
            await active_client.aclose()

    _mark_published(plan, outcome.ig_media_id, outcome.container_id, outcome.permalink,
                    outcome.media_type, cfg)
    return PublishResult(
        content_id=content_id,
        success=True,
        ig_media_id=outcome.ig_media_id,
        permalink=outcome.permalink,
        message="Yayınlandı.",
    )


async def publish_due(
    *,
    client: InstagramClient | None = None,
    settings: Settings | None = None,
) -> list[PublishResult]:
    """Zamanı gelmiş tüm planları işler."""
    cfg = settings or get_settings()
    with session_scope() as session:
        due = content_service.due_schedules(session)
        content_ids = [item.content_id for item in due]

    if not content_ids:
        return []

    logger.info("Zamanı gelen %d gönderi işlenecek.", len(content_ids))
    results: list[PublishResult] = []
    for content_id in content_ids:
        results.append(await publish_content(content_id, client=client, settings=cfg))
    return results


# ------------------------------------------------------------------ iç adımlar
def _claim(content_id: int, cfg: Settings) -> _PublishPlan | None:
    """İçeriği `publishing` durumuna kilitler ve yayın planını hazırlar.

    Returns:
        Plan; içerik alınamadıysa None.

    Raises:
        InstaFlowError: İçerik yoksa, medya adresi yoksa veya günlük sınır
            aşıldıysa.
    """
    with session_scope() as session:
        content = session.get(Content, content_id)
        if content is None:
            raise InstaFlowError(f"İçerik bulunamadı: {content_id}")

        already = session.scalar(
            select(PublishedPost).where(PublishedPost.content_id == content_id)
        )
        if already is not None:
            logger.info("İçerik %s zaten yayınlanmış, atlanıyor.", content_id)
            return None

        _check_daily_guard(session, cfg)

        media_url = content_service.resolve_publish_url(content, settings=cfg)
        children = _carousel_urls(content, cfg)
        if content.type == ContentType.CAROUSEL.value:
            hint = "" if children else _no_media_message(content)
        else:
            hint = "" if media_url else _no_media_message(content)

        claimed = session.execute(
            update(Content)
            .where(
                Content.id == content_id,
                Content.status.in_(content_service.CLAIMABLE_STATUSES),
            )
            .values(status=ContentStatus.PUBLISHING.value, error_message="")
        )
        if claimed.rowcount == 0:
            logger.info("İçerik %s başka bir işlem tarafından alınmış.", content_id)
            return None

        schedule = session.scalar(
            select(ScheduledPost)
            .where(
                ScheduledPost.content_id == content_id,
                ScheduledPost.status.in_(
                    (ScheduleStatus.PENDING.value, ScheduleStatus.RUNNING.value)
                ),
            )
            .order_by(ScheduledPost.scheduled_at.asc())
        )
        if schedule is not None:
            schedule.status = ScheduleStatus.RUNNING.value
            schedule.attempts += 1
            schedule.locked_at = utcnow()

        account = session.scalar(select(Account).where(Account.is_active.is_(True)))
        options = content.options or {}

        return _PublishPlan(
            content_id=content_id,
            content_type=content.type,
            caption=content.full_caption,
            media_url=media_url,
            children_urls=children,
            cover_url=str(options.get("cover_url", "")),
            share_to_feed=bool(options.get("share_to_feed", True)),
            account_id=account.id if account else None,
            schedule_id=schedule.id if schedule else None,
            error_hint=hint,
        )


def _mark_published(
    plan: _PublishPlan,
    media_id: str,
    container_id: str,
    permalink: str,
    media_type: str,
    cfg: Settings,
) -> None:
    """Başarılı yayını veritabanına işler."""
    with session_scope() as session:
        content = session.get(Content, plan.content_id)
        if content is None:
            return
        content.status = ContentStatus.PUBLISHED.value
        content.published_at = utcnow()
        content.error_message = ""
        content_service.move_media_for_status(content, settings=cfg)

        session.add(
            PublishedPost(
                content_id=plan.content_id,
                account_id=plan.account_id,
                ig_media_id=media_id,
                ig_container_id=container_id,
                permalink=permalink,
                media_type=media_type,
                published_at=utcnow(),
            )
        )
        if plan.schedule_id is not None:
            schedule = session.get(ScheduledPost, plan.schedule_id)
            if schedule is not None:
                schedule.status = ScheduleStatus.DONE.value
                schedule.last_error = ""
        try:
            session.flush()
        except IntegrityError:
            # Benzersiz kısıt: aynı gönderi başka bir yoldan zaten kaydedilmiş.
            session.rollback()
            logger.warning(
                "Yayın kaydı zaten mevcut (içerik %s, medya %s).",
                plan.content_id,
                media_id,
            )


def _mark_failed(
    plan: _PublishPlan, message: str, cfg: Settings, *, exhaust: bool = False
) -> None:
    """Başarısız yayını veritabanına işler.

    Args:
        exhaust: True ise tekrar denenmez (yapılandırma hataları gibi her
            denemede aynı sonucu verecek durumlar için).
    """
    with session_scope() as session:
        content = session.get(Content, plan.content_id)
        schedule = (
            session.get(ScheduledPost, plan.schedule_id)
            if plan.schedule_id is not None
            else None
        )
        retries_left = (
            not exhaust
            and schedule is not None
            and schedule.attempts < cfg.publish_max_attempts
        )

        if content is not None:
            content.error_message = message[:1000]
            if retries_left:
                content.status = ContentStatus.SCHEDULED.value
            else:
                content.status = ContentStatus.FAILED.value
                content_service.move_media_for_status(content, settings=cfg)

        if schedule is not None:
            schedule.last_error = message[:1000]
            schedule.status = (
                ScheduleStatus.PENDING.value
                if retries_left
                else ScheduleStatus.FAILED.value
            )
            schedule.locked_at = None


def _check_daily_guard(session: Session, cfg: Settings) -> None:
    """Son 24 saatte yapılan yayın sayısını yerel sınırla karşılaştırır.

    Raises:
        InstaFlowError: Sınır aşıldıysa.
    """
    since = utcnow() - timedelta(hours=24)
    count = session.scalar(
        select(func.count(PublishedPost.id)).where(PublishedPost.published_at >= since)
    )
    if (count or 0) >= cfg.daily_publish_guard:
        raise InstaFlowError(
            f"Son 24 saatte {count} gönderi yayınlandı; yerel güvenlik sınırı "
            f"({cfg.daily_publish_guard}) aşılmasın diye durduruldu."
        )


def _carousel_urls(content: Content, cfg: Settings) -> list[str]:
    """Carousel çocuklarının herkese açık adreslerini toplar."""
    if content.type != ContentType.CAROUSEL.value:
        return []
    options = content.options or {}
    urls = [str(url) for url in options.get("children_urls", []) if str(url).strip()]
    if urls:
        return urls

    from ..instagram.media import public_url_for

    paths = [str(path) for path in options.get("children_paths", []) if str(path).strip()]
    return [url for url in (public_url_for(path, cfg) for path in paths) if url]


def _no_media_message(content: Content) -> str:
    """Medya adresi bulunamadığında kullanıcıya gösterilecek açıklama."""
    if content.media_path:
        return (
            "Instagram Content Publishing API medyayı yalnızca herkese açık bir "
            "URL'den indirir; yerel dosya doğrudan yüklenemez. İçeriğe bir "
            "medya adresi (media_url) girin veya .env içinde PUBLIC_BASE_URL "
            "tanımlayın."
        )
    return "Bu içerikte yayınlanacak medya yok."
