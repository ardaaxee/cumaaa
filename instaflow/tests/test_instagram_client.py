"""Instagram istemcisi testleri — tamamı mock HTTP üzerinden.

Hiçbir test gerçek bir Instagram hesabına istek göndermez.
"""

from __future__ import annotations

import httpx
import pytest

from app.config import Settings, get_settings
from app.errors import (
    InstagramAPIError,
    InstagramAuthError,
    InstagramRateLimitError,
    NotConfiguredError,
)
from app.instagram.client import InstagramClient
from app.instagram.insights import InsightsService
from app.instagram.publishing import PublishingService, PublishRequest


async def test_basarili_istek_json_dondurur(mock_client_factory) -> None:
    # Arrange
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"id": "123", "username": "ornek"})

    client = mock_client_factory(handler)

    # Act
    async with client:
        result = await client.get("me")

    # Assert
    assert result["username"] == "ornek"


async def test_token_istek_parametresine_eklenir(mock_client_factory) -> None:
    seen: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["token"] = request.url.params.get("access_token", "")
        return httpx.Response(200, json={"ok": True})

    async with mock_client_factory(handler) as client:
        await client.get("me")

    assert seen["token"] == "test-token-not-a-real-secret"


async def test_401_yetki_hatasina_cevrilir(mock_client_factory) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            401,
            json={"error": {"message": "Invalid OAuth token", "code": 190, "error_subcode": 463}},
        )

    async with mock_client_factory(handler) as client:
        with pytest.raises(InstagramAuthError, match="süresi dolmuş"):
            await client.get("me")


async def test_izin_hatasi_anlasilir_mesaj_verir(mock_client_factory) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403, json={"error": {"message": "Missing permission scope", "code": 200}}
        )

    async with mock_client_factory(handler) as client:
        with pytest.raises(InstagramAuthError, match="izin"):
            await client.get("me")


