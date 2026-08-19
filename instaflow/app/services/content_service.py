"""İçerik CRUD ve planlama işlemleri.

Tüm veritabanı erişimi parametreli SQLAlchemy sorgularıyla yapılır; hiçbir
yerde dize birleştirmeyle SQL kurulmaz.
"""

from __future__ import annotations

import hashlib
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import get_default_user
from ..errors import InstaFlowError, MediaValidationError
from ..instagram.media import KIND_BY_CONTENT_TYPE, public_url_for, validate_media_file
from ..logging_setup import get_logger
from ..models import (
    Content,
    ContentStatus,
    ContentType,
    PublishedPost,
    ScheduledPost,
    ScheduleStatus,
    is_valid_transition,
)
from ..schemas import ContentCreate, ContentUpdate
from ..security import resolve_within
from ..timeutils import local_day_bounds, utcnow

logger = get_logger("services.content")

#: Durum → `content/` altındaki klasör.
STATUS_DIRECTORIES: dict[str, str] = {
    ContentStatus.DRAFT.value: "drafts",
    ContentStatus.SCHEDULED.value: "scheduled",
    ContentStatus.PUBLISHING.value: "scheduled",
    ContentStatus.PUBLISHED.value: "published",
    ContentStatus.FAILED.value: "failed",
}

#: Yayınlanabilir duruma geçebilecek durumlar.
CLAIMABLE_STATUSES = (
    ContentStatus.DRAFT.value,
    ContentStatus.SCHEDULED.value,
    ContentStatus.FAILED.value,
)


def create_content(
    session: Session,
    payload: ContentCreate,
    *,
    user_id: int | None = None,
    settings: Settings | None = None,
) -> Content:
    """Yeni içerik oluşturur (her zaman taslak olarak).

    Yerel bir medya yolu verilmişse dosya burada doğrulanır — geçersiz medya
    veritabanına hiç girmez.

    Raises:
        MediaValidationError: Medya doğrulanamazsa.
    """
    cfg = settings or get_settings()
    owner_id = user_id if user_id is not None else get_default_user(session).id

    media_path = payload.media_path.strip()
    if media_path:
        expected = KIND_BY_CONTENT_TYPE.get(payload.type.value)
        info = validate_media_file(media_path, expected=expected, settings=cfg)
        media_path = info.path.relative_to(cfg.content_dir.resolve()).as_posix()

    content = Content(
        user_id=owner_id,
        type=payload.type.value,
        title=payload.title,
        caption=payload.caption,
        hashtags=payload.hashtags,
        media_path=media_path,
        media_url=payload.media_url.strip(),
        thumbnail_url=payload.thumbnail_url.strip(),
        status=ContentStatus.DRAFT.value,
        options=payload.options or {},
    )
    session.add(content)
    session.flush()
    logger.info("İçerik oluşturuldu: id=%s tür=%s", content.id, content.type)
    return content


def update_content(
    session: Session,
    content_id: int,
    payload: ContentUpdate,
    *,
    settings: Settings | None = None,
) -> Content:
    """Var olan içeriği günceller.

    Yayınlanmış içerik değiştirilemez: Instagram'daki gönderi ile veritabanı
    arasındaki bağ bozulmasın diye.

    Raises:
        InstaFlowError: İçerik yoksa veya yayınlanmışsa.
    """
    content = require_content(session, content_id)
    if content.status == ContentStatus.PUBLISHED.value:
        raise InstaFlowError("Yayınlanmış içerik düzenlenemez.")

    cfg = settings or get_settings()
    data = payload.model_dump(exclude_unset=True)

    if "media_path" in data and data["media_path"]:
        content_type = data.get("type") or content.type
        type_value = content_type.value if isinstance(content_type, ContentType) else content_type
        expected = KIND_BY_CONTENT_TYPE.get(type_value)
        info = validate_media_file(data["media_path"], expected=expected, settings=cfg)
        data["media_path"] = info.path.relative_to(cfg.content_dir.resolve()).as_posix()

    if isinstance(data.get("type"), ContentType):
        data["type"] = data["type"].value

    for field, value in data.items():
        setattr(content, field, value)
    session.flush()
    logger.info("İçerik güncellendi: id=%s", content.id)
    return content


