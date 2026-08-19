"""OAuth ve token yaşam döngüsü testleri.

Tüm Meta çağrıları mock'lanmıştır. Hiçbir testte parola kullanılmaz —
proje parola ile giriş desteklemez ve desteklememelidir.
"""

from __future__ import annotations

from urllib.parse import parse_qs, urlparse

import httpx
import pytest

from app.config import Settings, get_settings
from app.errors import InstagramAPIError, NotConfiguredError
from app.instagram import auth


@pytest.fixture
def app_settings(monkeypatch: pytest.MonkeyPatch) -> Settings:
    """OAuth için gerekli uygulama bilgileri tanımlı ayarlar."""
    monkeypatch.setenv("META_APP_ID", "1234567890")
    monkeypatch.setenv("META_APP_SECRET", "sahte-uygulama-sirri")
    monkeypatch.setenv("OAUTH_REDIRECT_URI", "https://ornek.example/oauth/callback")
    get_settings.cache_clear()
    return get_settings()


def _client(handler) -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


# ------------------------------------------------------------ yetkilendirme URL
def test_instagram_kipinde_yetkilendirme_adresi(app_settings: Settings) -> None:
    url = auth.build_authorize_url(app_settings, state="rastgele")

    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    assert parsed.netloc == "www.instagram.com"
    assert params["client_id"] == ["1234567890"]
    assert params["response_type"] == ["code"]
    assert params["state"] == ["rastgele"]
    assert "instagram_business_content_publish" in params["scope"][0]


def test_facebook_kipinde_yetkilendirme_adresi(
    app_settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("INSTAGRAM_LOGIN_MODE", "facebook")
    get_settings.cache_clear()

    url = auth.build_authorize_url(get_settings())

    parsed = urlparse(url)
    assert parsed.netloc == "www.facebook.com"
    assert "instagram_content_publish" in parse_qs(parsed.query)["scope"][0]


def test_uygulama_bilgisi_yoksa_yetkilendirme_kurulamaz(isolated_env: Settings) -> None:
    with pytest.raises(NotConfiguredError, match="META_APP_ID"):
        auth.build_authorize_url(isolated_env)


def test_gizli_deger_yetkilendirme_adresinde_yer_almaz(app_settings: Settings) -> None:
    url = auth.build_authorize_url(app_settings)

    # App secret asla tarayıcıya gitmemeli.
    assert "sahte-uygulama-sirri" not in url


# --------------------------------------------------------------- kod değişimi
async def test_kod_kisa_omurlu_tokena_cevrilir(app_settings: Settings) -> None:
    # Arrange
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.host == "api.instagram.com"
        return httpx.Response(
            200,
            json={
                "access_token": "kisa-omurlu",
                "user_id": "17841400000000000",
                "permissions": ["instagram_business_basic"],
            },
        )

    client = _client(handler)

    # Act
    token = await auth.exchange_code("kod-123", app_settings, http_client=client)
    await client.aclose()

    # Assert
    assert token.access_token == "kisa-omurlu"
    assert token.user_id == "17841400000000000"


async def test_kod_degisiminde_hata_anlasilir(app_settings: Settings) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(400, json={"error_message": "kod süresi doldu"})

    client = _client(handler)

    with pytest.raises(InstagramAPIError, match="kod süresi doldu"):
        await auth.exchange_code("eski-kod", app_settings, http_client=client)
    await client.aclose()


async def test_uzun_omurlu_token_alinir(app_settings: Settings) -> None:
    # Arrange
    seen: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen.update(dict(request.url.params))
        return httpx.Response(
            200,
            json={
                "access_token": "uzun-omurlu",
                "token_type": "bearer",
                "expires_in": 5183944,
            },
        )

    client = _client(handler)

    # Act
    token = await auth.exchange_for_long_lived("kisa-omurlu", app_settings, http_client=client)
    await client.aclose()

    # Assert
    assert token.access_token == "uzun-omurlu"
    assert seen["grant_type"] == "ig_exchange_token"
    assert token.expires_at is not None
    # ~60 gün
    assert 59 <= auth.token_days_left(token.expires_at) <= 60


async def test_token_yenilenir(app_settings: Settings) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["grant_type"] == "ig_refresh_token"
        return httpx.Response(
            200, json={"access_token": "yenilenmis", "expires_in": 5183944}
        )

    client = _client(handler)

    token = await auth.refresh_long_lived_token("uzun-omurlu", app_settings, http_client=client)
    await client.aclose()

    assert token.access_token == "yenilenmis"


async def test_facebook_kipinde_yenileme_desteklenmedigi_soylenir(
    app_settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    monkeypatch.setenv("INSTAGRAM_LOGIN_MODE", "facebook")
    get_settings.cache_clear()

    # Act / Assert — uydurma bir başarı yerine açık bir "desteklenmiyor"
    with pytest.raises(InstagramAPIError, match="desteklenmiyor"):
        await auth.refresh_long_lived_token("token", get_settings())


# ------------------------------------------------------------- token denetimi
async def test_instagram_kipinde_token_me_ile_dogrulanir(app_settings: Settings) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"id": "178414", "username": "ornek"})

    client = _client(handler)

    info = await auth.inspect_token("token", app_settings, http_client=client)
    await client.aclose()

    assert info["valid"] is True
    assert info["source"] == "me"
    assert info["username"] == "ornek"


async def test_facebook_kipinde_debug_token_kullanilir(
    app_settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    monkeypatch.setenv("INSTAGRAM_LOGIN_MODE", "facebook")
    get_settings.cache_clear()

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/debug_token"
        return httpx.Response(
            200,
            json={"data": {"is_valid": True, "expires_at": 1800000000, "scopes": ["instagram_basic"]}},
        )

    client = _client(handler)

    # Act
    info = await auth.inspect_token("token", get_settings(), http_client=client)
    await client.aclose()

    # Assert
    assert info["valid"] is True
    assert info["source"] == "debug_token"


# ------------------------------------------------------------------ hesap bulma
async def test_instagram_kipinde_hesap_kimligi_me_ile_bulunur(
    app_settings: Settings,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"id": "17841400000000000", "username": "ornek"})

    client = _client(handler)

    ig_id = await auth.discover_ig_user_id("token", app_settings, http_client=client)
    await client.aclose()

    assert ig_id == "17841400000000000"


async def test_facebook_kipinde_sayfaya_bagli_hesap_bulunur(
    app_settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    monkeypatch.setenv("INSTAGRAM_LOGIN_MODE", "facebook")
    get_settings.cache_clear()

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "data": [
                    {"name": "Bağsız sayfa"},
                    {
                        "name": "Bağlı sayfa",
                        "instagram_business_account": {"id": "17841400000000000"},
                    },
                ]
            },
        )

    client = _client(handler)

    # Act
    ig_id = await auth.discover_ig_user_id("token", get_settings(), http_client=client)
    await client.aclose()

    # Assert
    assert ig_id == "17841400000000000"


async def test_bagli_hesap_yoksa_ne_yapilacagi_soylenir(
    app_settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("INSTAGRAM_LOGIN_MODE", "facebook")
    get_settings.cache_clear()

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"data": [{"name": "Bağsız sayfa"}]})

    client = _client(handler)

    with pytest.raises(InstagramAPIError, match="Facebook sayfasına bağlayın"):
        await auth.discover_ig_user_id("token", get_settings(), http_client=client)
    await client.aclose()


# -------------------------------------------------------------------- yardımcı
def test_bitis_tarihi_bilinmiyorsa_gun_hesaplanmaz() -> None:
    assert auth.token_days_left(None) is None
