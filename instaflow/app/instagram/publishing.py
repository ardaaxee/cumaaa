"""Content Publishing API akışı.

Meta'nın yayın akışı iki adımlıdır:

1. **Container oluştur** — `POST /{ig-user-id}/media`. Meta medyayı verdiğiniz
   herkese açık URL'den kendisi indirir.
2. **Yayınla** — `POST /{ig-user-id}/media_publish` ile container kimliğini
   gönder.

Videolarda container hemen hazır olmaz; `status_code` alanı `FINISHED`
olana kadar yoklanır.

Desteklenmeyen şeyler (uydurulmaz, açıkça hata verilir):

* Doğrudan ikili dosya yükleme — API yalnızca URL kabul eder.
* Facebook Login kipinde bazı uçlar farklı izin ister; eksikse Meta'nın
  hata mesajı kullanıcıya olduğu gibi iletilir.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any

from ..config import Settings, get_settings
from ..errors import InstagramAPIError, PublishingError, UnsupportedFeatureError
from ..logging_setup import get_logger
from ..models import ContentType
from .client import InstagramClient

logger = get_logger("instagram.publishing")

#: Container yoklamasında karşılaşılabilecek durumlar.
STATUS_FINISHED = "FINISHED"
STATUS_IN_PROGRESS = "IN_PROGRESS"
STATUS_ERROR = "ERROR"
STATUS_EXPIRED = "EXPIRED"
STATUS_PUBLISHED = "PUBLISHED"

#: Carousel sınırları (Meta belgeleri).
CAROUSEL_MIN_ITEMS = 2
CAROUSEL_MAX_ITEMS = 10

MEDIA_FIELDS = "id,permalink,media_type,media_url,timestamp,caption"


@dataclass
class PublishRequest:
    """Yayınlanacak tek gönderinin API'ye çevrilmiş hali."""

    content_type: str
    caption: str = ""
    media_url: str = ""
    children_urls: list[str] = field(default_factory=list)
    cover_url: str = ""
    thumb_offset: int | None = None
    share_to_feed: bool = True

    def validate(self) -> None:
        """Container oluşturmadan önceki tutarlılık kontrolü.

        Raises:
            PublishingError: Zorunlu alanlar eksikse.
            UnsupportedFeatureError: Tür desteklenmiyorsa.
        """
        if self.content_type == ContentType.CAROUSEL.value:
            count = len(self.children_urls)
            if not CAROUSEL_MIN_ITEMS <= count <= CAROUSEL_MAX_ITEMS:
                raise PublishingError(
                    f"Carousel için {CAROUSEL_MIN_ITEMS}-{CAROUSEL_MAX_ITEMS} "
                    f"medya gerekir; {count} verildi."
                )
            return

        if self.content_type not in {t.value for t in ContentType}:
            raise UnsupportedFeatureError(
                f"Bu içerik türü desteklenmiyor: {self.content_type}"
            )
        if not self.media_url:
            raise PublishingError(
                "Yayın için herkese açık bir medya adresi (media_url) gerekiyor. "
                "Instagram Content Publishing API yerel dosyayı doğrudan kabul "
                "etmez; medyanın internetten erişilebilir olması gerekir."
            )


@dataclass(frozen=True)
class PublishOutcome:
    """Başarılı yayın sonucu."""

    ig_media_id: str
    container_id: str
    permalink: str = ""
    media_type: str = ""


