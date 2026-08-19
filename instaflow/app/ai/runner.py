"""Sağlayıcı çağrısı ve yanıt ayrıştırma yardımcıları.

Tek bir yerde: LLM varsa çağır, yoksa (veya hata verirse) yerel üreticiye
düş ve bunu `fallback_used` ile raporla. Böylece her üretim fonksiyonu aynı
davranışı tekrar yazmak zorunda kalmaz.
"""

from __future__ import annotations

import json
import re
from collections.abc import Callable
from typing import Any, TypeVar

from ..errors import AIProviderError
from ..logging_setup import get_logger
from .providers import AIProvider, LocalGenerator, LocalProvider
from .prompts import SYSTEM_PROMPT

logger = get_logger("ai.runner")

T = TypeVar("T")

_CODE_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)
_BULLET = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s*")


class Attempt:
    """Bir üretim denemesinin sonucu ve hangi kaynaktan geldiği."""

    __slots__ = ("value", "provider", "model", "fallback_used")

    def __init__(self, value: Any, provider: str, model: str, fallback_used: bool) -> None:
        self.value = value
        self.provider = provider
        self.model = model
        self.fallback_used = fallback_used


async def run(
    provider: AIProvider,
    prompt: str,
    local_fn: Callable[[LocalGenerator], T],
    *,
    parse: Callable[[str], T] | None = None,
    max_tokens: int | None = None,
) -> Attempt:
    """LLM'i dener, olmazsa yerel üreticiye düşer.

    Args:
        provider: Seçili sağlayıcı.
        prompt: LLM'e gönderilecek istem.
        local_fn: Yerel üreticiden aynı sonucu üreten fonksiyon.
        parse: LLM yanıtını istenen tipe çeviren fonksiyon (None ise düz metin).
        max_tokens: Yanıt üst sınırı.

    Returns:
        Değeri ve kaynağını taşıyan `Attempt`.
    """
    if not provider.is_llm:
        generator = getattr(provider, "generator", None) or LocalGenerator()
        return Attempt(local_fn(generator), provider.name, provider.model, False)

    try:
        raw = await provider.complete(prompt, system=SYSTEM_PROMPT, max_tokens=max_tokens)
        value = parse(raw) if parse else raw.strip()
    except AIProviderError as exc:
        logger.warning("%s başarısız (%s); yerel üreticiye düşülüyor.", provider.name, exc)
        return Attempt(local_fn(LocalGenerator()), LocalProvider.name, LocalProvider.model, True)
    except (ValueError, TypeError) as exc:
        logger.warning("Yanıt ayrıştırılamadı (%s); yerel üreticiye düşülüyor.", exc)
        return Attempt(local_fn(LocalGenerator()), LocalProvider.name, LocalProvider.model, True)

    return Attempt(value, provider.name, provider.model, False)


def strip_fences(raw: str) -> str:
    """Modelin eklediği kod bloğu işaretlerini temizler."""
    return _CODE_FENCE.sub("", raw.strip()).strip()


def parse_string_list(raw: str) -> list[str]:
    """Yanıtı dize listesine çevirir.

    Önce JSON dizisi denenir; olmazsa satır satır ayrıştırılır. Boş liste
    ayrıştırma hatası sayılır ki yerel üreticiye düşülebilsin.

    Raises:
        ValueError: Hiçbir öğe çıkarılamazsa.
    """
    text = strip_fences(raw)
    try:
        data = json.loads(text)
        if isinstance(data, list):
            items = [str(item).strip() for item in data if str(item).strip()]
            if items:
                return items
    except json.JSONDecodeError:
        pass

    items = [
        _BULLET.sub("", line).strip().strip('"').strip(",")
        for line in text.splitlines()
        if line.strip()
    ]
    items = [item for item in items if item and not item.startswith(("[", "]"))]
    if not items:
        raise ValueError("Liste ayrıştırılamadı.")
    return items


def parse_object_list(raw: str) -> list[dict[str, Any]]:
    """Yanıtı sözlük listesine çevirir.

    Raises:
        ValueError: Geçerli bir JSON dizisi bulunamazsa.
    """
    text = strip_fences(raw)
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end < start:
        raise ValueError("JSON dizisi bulunamadı.")
    data = json.loads(text[start : end + 1])
    if not isinstance(data, list):
        raise ValueError("JSON dizisi bekleniyordu.")
    items = [item for item in data if isinstance(item, dict)]
    if not items:
        raise ValueError("Dizide nesne yok.")
    return items
