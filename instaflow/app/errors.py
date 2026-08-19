"""Uygulama hata tipleri.

Her hata sınıfı kullanıcıya gösterilebilecek Türkçe bir mesaj taşır;
teknik ayrıntı (HTTP kodu, Meta hata kodu) ayrı alanlarda durur ve yalnızca
loglara yazılır.
"""

from __future__ import annotations

from typing import Any


class InstaFlowError(Exception):
    """Tüm uygulama hatalarının tabanı."""

    def __init__(self, message: str, *, detail: str = "") -> None:
        super().__init__(message)
        self.message = message
        self.detail = detail

    def __str__(self) -> str:
        return self.message


class ConfigurationError(InstaFlowError):
    """Eksik veya hatalı yapılandırma."""


class NotConfiguredError(ConfigurationError):
    """İstenen özellik için gerekli kimlik bilgileri yok."""


class MediaValidationError(InstaFlowError):
    """Yüklenen/gösterilen medya kabul edilebilir değil."""


class InvalidDateError(InstaFlowError, ValueError):
    """Kullanıcının girdiği tarih anlaşılamadı.

    Hem `InstaFlowError` hem `ValueError` olması bilinçli: web katmanı
    `ValueError` yakalar, API katmanı ise `InstaFlowError` işleyicisiyle
    anlaşılır bir 400 döndürür.
    """


class UnsupportedFeatureError(InstaFlowError):
    """Özellik, mevcut API izinleriyle desteklenmiyor."""


class InstagramAPIError(InstaFlowError):
    """Graph API'den dönen hata.

    Attributes:
        status_code: HTTP durum kodu (ağ hatasında 0).
        error_code: Meta'nın `error.code` alanı.
        error_subcode: Meta'nın `error.error_subcode` alanı.
        payload: Ham hata gövdesi (loglama için).
        is_retryable: Yeniden denenebilir mi.
    """

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 0,
        error_code: int | None = None,
        error_subcode: int | None = None,
        payload: dict[str, Any] | None = None,
        is_retryable: bool = False,
        detail: str = "",
    ) -> None:
        super().__init__(message, detail=detail)
        self.status_code = status_code
        self.error_code = error_code
        self.error_subcode = error_subcode
        self.payload = payload or {}
        self.is_retryable = is_retryable


class InstagramAuthError(InstagramAPIError):
    """401/403: token geçersiz, süresi dolmuş veya izin yetersiz."""


class InstagramRateLimitError(InstagramAPIError):
    """429 veya Meta'nın kota hataları."""


class PublishingError(InstaFlowError):
    """Yayınlama akışında oluşan hata."""


class AIProviderError(InstaFlowError):
    """AI sağlayıcısından dönen hata."""