async def test_429_saldirgan_sekilde_tekrar_denenmez(
    mock_client_factory, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange — beklemeyi hızlandır
    settings = get_settings()
    monkeypatch.setattr(settings, "rate_limit_backoff_seconds", 0.01)
    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        return httpx.Response(429, json={"error": {"message": "rate limited", "code": 4}})

    # Act / Assert
    async with mock_client_factory(handler) as client:
        with pytest.raises(InstagramRateLimitError, match="kota"):
            await client.get("me")

    # Varsayılan rate_limit_max_retries=1 → toplam 2 istek, daha fazlası değil.
    assert calls["count"] == settings.rate_limit_max_retries + 1


async def test_sunucu_hatasi_tekrar_denenir(
    mock_client_factory, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    settings = get_settings()
    monkeypatch.setattr(settings, "http_backoff_base_seconds", 0.01)
    monkeypatch.setattr(settings, "http_max_retries", 2)
    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        if calls["count"] < 3:
            return httpx.Response(500, json={"error": {"message": "sunucu hatası"}})
        return httpx.Response(200, json={"id": "ok"})

    # Act
    async with mock_client_factory(handler) as client:
        result = await client.get("me")

    # Assert
    assert result["id"] == "ok"
    assert calls["count"] == 3


async def test_400_tekrar_denenmez(
    mock_client_factory, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        return httpx.Response(
            400, json={"error": {"message": "geçersiz parametre", "code": 100}}
        )

    async with mock_client_factory(handler) as client:
        with pytest.raises(InstagramAPIError, match="reddetti"):
            await client.get("me")

    assert calls["count"] == 1


async def test_ag_hatasi_yakalanir(monkeypatch: pytest.MonkeyPatch) -> None:
    # Arrange
    settings = get_settings()
    monkeypatch.setattr(settings, "http_backoff_base_seconds", 0.01)
    monkeypatch.setattr(settings, "http_max_retries", 1)

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("ağ yok")

    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient("t", "u", settings=settings, http_client=http_client)

    # Act / Assert
    with pytest.raises(InstagramAPIError, match="bağlanılamadı"):
        await client.get("me")
    await http_client.aclose()


def test_kimlik_bilgisi_yoksa_istemci_kurulamaz(isolated_env: Settings) -> None:
    with pytest.raises(NotConfiguredError, match="yapılandırılmamış"):
        InstagramClient.from_settings(isolated_env)


# ---------------------------------------------------------------- yayınlama
async def test_yayin_akisi_container_ve_publish_cagirir(
    mock_client_factory, publish_handler
) -> None:
    # Arrange
    client = mock_client_factory(publish_handler)
    service = PublishingService(client, get_settings())

    # Act
    async with client:
        outcome = await service.publish(
            PublishRequest(
                content_type="image",
                caption="merhaba",
                media_url="https://example.com/a.jpg",
            )
        )

    # Assert
    assert outcome.ig_media_id == "media-1"
    assert outcome.container_id == "container-1"
    assert outcome.permalink.startswith("https://")


async def test_medya_adresi_yoksa_yayin_reddedilir(mock_client_factory, publish_handler) -> None:
    client = mock_client_factory(publish_handler)
    service = PublishingService(client, get_settings())

    async with client:
        with pytest.raises(Exception, match="herkese açık"):
            await service.publish(PublishRequest(content_type="image", caption="x"))


async def test_carousel_oge_sayisi_dogrulanir(mock_client_factory, publish_handler) -> None:
    client = mock_client_factory(publish_handler)
    service = PublishingService(client, get_settings())

    async with client:
        with pytest.raises(Exception, match="Carousel"):
            await service.publish(
                PublishRequest(
                    content_type="carousel", children_urls=["https://example.com/a.jpg"]
                )
            )


async def test_container_hatasi_yayini_durdurur(mock_client_factory) -> None:
    # Arrange
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/media"):
            return httpx.Response(200, json={"id": "container-1"})
        if request.url.path.endswith("/container-1"):
            return httpx.Response(
                200, json={"status_code": "ERROR", "status": "Medya indirilemedi"}
            )
        return httpx.Response(200, json={})

    client = mock_client_factory(handler)
    service = PublishingService(client, get_settings())

    # Act / Assert
    async with client:
        with pytest.raises(Exception, match="işleyemedi"):
            await service.publish(
                PublishRequest(
                    content_type="image", media_url="https://example.com/a.jpg"
                )
            )


async def test_reels_container_dogru_parametrelerle_olusturulur(
    mock_client_factory, publish_handler
) -> None:
    # Arrange
    captured: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/media") and request.method == "POST":
            captured.update(dict(httpx.QueryParams(request.content.decode())))
        return publish_handler(request)

    client = mock_client_factory(handler)
    service = PublishingService(client, get_settings())

    # Act
    async with client:
        await service.publish(
            PublishRequest(
                content_type="reels",
                media_url="https://example.com/klip.mp4",
                caption="reels açıklaması",
            )
        )

    # Assert
    assert captured["media_type"] == "REELS"
    assert captured["video_url"] == "https://example.com/klip.mp4"
    assert captured["share_to_feed"] == "true"


# ---------------------------------------------------------------- insights
async def test_insights_degerleri_ayristirilir(mock_client_factory) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "data": [
                    {"name": "reach", "values": [{"value": 120}]},
                    {"name": "likes", "total_value": {"value": 34}},
                ]
            },
        )

    async with mock_client_factory(handler) as client:
        result = await InsightsService(client, get_settings()).get_media_insights(
            "media-1", metrics=("reach", "likes")
        )

    assert result.values == {"reach": 120.0, "likes": 34.0}
    assert result.unsupported == {}


async def test_desteklenmeyen_metrik_raporlanir(mock_client_factory) -> None:
    # Arrange — toplu istek reddedilir, tek tek denendiğinde biri hata verir
    def handler(request: httpx.Request) -> httpx.Response:
        metric = request.url.params.get("metric", "")
        if "," in metric:
            return httpx.Response(
                400, json={"error": {"message": "metric impressions is deprecated", "code": 100}}
            )
        if metric == "impressions":
            return httpx.Response(
                400, json={"error": {"message": "impressions is deprecated", "code": 100}}
            )
        return httpx.Response(200, json={"data": [{"name": metric, "values": [{"value": 7}]}]})

    # Act
    async with mock_client_factory(handler) as client:
        result = await InsightsService(client, get_settings()).get_media_insights(
            "media-1", metrics=("reach", "impressions")
        )

    # Assert — desteklenen metrik gelir, desteklenmeyen uydurulmaz
    assert result.values == {"reach": 7.0}
    assert "impressions" in result.unsupported
