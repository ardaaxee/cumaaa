"""AI sağlayıcı mimarisi.

    AIProvider (soyut)
    ├── OpenAIProvider     — OpenAI uyumlu /chat/completions
    ├── AnthropicProvider  — Anthropic Messages API
    └── LocalProvider      — ağ gerektirmeyen kural tabanlı üretici

Anahtar yoksa uygulama çökmez: fabrika `LocalProvider`'a düşer ve bu durum
`fallback_used` alanıyla açıkça raporlanır. Yerel üretici bir dil modeli
taklidi yapmaz; şablon tabanlı olduğunu adı ve modeli ile bildirir.
"""

from __future__ import annotations

import random
from abc import ABC, abstractmethod
from typing import Any

import httpx

from ..config import Settings, get_settings
from ..errors import AIProviderError
from ..logging_setup import get_logger

logger = get_logger("ai.providers")

LOCAL_MODEL_NAME = "rule-based"


class AIProvider(ABC):
    """Metin üreten sağlayıcı arayüzü."""

    name: str = "abstract"
    model: str = ""

    @property
    def is_llm(self) -> bool:
        """Gerçek bir dil modeline mi bağlanıyor?"""
        return True

    @abstractmethod
    async def complete(
        self, prompt: str, *, system: str = "", max_tokens: int | None = None
    ) -> str:
        """İstemi yanıtlayan düz metni döndürür.

        Raises:
            AIProviderError: Sağlayıcı hata verirse.
        """

    async def aclose(self) -> None:
        """Varsa HTTP kaynaklarını serbest bırakır."""


class _HTTPProvider(AIProvider):
    """HTTP tabanlı sağlayıcılar için ortak davranış."""

    def __init__(
        self,
        settings: Settings,
        *,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.settings = settings
        self._external_client = http_client is not None
        self._client = http_client

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.settings.ai_timeout_seconds)
            )
        return self._client

    async def aclose(self) -> None:
        if self._client is not None and not self._external_client:
            await self._client.aclose()
            self._client = None

    async def _post_json(
        self, url: str, headers: dict[str, str], payload: dict[str, Any]
    ) -> dict[str, Any]:
        client = self._ensure_client()
        try:
            response = await client.post(url, headers=headers, json=payload)
        except httpx.TimeoutException as exc:
            raise AIProviderError(
                f"{self.name}: istek zaman aşımına uğradı.", detail=str(exc)
            ) from exc
        except httpx.HTTPError as exc:
            raise AIProviderError(
                f"{self.name}: bağlantı kurulamadı.", detail=str(exc)
            ) from exc

        if response.status_code >= 400:
            raise AIProviderError(
                _http_error_message(self.name, response.status_code),
                detail=response.text[:500],
            )
        try:
            data = response.json()
        except ValueError as exc:
            raise AIProviderError(
                f"{self.name}: yanıt JSON olarak okunamadı.", detail=response.text[:300]
            ) from exc
        if not isinstance(data, dict):
            raise AIProviderError(f"{self.name}: beklenmeyen yanıt biçimi.")
        return data