def delete_content(session: Session, content_id: int) -> None:
    """İçeriği siler (yayınlanmışsa kayıt korunur).

    Raises:
        InstaFlowError: İçerik yoksa veya yayınlanmışsa.
    """
    content = require_content(session, content_id)
    if content.status == ContentStatus.PUBLISHED.value:
        raise InstaFlowError(
            "Yayınlanmış içerik silinemez; istatistik geçmişi buna bağlı."
        )
    session.delete(content)
    logger.info("İçerik silindi: id=%s", content_id)


def set_status(content: Content, new_status: str) -> None:
    """İçeriğin durumunu, geçiş kurallarını doğrulayarak değiştirir.

    Durum makinesi:

        draft ─┬─> scheduled ─┬─> publishing ─┬─> published (uç durum)
               │              │               └─> failed ──> (yeniden planla)
               └──────────────┴─> publishing

    Raises:
        InstaFlowError: Geçiş izinli değilse (örn. yayınlanmış bir içeriği
            tekrar taslağa çekmek).
    """
    if not is_valid_transition(content.status, new_status):
        raise InstaFlowError(
            f"Geçersiz durum geçişi: {content.status} → {new_status}"
        )
    content.status = new_status


def recover_stale_publishing(
    session: Session, *, stale_minutes: int, now: datetime | None = None
) -> int:
    """Yarıda kalmış yayınları kurtarır.

    Süreç yayın sırasında öldürülürse (Termux kapanması, pil optimizasyonu)
    içerik `publishing` durumunda kalır ve scheduler onu bir daha ele almaz.
    Bu işlev, kilidi belirtilen süreden eski olan kayıtları yeniden
    denenebilir duruma çeker.

    Gerçekten yayınlanmış olanlara dokunulmaz: `published_posts` kaydı olan
    içerik `published` yapılır, çünkü yayın Instagram tarafında tamamlanmış
    ama veritabanı güncellenememiş olabilir.

    Returns:
        Kurtarılan içerik sayısı.
    """
    moment = now or utcnow()
    cutoff = moment - timedelta(minutes=stale_minutes)

    stuck = list(
        session.scalars(
            select(Content).where(
                Content.status == ContentStatus.PUBLISHING.value,
                Content.updated_at < cutoff,
            )
        )
    )
    if not stuck:
        return 0

    recovered = 0
    for content in stuck:
        published = session.scalar(
            select(PublishedPost).where(PublishedPost.content_id == content.id)
        )
        if published is not None:
            # Yayın tamamlanmış, yalnızca durum güncellenememiş.
            content.status = ContentStatus.PUBLISHED.value
            content.published_at = content.published_at or published.published_at
            logger.warning(
                "Yarıda kalan yayın tamamlanmış olarak işaretlendi: içerik %s",
                content.id,
            )
        else:
            content.status = ContentStatus.SCHEDULED.value
            content.error_message = (
                "Önceki yayın denemesi yarıda kaldı; yeniden denenecek."
            )
            logger.warning(
                "Yarıda kalan yayın yeniden kuyruğa alındı: içerik %s", content.id
            )

        for schedule in session.scalars(
            select(ScheduledPost).where(
                ScheduledPost.content_id == content.id,
                ScheduledPost.status == ScheduleStatus.RUNNING.value,
            )
        ):
            schedule.status = (
                ScheduleStatus.DONE.value
                if published is not None
                else ScheduleStatus.PENDING.value
            )
            schedule.locked_at = None
        recovered += 1

    session.flush()
    return recovered


def get_content(session: Session, content_id: int) -> Content | None:
    """İçeriği getirir."""
    return session.get(Content, content_id)


def require_content(session: Session, content_id: int) -> Content:
    """İçeriği getirir; yoksa hata verir.

    Raises:
        InstaFlowError: İçerik bulunamazsa.
    """
    content = session.get(Content, content_id)
    if content is None:
        raise InstaFlowError(f"İçerik bulunamadı: {content_id}")
    return content


def list_contents(
    session: Session,
    *,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Content]:
    """İçerikleri listeler (en yeniden eskiye)."""
    query = select(Content).order_by(Content.created_at.desc())
    if status:
        query = query.where(Content.status == status)
    return list(session.scalars(query.limit(min(limit, 200)).offset(max(offset, 0))))


