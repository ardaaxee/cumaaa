"""AI sağlayıcı ve geri düşme (fallback) testleri.

Hiçbir test gerçek bir AI servisine istek göndermez.
"""

from __future__ import annotations

import httpx
import pytest

from app.ai import captions, content as ai_content, hashtags
from app.ai.providers import (
    AnthropicProvider,
    LocalGenerator,
    LocalProvider,
    OpenAIProvider,
    get_provider,
)
from app.ai.runner import parse_object_list, parse_string_list, strip_fences
from app.config import Settings, get_settings
from app.errors import AIProviderError


def _mock_provider(cls, handler):
    """Sahte HTTP taşıyıcısıyla bir sağlayıcı kurar."""
    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return cls(get_settings(), http_client=http_client), http_client


# ------------------------------------------------------------- sağlayıcı seçimi
def test_anahtar_yoksa_yerel_saglayici_secilir(isolated_env: Settings) -> None:
    provider = get_provider(isolated_env)

    assert isinstance(provider, LocalProvider)
    assert provider.is_llm is False


def test_openai_secili_ama_anahtar_yoksa_cokmez(monkeypatch: pytest.MonkeyPatch) -> None:
    # Arrange
    monkeypatch.setenv("AI_PROVIDER", "openai")
    get_settings.cache_clear()

    # Act — uygulama çökmemeli
    provider = get_provider(get_settings())

    # Assert
    assert isinstance(provider, LocalProvider)


