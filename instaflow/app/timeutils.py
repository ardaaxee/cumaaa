"""Zaman dönüşümleri.

Kural: veritabanında **her zaman** UTC (naive) saklanır. Kullanıcıya
gösterilen ve kullanıcıdan alınan her değer `settings.timezone` yerel
saatidir. Bu ayrım tek yerde uygulanır ki yaz saati geçişlerinde planlanmış
gönderiler kaymasın.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .config import get_settings
from .errors import InvalidDateError
from .logging_setup import get_logger

logger = get_logger("time")

#: Kullanıcıdan kabul edilen tarih biçimleri.
INPUT_FORMATS = (
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M",
    "%Y-%m-%dT%H:%M:%S",
    "%d.%m.%Y %H:%M",
)

DISPLAY_FORMAT = "%d.%m.%Y %H:%M"


def utcnow() -> datetime:
    """Naive UTC "şimdi"."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def local_zone() -> ZoneInfo:
    """Yapılandırılmış yerel saat dilimi; bulunamazsa UTC'ye düşer."""
    name = get_settings().timezone
    try:
        return ZoneInfo(name)
    except (ZoneInfoNotFoundError, KeyError, ValueError):
        logger.warning("Saat dilimi bulunamadı (%s), UTC kullanılıyor.", name)
        return ZoneInfo("UTC")


def to_local(value: datetime | None) -> datetime | None:
    """Naive UTC → yerel saat (naive)."""
    if value is None:
        return None
    return (
        value.replace(tzinfo=timezone.utc).astimezone(local_zone()).replace(tzinfo=None)
    )


def to_utc(value: datetime | None) -> datetime | None:
    """Naive yerel saat → naive UTC."""
    if value is None:
        return None
    return (
        value.replace(tzinfo=local_zone()).astimezone(timezone.utc).replace(tzinfo=None)
    )


def parse_local(raw: str) -> datetime:
    """Kullanıcının yazdığı yerel tarihi naive UTC'ye çevirir.

    Raises:
        InvalidDateError: Biçim tanınmazsa (aynı zamanda bir `ValueError`).
    """
    text = raw.strip()
    for fmt in INPUT_FORMATS:
        try:
            return to_utc(datetime.strptime(text, fmt))  # type: ignore[return-value]
        except ValueError:
            continue
    raise InvalidDateError(
        f"Tarih anlaşılamadı: {raw!r}. Beklenen biçim: 'YYYY-AA-GG SS:DD' "
        "(örn. 2026-08-20 18:00)"
    )


def format_local(value: datetime | None, fmt: str = DISPLAY_FORMAT) -> str:
    """Naive UTC değeri yerel saatte okunur biçime çevirir."""
    local = to_local(value)
    return local.strftime(fmt) if local else "-"


def local_day_bounds(offset_days: int = 0) -> tuple[datetime, datetime]:
    """Yerel günün başlangıç/bitişini naive UTC aralığı olarak döndürür."""
    now_local = to_local(utcnow())
    assert now_local is not None
    start_local = (now_local + timedelta(days=offset_days)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    end_local = start_local + timedelta(days=1)
    start = to_utc(start_local)
    end = to_utc(end_local)
    assert start is not None and end is not None
    return start, end
