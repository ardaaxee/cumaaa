"""Yayınlama akışı ve mükerrer yayın koruması testleri.

Tüm Instagram çağrıları mock'lanmıştır; gerçek bir hesaba istek gitmez.
"""

from __future__ import annotations

from datetime import timedelta

import httpx
import pytest
from sqlalchemy import func, select

from app.config import Settings
from app.database import session_scope
from app.models import Content, ContentStatus, PublishedPost, ScheduledPost, ScheduleStatus
from app.schemas import ContentCreate
from app.services import content_service, publishing_service
from app.timeutils import utcnow


def _publishable(session, **kwargs) -> Content:
    """Yayınlanmaya hazır (medya adresi olan) bir içerik."""
    payload = ContentCreate(
        title="Yayınlanacak",
        caption="metin",
        media_url="https://cdn.example/a.jpg",
        **kwargs,
    )
    return content_service.create_content(session, payload)


async def test_yayin_basarili_kayit_olusturur(
    configured_settings: Settings, mock_client_factory, publish_handler
) -> None:
    # Arrange
    with session_scope() as session:
        content_id = _publishable(session).id
    client = mock_client_factory(publish_handler)

    # Act
    async with client:
        result = await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )

    # Assert
    assert result.success is True
    assert result.ig_media_id == "media-1"
    with session_scope() as session:
        content = session.get(Content, content_id)
        assert content.status == ContentStatus.PUBLISHED.value
        assert content.published_at is not None
        assert session.scalar(select(func.count(PublishedPost.id))) == 1


async def test_ayni_icerik_iki_kez_yayinlanmaz(
    configured_settings: Settings, mock_client_factory, publish_handler
) -> None:
    """Idempotency: ikinci çağrı atlanır ve ikinci bir gönderi oluşmaz."""
    # Arrange
    publish_calls = {"count": 0}

    def counting_handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/media_publish"):
            publish_calls["count"] += 1
        return publish_handler(request)

    with session_scope() as session:
        content_id = _publishable(session).id
    client = mock_client_factory(counting_handler)

    # Act — art arda iki yayın denemesi
    async with client:
        first = await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )
        second = await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )

    # Assert
    assert first.success is True
    assert second.success is False
    assert second.skipped is True
    assert "zaten yayınlanmış" in second.message
    assert publish_calls["count"] == 1

    with session_scope() as session:
        assert session.scalar(select(func.count(PublishedPost.id))) == 1


async def test_yayinlanan_icerik_tekrar_kilitlenemez(
    configured_settings: Settings, mock_client_factory, publish_handler
) -> None:
    """Durum kilidi: `publishing` durumundaki içerik ikinci kez alınamaz."""
    # Arrange
    with session_scope() as session:
        content = _publishable(session)
        content.status = ContentStatus.PUBLISHING.value
        content_id = content.id

    client = mock_client_factory(publish_handler)

    # Act
    async with client:
        result = await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )

    # Assert
    assert result.skipped is True
    with session_scope() as session:
        assert session.scalar(select(func.count(PublishedPost.id))) == 0


async def test_medya_adresi_yoksa_basarisiz_isaretlenir(
    configured_settings: Settings, mock_client_factory, publish_handler
) -> None:
    """Yapılandırma eksikliği sonsuz döngüye girmemeli."""
    # Arrange
    with session_scope() as session:
        content = content_service.create_content(
            session, ContentCreate(title="Medyasız", caption="x")
        )
        content_id = content.id

    client = mock_client_factory(publish_handler)

    # Act
    async with client:
        result = await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )

    # Assert
    assert result.success is False
    assert "medya" in result.message.lower()
    with session_scope() as session:
        assert session.get(Content, content_id).status == ContentStatus.FAILED.value


async def test_yerel_dosya_icin_acik_uyari_verilir(
    configured_settings: Settings, mock_client_factory, publish_handler, jpeg_file
) -> None:
    """Yerel dosya doğrudan yüklenemez — bu açıkça söylenmeli."""
    # Arrange
    with session_scope() as session:
        content = content_service.create_content(
            session, ContentCreate(title="Yerel", media_path="drafts/ornek.jpg")
        )
        content_id = content.id

    client = mock_client_factory(publish_handler)

    # Act
    async with client:
        result = await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )

    # Assert
    assert result.success is False
    assert "URL" in result.message
    assert "PUBLIC_BASE_URL" in result.message