def count_by_status(session: Session) -> dict[str, int]:
    """Durum bazında içerik sayıları (tüm durumlar için anahtar döner)."""
    rows = session.execute(
        select(Content.status, func.count(Content.id)).group_by(Content.status)
    ).all()
    counts = {status.value: 0 for status in ContentStatus}
    counts.update({str(status): int(total) for status, total in rows})
    counts["total"] = sum(counts[s.value] for s in ContentStatus)
    return counts


# ------------------------------------------------------------------- planlama
def schedule_content(
    session: Session,
    content_id: int,
    when_utc: datetime,
) -> ScheduledPost:
    """İçeriği belirtilen zamana planlar.

    Aynı içerik + aynı dakika için ikinci bir kayıt oluşturulmaz; var olan
    bekleyen plan güncellenir. Bu, "aynı gönderi iki kez yayınlanmasın"
    güvencesinin ilk katmanıdır.

    Raises:
        InstaFlowError: İçerik yoksa, yayınlanmışsa veya zaman geçmişteyse.
    """
    content = require_content(session, content_id)
    if content.status == ContentStatus.PUBLISHED.value:
        raise InstaFlowError("Bu içerik zaten yayınlanmış.")
    if content.status == ContentStatus.PUBLISHING.value:
        raise InstaFlowError("Bu içerik şu anda yayınlanıyor.")
    if when_utc <= utcnow() - timedelta(minutes=1):
        raise InstaFlowError("Planlanan zaman geçmişte olamaz.")

    key = make_idempotency_key(content_id, when_utc)

    # Bekleyen bir plan varsa saati güncellenir. Yoksa aynı anahtara sahip
    # eski bir kayıt (iptal edilmiş ya da başarısız olmuş) aranır: anahtar
    # benzersiz olduğu için yeni satır eklemek çakışma hatası verirdi.
    schedule = session.scalar(
        select(ScheduledPost).where(
            ScheduledPost.content_id == content_id,
            ScheduledPost.status == ScheduleStatus.PENDING.value,
        )
    ) or session.scalar(
        select(ScheduledPost).where(ScheduledPost.idempotency_key == key)
    )

    if schedule is None:
        schedule = ScheduledPost(
            content_id=content_id,
            scheduled_at=when_utc,
            status=ScheduleStatus.PENDING.value,
            idempotency_key=key,
        )
        session.add(schedule)
    else:
        schedule.content_id = content_id
        schedule.scheduled_at = when_utc
        schedule.idempotency_key = key
        schedule.status = ScheduleStatus.PENDING.value
        schedule.attempts = 0
        schedule.last_error = ""
        schedule.locked_at = None

    set_status(content, ContentStatus.SCHEDULED.value)
    content.scheduled_at = when_utc
    content.error_message = ""
    session.flush()
    logger.info("İçerik planlandı: id=%s zaman=%s UTC", content_id, when_utc)
    return schedule


def cancel_schedule(session: Session, content_id: int) -> None:
    """Bekleyen planı iptal eder ve içeriği taslağa döndürür.

    Raises:
        InstaFlowError: Bekleyen plan yoksa.
    """
    schedules = list(
        session.scalars(
            select(ScheduledPost).where(
                ScheduledPost.content_id == content_id,
                ScheduledPost.status == ScheduleStatus.PENDING.value,
            )
        )
    )
    if not schedules:
        raise InstaFlowError("Bu içerik için bekleyen bir plan yok.")

    for schedule in schedules:
        schedule.status = ScheduleStatus.CANCELLED.value

    content = require_content(session, content_id)
    if content.status == ContentStatus.SCHEDULED.value:
        set_status(content, ContentStatus.DRAFT.value)
        content.scheduled_at = None
    session.flush()
    logger.info("Plan iptal edildi: içerik=%s", content_id)


def due_schedules(session: Session, *, now: datetime | None = None) -> list[ScheduledPost]:
    """Zamanı gelmiş, bekleyen planları döndürür."""
    moment = now or utcnow()
    query = (
        select(ScheduledPost)
        .where(
            ScheduledPost.status == ScheduleStatus.PENDING.value,
            ScheduledPost.scheduled_at <= moment,
        )
        .order_by(ScheduledPost.scheduled_at.asc())
    )
    return list(session.scalars(query))


def make_idempotency_key(content_id: int, when_utc: datetime) -> str:
    """İçerik + dakika bazlı benzersiz anahtar."""
    raw = f"{content_id}:{when_utc.strftime('%Y-%m-%dT%H:%M')}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]


