"""Merkezi yapılandırma.

Tüm ayarlar ortam değişkenlerinden (veya `.env` dosyasından) okunur. Kod
içinde hiçbir gizli değer bulunmaz; eksik değerler uygulamayı çökertmez,
ilgili özellik "yapılandırılmamış" olarak raporlanır.

Meta/Instagram API sürüm ve uç nokta bilgileri bilinçli olarak yapılandırma
üzerinden yönetilir: Meta bu API'yi sık sık sürümler ve metrik adları
değişebilir. Kodda sabitlenmiş bir sürüm, API değiştiğinde sessizce yanlış
davranır.
"""

from __future__ import annotations

import secrets
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

#: instaflow/ kök dizini (bu dosya app/config.py içinde).
BASE_DIR = Path(__file__).resolve().parent.parent

#: Instagram Content Publishing API'nin bir gönderiyi 24 saat içinde kaç kez
#: kabul ettiği Meta tarafından belirlenir; burada yalnızca yerel bir güvenlik
#: sınırı tutuyoruz. Gerçek kota `content_publishing_limit` ucundan okunur.
DEFAULT_DAILY_PUBLISH_GUARD = 25

LoginMode = Literal["instagram", "facebook"]
AIProviderName = Literal["openai", "anthropic", "local", "none"]


