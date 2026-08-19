"""Medya doğrulama ve yerel depolama.

Content Publishing API'nin önemli bir kısıtı var: Meta sunucuları medyayı
**herkese açık bir URL'den kendisi indirir**. Uygulamadan doğrudan ikili
dosya yüklenemez. Bu yüzden yerel dosya ile yayınlanabilir URL arasındaki
fark burada net biçimde ayrılır ve kullanıcıya açıkça anlatılır.
"""

from __future__ import annotations

import mimetypes
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

from ..config import Settings, get_settings
from ..errors import MediaValidationError
from ..logging_setup import get_logger
from ..models import ContentType
from ..security import resolve_within, sanitize_filename, unique_filename

logger = get_logger("instagram.media")

MB = 1024 * 1024

#: Dosya içeriğinden tür tespiti için imzalar.
_JPEG_MAGIC = b"\xff\xd8\xff"
_PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
_ISO_BMFF_BOX = b"ftyp"
_HEADER_BYTES = 16


class MediaKind(str, Enum):
    """Yerel dosyanın türü."""

    IMAGE = "image"
    VIDEO = "video"


#: İçerik türü → beklenen medya türü.
KIND_BY_CONTENT_TYPE: dict[str, MediaKind] = {
    ContentType.IMAGE.value: MediaKind.IMAGE,
    ContentType.VIDEO.value: MediaKind.VIDEO,
    ContentType.REELS.value: MediaKind.VIDEO,
    ContentType.STORY.value: MediaKind.IMAGE,
    ContentType.CAROUSEL.value: MediaKind.IMAGE,
}


@dataclass(frozen=True)
class MediaInfo:
    """Doğrulanmış medya dosyası hakkında bilinenler."""

    path: Path
    kind: MediaKind
    extension: str
    mime_type: str
    size_bytes: int

    @property
    def size_mb(self) -> float:
        return self.size_bytes / MB


def detect_kind_from_bytes(header: bytes) -> MediaKind | None:
    """Dosyanın ilk baytlarından türü tespit eder.

    Uzantıya güvenmiyoruz: `.jpg` uzantılı bir betik dosyası buradan geçemez.
    """
    if header.startswith(_JPEG_MAGIC):
        return MediaKind.IMAGE
    if header.startswith(_PNG_MAGIC):
        return MediaKind.IMAGE
    if len(header) >= 12 and header[4:8] == _ISO_BMFF_BOX:
        return MediaKind.VIDEO
    return None


def validate_media_file(
    path: str | Path,
    *,
    expected: MediaKind | None = None,
    settings: Settings | None = None,
) -> MediaInfo:
    """Yerel medya dosyasını doğrular.

    Kontroller: yol güvenliği, varlık, uzantı, gerçek içerik imzası, MIME
    türü ve boyut.

    Raises:
        MediaValidationError: Herhangi bir kontrol başarısız olursa.
    """
    cfg = settings or get_settings()
    target = _resolve_media_path(path, cfg)

    if not target.is_file():
        raise MediaValidationError(f"Medya dosyası bulunamadı: {target.name}")

    extension = target.suffix.lower()
    if extension in cfg.image_extensions:
        kind_by_ext = MediaKind.IMAGE
    elif extension in cfg.video_extensions:
        kind_by_ext = MediaKind.VIDEO
    else:
        allowed = ", ".join(cfg.image_extensions + cfg.video_extensions)
        raise MediaValidationError(
            f"Desteklenmeyen dosya uzantısı: {extension or '(yok)'}. "
            f"İzin verilenler: {allowed}"
        )

    with target.open("rb") as handle:
        header = handle.read(_HEADER_BYTES)
    kind_by_content = detect_kind_from_bytes(header)
    if kind_by_content is None:
        raise MediaValidationError(
            "Dosya içeriği tanınmadı; geçerli bir görsel veya video değil."
        )
    if kind_by_content is not kind_by_ext:
        raise MediaValidationError(
            "Dosya uzantısı ile içeriği uyuşmuyor "
            f"(uzantı: {kind_by_ext.value}, içerik: {kind_by_content.value})."
        )
    if expected is not None and kind_by_content is not expected:
        raise MediaValidationError(
            f"Bu içerik türü için {expected.value} bekleniyor, "
            f"{kind_by_content.value} verildi."
        )

    mime_type = mimetypes.guess_type(target.name)[0] or ""
    expected_prefix = "image/" if kind_by_content is MediaKind.IMAGE else "video/"
    if mime_type and not mime_type.startswith(expected_prefix):
        raise MediaValidationError(f"MIME türü uygun değil: {mime_type}")

    size = target.stat().st_size
    if size == 0:
        raise MediaValidationError("Dosya boş.")
    limit_mb = cfg.max_image_mb if kind_by_content is MediaKind.IMAGE else cfg.max_video_mb
    if size > limit_mb * MB:
        raise MediaValidationError(
            f"Dosya çok büyük: {size / MB:.1f} MB (sınır {limit_mb:.0f} MB)."
        )

    return MediaInfo(
        path=target,
        kind=kind_by_content,
        extension=extension,
        mime_type=mime_type or expected_prefix.rstrip("/"),
        size_bytes=size,
    )


