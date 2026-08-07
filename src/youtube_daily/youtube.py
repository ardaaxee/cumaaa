"""YouTube tarafı: parçalı (resumable) video yükleme ve küçük resim."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

from .metadata import VideoMetadata
from .retry import backoff_delay, is_retriable

logger = logging.getLogger(__name__)

CHUNK_SIZE = 16 * 1024 * 1024  # 16 MB
MAX_ATTEMPTS = 5

# Beklemekle geçmeyecek hatalar — yeniden denemek yerine açıklayıcı mesaj ver.
FATAL_REASONS = {
    "quotaExceeded": (
        "YouTube API günlük kotası doldu. Bir yükleme 1600 birim harcar, "
        "varsayılan günlük kota 10.000 birimdir. Yarın tekrar denenecek."
    ),
    "uploadLimitExceeded": (
        "Kanalın günlük yükleme sınırına ulaşıldı. Yarın tekrar denenecek."
    ),
    "forbidden": (
        "Yetki reddedildi. OAuth token'ı youtube.upload yetkisiyle üretilmiş mi "
        "ve doğru kanala mı ait, kontrol edin."
    ),
    "youtubeSignupRequired": (
        "Bu Google hesabına bağlı bir YouTube kanalı yok. Önce kanal oluşturun."
    ),
}


class UploadError(RuntimeError):
    """Yükleme kalıcı olarak başarısız olduğunda fırlatılır."""


def build_youtube_service(credentials: Any):
    return build("youtube", "v3", credentials=credentials, cache_discovery=False)


def _reason_of(error: HttpError) -> str:
    try:
        details = error.error_details  # type: ignore[attr-defined]
        if details:
            return str(details[0].get("reason", ""))
    except Exception:  # noqa: BLE001 - hata ayrıntısı yoksa sorun değil
        pass
    return ""


def _describe(error: HttpError) -> str:
    reason = _reason_of(error)
    if reason in FATAL_REASONS:
        return FATAL_REASONS[reason]
    status = getattr(error.resp, "status", "?")
    return f"YouTube API hatası (HTTP {status}, reason={reason or 'bilinmiyor'}): {error}"


def upload_video(
    service: Any,
    video_path: str | Path,
    metadata: VideoMetadata,
    *,
    sleep=None,
) -> str:
    """Videoyu parçalı yükler ve YouTube video ID'sini döndürür."""
    import time

    sleep = sleep or time.sleep
    video_path = Path(video_path)
    if not video_path.exists():
        raise UploadError(f"Yüklenecek dosya bulunamadı: {video_path}")

    media = MediaFileUpload(
        str(video_path),
        chunksize=CHUNK_SIZE,
        resumable=True,
        mimetype="video/*",
    )
    request = service.videos().insert(
        part="snippet,status",
        body=metadata.to_body(),
        media_body=media,
    )

    logger.info("Yükleniyor: %s (%.1f MB)", metadata.title, video_path.stat().st_size / 1e6)

    response = None
    attempt = 0
    last_logged = -1

    while response is None:
        try:
            status, response = request.next_chunk()
            if status:
                percent = int(status.progress() * 100)
                if percent >= last_logged + 20:
                    logger.info("Yükleniyor... %%%d", percent)
                    last_logged = percent
            # Başarılı bir parçadan sonra geri çekilme sayacını sıfırla:
            # uzun yüklemelerde tek tük hatalar birikip yüklemeyi öldürmesin.
            attempt = 0
        except HttpError as error:
            if _reason_of(error) in FATAL_REASONS or not is_retriable(error):
                raise UploadError(_describe(error)) from error
            attempt += 1
            if attempt >= MAX_ATTEMPTS:
                raise UploadError(
                    f"Yükleme {MAX_ATTEMPTS} denemede tamamlanamadı: {_describe(error)}"
                ) from error
            delay = backoff_delay(attempt)
            logger.warning(
                "Parça yüklenemedi (deneme %d/%d): %s — %.1f sn sonra devam edilecek.",
                attempt,
                MAX_ATTEMPTS,
                error,
                delay,
            )
            sleep(delay)
        except (ConnectionError, TimeoutError, OSError) as error:
            attempt += 1
            if attempt >= MAX_ATTEMPTS:
                raise UploadError(f"Ağ hatası, yükleme tamamlanamadı: {error}") from error
            delay = backoff_delay(attempt)
            logger.warning("Ağ hatası (deneme %d/%d): %s", attempt, MAX_ATTEMPTS, error)
            sleep(delay)

    video_id = response.get("id")
    if not video_id:
        raise UploadError(f"YouTube beklenmeyen yanıt döndürdü: {response}")

    logger.info("Yüklendi: https://www.youtube.com/watch?v=%s", video_id)
    return video_id


def set_thumbnail(service: Any, video_id: str, thumbnail_path: str | Path) -> bool:
    """Küçük resmi ayarlar. Kanal doğrulanmamışsa sessizce atlar."""
    thumbnail_path = Path(thumbnail_path)
    try:
        service.thumbnails().set(
            videoId=video_id,
            media_body=MediaFileUpload(str(thumbnail_path)),
        ).execute()
    except HttpError as error:
        # Küçük resim yükleme doğrulanmış kanal ister; video zaten yüklendi,
        # bu adımın başarısızlığı çalıştırmayı düşürmemeli.
        logger.warning("Küçük resim ayarlanamadı: %s", _describe(error))
        return False
    logger.info("Küçük resim ayarlandı: %s", thumbnail_path.name)
    return True
