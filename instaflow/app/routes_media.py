"""Medya servis ucu.

Instagram, yayınlanacak medyayı **kendisi indirir**; bu yüzden dosyanın
herkese açık bir adresten servis edilmesi gerekir. Bu uç tam olarak bunu
yapar ve başka hiçbir şey yapmaz:

* Yalnızca `content/` altındaki bilinen alt dizinlerden okur.
* Yalnızca izin verilen medya uzantılarını servis eder — dizinde başka bir
  dosya (yedek, not, veritabanı) bulunsa bile erişilemez.
* MIME türünü uzantıdan **açıkça** belirler, tahmin ettirmez.
* Dizin listelemez.
* Dosya adını temizler ve yolu `content/` içine sabitler.

Bu uç kimlik doğrulaması istemez — istemesi de anlamsız olurdu, çünkü
Meta'nın sunucuları anonim olarak indirir. Bu yüzden yalnızca yayına
hazırlanan medya dosyaları erişilebilir olmalıdır.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Response
from fastapi.responses import FileResponse

from .config import Settings, get_settings
from .errors import MediaValidationError
from .logging_setup import get_logger
from .security import resolve_within, sanitize_filename

logger = get_logger("media")

router = APIRouter(include_in_schema=False)

#: Servis edilebilecek alt dizinler. Başka bir dizin adı 404 döner.
ALLOWED_SUBDIRS = frozenset({"drafts", "scheduled", "published", "failed"})

#: Uzantı → gönderilecek Content-Type. Tahmin yok, sabit eşleme var.
MIME_BY_EXTENSION: dict[str, str] = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
}

#: Meta medyayı birden çok kez indirebilir; kısa bir önbellek yeterli.
CACHE_CONTROL = "public, max-age=300"


@router.get("/media/{subdir}/{filename}")
async def serve_media(subdir: str, filename: str) -> Response:
    """`content/<subdir>/<filename>` dosyasını servis eder.

    Returns:
        Dosya yanıtı; dosya yoksa veya izin verilmiyorsa 404.
    """
    settings = get_settings()

    if subdir not in ALLOWED_SUBDIRS:
        return _not_found()

    try:
        safe_name = sanitize_filename(filename)
    except MediaValidationError:
        return _not_found()

    extension = Path(safe_name).suffix.lower()
    media_type = MIME_BY_EXTENSION.get(extension)
    if media_type is None or not _extension_allowed(extension, settings):
        logger.info("İzin verilmeyen uzantı istendi: %s", extension or "(yok)")
        return _not_found()

    try:
        target = resolve_within(settings.content_dir, f"{subdir}/{safe_name}")
    except MediaValidationError:
        logger.warning("Dizin dışına çıkma girişimi: %s/%s", subdir, filename)
        return _not_found()

    if not target.is_file():
        return _not_found()

    return FileResponse(
        target,
        media_type=media_type,
        headers={
            "Cache-Control": CACHE_CONTROL,
            "X-Content-Type-Options": "nosniff",
            "Content-Disposition": f'inline; filename="{safe_name}"',
        },
    )


def _extension_allowed(extension: str, settings: Settings) -> bool:
    """Uzantı, yapılandırmadaki izin listelerinde mi?"""
    return extension in settings.image_extensions or extension in settings.video_extensions


def _not_found() -> Response:
    """Nedenini sızdırmayan tek tip 404.

    Dosyanın var olup olmadığını, uzantısının mı yoksa yolunun mu sorunlu
    olduğunu belli etmemek için tüm ret durumları aynı yanıtı verir.
    """
    return Response(status_code=404, content="Bulunamadı", media_type="text/plain")
