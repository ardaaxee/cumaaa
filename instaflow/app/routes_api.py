"""JSON API uçları.

Tüm yanıtlar `APIResponse` zarfını kullanır. Hiçbir uç token, parola veya
API anahtarı döndürmez.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .ai import captions as ai_captions
from .ai import content as ai_content
from .ai import hashtags as ai_hashtags
from .config import get_settings
from .database import get_db
from .logging_setup import get_logger
from .scheduler import jobs as scheduler_jobs
from .schemas import (
    APIResponse,
    ContentCreate,
    ContentRead,
    ContentUpdate,
    PublishResult,
    ScheduleRequest,
)
from .services import account_service, analytics_service, content_service, publishing_service
from .timeutils import parse_local

logger = get_logger("api")

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/status")
async def read_status(db: Session = Depends(get_db)) -> APIResponse[dict[str, Any]]:
    """Sistem durumu."""
    status = account_service.build_system_status(
        db, scheduler_running=scheduler_jobs.is_running()
    )
    return APIResponse.ok(status.model_dump(mode="json"))


@router.get("/content")
async def list_content(
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> APIResponse[list[dict[str, Any]]]:
    """İçerikleri listeler."""
    items = content_service.list_contents(db, status=status, limit=limit, offset=offset)
    payload = [ContentRead.model_validate(item).model_dump(mode="json") for item in items]
    counts = content_service.count_by_status(db)
    return APIResponse.ok(payload, total=counts.get("total", 0), returned=len(payload))


@router.post("/content", status_code=201)
async def create_content(
    payload: ContentCreate, db: Session = Depends(get_db)
) -> APIResponse[dict[str, Any]]:
    """Yeni içerik oluşturur (taslak)."""
    content = content_service.create_content(db, payload)
    return APIResponse.ok(ContentRead.model_validate(content).model_dump(mode="json"))


@router.get("/content/{content_id}")
async def read_content(
    content_id: int, db: Session = Depends(get_db)
) -> APIResponse[dict[str, Any]]:
    """Tek içeriği getirir."""
    content = content_service.require_content(db, content_id)
    return APIResponse.ok(ContentRead.model_validate(content).model_dump(mode="json"))


@router.patch("/content/{content_id}")
async def update_content(
    content_id: int, payload: ContentUpdate, db: Session = Depends(get_db)
) -> APIResponse[dict[str, Any]]:
    """İçeriği günceller."""
    content = content_service.update_content(db, content_id, payload)
    return APIResponse.ok(ContentRead.model_validate(content).model_dump(mode="json"))


@router.delete("/content/{content_id}")
async def delete_content(
    content_id: int, db: Session = Depends(get_db)
) -> APIResponse[dict[str, str]]:
    """İçeriği siler."""
    content_service.delete_content(db, content_id)
    return APIResponse.ok({"deleted": str(content_id)})


@router.post("/content/{content_id}/schedule")
async def schedule_content(
    content_id: int, payload: ScheduleRequest, db: Session = Depends(get_db)
) -> APIResponse[dict[str, Any]]:
    """İçeriği planlar (yerel saat metni ile)."""
    when = parse_local(payload.scheduled_at)
    schedule = content_service.schedule_content(db, content_id, when)
    return APIResponse.ok(
        {
            "content_id": content_id,
            "scheduled_at_utc": schedule.scheduled_at.isoformat(),
            "status": schedule.status,
        }
    )


@router.post("/content/{content_id}/cancel")
async def cancel_schedule(
    content_id: int, db: Session = Depends(get_db)
) -> APIResponse[dict[str, str]]:
    """Planı iptal eder."""
    content_service.cancel_schedule(db, content_id)
    return APIResponse.ok({"cancelled": str(content_id)})


@router.post("/content/{content_id}/publish")
async def publish_content(content_id: int) -> APIResponse[dict[str, Any]]:
    """İçeriği hemen yayınlar."""
    result: PublishResult = await publishing_service.publish_content(content_id)
    payload = result.model_dump(mode="json")
    if result.success:
        return APIResponse.ok(payload)
    return APIResponse(success=False, data=payload, error=result.message)


@router.get("/analytics")
async def read_analytics(db: Session = Depends(get_db)) -> APIResponse[dict[str, Any]]:
    """Toplanmış istatistikler."""
    totals = analytics_service.totals_by_metric(db)
    posts = [
        {
            "ig_media_id": post.ig_media_id,
            "permalink": post.permalink,
            "published_at": post.published_at.isoformat(),
            "metrics": metrics,
        }
        for post, metrics in analytics_service.per_post_metrics(db, limit=20)
    ]
    return APIResponse.ok({"totals": totals, "posts": posts})


@router.post("/analytics/sync")
async def sync_analytics() -> APIResponse[dict[str, Any]]:
    """İstatistikleri API'den çeker."""
    report = await analytics_service.sync_insights()
    payload = {
        "posts_processed": report.posts_processed,
        "metrics_written": report.metrics_written,
        "unsupported": report.unsupported,
        "errors": report.errors,
    }
    if report.errors:
        return APIResponse(success=False, data=payload, error="; ".join(report.errors[:3]))
    return APIResponse.ok(payload)


