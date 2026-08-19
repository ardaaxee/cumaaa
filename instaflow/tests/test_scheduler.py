"""Scheduler testleri."""

from __future__ import annotations

from datetime import timedelta

import pytest
from sqlalchemy import func, select

from app.config import Settings, get_settings
from app.database import session_scope
from app.models import Content, ContentStatus, PublishedPost
from app.schemas import ContentCreate
from app.scheduler import jobs
from app.services import content_service
from app.timeutils import utcnow


def test_scheduler_uc_isi_kaydeder(isolated_env: Settings) -> None:
    scheduler = jobs.create_scheduler(isolated_env)

    job_ids = {job.id for job in scheduler.get_jobs()}

    assert job_ids == {jobs.JOB_PUBLISH, jobs.JOB_ANALYTICS, jobs.JOB_TOKEN}


def test_yayin_isi_yapilandirilan_aralikla_calisir(
    isolated_env: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(isolated_env, "scheduler_interval_seconds", 30)

    scheduler = jobs.create_scheduler(isolated_env)
    publish_job = scheduler.get_job(jobs.JOB_PUBLISH)

    assert publish_job.trigger.interval.total_seconds() == 30
    # Aynı iş üst üste binmemeli.
    assert publish_job.max_instances == 1


def test_scheduler_utc_calisir(isolated_env: Settings) -> None:
    """Yerel saat dilimi değişse de zamanlama UTC üzerinden yürür."""
    scheduler = jobs.create_scheduler(isolated_env)

    assert str(scheduler.timezone) == "UTC"


def test_calismiyorken_is_listesi_bos(isolated_env: Settings) -> None:
    jobs.shutdown_scheduler()

    assert jobs.is_running() is False
    assert jobs.job_summary() == []


async def test_baslatma_ve_durdurma(isolated_env: Settings) -> None:
    # Act
    scheduler = jobs.start_scheduler(isolated_env)

    try:
        # Assert
        assert jobs.is_running() is True
        assert len(jobs.job_summary()) == 3
        # İkinci çağrı aynı örneği döndürmeli.
        assert jobs.start_scheduler(isolated_env) is scheduler
    finally:
        jobs.shutdown_scheduler()

    assert jobs.is_running() is False


async def test_yayin_isi_zamani_geleni_yayinlar(
    configured_settings: Settings, mock_client_factory, publish_handler, monkeypatch
) -> None:
    # Arrange
    with session_scope() as session:
        content = content_service.create_content(
            session,
            ContentCreate(title="Zamanı gelen", media_url="https://cdn.example/a.jpg"),
        )
        content_service.schedule_content(
            session, content.id, utcnow() - timedelta(seconds=10)
        )
        content_id = content.id

    client = mock_client_factory(publish_handler)

    # publish_due varsayılan olarak kendi istemcisini kurar; mock'u enjekte et.
    from app.services import publishing_service

    original = publishing_service.publish_due

    async def patched(**kwargs):
        return await original(client=client, settings=configured_settings)

    monkeypatch.setattr(publishing_service, "publish_due", patched)

    # Act
    async with client:
        await jobs.publish_due_job()

    # Assert
    with session_scope() as session:
        assert session.get(Content, content_id).status == ContentStatus.PUBLISHED.value
        assert session.scalar(select(func.count(PublishedPost.id))) == 1


async def test_yayin_isi_hata_yutmaz_ama_cokmez(
    isolated_env: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Bir iş patlasa bile scheduler ayakta kalmalı."""
    # Arrange
    from app.services import publishing_service

    async def exploding(**kwargs):
        raise RuntimeError("beklenmedik hata")

    monkeypatch.setattr(publishing_service, "publish_due", exploding)

    # Act — istisna dışarı sızmamalı
    await jobs.publish_due_job()

    # Assert — hata log tablosuna yazılmış olmalı
    from app.models import LogEntry

    with session_scope() as session:
        errors = list(session.scalars(select(LogEntry).where(LogEntry.level == "ERROR")))
    assert any("beklenmedik hata" in entry.message for entry in errors)


async def test_token_kontrolu_bilgi_yoksa_sessizce_gecer(isolated_env: Settings) -> None:
    # Token bilgisi olmadan çağrı hata vermemeli.
    await jobs.token_check_job()


async def test_istatistik_isi_kimlik_bilgisi_yoksa_cokmez(isolated_env: Settings) -> None:
    await jobs.sync_analytics_job()


def test_token_yenileme_esigi() -> None:
    from app.instagram.auth import should_refresh, token_days_left

    yakin = utcnow() + timedelta(days=3)
    uzak = utcnow() + timedelta(days=50)

    assert should_refresh(yakin) is True
    assert should_refresh(uzak) is False
    assert should_refresh(None) is False
    assert token_days_left(uzak) == 49