def store_upload(
    filename: str,
    data: bytes,
    *,
    subdir: str = "drafts",
    settings: Settings | None = None,
) -> MediaInfo:
    """Yüklenen baytları güvenli bir adla `content/<subdir>/` altına yazar.

    Önce boyut ve içerik imzası kontrol edilir; dosya ancak geçerliyse
    diske yazılır.

    Raises:
        MediaValidationError: Dosya kabul edilemezse.
    """
    cfg = settings or get_settings()
    safe_name = sanitize_filename(filename)
    extension = Path(safe_name).suffix.lower()

    if extension in cfg.image_extensions:
        kind = MediaKind.IMAGE
        limit_mb = cfg.max_image_mb
    elif extension in cfg.video_extensions:
        kind = MediaKind.VIDEO
        limit_mb = cfg.max_video_mb
    else:
        allowed = ", ".join(cfg.image_extensions + cfg.video_extensions)
        raise MediaValidationError(
            f"Desteklenmeyen dosya uzantısı: {extension or '(yok)'}. "
            f"İzin verilenler: {allowed}"
        )

    if not data:
        raise MediaValidationError("Dosya boş.")
    if len(data) > limit_mb * MB:
        raise MediaValidationError(
            f"Dosya çok büyük: {len(data) / MB:.1f} MB (sınır {limit_mb:.0f} MB)."
        )
    if detect_kind_from_bytes(data[:_HEADER_BYTES]) is not kind:
        raise MediaValidationError(
            "Dosya içeriği uzantısıyla uyuşmuyor; yükleme reddedildi."
        )

    directory = resolve_within(cfg.content_dir, subdir)
    directory.mkdir(parents=True, exist_ok=True)
    destination = unique_filename(directory, safe_name)
    destination.write_bytes(data)
    logger.info("Medya kaydedildi: %s (%.1f MB)", destination.name, len(data) / MB)

    return validate_media_file(destination, expected=kind, settings=cfg)


def public_url_for(
    path: str | Path, settings: Settings | None = None
) -> str:
    """Yerel dosya için herkese açık URL üretir.

    `PUBLIC_BASE_URL` tanımlı değilse boş dize döner — bu, "yayınlanamaz"
    anlamına gelir ve çağıran taraf kullanıcıyı buna göre uyarır.
    """
    cfg = settings or get_settings()
    if not cfg.public_base_url:
        return ""
    target = _resolve_media_path(path, cfg)
    relative = target.relative_to(cfg.content_dir.resolve()).as_posix()
    return f"{cfg.public_base_url.rstrip('/')}/media/{relative}"


def _resolve_media_path(path: str | Path, cfg: Settings) -> Path:
    """Medya yolunu `content/` altına sabitler."""
    candidate = Path(path)
    if candidate.is_absolute():
        return resolve_within(cfg.content_dir, candidate)
    return resolve_within(cfg.content_dir, candidate)
