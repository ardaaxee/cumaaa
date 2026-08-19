"""Pydantic şemaları — sistem sınırlarındaki doğrulama.

API yanıtları ortak bir zarf kullanır: `success`, `data`, `error`, `meta`.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .models import ContentStatus, ContentType

T = TypeVar("T")

#: Instagram caption sınırı (Meta belgelerinde 2200 karakter).
MAX_CAPTION_LENGTH = 2200
#: Bir gönderide en fazla 30 hashtag kabul edilir.
MAX_HASHTAGS = 30


class APIResponse(BaseModel, Generic[T]):
    """Tüm JSON uçlarının ortak zarfı."""

    success: bool = True
    data: T | None = None
    error: str | None = None
    meta: dict[str, Any] | None = None

    @classmethod
    def ok(cls, data: T | None = None, **meta: Any) -> "APIResponse[T]":
        return cls(success=True, data=data, meta=meta or None)

    @classmethod
    def fail(cls, error: str, **meta: Any) -> "APIResponse[T]":
        return cls(success=False, data=None, error=error, meta=meta or None)


class ContentCreate(BaseModel):
    """Yeni içerik girdisi."""

    model_config = ConfigDict(str_strip_whitespace=True)

    type: ContentType = ContentType.IMAGE
    title: str = Field(default="", max_length=255)
    caption: str = Field(default="", max_length=MAX_CAPTION_LENGTH)
    hashtags: str = Field(default="", max_length=600)
    media_path: str = ""
    media_url: str = ""
    thumbnail_url: str = ""
    options: dict[str, Any] = Field(default_factory=dict)

    @field_validator("hashtags")
    @classmethod
    def _limit_hashtags(cls, value: str) -> str:
        tags = [t for t in value.replace(",", " ").split() if t.startswith("#")]
        if len(tags) > MAX_HASHTAGS:
            raise ValueError(f"En fazla {MAX_HASHTAGS} hashtag kullanılabilir.")
        return value

    @field_validator("media_url", "thumbnail_url")
    @classmethod
    def _https_only(cls, value: str) -> str:
        if value and not value.startswith("https://"):
            raise ValueError("Medya adresi https:// ile başlamalıdır.")
        return value


class ContentUpdate(BaseModel):
    """Kısmi içerik güncellemesi."""

    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, max_length=255)
    caption: str | None = Field(default=None, max_length=MAX_CAPTION_LENGTH)
    hashtags: str | None = Field(default=None, max_length=600)
    media_path: str | None = None
    media_url: str | None = None
    thumbnail_url: str | None = None
    type: ContentType | None = None
    options: dict[str, Any] | None = None


class ContentRead(BaseModel):
    """Arayüze/CLI'ya dönen içerik gösterimi.

    Gizli hiçbir alan içermez.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    title: str
    caption: str
    hashtags: str
    media_path: str
    media_url: str
    status: str
    scheduled_at: datetime | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    error_message: str


class ScheduleRequest(BaseModel):
    """Planlama isteği (yerel saat metni olarak)."""

    content_id: int
    scheduled_at: str = Field(description="Yerel saat, örn. 2026-08-20 18:00")


class AccountStatus(BaseModel):
    """Instagram bağlantı durumu — token asla yer almaz."""

    configured: bool
    connected: bool
    login_mode: str
    api_version: str
    ig_user_id: str = ""
    username: str = ""
    account_type: str = ""
    followers_count: int = 0
    media_count: int = 0
    token_expires_at: datetime | None = None
    token_days_left: int | None = None
    message: str = ""


class SystemStatus(BaseModel):
    """`run.py status` çıktısının yapılandırılmış hali."""

    app_name: str
    app_env: str
    database_ok: bool
    database_path: str
    instagram: AccountStatus
    ai_provider: str
    ai_configured: bool
    scheduler_running: bool
    counts: dict[str, int]
    timezone: str


class PublishResult(BaseModel):
    """Yayınlama sonucu."""

    content_id: int
    success: bool
    ig_media_id: str = ""
    permalink: str = ""
    message: str = ""
    skipped: bool = False


class GeneratedText(BaseModel):
    """AI üretimi tek metin."""

    text: str
    provider: str
    model: str
    fallback_used: bool = False


class GeneratedList(BaseModel):
    """AI üretimi liste (fikir, hashtag, varyasyon)."""

    items: list[str]
    provider: str
    model: str
    fallback_used: bool = False


class CalendarSlot(BaseModel):
    """Haftalık plandaki tek slot."""

    day: str
    time: str
    content_type: Literal["image", "video", "reels", "carousel", "story"]
    title: str
    idea: str


class GeneratedCalendar(BaseModel):
    """Haftalık içerik planı."""

    slots: list[CalendarSlot]
    provider: str
    model: str
    fallback_used: bool = False