class Settings(BaseSettings):
    """Uygulama ayarları."""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ---------------------------------------------------------------- genel
    app_name: str = "InstaFlow"
    app_env: Literal["development", "production"] = "production"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000
    timezone: str = "Europe/Istanbul"

    #: Oturum çerezi ve CSRF token'ını imzalamak için kullanılır. Üretimde
    #: mutlaka .env üzerinden verilmelidir; verilmezse her açılışta yeniden
    #: üretilir (bu da mevcut oturumları geçersiz kılar).
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))

    # -------------------------------------------------------------- dizinler
    data_dir: Path = BASE_DIR / "data"
    content_dir: Path = BASE_DIR / "content"
    logs_dir: Path = BASE_DIR / "logs"
    database_url: str = ""

    # ------------------------------------------------------------- instagram
    #: "instagram" = Instagram Login ile Instagram API (graph.instagram.com)
    #: "facebook" = Facebook Login ile Instagram API (graph.facebook.com)
    instagram_login_mode: LoginMode = "instagram"
    instagram_api_version: str = "v25.0"
    instagram_graph_host: str = "https://graph.instagram.com"
    facebook_graph_host: str = "https://graph.facebook.com"
    instagram_oauth_authorize_url: str = "https://www.instagram.com/oauth/authorize"
    instagram_oauth_token_url: str = "https://api.instagram.com/oauth/access_token"
    facebook_oauth_authorize_url: str = "https://www.facebook.com/dialog/oauth"

    instagram_access_token: str = ""
    instagram_user_id: str = ""
    meta_app_id: str = ""
    meta_app_secret: str = ""
    oauth_redirect_uri: str = ""

    #: Instagram Login akışının kapsamları. Meta 27 Ocak 2025'te eski
    #: `business_*` adlarını kaldırdı; güncel adlar aşağıdaki gibidir.
    instagram_scopes: str = "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights"
    facebook_scopes: str = (
        "instagram_basic,instagram_content_publish,instagram_manage_insights,"
        "pages_show_list,pages_read_engagement,business_management"
    )

    #: Meta sunucuları medyayı yalnızca herkese açık bir URL'den indirir.
    #: Yerel dosyaları yayınlayabilmek için uygulamanın dışarıdan erişilebilir
    #: adresi (örn. bir tünel adresi) burada verilir. Boşsa yerel dosyalar
    #: yayınlanamaz ve bu durum kullanıcıya açıkça bildirilir.
    public_base_url: str = ""

    # ------------------------------------------------------------------ HTTP
    http_timeout_seconds: float = 30.0
    http_max_retries: int = 3
    http_backoff_base_seconds: float = 2.0
    http_backoff_max_seconds: float = 60.0
    #: 429 (rate limit) alındığında saldırgan yeniden deneme yapılmaz.
    rate_limit_max_retries: int = 1
    rate_limit_backoff_seconds: float = 60.0

    # ------------------------------------------------------------- scheduler
    scheduler_interval_seconds: int = 60
    publish_max_attempts: int = 3
    #: Container'ın işlenmesini beklerken yapılacak yoklama sayısı/aralığı.
    container_poll_attempts: int = 30
    container_poll_interval_seconds: float = 5.0
    daily_publish_guard: int = DEFAULT_DAILY_PUBLISH_GUARD
    #: `publishing` durumunda bu kadar dakika takılı kalan içerik, süreç
    #: çökmüş sayılır ve yeniden denenebilir duruma çekilir.
    stale_lock_minutes: int = 30
    analytics_sync_hour: int = 3
    token_check_hour: int = 4

    # ------------------------------------------------------------------- AI
    ai_provider: AIProviderName = "local"
    ai_max_tokens: int = 1200
    ai_timeout_seconds: float = 60.0
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-5"
    anthropic_base_url: str = "https://api.anthropic.com/v1"
    anthropic_version: str = "2023-06-01"

    # ----------------------------------------------------------------- medya
    max_image_mb: float = 8.0
    max_video_mb: float = 100.0
    #: Meta'nın görsel yayın belgeleri JPEG ister; PNG genellikle reddedilir.
    #: Gerekirse .env üzerinden genişletilebilir.
    allowed_image_extensions: str = ".jpg,.jpeg"
    allowed_video_extensions: str = ".mp4,.mov"

    # ------------------------------------------------------------- analytics
    #: Meta, 21 Nisan 2025'ten itibaren `impressions`, `plays` ve
    #: `video_views` metriklerini tüm sürümlerde kaldırdı; yerine `views`
    #: geldi. Liste yapılandırılabilir çünkü metrik setleri değişmeye devam
    #: ediyor — desteklenmeyen bir metrik istenirse API hata döndürür ve bu
    #: hata kullanıcıya olduğu gibi aktarılır.
    media_insight_metrics: str = "reach,likes,comments,saved,shares,views,total_interactions"
    account_insight_metrics: str = "reach,follower_count,views"

    # ------------------------------------------------------------- yardımcılar
    @field_validator("data_dir", "content_dir", "logs_dir", mode="before")
    @classmethod
    def _expand(cls, value: object) -> object:
        if isinstance(value, str):
            return Path(value).expanduser()
        return value

    @field_validator("instagram_api_version")
    @classmethod
    def _check_version(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned.startswith("v"):
            raise ValueError("API sürümü 'v' ile başlamalı, örn. v25.0")
        return cleaned

    @property
    def graph_host(self) -> str:
        """Aktif giriş kipine göre Graph API ana adresi."""
        if self.instagram_login_mode == "instagram":
            return self.instagram_graph_host.rstrip("/")
        return self.facebook_graph_host.rstrip("/")

    @property
    def graph_base_url(self) -> str:
        """Sürüm ekli Graph API taban adresi."""
        return f"{self.graph_host}/{self.instagram_api_version}"

    @property
    def oauth_scopes(self) -> str:
        if self.instagram_login_mode == "instagram":
            return self.instagram_scopes
        return self.facebook_scopes

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return f"sqlite:///{(self.data_dir / 'instaflow.db').as_posix()}"

    @property
    def image_extensions(self) -> tuple[str, ...]:
        return _split_csv(self.allowed_image_extensions)

    @property
    def video_extensions(self) -> tuple[str, ...]:
        return _split_csv(self.allowed_video_extensions)

    @property
    def media_metrics(self) -> tuple[str, ...]:
        return _split_csv(self.media_insight_metrics)

    @property
    def account_metrics(self) -> tuple[str, ...]:
        return _split_csv(self.account_insight_metrics)

    @property
    def is_secret_key_ephemeral(self) -> bool:
        """SECRET_KEY verilmemiş mi?

        Verilmemişse her açılışta yeni bir anahtar üretilir; bu da tüm
        oturumları ve bekleyen CSRF token'larını geçersiz kılar. Üretimde
        mutlaka `.env` üzerinden sabitlenmelidir.
        """
        return "secret_key" not in self.model_fields_set

    @property
    def is_instagram_configured(self) -> bool:
        return bool(self.instagram_access_token and self.instagram_user_id)

    @property
    def is_oauth_configured(self) -> bool:
        return bool(self.meta_app_id and self.meta_app_secret and self.oauth_redirect_uri)

    @property
    def is_ai_configured(self) -> bool:
        if self.ai_provider == "openai":
            return bool(self.openai_api_key)
        if self.ai_provider == "anthropic":
            return bool(self.anthropic_api_key)
        return self.ai_provider == "local"

    def ensure_directories(self) -> None:
        """Çalışma dizinlerini oluştur (varsa dokunma)."""
        for path in (
            self.data_dir,
            self.logs_dir,
            self.content_dir,
            self.content_dir / "drafts",
            self.content_dir / "scheduled",
            self.content_dir / "published",
            self.content_dir / "failed",
        ):
            path.mkdir(parents=True, exist_ok=True)


def _split_csv(raw: str) -> tuple[str, ...]:
    """Virgülle ayrılmış listeyi normalize eder."""
    return tuple(item.strip() for item in raw.split(",") if item.strip())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Süreç boyunca tek bir ayar nesnesi kullan."""
    settings = Settings()
    settings.ensure_directories()
    return settings