# ----------------------------------------------------------------------- AI
@router.post("/ai/caption")
async def api_caption(topic: str = Query(..., min_length=2)) -> APIResponse[dict[str, Any]]:
    """Açıklama üretir (kaydetmez)."""
    result = await ai_captions.generate_caption(topic)
    return APIResponse.ok(result.model_dump(mode="json"))


@router.post("/ai/variants")
async def api_variants(
    topic: str = Query(..., min_length=2), count: int = Query(default=3, ge=1, le=10)
) -> APIResponse[dict[str, Any]]:
    """Açıklama varyasyonları üretir."""
    result = await ai_captions.generate_caption_variants(topic, count=count)
    return APIResponse.ok(result.model_dump(mode="json"))


@router.post("/ai/hashtags")
async def api_hashtags(
    topic: str = Query(..., min_length=2), count: int = Query(default=15, ge=1, le=30)
) -> APIResponse[dict[str, Any]]:
    """Hashtag önerir."""
    result = await ai_hashtags.generate_hashtags(topic, count=count)
    return APIResponse.ok(result.model_dump(mode="json"))


@router.post("/ai/ideas")
async def api_ideas(
    topic: str = Query(..., min_length=2), count: int = Query(default=7, ge=1, le=30)
) -> APIResponse[dict[str, Any]]:
    """İçerik fikirleri üretir."""
    result = await ai_content.generate_ideas(topic, count=count)
    return APIResponse.ok(result.model_dump(mode="json"))


@router.post("/ai/calendar")
async def api_calendar(
    topic: str = Query(..., min_length=2),
    days: int = Query(default=7, ge=1, le=30),
    per_day: int = Query(default=1, ge=1, le=3),
) -> APIResponse[dict[str, Any]]:
    """Haftalık plan üretir (kaydetmez)."""
    result = await ai_content.generate_calendar(topic, days=days, per_day=per_day)
    return APIResponse.ok(result.model_dump(mode="json"))


@router.get("/config")
async def read_public_config() -> APIResponse[dict[str, Any]]:
    """Gizli olmayan yapılandırma özeti.

    Hangi değerlerin **tanımlı olduğu** bildirilir; değerlerin kendisi asla.
    """
    settings = get_settings()
    return APIResponse.ok(
        {
            "app_env": settings.app_env,
            "timezone": settings.timezone,
            "login_mode": settings.instagram_login_mode,
            "api_version": settings.instagram_api_version,
            "ai_provider": settings.ai_provider,
            "media_metrics": list(settings.media_metrics),
            "configured": {
                "instagram": settings.is_instagram_configured,
                "oauth": settings.is_oauth_configured,
                "ai": settings.is_ai_configured,
                "public_base_url": bool(settings.public_base_url),
            },
        }
    )