class OpenAIProvider(_HTTPProvider):
    """OpenAI (ve OpenAI uyumlu yerel sunucular) için sağlayıcı."""

    name = "openai"

    def __init__(
        self, settings: Settings, *, http_client: httpx.AsyncClient | None = None
    ) -> None:
        super().__init__(settings, http_client=http_client)
        self.model = settings.openai_model

    async def complete(
        self, prompt: str, *, system: str = "", max_tokens: int | None = None
    ) -> str:
        if not self.settings.openai_api_key:
            raise AIProviderError("OPENAI_API_KEY tanımlı değil.")

        messages: list[dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        url = f"{self.settings.openai_base_url.rstrip('/')}/chat/completions"
        headers = {"Authorization": f"Bearer {self.settings.openai_api_key}"}
        limit = max_tokens or self.settings.ai_max_tokens

        # Yeni modeller `max_completion_tokens`, OpenAI uyumlu yerel sunucuların
        # çoğu ise hâlâ `max_tokens` bekliyor. İlki reddedilirse ikincisi denenir.
        for token_field in ("max_completion_tokens", "max_tokens"):
            payload = {"model": self.model, "messages": messages, token_field: limit}
            try:
                data = await self._post_json(url, headers, payload)
            except AIProviderError as exc:
                if token_field == "max_completion_tokens" and _is_param_error(exc):
                    logger.debug("max_completion_tokens reddedildi, max_tokens denenecek.")
                    continue
                raise
            return _extract_openai_text(data)
        raise AIProviderError("openai: istek kabul edilmedi.")


class AnthropicProvider(_HTTPProvider):
    """Anthropic Messages API sağlayıcısı."""

    name = "anthropic"

    def __init__(
        self, settings: Settings, *, http_client: httpx.AsyncClient | None = None
    ) -> None:
        super().__init__(settings, http_client=http_client)
        self.model = settings.anthropic_model

    async def complete(
        self, prompt: str, *, system: str = "", max_tokens: int | None = None
    ) -> str:
        if not self.settings.anthropic_api_key:
            raise AIProviderError("ANTHROPIC_API_KEY tanımlı değil.")

        url = f"{self.settings.anthropic_base_url.rstrip('/')}/messages"
        headers = {
            "x-api-key": self.settings.anthropic_api_key,
            "anthropic-version": self.settings.anthropic_version,
        }
        payload: dict[str, Any] = {
            "model": self.model,
            "max_tokens": max_tokens or self.settings.ai_max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            payload["system"] = system

        data = await self._post_json(url, headers, payload)
        return _extract_anthropic_text(data)


class LocalGenerator:
    """Ağ gerektirmeyen, şablon tabanlı metin üretici.

    Dil modeli değildir; sabit kalıplardan tutarlı ve kullanılabilir taslaklar
    üretir. Amacı, API anahtarı olmadan da sistemin uçtan uca çalışabilmesidir.
    """

    HOOKS = (
        "Bugün küçük bir detay dikkatimi çekti:",
        "Uzun zamandır denemek istediğim şeyi sonunda yaptım:",
        "Bunu paylaşmadan geçemeyeceğim:",
        "Basit ama işe yarayan bir şey öğrendim:",
        "Kısa bir not:",
    )
    CLOSERS = (
        "Siz ne düşünüyorsunuz?",
        "Sizde nasıl gidiyor?",
        "Denediniz mi hiç?",
        "Yorumlarda buluşalım.",
        "",
    )
    TONE_WORDS = {
        "samimi": "Rahat ve içten bir dille anlatıyorum.",
        "bilgilendirici": "Kısaca ne yaptığımı ve neden işe yaradığını anlatayım.",
        "eğlenceli": "Biraz da işin keyifli tarafı var.",
        "profesyonel": "Süreci adım adım aktarıyorum.",
    }
    FORMATS = ("image", "reels", "carousel", "video", "story")

    def __init__(self, seed_source: str = "") -> None:
        # Aynı konu için aynı çıktıyı üretmek testleri ve kullanıcı deneyimini
        # öngörülebilir kılar.
        self._random = random.Random(seed_source or "instaflow")

    def caption(self, topic: str, *, tone: str = "samimi", max_chars: int = 2200) -> str:
        """Tek bir açıklama taslağı."""
        hook = self._random.choice(self.HOOKS)
        tone_line = self.TONE_WORDS.get(tone, self.TONE_WORDS["samimi"])
        closer = self._random.choice(self.CLOSERS)
        parts = [f"{hook} {topic.strip().rstrip('.')}.", tone_line, closer]
        return _trim("\n\n".join(part for part in parts if part), max_chars)

    def variants(self, topic: str, count: int, *, tone: str = "samimi") -> list[str]:
        """Birbirinden farklı açıklama taslakları."""
        openings = (
            f"{topic.strip().rstrip('.')} — kısa bir hikâye.",
            f"{topic.strip().rstrip('.')} hakkında üç şey öğrendim.",
            f"Soru: {topic.strip().rstrip('.')} sizce nasıl olmalı?",
            f"{topic.strip().rstrip('.')} için küçük bir rehber.",
            f"Kamera arkası: {topic.strip().rstrip('.')}",
        )
        results: list[str] = []
        for index in range(count):
            opening = openings[index % len(openings)]
            results.append(f"{opening}\n\n{self.TONE_WORDS.get(tone, '')}".strip())
        return results

    def title(self, topic: str, *, max_chars: int = 80) -> str:
        """Kısa başlık."""
        cleaned = " ".join(topic.split()).rstrip(".")
        return _trim(cleaned[:1].upper() + cleaned[1:], max_chars)

    def reels_description(self, topic: str, *, duration: str = "30 sn") -> str:
        """Reels açıklaması."""
        cleaned = topic.strip().rstrip(".")
        return (
            f"{cleaned} ({duration}).\n\n"
            "İlk saniyeler en kritik kısım; en çarpıcı anı başa aldım.\n"
            "Kaydetmeyi unutmayın."
        )

    def hashtags(self, topic: str, count: int) -> list[str]:
        """Konudan türetilmiş etiketler + genel etiketler."""
        words = [
            _slug(word)
            for word in topic.split()
            if len(word) > 3 and _slug(word)
        ]
        derived = [f"#{word}" for word in dict.fromkeys(words)]
        generic = [
            "#keşfet",
            "#günlük",
            "#içerik",
            "#paylaşım",
            "#reels",
            "#fotoğraf",
            "#türkiye",
            "#ilham",
            "#hayat",
            "#deneme",
        ]
        combined = list(dict.fromkeys(derived + generic))
        return combined[:count]

    def ideas(self, topic: str, count: int) -> list[str]:
        """Somut içerik fikirleri."""
        cleaned = topic.strip().rstrip(".")
        templates = (
            "{t} hakkında sık sorulan bir soruyu tek karede yanıtla.",
            "{t} sürecinin kamera arkasını kısa bir reels olarak çek.",
            "{t} ile ilgili üç ipucunu carousel yap.",
            "{t} konusunda yaptığın en büyük hatayı anlat.",
            "{t} için önce/sonra karşılaştırması paylaş.",
            "{t} ile ilgili bir günlük rutinini story serisine böl.",
            "{t} hakkında takipçilerine anket sor.",
        )
        return [templates[i % len(templates)].format(t=cleaned) for i in range(count)]

    def calendar(self, topic: str, days: int, per_day: int) -> list[dict[str, str]]:
        """Haftalık plan iskeleti."""
        day_names = (
            "Pazartesi",
            "Salı",
            "Çarşamba",
            "Perşembe",
            "Cuma",
            "Cumartesi",
            "Pazar",
        )
        times = ("12:00", "18:00", "21:00")
        ideas = self.ideas(topic, days * per_day)
        slots: list[dict[str, str]] = []
        for index in range(days * per_day):
            day = day_names[(index // per_day) % len(day_names)]
            slots.append(
                {
                    "day": day,
                    "time": times[index % per_day % len(times)],
                    "content_type": self.FORMATS[index % len(self.FORMATS)],
                    "title": self.title(ideas[index], max_chars=60),
                    "idea": ideas[index],
                }
            )
        return slots


class LocalProvider(AIProvider):
    """`LocalGenerator`'ı `AIProvider` arayüzüne bağlar."""

    name = "local"
    model = LOCAL_MODEL_NAME

    def __init__(self, generator: LocalGenerator | None = None) -> None:
        self.generator = generator or LocalGenerator()

    @property
    def is_llm(self) -> bool:
        return False

    async def complete(
        self, prompt: str, *, system: str = "", max_tokens: int | None = None
    ) -> str:
        """Yerel üretici serbest metin tamamlamaz.

        Çağıranlar `is_llm` kontrolüyle doğrudan `generator` metotlarını
        kullanır; buraya düşmek bir programlama hatasıdır.
        """
        raise AIProviderError(
            "Yerel üretici serbest metin tamamlama yapmaz; şablon üreticileri "
            "kullanılmalıdır."
        )


def get_provider(
    settings: Settings | None = None,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> AIProvider:
    """Yapılandırmaya göre sağlayıcı seçer.

    Anahtar eksikse veya sağlayıcı `none`/`local` ise `LocalProvider` döner —
    uygulama hiçbir durumda çökmemelidir.
    """
    cfg = settings or get_settings()
    choice = cfg.ai_provider

    if choice == "openai" and cfg.openai_api_key:
        return OpenAIProvider(cfg, http_client=http_client)
    if choice == "anthropic" and cfg.anthropic_api_key:
        return AnthropicProvider(cfg, http_client=http_client)
    if choice in ("openai", "anthropic"):
        logger.warning(
            "AI_PROVIDER=%s seçili ama API anahtarı yok; yerel üreticiye düşülüyor.",
            choice,
        )
    return LocalProvider()


# --------------------------------------------------------------------- yardımcı
def _extract_openai_text(data: dict[str, Any]) -> str:
    choices = data.get("choices")
    if not isinstance(choices, list) or not choices:
        raise AIProviderError("openai: yanıtta içerik yok.")
    message = choices[0].get("message", {}) if isinstance(choices[0], dict) else {}
    text = message.get("content", "")
    if isinstance(text, list):  # bazı uyumlu sunucular parça listesi döndürür
        text = "".join(part.get("text", "") for part in text if isinstance(part, dict))
    if not isinstance(text, str) or not text.strip():
        raise AIProviderError("openai: boş yanıt döndü.")
    return text.strip()


def _extract_anthropic_text(data: dict[str, Any]) -> str:
    blocks = data.get("content")
    if not isinstance(blocks, list):
        raise AIProviderError("anthropic: yanıtta içerik yok.")
    text = "".join(
        block.get("text", "")
        for block in blocks
        if isinstance(block, dict) and block.get("type") == "text"
    )
    if not text.strip():
        raise AIProviderError("anthropic: boş yanıt döndü.")
    return text.strip()


def _http_error_message(provider: str, status: int) -> str:
    if status in (401, 403):
        return f"{provider}: API anahtarı geçersiz veya yetkisiz."
    if status == 429:
        return f"{provider}: istek kotası aşıldı."
    if status >= 500:
        return f"{provider}: sağlayıcı sunucu hatası ({status})."
    return f"{provider}: istek reddedildi ({status})."


def _is_param_error(exc: AIProviderError) -> bool:
    """Hata, parametre adı uyuşmazlığından mı kaynaklanıyor?"""
    detail = (exc.detail or "").lower()
    return "max_completion_tokens" in detail or "max_tokens" in detail


def _trim(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1].rstrip() + "…"


def _slug(word: str) -> str:
    table = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")
    cleaned = "".join(ch for ch in word.translate(table) if ch.isalnum())
    return cleaned.lower()
