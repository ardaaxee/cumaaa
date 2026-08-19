"""İçerik fikri ve haftalık plan üretimi.

Üretilen hiçbir şey doğrudan yayınlanmaz: fikirler ve plan slotları
`content_service` üzerinden **taslak** olarak kaydedilir.
"""

from __future__ import annotations

from ..logging_setup import get_logger
from ..models import ContentType
from ..schemas import CalendarSlot, GeneratedCalendar, GeneratedList
from . import prompts
from .providers import AIProvider, get_provider
from .runner import parse_object_list, parse_string_list, run

logger = get_logger("ai.content")

DEFAULT_IDEA_COUNT = 7
DEFAULT_DAYS = 7
DEFAULT_PER_DAY = 1
VALID_TYPES = {t.value for t in ContentType}
_DAY_NAMES = (
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
)


async def generate_ideas(
    topic: str,
    *,
    count: int = DEFAULT_IDEA_COUNT,
    provider: AIProvider | None = None,
) -> GeneratedList:
    """Çekilebilir, somut içerik fikirleri üretir."""
    limit = max(1, min(count, 30))
    active = provider or get_provider()
    prompt = prompts.IDEAS.format(
        topic=topic, count=limit, list_rule=prompts.list_rule()
    )
    attempt = await run(
        active,
        prompt,
        lambda gen: gen.ideas(topic, limit),
        parse=parse_string_list,
        max_tokens=1000,
    )
    items = [str(item).strip() for item in list(attempt.value)[:limit] if str(item).strip()]
    return GeneratedList(
        items=items,
        provider=attempt.provider,
        model=attempt.model,
        fallback_used=attempt.fallback_used,
    )


async def generate_calendar(
    topic: str,
    *,
    days: int = DEFAULT_DAYS,
    per_day: int = DEFAULT_PER_DAY,
    provider: AIProvider | None = None,
) -> GeneratedCalendar:
    """Haftalık içerik planı üretir."""
    day_count = max(1, min(days, 30))
    daily = max(1, min(per_day, 3))
    active = provider or get_provider()
    prompt = prompts.CALENDAR.format(topic=topic, days=day_count, per_day=daily)

    attempt = await run(
        active,
        prompt,
        lambda gen: gen.calendar(topic, day_count, daily),
        parse=parse_object_list,
        max_tokens=2000,
    )
    slots = _to_slots(list(attempt.value), day_count * daily)
    return GeneratedCalendar(
        slots=slots,
        provider=attempt.provider,
        model=attempt.model,
        fallback_used=attempt.fallback_used,
    )


def _to_slots(raw: list[dict], limit: int) -> list[CalendarSlot]:
    """Ham sözlükleri doğrulanmış slotlara çevirir; bozuk olanları atar."""
    slots: list[CalendarSlot] = []
    for index, item in enumerate(raw[:limit]):
        content_type = str(item.get("content_type", "image")).lower().strip()
        if content_type not in VALID_TYPES:
            content_type = ContentType.IMAGE.value
        idea = str(item.get("idea", "")).strip()
        if not idea:
            continue
        slots.append(
            CalendarSlot(
                day=str(item.get("day") or _DAY_NAMES[index % len(_DAY_NAMES)]).strip(),
                time=_normalize_time(item.get("time")),
                content_type=content_type,  # type: ignore[arg-type]
                title=str(item.get("title", "")).strip()[:255] or idea[:60],
                idea=idea,
            )
        )
    return slots


def _normalize_time(value: object) -> str:
    """'18:00' biçimine indirger; anlaşılmazsa varsayılan saat."""
    text = str(value or "").strip()
    parts = text.replace(".", ":").split(":")
    if len(parts) >= 2 and parts[0].isdigit() and parts[1][:2].isdigit():
        hour = min(23, int(parts[0]))
        minute = min(59, int(parts[1][:2]))
        return f"{hour:02d}:{minute:02d}"
    return "18:00"