def test_anahtar_varsa_openai_secilir(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()

    provider = get_provider(get_settings())

    assert isinstance(provider, OpenAIProvider)
    assert provider.is_llm is True


def test_anahtar_varsa_anthropic_secilir(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "anthropic")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()

    provider = get_provider(get_settings())

    assert isinstance(provider, AnthropicProvider)


# ------------------------------------------------------------------- HTTP akışı
async def test_openai_yaniti_ayristirilir(monkeypatch: pytest.MonkeyPatch) -> None:
    # Arrange
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["auth"] = request.headers.get("authorization")
        return httpx.Response(
            200, json={"choices": [{"message": {"content": "üretilmiş metin"}}]}
        )

    provider, http_client = _mock_provider(OpenAIProvider, handler)

    # Act
    text = await provider.complete("merhaba", system="sistem")
    await http_client.aclose()

    # Assert
    assert text == "üretilmiş metin"
    assert seen["auth"] == "Bearer sahte-anahtar"


async def test_anthropic_yaniti_ayristirilir(monkeypatch: pytest.MonkeyPatch) -> None:
    # Arrange
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["key"] = request.headers.get("x-api-key")
        seen["version"] = request.headers.get("anthropic-version")
        return httpx.Response(
            200, json={"content": [{"type": "text", "text": "üretilmiş metin"}]}
        )

    provider, http_client = _mock_provider(AnthropicProvider, handler)

    # Act
    text = await provider.complete("merhaba", system="sistem")
    await http_client.aclose()

    # Assert
    assert text == "üretilmiş metin"
    assert seen["key"] == "sahte-anahtar"
    assert seen["version"] == "2023-06-01"


async def test_anahtar_gecersizse_anlasilir_hata(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": {"message": "invalid key"}})

    provider, http_client = _mock_provider(OpenAIProvider, handler)

    with pytest.raises(AIProviderError, match="geçersiz veya yetkisiz"):
        await provider.complete("merhaba")
    await http_client.aclose()


async def test_yerel_saglayici_serbest_metin_uretmez() -> None:
    with pytest.raises(AIProviderError):
        await LocalProvider().complete("merhaba")


# ---------------------------------------------------------------- geri düşme
async def test_saglayici_hata_verirse_yerel_uretici_devreye_girer(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """En kritik davranış: AI servisi çökse bile içerik üretimi durmaz."""
    # Arrange
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()

    def failing(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"error": {"message": "sunucu hatası"}})

    provider, http_client = _mock_provider(OpenAIProvider, failing)

    # Act
    result = await captions.generate_caption("kahve demleme", provider=provider)
    await http_client.aclose()

    # Assert
    assert result.fallback_used is True
    assert result.provider == "local"
    assert "kahve demleme" in result.text


async def test_ag_kopukse_yerel_uretici_devreye_girer(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()

    def offline(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("ağ yok")

    provider, http_client = _mock_provider(OpenAIProvider, offline)

    result = await hashtags.generate_hashtags("kahve demleme", provider=provider)
    await http_client.aclose()

    assert result.fallback_used is True
    assert all(tag.startswith("#") for tag in result.items)


async def test_bozuk_json_yaniti_yerel_uretice_dusurur(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()

    def garbage(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"choices": [{"message": {"content": "   "}}]})

    provider, http_client = _mock_provider(OpenAIProvider, garbage)

    result = await ai_content.generate_ideas("kahve demleme", provider=provider)
    await http_client.aclose()

    assert result.fallback_used is True
    assert len(result.items) > 0


async def test_llm_calisirsa_geri_dusulmez(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()

    def working(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200, json={"choices": [{"message": {"content": "gerçek model çıktısı"}}]}
        )

    provider, http_client = _mock_provider(OpenAIProvider, working)

    result = await captions.generate_caption("kahve", provider=provider)
    await http_client.aclose()

    assert result.fallback_used is False
    assert result.provider == "openai"
    assert result.text == "gerçek model çıktısı"


# --------------------------------------------------------------- yerel üretim
async def test_yerel_uretici_aciklama_uretir(isolated_env: Settings) -> None:
    result = await captions.generate_caption("kahve demleme")

    assert result.provider == "local"
    assert result.fallback_used is False
    assert len(result.text) > 10


async def test_yerel_uretici_varyasyon_uretir(isolated_env: Settings) -> None:
    result = await captions.generate_caption_variants("kahve demleme", count=3)

    assert len(result.items) == 3
    assert len(set(result.items)) == 3


async def test_yerel_uretici_baslik_uretir(isolated_env: Settings) -> None:
    result = await captions.generate_title("kahve demleme sanatı")

    assert result.text.startswith("K")
    assert len(result.text) <= 80


async def test_yerel_uretici_reels_aciklamasi_uretir(isolated_env: Settings) -> None:
    result = await captions.generate_reels_description("kahve demleme", duration="15 sn")

    assert "15 sn" in result.text


async def test_hashtag_sayisi_sinirlanir(isolated_env: Settings) -> None:
    result = await hashtags.generate_hashtags("kahve demleme", count=100)

    # Instagram sınırı 30.
    assert len(result.items) <= 30


async def test_hashtagler_normalize_edilir() -> None:
    normalized = hashtags.normalize_hashtags(["Kahve", "#DEMLEME", "#kahve", "boş boşluk"])

    assert normalized[0] == "#kahve"
    assert "#demleme" in normalized
    # Tekrarlar atılır.
    assert len(normalized) == len(set(normalized))


async def test_takvim_slotlari_dogrulanir(isolated_env: Settings) -> None:
    result = await ai_content.generate_calendar("kahve demleme", days=7, per_day=1)

    assert len(result.slots) == 7
    for slot in result.slots:
        assert slot.content_type in {"image", "video", "reels", "carousel", "story"}
        assert ":" in slot.time


async def test_llm_takvimindeki_gecersiz_tur_duzeltilir(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange — model geçersiz bir tür döndürüyor
    monkeypatch.setenv("OPENAI_API_KEY", "sahte-anahtar")
    get_settings.cache_clear()
    payload = (
        '[{"day": "Pazartesi", "time": "25:99", "content_type": "tiktok", '
        '"title": "Test", "idea": "bir fikir"}]'
    )

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"choices": [{"message": {"content": payload}}]})

    provider, http_client = _mock_provider(OpenAIProvider, handler)

    # Act
    result = await ai_content.generate_calendar("kahve", days=1, provider=provider)
    await http_client.aclose()

    # Assert — geçersiz değerler güvenli varsayılana çekilir
    assert result.slots[0].content_type == "image"
    assert result.slots[0].time == "23:59"


# ----------------------------------------------------------------- ayrıştırma
def test_kod_blogu_isaretleri_temizlenir() -> None:
    assert strip_fences('```json\n["a"]\n```') == '["a"]'


def test_json_listesi_ayristirilir() -> None:
    assert parse_string_list('["bir", "iki"]') == ["bir", "iki"]


def test_madde_listesi_ayristirilir() -> None:
    result = parse_string_list("- bir\n- iki\n3. üç")

    assert result == ["bir", "iki", "üç"]


def test_bos_liste_hata_verir() -> None:
    with pytest.raises(ValueError):
        parse_string_list("   ")


def test_nesne_listesi_ayristirilir() -> None:
    result = parse_object_list('Şöyle: [{"a": 1}, {"b": 2}] işte')

    assert result == [{"a": 1}, {"b": 2}]


def test_nesne_listesi_yoksa_hata_verir() -> None:
    with pytest.raises(ValueError):
        parse_object_list("hiç JSON yok")


def test_yerel_uretici_ayni_girdide_ayni_ciktiyi_verir() -> None:
    first = LocalGenerator("tohum").caption("kahve")
    second = LocalGenerator("tohum").caption("kahve")

    assert first == second
