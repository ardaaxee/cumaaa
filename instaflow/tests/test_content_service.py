"""İçerik oluşturma ve planlama testleri."""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path

import pytest

from app.config import Settings
from app.database import session_scope
from app.errors import InstaFlowError, MediaValidationError
from app.models import ContentStatus, ContentType, ScheduleStatus
from app.schemas import ContentCreate, ContentUpdate
from app.services import content_service
from app.timeutils import parse_local, to_local, utcnow


def _create(session, **kwargs):
    payload = ContentCreate(**{"title": "Test içerik", **kwargs})
    return content_service.create_content(session, payload)


def test_icerik_taslak_olarak_olusur(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session, caption="merhaba", hashtags="#test")

        assert content.id is not None
        assert content.status == ContentStatus.DRAFT.value
        assert content.published_at is None


def test_caption_ve_hashtag_birlestirilir(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session, caption="metin", hashtags="#a #b")

        assert content.full_caption == "metin\n\n#a #b"


def test_gecersiz_medya_yolu_veritabanina_girmez(isolated_env: Settings) -> None:
    with session_scope() as session:
        with pytest.raises(MediaValidationError):
            _create(session, media_path="drafts/olmayan.jpg")

        assert content_service.list_contents(session) == []


def test_yerel_medya_dogrulanir_ve_goreli_kaydedilir(
    isolated_env: Settings, jpeg_file: Path
) -> None:
    with session_scope() as session:
        content = _create(session, media_path="drafts/ornek.jpg")

        assert content.media_path == "drafts/ornek.jpg"


def test_https_olmayan_medya_adresi_reddedilir(isolated_env: Settings) -> None:
    with pytest.raises(ValueError, match="https"):
        ContentCreate(media_url="http://example.com/a.jpg")


def test_hashtag_siniri_uygulanir(isolated_env: Settings) -> None:
    too_many = " ".join(f"#etiket{i}" for i in range(31))

    with pytest.raises(ValueError, match="30"):
        ContentCreate(hashtags=too_many)


def test_icerik_guncellenir(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session)
        updated = content_service.update_content(
            session, content.id, ContentUpdate(title="Yeni başlık")
        )

        assert updated.title == "Yeni başlık"


def test_yayinlanmis_icerik_duzenlenemez(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session)
        content.status = ContentStatus.PUBLISHED.value
        session.flush()

        with pytest.raises(InstaFlowError, match="düzenlenemez"):
            content_service.update_content(session, content.id, ContentUpdate(title="x"))


def test_yayinlanmis_icerik_silinemez(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session)
        content.status = ContentStatus.PUBLISHED.value
        session.flush()

        with pytest.raises(InstaFlowError, match="silinemez"):
            content_service.delete_content(session, content.id)


def test_olmayan_icerik_acik_hata_verir(isolated_env: Settings) -> None:
    with session_scope() as session:
        with pytest.raises(InstaFlowError, match="bulunamadı"):
            content_service.require_content(session, 9999)


# ------------------------------------------------------------------ planlama
def test_planlama_durumu_gunceller(isolated_env: Settings) -> None:
    when = utcnow() + timedelta(hours=2)

    with session_scope() as session:
        content = _create(session)
        schedule = content_service.schedule_content(session, content.id, when)

        assert content.status == ContentStatus.SCHEDULED.value
        assert schedule.status == ScheduleStatus.PENDING.value
        assert schedule.idempotency_key


def test_gecmise_planlanamaz(isolated_env: Settings) -> None:
    past = utcnow() - timedelta(hours=1)

    with session_scope() as session:
        content = _create(session)

        with pytest.raises(InstaFlowError, match="geçmişte"):
            content_service.schedule_content(session, content.id, past)


def test_ayni_icerik_iki_kez_kuyruga_girmez(isolated_env: Settings) -> None:
    # Arrange
    first_time = utcnow() + timedelta(hours=2)
    second_time = utcnow() + timedelta(hours=5)

    # Act — aynı içerik iki kez planlanır
    with session_scope() as session:
        content = _create(session)
        first = content_service.schedule_content(session, content.id, first_time)
        second = content_service.schedule_content(session, content.id, second_time)

        # Assert — yeni kayıt açılmaz, var olan güncellenir
        assert first.id == second.id
        assert second.scheduled_at == second_time
        pending = content_service.due_schedules(
            session, now=second_time + timedelta(minutes=1)
        )
        assert len(pending) == 1


def test_idempotency_anahtari_icerik_ve_dakikaya_bagli() -> None:
    moment = utcnow()

    same = content_service.make_idempotency_key(1, moment)
    same_again = content_service.make_idempotency_key(1, moment)
    different_content = content_service.make_idempotency_key(2, moment)
    different_time = content_service.make_idempotency_key(1, moment + timedelta(hours=1))

    assert same == same_again
    assert same != different_content
    assert same != different_time


