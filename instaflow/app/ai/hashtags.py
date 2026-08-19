"""Hashtag önerisi üretimi."""

from __future__ import annotations

import re

from ..logging_setup import get_logger
from ..schemas import MAX_HASHTAGS, GeneratedList
from . import prompts
from .providers import AIProvider, get_provider
from .runner import parse_string_list, run

logger = get_logger("ai.hashtags")

DEFAULT_COUNT = 15
_TAG_PATTERN = re.compile(r"[^0-9A-Za-zÇĞİÖŞÜçğıöşü_]")


async def generate_hashtags(
    topic: str,
    *,
    count: int = DEFAULT_COUNT,
    provider: AIProvider | None = None,
) -> GeneratedList:
    """Konuya uygun hashtag listesi üretir.

    Sonuç her zaman normalize edilir: '#' ile başlar, boşluk içermez,
    tekrarlar atılır ve Instagram'ın 30 etiket sınırı aşılmaz.
    """
    limit = max(1, min(count, MAX_HASHTAGS))
    active = provider or get_provider()
    prompt = prompts.HASHTAGS.format(
        topic=topic, count=limit, list_rule=prompts.list_rule()
    )
    attempt = await run(
        active,
        prompt,
        lambda gen: gen.hashtags(topic, limit),
        parse=parse_string_list,
        max_tokens=600,
    )
    tags = normalize_hashtags(list(attempt.value), limit)
    return GeneratedList(
        items=tags,
        provider=attempt.provider,
        model=attempt.model,
        fallback_used=attempt.fallback_used,
    )


def normalize_hashtags(raw_items: list[str], limit: int = MAX_HASHTAGS) -> list[str]:
    """Ham etiketleri geçerli Instagram hashtag'lerine dönüştürür."""
    seen: dict[str, None] = {}
    for item in raw_items:
        for token in str(item).split():
            cleaned = _TAG_PATTERN.sub("", token.lstrip("#"))
            if not cleaned or cleaned.isdigit():
                continue
            seen.setdefault(f"#{cleaned.lower()}", None)
            if len(seen) >= limit:
                return list(seen)
    return list(seen)
