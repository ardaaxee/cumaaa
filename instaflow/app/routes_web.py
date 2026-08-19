"""HTML sayfaları ve form işlemleri.

Tüm durum değiştiren istekler POST'tur ve CSRF token'ı doğrulanır.
Şablonlara hiçbir gizli değer geçilmez.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from .ai import captions as ai_captions
from .ai import content as ai_content
from .ai import hashtags as ai_hashtags
from .config import get_settings
from .database import get_db
from .errors import InstaFlowError, MediaValidationError
from .instagram.media import store_upload
from .logging_setup import get_logger
from .models import ContentStatus, ContentType
from .scheduler import jobs as scheduler_jobs
from .schemas import ContentCreate, ContentUpdate
from .security import issue_csrf_token, new_session_id, verify_csrf_token
from .services import account_service, analytics_service, content_service, publishing_service
from .templating import templates
from .timeutils import parse_local

logger = get_logger("web")

router = APIRouter(include_in_schema=False)

FLASH_KEY = "flash"


# --------------------------------------------------------------------- oturum
def session_id(request: Request) -> str:
    """Oturum kimliğini döndürür, yoksa oluşturur."""
    sid = request.session.get("sid")
    if not sid:
        sid = new_session_id()
        request.session["sid"] = sid
    return sid


def csrf_token(request: Request) -> str:
    """Formlara gömülecek CSRF token'ı."""
    return issue_csrf_token(session_id(request))


async def require_csrf(request: Request) -> None:
    """Form gövdesindeki CSRF token'ını doğrular.

    Raises:
        InstaFlowError: Token eksik veya geçersizse.
    """
    form = await request.form()
    token = form.get("csrf_token")
    if not verify_csrf_token(str(token) if token else None, session_id(request)):
        raise InstaFlowError(
            "Güvenlik doğrulaması başarısız (CSRF). Sayfayı yenileyip tekrar deneyin."
        )


def flash(request: Request, message: str, level: str = "info") -> None:
    """Bir sonraki sayfada gösterilecek bildirim ekler."""
    messages = request.session.get(FLASH_KEY, [])
    messages.append({"text": message, "level": level})
    request.session[FLASH_KEY] = messages[-5:]


def pop_flashes(request: Request) -> list[dict[str, str]]:
    """Bekleyen bildirimleri okur ve temizler."""
    messages = request.session.get(FLASH_KEY, [])
    request.session[FLASH_KEY] = []
    return messages


def page_context(request: Request, **extra) -> dict:
    """Her sayfada bulunan ortak bağlam."""
    context = {
        "csrf_token": csrf_token(request),
        "flashes": pop_flashes(request),
        "settings": get_settings(),
    }
    context.update(extra)
    return context


def _redirect(url: str) -> RedirectResponse:
    """POST sonrası yönlendirme (çift gönderimi önler)."""
    return RedirectResponse(url=url, status_code=303)


# ------------------------------------------------------------------ dashboard
@router.get("/dashboard")
async def dashboard(request: Request, db: Session = Depends(get_db)):
    """Ana sayfa: bağlantı durumu, bugünkü plan, sayaçlar, son hatalar."""
    status = account_service.build_system_status(
        db, scheduler_running=scheduler_jobs.is_running()
    )
    buckets = content_service.dashboard_buckets(db)
    return templates.TemplateResponse(
        request,
        "dashboard.html",
        page_context(
            request,
            active_page="dashboard",
            status=status,
            buckets=buckets,
            recent_published=content_service.recent_published(db, limit=5),
            recent_errors=account_service.recent_errors(db, limit=5),
            jobs=scheduler_jobs.job_summary(),
        ),
    )


# -------------------------------------------------------------------- içerik
@router.get("/content")
async def content_page(
    request: Request, status: str = "", db: Session = Depends(get_db)
):
    """İçerik listesi ve yeni içerik formu."""
    items = content_service.list_contents(db, status=status or None, limit=100)
    return templates.TemplateResponse(
        request,
        "content.html",
        page_context(
            request,
            active_page="content",
            items=items,
            active_status=status,
            statuses=[s.value for s in ContentStatus],
            types=[t.value for t in ContentType],
            counts=content_service.count_by_status(db),
        ),
    )


