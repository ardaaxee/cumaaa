"""Açıklama, başlık ve Reels metni üretimi."""

from __future__ import annotations

from ..config import get_settings
from ..logging_setup import get_logger
from ..schemas import GeneratedList, GeneratedText
from . import prompts
from .providers import AIProvider, get_provider
from .runner import parse_string_list, run

logger = get_logger("ai.captions")

#: Instagram açıklama sınırı.
MAX_CAPTION_CHARS = 2200
MAX_TITLE_CHARS = 80
DEFAULT_TONE = "samimi"
DEFAULT_VARIANT_COUNT = 3


async def generate_caption(
    topic: str,
    *,
    tone: str = DEFAULT_TONE,
    length: str = "orta",
    provider: AIProvider | None = None,
) -> GeneratedText:
    """Tek bir açıklama üretir."""
    active = provider or get_provider()
    prompt = prompts.CAPTION.format(
        topic=topic, tone=tone, length=length, max_chars=MAX_CAPTION_CHARS
    )
    attempt = await run(
        active,
        prompt,
        lambda gen: gen.caption(topic, tone=tone, max_chars=MAX_CAPTION_CHARS),
        max_tokens=get_settings().ai_max_tokens,
    )
    return GeneratedText(
        text=str(attempt.value)[:MAX_CAPTION_CHARS],
        provider=attempt.provider,
        model=attempt.model,
        fallback_used=attempt.fallback_used,
    )


async def generate_caption_variants(
    topic: str,
    *,
    count: int = DEFAULT_VARIANT_COUNT,
    tone: str = DEFAULT_TONE,
    provider: AIProvider | None = None,
) -> GeneratedList:
    """Aynı konu için birden fazla açıklama seçeneği üretir."""
    active = provider or get_provider()
    prompt = prompts.CAPTION_VARIANTS.format(
        topic=topic,
        count=count,
        tone=tone,
        max_chars=MAX_CAPTION_CHARS,
        list_rule=prompts.list_rule(),
    )
    attempt = await run(
        active,
        prompt,
        lambda gen: gen.variants(topic, count, tone=tone),
        parse=parse_string_list,
        max_tokens=get_settings().ai_max_tokens,
    )
    items = [str(item)[:MAX_CAPTION_CHARS] for item in list(attempt.value)[:count]]
    return GeneratedList(
        items=items,
        provider=attempt.provider,
        model=attempt.model,
        fallback_used=attempt.fallback_used,
    )


async def generate_title(
    topic: str, *, provider: AIProvider | None = None
) -> GeneratedText:
    """Kısa başlık üretir."""
    active = provider or get_provider()
    prompt = prompts.TITLE.format(topic=topic, max_chars=MAX_TITLE_CHARS)
    attempt = await run(
        active,
        prompt,
        lambda gen: gen.title(topic, max_chars=MAX_TITLE_CHARS),
        max_tokens=200,
    )
    text = str(attempt.value).splitlines()[0].strip().strip('"')
    return GeneratedText(
        text=text[:MAX_TITLE_CHARS],
        provider=attempt.provider,
        model=attempt.model,
        fallback_used=attempt.fallback_used,
    )


async def generate_reels_description(
    topic: str,
    *,
    duration: str = "30 sn",
    tone: str = DEFAULT_TONE,
    provider: AIProvider | None = None,
) -> GeneratedText:
    """Reels açıklaması üretir."""
    active = provider or get_provider()
    prompt = prompts.REELS_DESCRIPTION.format(
        topic=topic, duration=duration, tone=tone, max_chars=MAX_CAPTION_CHARS
    )
    attempt = await run(
        active,
        prompt,
        lambda gen: gen.reels_description(topic, duration=duration),
        max_tokens=get_settings().ai_max_tokens,
    )
    return GeneratedText(
        text=str(attempt.value)[:MAX_CAPTION_CHARS],
        provider=attempt.provider,
        model=attempt.model,
        fallback_used=attempt.fallback_used,
    )