# ------------------------------------------------------------------ dashboard
def dashboard_buckets(session: Session) -> dict[str, list[Content]]:
    """Dashboard'daki zaman kovaları."""
    today_start, today_end = local_day_bounds(0)
    tomorrow_start, tomorrow_end = local_day_bounds(1)
    week_end = today_start + timedelta(days=7)

    def scheduled_between(start: datetime, end: datetime) -> list[Content]:
        return list(
            session.scalars(
                select(Content)
                .where(
                    Content.status.in_(
                        (ContentStatus.SCHEDULED.value, ContentStatus.PUBLISHING.value)
                    ),
                    Content.scheduled_at >= start,
                    Content.scheduled_at < end,
                )
                .order_by(Content.scheduled_at.asc())
            )
        )

    return {
        "today": scheduled_between(today_start, today_end),
        "tomorrow": scheduled_between(tomorrow_start, tomorrow_end),
        "week": scheduled_between(today_start, week_end),
        "scheduled": list_contents(session, status=ContentStatus.SCHEDULED.value, limit=20),
        "published": list_contents(session, status=ContentStatus.PUBLISHED.value, limit=10),
        "failed": list_contents(session, status=ContentStatus.FAILED.value, limit=10),
    }


def calendar_entries(
    session: Session, *, days: int = 30
) -> list[tuple[str, list[Content]]]:
    """Takvim görünümü için gün gün gruplanmış içerikler."""
    from ..timeutils import to_local

    start, _ = local_day_bounds(0)
    end = start + timedelta(days=days)
    rows = list(
        session.scalars(
            select(Content)
            .where(Content.scheduled_at >= start, Content.scheduled_at < end)
            .order_by(Content.scheduled_at.asc())
        )
    )
    grouped: dict[str, list[Content]] = {}
    for content in rows:
        local = to_local(content.scheduled_at)
        if local is None:
            continue
        grouped.setdefault(local.strftime("%Y-%m-%d"), []).append(content)
    return sorted(grouped.items())


# ---------------------------------------------------------------------- medya
def move_media_for_status(
    content: Content, *, settings: Settings | None = None
) -> None:
    """Yerel medyayı içeriğin durumuna karşılık gelen klasöre taşır.

    Dosya yoksa veya `content/` dışına işaret ediyorsa sessizce atlanır —
    taşıma, yayınlama akışını bozacak kadar kritik değildir.
    """
    cfg = settings or get_settings()
    if not content.media_path:
        return

    target_dir_name = STATUS_DIRECTORIES.get(content.status)
    if not target_dir_name:
        return

    try:
        source = resolve_within(cfg.content_dir, content.media_path)
    except MediaValidationError:
        logger.warning("Medya yolu güvenli değil, taşınmadı: %s", content.media_path)
        return
    if not source.is_file():
        return

    destination_dir = cfg.content_dir.resolve() / target_dir_name
    if source.parent == destination_dir:
        return

    destination_dir.mkdir(parents=True, exist_ok=True)
    destination = destination_dir / source.name
    if destination.exists():
        destination = destination_dir / f"{source.stem}-{content.id}{source.suffix}"

    try:
        source.replace(destination)
    except OSError as exc:
        logger.warning("Medya taşınamadı (%s): %s", source.name, exc)
        return

    content.media_path = destination.relative_to(cfg.content_dir.resolve()).as_posix()


def resolve_publish_url(content: Content, *, settings: Settings | None = None) -> str:
    """Yayında kullanılacak medya adresini belirler.

    Öncelik `media_url` alanındadır. Yoksa yerel dosyadan `PUBLIC_BASE_URL`
    ile bir adres türetilir. İkisi de yoksa boş dize döner ve çağıran taraf
    kullanıcıya nedenini açıklar.
    """
    cfg = settings or get_settings()
    if content.media_url:
        return content.media_url
    if content.media_path:
        return public_url_for(Path(content.media_path), cfg)
    return ""


def recent_published(session: Session, limit: int = 10) -> list[PublishedPost]:
    """Son yayınlanan gönderiler."""
    return list(
        session.scalars(
            select(PublishedPost).order_by(PublishedPost.published_at.desc()).limit(limit)
        )
    )
