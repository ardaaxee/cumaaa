"""SQLAlchemy veri modelleri.

Tüm zaman damgaları naive UTC'dir (bkz. `timeutils`).
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from .timeutils import utcnow


class Base(DeclarativeBase):
    """Ortak taban sınıf."""


class ContentStatus(str, enum.Enum):
    """İçerik yaşam döngüsü."""

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"


class ContentType(str, enum.Enum):
    """Instagram Content Publishing API'nin desteklediği türler."""

    IMAGE = "image"
    VIDEO = "video"
    REELS = "reels"
    CAROUSEL = "carousel"
    STORY = "story"


class ScheduleStatus(str, enum.Enum):
    """Planlanmış gönderi kaydının durumu."""

    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TimestampMixin:
    """created_at / updated_at alanları."""

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )


class User(Base, TimestampMixin):
    """Yerel operatör kaydı.

    InstaFlow tek kullanıcılık, yerel bir araçtır: burada parola tutulmaz.
    Bu tablo yalnızca içerik ve hesapları bir sahibe bağlamak içindir.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    accounts: Mapped[list["Account"]] = relationship(back_populates="user")
    contents: Mapped[list["Content"]] = relationship(back_populates="user")


class Account(Base, TimestampMixin):
    """Bağlı Instagram Professional hesabı.

    `access_token` yalnızca sunucu tarafında kullanılır; hiçbir şablona veya
    JSON yanıtına konmaz.
    """

    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    ig_user_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    account_type: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    profile_picture_url: Mapped[str] = mapped_column(Text, default="", nullable=False)
    followers_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    media_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    access_token: Mapped[str] = mapped_column(Text, default="", nullable=False)
    token_type: Mapped[str] = mapped_column(String(32), default="bearer", nullable=False)
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    login_mode: Mapped[str] = mapped_column(String(16), default="instagram", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped[User] = relationship(back_populates="accounts")

    def masked_token(self) -> str:
        """Arayüzde gösterilebilecek maskelenmiş token."""
        if not self.access_token:
            return ""
        return f"{self.access_token[:4]}…{self.access_token[-4:]}"


class Content(Base, TimestampMixin):
    """Yayınlanacak içerik.

    `media_path` yerel dosyayı, `media_url` Meta sunucularının indirebileceği
    herkese açık adresi gösterir. Content Publishing API yalnızca URL kabul
    eder; ikisi arasındaki fark `publishing_service` içinde açıkça ele alınır.
    """

    __tablename__ = "content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(16), default=ContentType.IMAGE.value, nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    caption: Mapped[str] = mapped_column(Text, default="", nullable=False)
    hashtags: Mapped[str] = mapped_column(Text, default="", nullable=False)
    media_path: Mapped[str] = mapped_column(Text, default="", nullable=False)
    media_url: Mapped[str] = mapped_column(Text, default="", nullable=False)
    thumbnail_url: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), default=ContentStatus.DRAFT.value, nullable=False, index=True
    )
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, default="", nullable=False)
    ai_provider: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    ai_model: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    #: Carousel çocukları, Reels seçenekleri gibi türe özgü alanlar.
    options: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    user: Mapped[User] = relationship(back_populates="contents")
    schedules: Mapped[list["ScheduledPost"]] = relationship(
        back_populates="content", cascade="all, delete-orphan"
    )
    published: Mapped["PublishedPost | None"] = relationship(
        back_populates="content", uselist=False, cascade="all, delete-orphan"
    )

    @property
    def full_caption(self) -> str:
        """Caption + hashtag birleşimi (Instagram'a gönderilen metin)."""
        parts = [self.caption.strip(), self.hashtags.strip()]
        return "\n\n".join(part for part in parts if part)


class ScheduledPost(Base, TimestampMixin):
    """Zamanlanmış yayın kaydı.

    `idempotency_key` benzersizdir: aynı içerik + aynı dakika için ikinci bir
    kayıt oluşturulamaz, dolayısıyla aynı gönderi iki kez kuyruğa girmez.
    """

    __tablename__ = "scheduled_posts"
    __table_args__ = (
        UniqueConstraint("idempotency_key", name="uq_scheduled_idempotency"),
        Index("ix_scheduled_due", "status", "scheduled_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("content.id"), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), default=ScheduleStatus.PENDING.value, nullable=False
    )
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_error: Mapped[str] = mapped_column(Text, default="", nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False)
    locked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    content: Mapped[Content] = relationship(back_populates="schedules")


class PublishedPost(Base, TimestampMixin):
    """Instagram'da gerçekten yayımlanmış gönderi.

    Hem `content_id` hem `ig_media_id` benzersizdir — mükerrer yayın veritabanı
    seviyesinde de engellenir.
    """

    __tablename__ = "published_posts"
    __table_args__ = (
        UniqueConstraint("content_id", name="uq_published_content"),
        UniqueConstraint("ig_media_id", name="uq_published_media"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("content.id"), nullable=False)
    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), nullable=True)
    ig_media_id: Mapped[str] = mapped_column(String(64), nullable=False)
    ig_container_id: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    permalink: Mapped[str] = mapped_column(Text, default="", nullable=False)
    media_type: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    content: Mapped[Content] = relationship(back_populates="published")
    metrics: Mapped[list["Analytics"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )


class Analytics(Base):
    """Tek bir metrik ölçümü.

    Yalnızca API'den gerçekten dönen değerler yazılır. Bir metrik
    desteklenmiyorsa satır oluşturulmaz — eksik veri uydurulmaz.
    """

    __tablename__ = "analytics"
    __table_args__ = (
        UniqueConstraint(
            "scope", "object_id", "metric", "captured_on", name="uq_analytics_daily"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    published_post_id: Mapped[int | None] = mapped_column(
        ForeignKey("published_posts.id"), nullable=True
    )
    #: "media" veya "account"
    scope: Mapped[str] = mapped_column(String(16), default="media", nullable=False)
    object_id: Mapped[str] = mapped_column(String(64), nullable=False)
    metric: Mapped[str] = mapped_column(String(64), nullable=False)
    value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    period: Mapped[str] = mapped_column(String(32), default="lifetime", nullable=False)
    #: Aynı gün içinde tekrar çekilirse üzerine yazılır (bkz. unique kısıt).
    captured_on: Mapped[str] = mapped_column(String(10), nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    post: Mapped[PublishedPost | None] = relationship(back_populates="metrics")


class LogEntry(Base):
    """Dashboard'da gösterilen uyarı/hata kayıtları."""

    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    level: Mapped[str] = mapped_column(String(16), default="INFO", nullable=False, index=True)
    logger: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    message: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