@router.post("/content/create", dependencies=[Depends(require_csrf)])
async def create_content(
    request: Request,
    content_type: str = Form("image"),
    title: str = Form(""),
    caption: str = Form(""),
    hashtags: str = Form(""),
    media_url: str = Form(""),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    """Formdan yeni içerik oluşturur."""
    settings = get_settings()
    media_path = ""

    if media_file is not None and media_file.filename:
        try:
            info = store_upload(
                media_file.filename, await media_file.read(), settings=settings
            )
            media_path = info.path.relative_to(settings.content_dir.resolve()).as_posix()
        except MediaValidationError as exc:
            flash(request, f"Dosya reddedildi: {exc.message}", "error")
            return _redirect("/content")

    try:
        payload = ContentCreate(
            type=ContentType(content_type),
            title=title,
            caption=caption,
            hashtags=hashtags,
            media_path=media_path,
            media_url=media_url,
        )
    except ValueError as exc:
        flash(request, f"Form geçersiz: {exc}", "error")
        return _redirect("/content")

    content = content_service.create_content(db, payload, settings=settings)
    flash(request, f"İçerik #{content.id} taslak olarak kaydedildi.", "success")
    return _redirect("/content")


@router.post("/content/{content_id}/update", dependencies=[Depends(require_csrf)])
async def update_content(
    request: Request,
    content_id: int,
    title: str = Form(""),
    caption: str = Form(""),
    hashtags: str = Form(""),
    media_url: str = Form(""),
    db: Session = Depends(get_db),
):
    """İçeriği günceller."""
    content_service.update_content(
        db,
        content_id,
        ContentUpdate(
            title=title, caption=caption, hashtags=hashtags, media_url=media_url
        ),
    )
    flash(request, f"İçerik #{content_id} güncellendi.", "success")
    return _redirect("/content")


@router.post("/content/{content_id}/delete", dependencies=[Depends(require_csrf)])
async def delete_content(request: Request, content_id: int, db: Session = Depends(get_db)):
    """İçeriği siler."""
    content_service.delete_content(db, content_id)
    flash(request, f"İçerik #{content_id} silindi.", "success")
    return _redirect("/content")


@router.post("/content/{content_id}/schedule", dependencies=[Depends(require_csrf)])
async def schedule_content(
    request: Request,
    content_id: int,
    scheduled_at: str = Form(...),
    db: Session = Depends(get_db),
):
    """İçeriği planlar."""
    try:
        when = parse_local(scheduled_at)
    except ValueError as exc:
        flash(request, str(exc), "error")
        return _redirect("/calendar")

    content_service.schedule_content(db, content_id, when)
    flash(request, f"İçerik #{content_id} planlandı.", "success")
    return _redirect("/calendar")


@router.post("/content/{content_id}/cancel", dependencies=[Depends(require_csrf)])
async def cancel_schedule(request: Request, content_id: int, db: Session = Depends(get_db)):
    """Planı iptal eder."""
    content_service.cancel_schedule(db, content_id)
    flash(request, f"İçerik #{content_id} planı iptal edildi.", "success")
    return _redirect("/calendar")


@router.post("/content/{content_id}/publish", dependencies=[Depends(require_csrf)])
async def publish_now(request: Request, content_id: int):
    """İçeriği hemen yayınlar."""
    result = await publishing_service.publish_content(content_id)
    flash(
        request,
        result.message or ("Yayınlandı." if result.success else "Yayınlanamadı."),
        "success" if result.success else "error",
    )
    return _redirect("/content")


# -------------------------------------------------------------------- takvim
@router.get("/calendar")
async def calendar_page(request: Request, db: Session = Depends(get_db)):
    """Takvim görünümü ve planlanabilir içerikler."""
    schedulable = [
        item
        for item in content_service.list_contents(db, limit=100)
        if item.status in (ContentStatus.DRAFT.value, ContentStatus.FAILED.value)
    ]
    return templates.TemplateResponse(
        request,
        "calendar.html",
        page_context(
            request,
            active_page="calendar",
            days=content_service.calendar_entries(db, days=30),
            schedulable=schedulable,
            buckets=content_service.dashboard_buckets(db),
        ),
    )


# ----------------------------------------------------------------- analytics
@router.get("/analytics")
async def analytics_page(request: Request, db: Session = Depends(get_db)):
    """İstatistik özeti."""
    totals = analytics_service.totals_by_metric(db)
    return templates.TemplateResponse(
        request,
        "analytics.html",
        page_context(
            request,
            active_page="analytics",
            totals=totals,
            posts=analytics_service.per_post_metrics(db, limit=20),
            has_data=analytics_service.has_any_data(db),
            metrics=get_settings().media_metrics,
            max_value=max(totals.values(), default=0),
        ),
    )


@router.post("/analytics/sync", dependencies=[Depends(require_csrf)])
async def analytics_sync(request: Request):
    """İstatistikleri şimdi çeker."""
    report = await analytics_service.sync_insights()
    if report.errors:
        flash(request, "; ".join(report.errors[:3]), "error")
    else:
        flash(
            request,
            f"{report.posts_processed} gönderi için {report.metrics_written} metrik güncellendi.",
            "success",
        )
    if report.unsupported:
        flash(
            request,
            "Bu metrikler mevcut API izinleriyle desteklenmiyor: "
            + ", ".join(sorted(report.unsupported)),
            "warning",
        )
    return _redirect("/analytics")


# ------------------------------------------------------------------ ayarlar
@router.get("/settings")
async def settings_page(request: Request, db: Session = Depends(get_db)):
    """Yapılandırma özeti — gizli değerler yalnızca maskeli gösterilir."""
    settings = get_settings()
    account = account_service.get_active_account(db)
    return templates.TemplateResponse(
        request,
        "settings.html",
        page_context(
            request,
            active_page="settings",
            status=account_service.local_status(db, settings),
            account=account,
            jobs=scheduler_jobs.job_summary(),
            scheduler_running=scheduler_jobs.is_running(),
            secrets={
                "INSTAGRAM_ACCESS_TOKEN": bool(settings.instagram_access_token),
                "INSTAGRAM_USER_ID": bool(settings.instagram_user_id),
                "META_APP_ID": bool(settings.meta_app_id),
                "META_APP_SECRET": bool(settings.meta_app_secret),
                "OAUTH_REDIRECT_URI": bool(settings.oauth_redirect_uri),
                "PUBLIC_BASE_URL": bool(settings.public_base_url),
                "OPENAI_API_KEY": bool(settings.openai_api_key),
                "ANTHROPIC_API_KEY": bool(settings.anthropic_api_key),
            },
        ),
    )


@router.post("/settings/verify", dependencies=[Depends(require_csrf)])
async def verify_connection(request: Request):
    """Instagram bağlantısını canlı olarak doğrular."""
    status = await account_service.verify_connection()
    flash(
        request,
        status.message,
        "success" if status.connected else "error",
    )
    return _redirect("/settings")


# ---------------------------------------------------------------- AI yardımı
@router.post("/ai/generate", dependencies=[Depends(require_csrf)])
async def ai_generate(
    request: Request,
    topic: str = Form(...),
    action: str = Form("caption"),
    db: Session = Depends(get_db),
):
    """Konudan içerik üretir ve **taslak** olarak kaydeder.

    Üretilen hiçbir şey otomatik yayınlanmaz.
    """
    topic = topic.strip()
    if not topic:
        flash(request, "Konu boş olamaz.", "error")
        return _redirect("/content")

    if action == "hashtags":
        result = await ai_hashtags.generate_hashtags(topic)
        flash(request, "Öneriler: " + " ".join(result.items), "info")
        return _redirect("/content")

    if action == "ideas":
        result = await ai_content.generate_ideas(topic)
        created = 0
        for idea in result.items:
            content_service.create_content(
                db, ContentCreate(type=ContentType.IMAGE, title=idea[:255], caption="")
            )
            created += 1
        flash(request, f"{created} fikir taslak olarak eklendi.", "success")
        return _redirect("/content")

    caption = await ai_captions.generate_caption(topic)
    tags = await ai_hashtags.generate_hashtags(topic)
    title = await ai_captions.generate_title(topic)
    content = content_service.create_content(
        db,
        ContentCreate(
            type=ContentType.IMAGE,
            title=title.text,
            caption=caption.text,
            hashtags=" ".join(tags.items),
        ),
    )
    content.ai_provider = caption.provider
    content.ai_model = caption.model
    note = " (yerel üreticiye düşüldü)" if caption.fallback_used else ""
    flash(request, f"İçerik #{content.id} taslak olarak üretildi{note}.", "success")
    return _redirect("/content")
