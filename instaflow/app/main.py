"""FastAPI uygulaması.

Web sunucusu ve scheduler aynı süreçte çalışır — Termux'ta ikinci bir süreç
açmamak için. Scheduler'ı kapatmak isteyenler `RUN_SCHEDULER=0` verebilir.
"""

from __future__ import annotations

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from . import __version__
from .config import get_settings
from .database import init_db, session_scope
from .errors import InstaFlowError
from .logging_setup import get_logger, setup_logging
from .scheduler import jobs as scheduler_jobs
from .security import same_origin
from .services import content_service
from .templating import templates

logger = get_logger("main")

#: Durum değiştiren yöntemler — çapraz kaynak kontrolüne tabidir.
UNSAFE_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})

#: Sıkı bir CSP: sayfa hiçbir dış kaynağa çıkmaz, satır içi stil/script
#: yalnızca kendi şablonlarımızdan gelir.
CONTENT_SECURITY_POLICY = (
    "default-src 'self'; "
    "img-src 'self' https: data:; "
    "style-src 'self' 'unsafe-inline'; "
    "script-src 'self' 'unsafe-inline'; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": CONTENT_SECURITY_POLICY,
}


def _scheduler_enabled() -> bool:
    """Scheduler bu süreçte çalışsın mı?"""
    return os.getenv("RUN_SCHEDULER", "1").strip().lower() not in {"0", "false", "no"}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Açılış/kapanış işleri."""
    settings = get_settings()
    setup_logging(settings.logs_dir, debug=settings.debug)
    init_db()
    logger.info("%s %s başlatılıyor (%s).", settings.app_name, __version__, settings.app_env)

    if settings.is_secret_key_ephemeral:
        logger.warning(
            "SECRET_KEY tanımlı değil; geçici bir anahtar üretildi. Her yeniden "
            "başlatmada oturumlar geçersiz olur. Üretimde .env içine sabit bir "
            "SECRET_KEY yazın."
        )
    if settings.host not in ("127.0.0.1", "localhost", "::1"):
        logger.warning(
            "Sunucu %s adresinde dinliyor; panelde giriş ekranı yoktur ve "
            "ağdaki herkes erişebilir.",
            settings.host,
        )

    # Süreç yayın ortasında öldürülmüşse takılı kalan içerikleri kurtar.
    with session_scope() as session:
        recovered = content_service.recover_stale_publishing(
            session, stale_minutes=settings.stale_lock_minutes
        )
    if recovered:
        logger.warning("Açılışta %d yarıda kalmış yayın kurtarıldı.", recovered)

    if _scheduler_enabled():
        scheduler_jobs.start_scheduler(settings)
    else:
        logger.info("Scheduler devre dışı (RUN_SCHEDULER=0).")

    try:
        yield
    finally:
        scheduler_jobs.shutdown_scheduler()
        logger.info("Kapatıldı.")


def create_app() -> FastAPI:
    """Uygulamayı kurar."""
    settings = get_settings()
    settings.ensure_directories()

    app = FastAPI(
        title=settings.app_name,
        version=__version__,
        description="Instagram içerik otomasyonu (resmî Graph API ile).",
        docs_url="/docs" if settings.debug else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.debug else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.secret_key,
        session_cookie="instaflow_session",
        same_site="lax",
        https_only=settings.app_env == "production" and settings.public_base_url.startswith("https://"),
        max_age=60 * 60 * 24 * 7,
    )

    @app.middleware("http")
    async def block_cross_origin_writes(request: Request, call_next):
        """Çapraz kaynaklı durum değiştiren istekleri reddeder.

        Form tabanlı CSRF saldırılarında tarayıcı `Origin` başlığını gönderir
        ama özel başlık ekleyemez. Bu yüzden `Origin` varsa aynı kaynak
        olmak zorundadır. `Origin` hiç yoksa (curl, CLI, sunucu-sunucu)
        istek geçer — tarayıcı kaynaklı bir saldırı değildir.

        Web formları ayrıca imzalı CSRF token'ı taşır; bu katman JSON API
        uçlarını da kapsayan ikinci savunmadır.
        """
        origin = request.headers.get("origin", "")
        if (
            request.method in UNSAFE_METHODS
            and origin
            and not same_origin(origin, str(request.base_url))
        ):
            logger.warning(
                "Çapraz kaynaklı yazma isteği reddedildi: %s %s (origin=%s)",
                request.method,
                request.url.path,
                origin,
            )
            message = "Çapraz kaynaklı istekler kabul edilmiyor."
            if request.url.path.startswith("/api/"):
                return JSONResponse(
                    status_code=403,
                    content={"success": False, "data": None, "error": message},
                )
            return JSONResponse(status_code=403, content={"detail": message})

        response = await call_next(request)
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        return response

    @app.exception_handler(InstaFlowError)
    async def handle_app_error(request: Request, exc: InstaFlowError):
        """Uygulama hatalarını kullanıcıya anlaşılır biçimde döndürür."""
        logger.warning("İşlem hatası (%s): %s", request.url.path, exc.message)
        if request.url.path.startswith("/api/"):
            return JSONResponse(
                status_code=400,
                content={"success": False, "data": None, "error": exc.message},
            )
        return templates.TemplateResponse(
            request,
            "error.html",
            {"message": exc.message},
            status_code=400,
        )

    # Statik dosyalar paketin yanındadır; veri dizini taşınsa da değişmez.
    static_dir = Path(__file__).resolve().parent / "static"
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    from .routes_api import router as api_router
    from .routes_media import router as media_router
    from .routes_oauth import router as oauth_router
    from .routes_web import router as web_router

    app.include_router(web_router)
    app.include_router(media_router)
    app.include_router(oauth_router)
    app.include_router(api_router)

    @app.get("/", include_in_schema=False)
    async def index() -> RedirectResponse:
        return RedirectResponse(url="/dashboard")

    @app.get("/healthz", include_in_schema=False)
    async def healthz() -> dict[str, str]:
        return {"status": "ok", "version": __version__}

    return app


app = create_app()