class PublishingService:
    """Container oluşturma, yoklama ve yayınlama akışı."""

    def __init__(self, client: InstagramClient, settings: Settings | None = None) -> None:
        self.client = client
        self.settings = settings or get_settings()

    # ------------------------------------------------------------------ akış
    async def publish(self, request: PublishRequest) -> PublishOutcome:
        """Tam yayın akışını çalıştırır.

        Raises:
            PublishingError: Akışın herhangi bir adımı başarısız olursa.
            InstagramAPIError: API hata döndürürse.
        """
        request.validate()

        if request.content_type == ContentType.CAROUSEL.value:
            container_id = await self._create_carousel_container(request)
        else:
            container_id = await self._create_container(request)

        await self.wait_for_container(container_id)
        media_id = await self._publish_container(container_id)
        details = await self.get_media(media_id)
        logger.info("Yayınlandı: media_id=%s", media_id)
        return PublishOutcome(
            ig_media_id=media_id,
            container_id=container_id,
            permalink=str(details.get("permalink", "")),
            media_type=str(details.get("media_type", "")),
        )

    # -------------------------------------------------------------- container
    async def _create_container(self, request: PublishRequest) -> str:
        payload = self._container_payload(request)
        response = await self.client.post(f"{self.client.ig_user_id}/media", data=payload)
        container_id = str(response.get("id", ""))
        if not container_id:
            raise PublishingError("Instagram container kimliği döndürmedi.")
        return container_id

    def _container_payload(self, request: PublishRequest) -> dict[str, Any]:
        """İçerik türünü API parametrelerine çevirir."""
        caption = request.caption
        content_type = request.content_type

        if content_type == ContentType.IMAGE.value:
            return {"image_url": request.media_url, "caption": caption}

        if content_type == ContentType.STORY.value:
            key = "video_url" if _looks_like_video(request.media_url) else "image_url"
            # Story'lerde caption gösterilmez; göndermiyoruz.
            return {"media_type": "STORIES", key: request.media_url}

        if content_type in (ContentType.REELS.value, ContentType.VIDEO.value):
            # Meta, akış videolarını Reels olarak işliyor; ayrı bir "feed video"
            # container türü artık kullanılmıyor.
            payload: dict[str, Any] = {
                "media_type": "REELS",
                "video_url": request.media_url,
                "caption": caption,
                "share_to_feed": "true" if request.share_to_feed else "false",
            }
            if request.cover_url:
                payload["cover_url"] = request.cover_url
            elif request.thumb_offset is not None:
                payload["thumb_offset"] = request.thumb_offset
            return payload

        raise UnsupportedFeatureError(
            f"Bu içerik türü desteklenmiyor: {content_type}"
        )

    async def _create_carousel_container(self, request: PublishRequest) -> str:
        """Önce çocuk container'ları, sonra ana carousel container'ını oluşturur."""
        child_ids: list[str] = []
        for url in request.children_urls:
            key = "video_url" if _looks_like_video(url) else "image_url"
            child = await self.client.post(
                f"{self.client.ig_user_id}/media",
                data={key: url, "is_carousel_item": "true"},
            )
            child_id = str(child.get("id", ""))
            if not child_id:
                raise PublishingError("Carousel öğesi için container oluşturulamadı.")
            child_ids.append(child_id)

        for child_id in child_ids:
            await self.wait_for_container(child_id)

        response = await self.client.post(
            f"{self.client.ig_user_id}/media",
            data={
                "media_type": "CAROUSEL",
                "children": ",".join(child_ids),
                "caption": request.caption,
            },
        )
        container_id = str(response.get("id", ""))
        if not container_id:
            raise PublishingError("Carousel container kimliği döndürmedi.")
        return container_id

    async def wait_for_container(self, container_id: str) -> None:
        """Container `FINISHED` olana kadar bekler.

        Raises:
            PublishingError: Container hata verirse, süresi dolarsa veya
                beklemede zaman aşımına uğranırsa.
        """
        attempts = self.settings.container_poll_attempts
        interval = self.settings.container_poll_interval_seconds

        for attempt in range(1, attempts + 1):
            status = await self.get_container_status(container_id)
            code = status.get("status_code", "")

            if code in (STATUS_FINISHED, STATUS_PUBLISHED):
                return
            if code == STATUS_ERROR:
                raise PublishingError(
                    "Instagram medyayı işleyemedi: "
                    f"{status.get('status', 'ayrıntı yok')}"
                )
            if code == STATUS_EXPIRED:
                raise PublishingError(
                    "Medya container'ının süresi doldu (24 saat). Yeniden deneyin."
                )
            if attempt < attempts:
                logger.debug(
                    "Container %s hazır değil (%s); %ss bekleniyor.",
                    container_id,
                    code or STATUS_IN_PROGRESS,
                    interval,
                )
                await asyncio.sleep(interval)

        raise PublishingError(
            f"Medya {attempts * interval:.0f} saniyede işlenmedi. "
            "Video uzun olabilir; daha sonra tekrar deneyin."
        )

    async def get_container_status(self, container_id: str) -> dict[str, Any]:
        """Container durum bilgisini döndürür."""
        return await self.client.get(container_id, params={"fields": "status_code,status"})

    async def _publish_container(self, container_id: str) -> str:
        response = await self.client.post(
            f"{self.client.ig_user_id}/media_publish",
            data={"creation_id": container_id},
        )
        media_id = str(response.get("id", ""))
        if not media_id:
            raise PublishingError("Yayınlama isteği medya kimliği döndürmedi.")
        return media_id

    # ----------------------------------------------------------------- sorgu
    async def get_media(self, media_id: str) -> dict[str, Any]:
        """Yayınlanmış medyanın bilgilerini getirir."""
        try:
            return await self.client.get(media_id, params={"fields": MEDIA_FIELDS})
        except InstagramAPIError as exc:
            # Yayın başarılı olduysa ayrıntı alınamaması akışı bozmamalı.
            logger.warning("Medya ayrıntısı alınamadı (%s): %s", media_id, exc.message)
            return {}

    async def list_media(self, limit: int = 25) -> list[dict[str, Any]]:
        """Hesabın son gönderilerini listeler."""
        response = await self.client.get(
            f"{self.client.ig_user_id}/media",
            params={"fields": MEDIA_FIELDS, "limit": limit},
        )
        data = response.get("data", [])
        return list(data) if isinstance(data, list) else []

    async def get_publishing_limit(self) -> dict[str, Any]:
        """Kalan 24 saatlik yayın kotasını döndürür.

        Meta bu bilgiyi `content_publishing_limit` ucundan verir.
        """
        response = await self.client.get(
            f"{self.client.ig_user_id}/content_publishing_limit",
            params={"fields": "config,quota_usage"},
        )
        data = response.get("data", [])
        return data[0] if isinstance(data, list) and data else {}


def _looks_like_video(url: str) -> bool:
    """URL uzantısına bakarak video olup olmadığını tahmin eder."""
    lowered = url.split("?")[0].lower()
    return lowered.endswith((".mp4", ".mov", ".m4v"))