async def test_api_hatasi_yeniden_denemeye_birakir(
    configured_settings: Settings, mock_client_factory, monkeypatch: pytest.MonkeyPatch
) -> None:
    """İlk deneme başarısız olursa içerik yeniden denenmek üzere planlı kalır."""
    # Arrange
    monkeypatch.setattr(configured_settings, "http_backoff_base_seconds", 0.01)

    def failing(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            400, json={"error": {"message": "medya indirilemedi", "code": 100}}
        )

    with session_scope() as session:
        content = _publishable(session)
        content_service.schedule_content(
            session, content.id, utcnow() + timedelta(minutes=1)
        )
        content_id = content.id

    client = mock_client_factory(failing)

    # Act
    async with client:
        result = await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )

    # Assert
    assert result.success is False
    with session_scope() as session:
        content = session.get(Content, content_id)
        schedule = session.scalar(
            select(ScheduledPost).where(ScheduledPost.content_id == content_id)
        )
        assert schedule.attempts == 1
        assert schedule.status == ScheduleStatus.PENDING.value
        assert content.status == ContentStatus.SCHEDULED.value
        assert "medya indirilemedi" in content.error_message


async def test_deneme_hakki_bitince_basarisiz_olur(
    configured_settings: Settings, mock_client_factory, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    monkeypatch.setattr(configured_settings, "publish_max_attempts", 1)
    monkeypatch.setattr(configured_settings, "http_backoff_base_seconds", 0.01)

    def failing(request: httpx.Request) -> httpx.Response:
        return httpx.Response(400, json={"error": {"message": "kalıcı hata", "code": 100}})

    with session_scope() as session:
        content = _publishable(session)
        content_service.schedule_content(
            session, content.id, utcnow() + timedelta(minutes=1)
        )
        content_id = content.id

    client = mock_client_factory(failing)

    # Act
    async with client:
        await publishing_service.publish_content(
            content_id, client=client, settings=configured_settings
        )

    # Assert
    with session_scope() as session:
        content = session.get(Content, content_id)
        schedule = session.scalar(
            select(ScheduledPost).where(ScheduledPost.content_id == content_id)
        )
        assert content.status == ContentStatus.FAILED.value
        assert schedule.status == ScheduleStatus.FAILED.value


async def test_gunluk_sinir_asilirsa_yayin_durur(
    configured_settings: Settings,
    mock_client_factory,
    publish_handler,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange — sınırı 1'e çek, bir gönderi zaten yayınlanmış olsun
    monkeypatch.setattr(configured_settings, "daily_publish_guard", 1)
    with session_scope() as session:
        first = _publishable(session)
        session.add(PublishedPost(content_id=first.id, ig_media_id="onceki"))
        second = _publishable(session)
        second_id = second.id

    client = mock_client_factory(publish_handler)

    # Act
    async with client:
        result = await publishing_service.publish_content(
            second_id, client=client, settings=configured_settings
        )

    # Assert
    assert result.success is False
    assert "güvenlik sınırı" in result.message


async def test_kimlik_bilgisi_yoksa_anlasilir_hata(
    isolated_env: Settings, mock_client_factory, publish_handler
) -> None:
    # Arrange — configured_settings kullanılmıyor, yani token yok
    with session_scope() as session:
        content_id = _publishable(session).id

    # Act
    result = await publishing_service.publish_content(content_id, settings=isolated_env)

    # Assert
    assert result.success is False
    assert "yapılandırılmamış" in result.message


async def test_zamani_gelenler_toplu_yayinlanir(
    configured_settings: Settings, mock_client_factory, publish_handler
) -> None:
    # Arrange — biri zamanı gelmiş, biri gelmemiş iki plan
    with session_scope() as session:
        due = _publishable(session)
        content_service.schedule_content(session, due.id, utcnow() - timedelta(seconds=30))
        later = _publishable(session)
        content_service.schedule_content(session, later.id, utcnow() + timedelta(days=1))
        due_id, later_id = due.id, later.id

    client = mock_client_factory(publish_handler)

    # Act
    async with client:
        results = await publishing_service.publish_due(
            client=client, settings=configured_settings
        )

    # Assert
    assert len(results) == 1
    assert results[0].content_id == due_id
    with session_scope() as session:
        assert session.get(Content, due_id).status == ContentStatus.PUBLISHED.value
        assert session.get(Content, later_id).status == ContentStatus.SCHEDULED.value
