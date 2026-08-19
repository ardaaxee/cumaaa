"""Instagram Graph API entegrasyonu.

Yalnızca Meta'nın resmî API'si kullanılır. Web arayüzü otomasyonu, parola ile
giriş veya oturum taşıma bu pakette yoktur ve eklenmemelidir.
"""

from .client import InstagramClient
from .insights import InsightsResult, InsightsService
from .media import (
    MediaInfo,
    MediaKind,
    store_upload,
    store_upload_stream,
    validate_media_file,
)
from .publishing import PublishingService, PublishOutcome, PublishRequest

__all__ = [
    "InstagramClient",
    "InsightsResult",
    "InsightsService",
    "MediaInfo",
    "MediaKind",
    "PublishOutcome",
    "PublishRequest",
    "PublishingService",
    "store_upload",
    "store_upload_stream",
    "validate_media_file",
]
