"""İstatistik toplama ve özetleme.

Yalnızca API'den gerçekten dönen değerler kaydedilir. Desteklenmeyen
metrikler `unsupported` listesinde raporlanır; sıfır olarak yazılmaz, çünkü
"veri yok" ile "değer sıfır" farklı şeylerdir.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import session_scope
from ..errors import (
    InstagramAPIError,
    InstagramAuthError,
    InstagramRateLimitError,
    NotConfiguredError,
)
from ..instagram.client import InstagramClient
from ..instagram.insights import InsightsService
from ..logging_setup import get_logger
from ..models import Analytics, PublishedPost
from ..timeutils import utcnow

logger = get_logger("services.analytics")

DEFAULT_LOOKBACK_DAYS = 30


@dataclass
class SyncReport:
    """Bir eşitleme turunun sonucu."""

    posts_processed: int = 0
    metrics_written: int = 0
    unsupported: dict[str, str] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.errors


async def sync_insights(
    *,
    client: InstagramClient | None = None,
    settings: Settings | None = None,
    lookback_days: int = DEFAULT_LOOKBACK_DAYS,
) -> SyncReport:
    """Son gönderilerin ve hesabın istatistiklerini çeker.

    Returns:
        Kaç gönderi işlendiği ve hangi metriklerin desteklenmediği.
    """
    cfg = settings or get_settings()
    report = SyncReport()

    with session_scope() as session:
        since = utcnow() - timedelta(days=lookback_days)
        posts = list(
            session.scalars(
                select(PublishedPost)
                .where(PublishedPost.published_at >= since)
                .order_by(PublishedPost.published_at.desc())
            )
        )
        targets = [(post.id, post.ig_media_id) for post in posts]

    owns_client = client is None
    try:
        active = client or InstagramClient.from_settings(cfg)
    except NotConfiguredError as exc:
        report.errors.append(str(exc))
        return report

    try:
        service = InsightsService(active, cfg)

        for post_id, media_id in targets:
            try:
                result = await service.get_media_insights(media_id)
            except (InstagramAuthError, InstagramRateLimitError) as exc:
                # Token geçersizse ya da kota dolduysa kalan gönderiler için
                # istek atmanın anlamı yok; döngüyü burada kesiyoruz.
                report.errors.append(exc.message)
                logger.error("İstatistik eşitlemesi durduruldu: %s", exc.message)
                return report
            except InstagramAPIError as exc:
                report.errors.append(f"{media_id}: {exc.message}")
                continue
            report.posts_processed += 1
            report.unsupported.update(result.unsupported)
            report.metrics_written += _store(
                scope="media",
                object_id=media_id,
                values=result.values,
                period="lifetime",
                published_post_id=post_id,
            )

        try:
            account = await service.get_account_insights()
        except (InstagramAuthError, InstagramRateLimitError) as exc:
            report.errors.append(exc.message)
            return report
        except InstagramAPIError as exc:
            report.errors.append(f"hesap: {exc.message}")
        else:
            report.unsupported.update(account.unsupported)
            report.metrics_written += _store(
                scope="account",
                object_id=active.ig_user_id,
                values=account.values,
                period="day",
                published_post_id=None,
            )
    finally:
        if owns_client:
            await active.aclose()

    logger.info(
        "İstatistik eşitlemesi bitti: %d gönderi, %d metrik.",
        report.posts_processed,
        report.metrics_written,
    )
    return report


def _store(
    *,
    scope: str,
    object_id: str,
    values: dict[str, float],
    period: str,
    published_post_id: int | None,
) -> int:
    """Metrikleri gün bazında ekler veya günceller."""
    if not values:
        return 0
    captured_on = utcnow().strftime("%Y-%m-%d")
    written = 0
    with session_scope() as session:
        for metric, value in values.items():
            existing = session.scalar(
                select(Analytics).where(
                    Analytics.scope == scope,
                    Analytics.object_id == object_id,
                    Analytics.metric == metric,
                    Analytics.captured_on == captured_on,
                )
            )
            if existing is None:
                session.add(
                    Analytics(
                        published_post_id=published_post_id,
                        scope=scope,
                        object_id=object_id,
                        metric=metric,
                        value=float(value),
                        period=period,
                        captured_on=captured_on,
                    )
                )
            else:
                existing.value = float(value)
                existing.fetched_at = utcnow()
            written += 1
    return written


def totals_by_metric(session: Session, *, scope: str = "media") -> dict[str, float]:
    """Her metriğin toplamı (gönderi başına en son ölçüm üzerinden).

    Aynı gönderi için birden çok günün kaydı olabileceğinden, önce her
    (nesne, metrik) çifti için en güncel gün seçilir.
    """
    latest = (
        select(
            Analytics.object_id.label("object_id"),
            Analytics.metric.label("metric"),
            func.max(Analytics.captured_on).label("captured_on"),
        )
        .where(Analytics.scope == scope)
        .group_by(Analytics.object_id, Analytics.metric)
        .subquery()
    )
    rows = session.execute(
        select(Analytics.metric, func.sum(Analytics.value))
        .join(
            latest,
            (Analytics.object_id == latest.c.object_id)
            & (Analytics.metric == latest.c.metric)
            & (Analytics.captured_on == latest.c.captured_on),
        )
        .where(Analytics.scope == scope)
        .group_by(Analytics.metric)
    ).all()
    return {str(metric): float(total or 0) for metric, total in rows}


def per_post_metrics(
    session: Session, *, limit: int = 20
) -> list[tuple[PublishedPost, dict[str, float]]]:
    """Son gönderiler ve her birinin en güncel metrikleri."""
    posts = list(
        session.scalars(
            select(PublishedPost).order_by(PublishedPost.published_at.desc()).limit(limit)
        )
    )
    if not posts:
        return []

    media_ids = [post.ig_media_id for post in posts]
    rows = session.execute(
        select(Analytics.object_id, Analytics.metric, Analytics.value, Analytics.captured_on)
        .where(Analytics.scope == "media", Analytics.object_id.in_(media_ids))
        .order_by(Analytics.captured_on.asc())
    ).all()

    grouped: dict[str, dict[str, float]] = {}
    for object_id, metric, value, _captured in rows:
        grouped.setdefault(str(object_id), {})[str(metric)] = float(value)

    return [(post, grouped.get(post.ig_media_id, {})) for post in posts]


def account_series(
    session: Session, metric: str, *, days: int = 30
) -> list[tuple[str, float]]:
    """Hesap düzeyinde bir metriğin gün gün seyri."""
    since = (utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
    rows = session.execute(
        select(Analytics.captured_on, Analytics.value)
        .where(
            Analytics.scope == "account",
            Analytics.metric == metric,
            Analytics.captured_on >= since,
        )
        .order_by(Analytics.captured_on.asc())
    ).all()
    return [(str(day), float(value)) for day, value in rows]


def has_any_data(session: Session) -> bool:
    """Hiç istatistik toplanmış mı?"""
    return bool(session.scalar(select(func.count(Analytics.id))))
