"""Insights (istatistik) okuma.

Önemli: Meta metrik setini sık değiştiriyor. 21 Nisan 2025'ten itibaren
`impressions`, `plays` ve `video_views` metrikleri **tüm API sürümlerinde**
kaldırıldı; yerlerine tek bir `views` metriği geldi. Bu yüzden metrik
listesi `.env` üzerinden yönetilir ve desteklenmeyen metrikler sessizce
atlanmaz — "desteklenmiyor" olarak raporlanır.

Hiçbir metrik tahmin edilmez veya türetilmez: API ne döndürürse o yazılır.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..config import Settings, get_settings
from ..errors import InstagramAPIError, InstagramAuthError, InstagramRateLimitError
from ..logging_setup import get_logger
from ..security import redact_secrets
from .client import InstagramClient

logger = get_logger("instagram.insights")

#: Hesap bilgisi için istenen alanlar; bazıları giriş kipine göre değişebilir.
ACCOUNT_FIELDS = (
    "id,username,name,account_type,media_count,followers_count,profile_picture_url"
)
ACCOUNT_FIELDS_MINIMAL = "id,username"

#: Hesap düzeyinde zaman serisi metriklerinin varsayılan periyodu.
ACCOUNT_PERIOD = "day"


@dataclass
class InsightsResult:
    """Bir nesne için okunan metrikler.

    Attributes:
        values: metrik adı → değer (yalnızca API'den gerçekten dönenler).
        unsupported: API'nin reddettiği metrikler ve nedenleri.
    """

    values: dict[str, float] = field(default_factory=dict)
    unsupported: dict[str, str] = field(default_factory=dict)

    @property
    def has_data(self) -> bool:
        return bool(self.values)


class InsightsService:
    """Medya ve hesap istatistiklerini okur."""

    def __init__(self, client: InstagramClient, settings: Settings | None = None) -> None:
        self.client = client
        self.settings = settings or get_settings()

    async def get_account_info(self) -> dict[str, Any]:
        """Hesap bilgilerini getirir.

        Bazı alanlar giriş kipine/izinlere göre reddedilebilir; bu durumda
        asgari alan setiyle tekrar denenir.
        """
        try:
            return await self.client.get(
                self.client.ig_user_id, params={"fields": ACCOUNT_FIELDS}
            )
        except (InstagramAuthError, InstagramRateLimitError):
            raise
        except InstagramAPIError as exc:
            logger.warning(
                "Tam hesap alanları alınamadı (%s); asgari alanlar deneniyor.",
                exc.message,
            )
            return await self.client.get(
                self.client.ig_user_id, params={"fields": ACCOUNT_FIELDS_MINIMAL}
            )

    async def get_media_insights(
        self, media_id: str, metrics: tuple[str, ...] | None = None
    ) -> InsightsResult:
        """Tek bir gönderinin metriklerini okur.

        Toplu istek reddedilirse metrikler tek tek denenir; böylece bir
        metriğin desteklenmemesi diğerlerini götürmez.
        """
        wanted = metrics or self.settings.media_metrics
        return await self._read_insights(f"{media_id}/insights", wanted, params={})

    async def get_account_insights(
        self,
        metrics: tuple[str, ...] | None = None,
        *,
        period: str = ACCOUNT_PERIOD,
    ) -> InsightsResult:
        """Hesap düzeyinde metrikleri okur."""
        wanted = metrics or self.settings.account_metrics
        return await self._read_insights(
            f"{self.client.ig_user_id}/insights", wanted, params={"period": period}
        )

    # ----------------------------------------------------------------- iç akış
    async def _read_insights(
        self, path: str, metrics: tuple[str, ...], params: dict[str, Any]
    ) -> InsightsResult:
        if not metrics:
            return InsightsResult()

        try:
            payload = await self.client.get(
                path, params={**params, "metric": ",".join(metrics)}
            )
            return _parse_insights(payload, metrics)
        except (InstagramAuthError, InstagramRateLimitError):
            raise
        except InstagramAPIError as exc:
            logger.info(
                "Toplu metrik isteği reddedildi (%s); metrikler tek tek denenecek.",
                exc.message,
            )

        result = InsightsResult()
        for metric in metrics:
            try:
                payload = await self.client.get(path, params={**params, "metric": metric})
            except (InstagramAuthError, InstagramRateLimitError):
                raise
            except InstagramAPIError as exc:
                result.unsupported[metric] = redact_secrets(exc.detail or exc.message)
                continue
            single = _parse_insights(payload, (metric,))
            result.values.update(single.values)
            result.unsupported.update(single.unsupported)
        return result


def _parse_insights(payload: dict[str, Any], requested: tuple[str, ...]) -> InsightsResult:
    """Graph API insights yanıtını düz bir sözlüğe indirger."""
    result = InsightsResult()
    entries = payload.get("data", [])
    if not isinstance(entries, list):
        return result

    for entry in entries:
        name = str(entry.get("name", ""))
        if not name:
            continue
        value = _extract_value(entry)
        if value is not None:
            result.values[name] = value

    for metric in requested:
        if metric not in result.values:
            result.unsupported.setdefault(
                metric, "API bu metriği bu nesne için döndürmedi."
            )
    return result


def _extract_value(entry: dict[str, Any]) -> float | None:
    """`values` listesinden ya da `total_value` alanından sayıyı çıkarır."""
    total = entry.get("total_value")
    if isinstance(total, dict) and "value" in total:
        return _as_float(total.get("value"))

    values = entry.get("values")
    if isinstance(values, list) and values:
        # Zaman serisi metriklerinde en güncel ölçüm sondadır.
        return _as_float(values[-1].get("value"))
    return None


def _as_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
