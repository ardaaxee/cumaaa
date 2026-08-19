"""İçerik türlerine göre container parametreleri.

Meta'nın beklediği alan adları burada sabitlenir; bir tür yanlış
parametrelerle gönderilirse test kırılır.
"""

from __future__ import annotations

import httpx
import pytest

from app.config import get_settings
from app.errors import PublishingError, UnsupportedFeatureError
from app.instagram.publishing import PublishingService, PublishRequest


def _form(request: httpx.Request) -> dict[str, str]:
    """POST gövdesini sözlüğe çevirir."""
    return dict(httpx.QueryParams(request.content.decode()))


async def test_gorsel_container_image_url_kullanir(
    mock_client_factory, publish_handler
) -> None:
    # Arrange
    captured: list[dict[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path.endswith("/media"):
            captured.append(_form(request))
        return publish_handler(request)

    client = mock_client_factory(handler)

    # Act
    async with client:
        await PublishingService(client, get_settings()).publish(
            PublishRequest(
                content_type="image",
                media_url="https://cdn.example/a.jpg",
                caption="açıklama",
            )
        )

    # Assert
    assert captured[0] == {"image_url": "https://cdn.example/a.jpg", "caption": "açıklama"}


async def test_hikaye_stories_turunu_kullanir(mock_client_factory, publish_handler) -> None:
    captured: list[dict[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path.endswith("/media"):
            captured.append(_form(request))
        return publish_handler(request)

    client = mock_client_factory(handler)

    async with client:
        await PublishingService(client, get_settings()).publish(
            PublishRequest(content_type="story", media_url="https://cdn.example/a.jpg")
        )

    assert captured[0]["media_type"] == "STORIES"
    assert captured[0]["image_url"] == "https://cdn.example/a.jpg"
    # Hikâyelerde açıklama gösterilmez; boşuna gönderilmemeli.
    assert "caption" not in captured[0]


async def test_hikaye_video_ise_video_url_kullanir(
    mock_client_factory, publish_handler
) -> None:
    captured: list[dict[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path.endswith("/media"):
            captured.append(_form(request))
        return publish_handler(request)

    client = mock_client_factory(handler)

    async with client:
        await PublishingService(client, get_settings()).publish(
            PublishRequest(content_type="story", media_url="https://cdn.example/a.mp4")
        )

    assert captured[0]["video_url"] == "https://cdn.example/a.mp4"


async def test_video_turu_reels_olarak_gonderilir(
    mock_client_factory, publish_handler
) -> None:
    """Meta akış videolarını Reels olarak işliyor; ayrı bir tür yok."""
    captured: list[dict[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path.endswith("/media"):
            captured.append(_form(request))
        return publish_handler(request)

    client = mock_client_factory(handler)

    async with client:
        await PublishingService(client, get_settings()).publish(
            PublishRequest(content_type="video", media_url="https://cdn.example/a.mp4")
        )

    assert captured[0]["media_type"] == "REELS"


async def test_reels_kapak_adresi_gonderilir(mock_client_factory, publish_handler) -> None:
    captured: list[dict[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path.endswith("/media"):
            captured.append(_form(request))
        return publish_handler(request)

    client = mock_client_factory(handler)

    async with client:
        await PublishingService(client, get_settings()).publish(
            PublishRequest(
                content_type="reels",
                media_url="https://cdn.example/a.mp4",
                cover_url="https://cdn.example/kapak.jpg",
                share_to_feed=False,
            )
        )

    assert captured[0]["cover_url"] == "https://cdn.example/kapak.jpg"
    assert captured[0]["share_to_feed"] == "false"


async def test_carousel_once_cocuk_sonra_ana_container_olusturur(
    mock_client_factory,
) -> None:
    # Arrange
    captured: list[dict[str, str]] = []
    child_ids = iter(["child-1", "child-2"])

    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if request.method == "POST" and path.endswith("/media"):
            form = _form(request)
            captured.append(form)
            if form.get("is_carousel_item") == "true":
                return httpx.Response(200, json={"id": next(child_ids)})
            return httpx.Response(200, json={"id": "parent-1"})
        if request.method == "POST" and path.endswith("/media_publish"):
            return httpx.Response(200, json={"id": "media-1"})
        if path.rsplit("/", 1)[-1] in {"child-1", "child-2", "parent-1"}:
            return httpx.Response(200, json={"status_code": "FINISHED"})
        return httpx.Response(200, json={"id": "media-1", "permalink": "https://x/"})

    client = mock_client_factory(handler)

    # Act
    async with client:
        outcome = await PublishingService(client, get_settings()).publish(
            PublishRequest(
                content_type="carousel",
                caption="albüm",
                children_urls=["https://cdn.example/1.jpg", "https://cdn.example/2.jpg"],
            )
        )

    # Assert
    assert [form.get("is_carousel_item") for form in captured[:2]] == ["true", "true"]
    assert captured[2]["media_type"] == "CAROUSEL"
    assert captured[2]["children"] == "child-1,child-2"
    assert captured[2]["caption"] == "albüm"
    assert outcome.ig_media_id == "media-1"


async def test_carousel_on_ogeden_fazla_olamaz(mock_client_factory, publish_handler) -> None:
    client = mock_client_factory(publish_handler)

    async with client:
        with pytest.raises(PublishingError, match="2-10"):
            await PublishingService(client, get_settings()).publish(
                PublishRequest(
                    content_type="carousel",
                    children_urls=[f"https://cdn.example/{i}.jpg" for i in range(11)],
                )
            )


async def test_bilinmeyen_tur_desteklenmiyor_der(mock_client_factory, publish_handler) -> None:
    client = mock_client_factory(publish_handler)

    async with client:
        with pytest.raises(UnsupportedFeatureError, match="desteklenmiyor"):
            await PublishingService(client, get_settings()).publish(
                PublishRequest(content_type="canli_yayin", media_url="https://x/a.jpg")
            )


async def test_container_suresi_dolarsa_anlasilir_hata(mock_client_factory) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path.endswith("/media"):
            return httpx.Response(200, json={"id": "container-1"})
        return httpx.Response(200, json={"status_code": "EXPIRED"})

    client = mock_client_factory(handler)

    async with client:
        with pytest.raises(PublishingError, match="süresi doldu"):
            await PublishingService(client, get_settings()).publish(
                PublishRequest(content_type="image", media_url="https://cdn.example/a.jpg")
            )


async def test_islenmeyi_bekleyen_container_zaman_asimina_ugrar(
    mock_client_factory, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange — video hiç hazır olmuyor
    settings = get_settings()
    monkeypatch.setattr(settings, "container_poll_attempts", 2)
    monkeypatch.setattr(settings, "container_poll_interval_seconds", 0.01)

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path.endswith("/media"):
            return httpx.Response(200, json={"id": "container-1"})
        return httpx.Response(200, json={"status_code": "IN_PROGRESS"})

    client = mock_client_factory(handler)

    # Act / Assert
    async with client:
        with pytest.raises(PublishingError, match="işlenmedi"):
            await PublishingService(client, get_settings()).publish(
                PublishRequest(content_type="reels", media_url="https://cdn.example/a.mp4")
            )


async def test_yayin_kotasi_okunur(mock_client_factory) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200, json={"data": [{"config": {"quota_total": 50}, "quota_usage": 3}]}
        )

    async with mock_client_factory(handler) as client:
        limit = await PublishingService(client, get_settings()).get_publishing_limit()

    assert limit["quota_usage"] == 3
    assert limit["config"]["quota_total"] == 50


async def test_son_gonderiler_listelenir(mock_client_factory) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"data": [{"id": "1"}, {"id": "2"}]})

    async with mock_client_factory(handler) as client:
        media = await PublishingService(client, get_settings()).list_media(limit=5)

    assert len(media) == 2


async def test_medya_ayrintisi_alinamazsa_yayin_bozulmaz(mock_client_factory) -> None:
    """Yayın başarılıysa, ayrıntı çağrısının hatası sonucu geçersiz kılmamalı."""
    # Arrange
    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if request.method == "POST" and path.endswith("/media_publish"):
            return httpx.Response(200, json={"id": "media-1"})
        if request.method == "POST" and path.endswith("/media"):
            return httpx.Response(200, json={"id": "container-1"})
        if path.endswith("/container-1"):
            return httpx.Response(200, json={"status_code": "FINISHED"})
        # Ayrıntı çağrısı hata veriyor
        return httpx.Response(400, json={"error": {"message": "alan okunamadı"}})

    client = mock_client_factory(handler)

    # Act
    async with client:
        outcome = await PublishingService(client, get_settings()).publish(
            PublishRequest(content_type="image", media_url="https://cdn.example/a.jpg")
        )

    # Assert
    assert outcome.ig_media_id == "media-1"
    assert outcome.permalink == ""