def test_plan_iptali_taslaga_dondurur(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session)
        content_service.schedule_content(session, content.id, utcnow() + timedelta(hours=1))

        content_service.cancel_schedule(session, content.id)

        assert content.status == ContentStatus.DRAFT.value
        assert content.scheduled_at is None


def test_bekleyen_plan_yoksa_iptal_hata_verir(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session)

        with pytest.raises(InstaFlowError, match="bekleyen"):
            content_service.cancel_schedule(session, content.id)


def test_zamani_gelmeyen_plan_dondurulmez(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session)
        content_service.schedule_content(session, content.id, utcnow() + timedelta(hours=3))

        assert content_service.due_schedules(session) == []


def test_zamani_gelen_plan_dondurulur(isolated_env: Settings) -> None:
    when = utcnow() + timedelta(minutes=5)

    with session_scope() as session:
        content = _create(session)
        content_service.schedule_content(session, content.id, when)

        due = content_service.due_schedules(session, now=when + timedelta(seconds=1))

        assert len(due) == 1
        assert due[0].content_id == content.id


# ------------------------------------------------------------------ sayaçlar
def test_durum_sayaclari_hesaplanir(isolated_env: Settings) -> None:
    with session_scope() as session:
        _create(session)
        second = _create(session)
        second.status = ContentStatus.FAILED.value
        session.flush()

        counts = content_service.count_by_status(session)

        assert counts["draft"] == 1
        assert counts["failed"] == 1
        assert counts["total"] == 2


def test_bugun_kovasi_yerel_gune_gore_dolar(isolated_env: Settings) -> None:
    # Arrange — yerel saatle bugünün ilerleyen bir saati
    now_local = to_local(utcnow())
    assert now_local is not None
    later_today = now_local.replace(hour=23, minute=30, second=0, microsecond=0)
    if later_today <= now_local:
        pytest.skip("Gün sonuna çok yakın; bu test anlamlı değil.")

    with session_scope() as session:
        content = _create(session)
        content_service.schedule_content(
            session, content.id, parse_local(later_today.strftime("%Y-%m-%d %H:%M"))
        )

        # Act
        buckets = content_service.dashboard_buckets(session)

        # Assert
        assert [item.id for item in buckets["today"]] == [content.id]


def test_takvim_gune_gore_gruplar(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(session)
        content_service.schedule_content(session, content.id, utcnow() + timedelta(days=2))

        entries = content_service.calendar_entries(session, days=30)

        assert len(entries) == 1
        day, items = entries[0]
        assert len(items) == 1
        assert len(day) == 10  # YYYY-AA-GG


def test_medya_durum_klasorune_tasinir(isolated_env: Settings, jpeg_file: Path) -> None:
    # Arrange
    with session_scope() as session:
        content = _create(session, media_path="drafts/ornek.jpg")
        content.status = ContentStatus.PUBLISHED.value

        # Act
        content_service.move_media_for_status(content, settings=isolated_env)

        # Assert
        assert content.media_path.startswith("published/")
        assert (isolated_env.content_dir / content.media_path).exists()


def test_public_base_url_yoksa_yayin_adresi_bos(
    isolated_env: Settings, jpeg_file: Path
) -> None:
    with session_scope() as session:
        content = _create(session, media_path="drafts/ornek.jpg")

        assert content_service.resolve_publish_url(content, settings=isolated_env) == ""


def test_public_base_url_ile_yayin_adresi_uretilir(
    isolated_env: Settings, jpeg_file: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(isolated_env, "public_base_url", "https://ornek.example")

    with session_scope() as session:
        content = _create(session, media_path="drafts/ornek.jpg")

        url = content_service.resolve_publish_url(content, settings=isolated_env)

        assert url == "https://ornek.example/media/drafts/ornek.jpg"


def test_media_url_yerel_dosyaya_tercih_edilir(
    isolated_env: Settings, jpeg_file: Path
) -> None:
    with session_scope() as session:
        content = _create(
            session,
            media_path="drafts/ornek.jpg",
            media_url="https://cdn.example/a.jpg",
        )

        assert (
            content_service.resolve_publish_url(content, settings=isolated_env)
            == "https://cdn.example/a.jpg"
        )


def test_carousel_turu_kabul_edilir(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = _create(
            session,
            type=ContentType.CAROUSEL,
            options={"children_urls": ["https://a.example/1.jpg", "https://a.example/2.jpg"]},
        )

        assert content.type == ContentType.CAROUSEL.value
        assert len(content.options["children_urls"]) == 2
