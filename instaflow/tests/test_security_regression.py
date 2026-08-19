"""Güvenlik ve kararlılık regresyon testleri.

Bu dosyadaki her test, denetimde **gerçekten bulunmuş** bir açığa veya
hataya karşılık gelir. Amaç, aynı hatanın sessizce geri gelmemesidir.
"""

from __future__ import annotations

from collections.abc import Iterator
from datetime import timedelta
from io import BytesIO
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.config import Settings, get_settings
from app.database import session_scope
from app.errors import InstaFlowError, MediaValidationError
from app.instagram.media import store_upload_stream
from app.models import (
    Content,
    ContentStatus,
    PublishedPost,
    ScheduledPost,
    ScheduleStatus,
    is_valid_transition,
)
from app.schemas import ContentCreate
from app.security import redact_secrets, same_origin
from app.services import content_service
from app.timeutils import utcnow
from tests.conftest import TINY_JPEG

ATTACKER_ORIGIN = "https://saldirgan.example"


@pytest.fixture
def client(isolated_env: Settings, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setenv("RUN_SCHEDULER", "0")
    from app.main import create_app

    with TestClient(create_app()) as test_client:
        yield test_client


def _content_id() -> int:
    with session_scope() as session:
        return content_service.create_content(session, ContentCreate(title="hedef")).id


# ===========================================================================
# 1. Çapraz kaynaklı yazma (CSRF) — JSON API uçları korumasızdı.
# ===========================================================================
def test_capraz_kaynak_api_publish_reddedilir(client: TestClient) -> None:
    """Kötü niyetli bir sayfa, form POST'u ile yayın tetikleyebiliyordu."""
    # Arrange
    content_id = _content_id()

    # Act — tarayıcı çapraz kaynak POST'unda Origin gönderir
    response = client.post(
        f"/api/content/{content_id}/publish",
        headers={
            "Origin": ATTACKER_ORIGIN,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        content="",
    )

    # Assert
    assert response.status_code == 403
    assert response.json()["success"] is False


def test_capraz_kaynak_api_delete_reddedilir(client: TestClient) -> None:
    content_id = _content_id()

    response = client.request(
        "DELETE", f"/api/content/{content_id}", headers={"Origin": ATTACKER_ORIGIN}
    )

    assert response.status_code == 403
    with session_scope() as session:
        assert session.get(Content, content_id) is not None


def test_capraz_kaynak_web_formu_reddedilir(client: TestClient) -> None:
    response = client.post(
        "/content/create",
        data={"title": "izinsiz"},
        headers={"Origin": ATTACKER_ORIGIN},
    )

    assert response.status_code == 403
    with session_scope() as session:
        assert content_service.list_contents(session) == []


def test_capraz_kaynak_ai_ucu_reddedilir(client: TestClient) -> None:
    """Sorgu parametreli POST uçları gövde gerektirmediği için en kolay hedefti."""
    response = client.post(
        "/api/ai/caption",
        params={"topic": "test"},
        headers={"Origin": ATTACKER_ORIGIN},
    )

    assert response.status_code == 403


def test_ayni_kaynak_istegi_gecer(client: TestClient) -> None:
    """Panelin kendi formları çalışmaya devam etmeli."""
    response = client.post(
        "/api/ai/caption",
        params={"topic": "kahve demleme"},
        headers={"Origin": "http://testserver"},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True


def test_origin_olmayan_istek_gecer(client: TestClient) -> None:
    """curl ve CLI Origin göndermez; engellenmemeli."""
    response = client.post("/api/ai/caption", params={"topic": "kahve"})

    assert response.status_code == 200


def test_okuma_istekleri_capraz_kaynakta_da_calisir(client: TestClient) -> None:
    """Kısıt yalnızca durum değiştiren yöntemler için."""
    response = client.get("/api/status", headers={"Origin": ATTACKER_ORIGIN})

    assert response.status_code == 200


@pytest.mark.parametrize(
    ("origin", "base", "expected"),
    [
        ("http://127.0.0.1:8000", "http://127.0.0.1:8000/", True),
        ("http://127.0.0.1", "http://127.0.0.1:80/", True),
        ("https://ornek.example", "https://ornek.example:443/", True),
        ("http://127.0.0.1:8001", "http://127.0.0.1:8000/", False),
        ("https://127.0.0.1:8000", "http://127.0.0.1:8000/", False),
        ("http://kotu.example", "http://127.0.0.1:8000/", False),
        ("null", "http://127.0.0.1:8000/", False),
        ("", "http://127.0.0.1:8000/", False),
    ],
)
def test_kaynak_karsilastirmasi(origin: str, base: str, expected: bool) -> None:
    assert same_origin(origin, base) is expected


# ===========================================================================
# 2. Medya servisi — content/ altındaki her dosya servis ediliyordu.
# ===========================================================================
def test_medya_ucu_gecerli_gorseli_servis_eder(
    client: TestClient, isolated_env: Settings
) -> None:
    # Arrange
    target = isolated_env.content_dir / "drafts" / "kare.jpg"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(TINY_JPEG)

    # Act
    response = client.get("/media/drafts/kare.jpg")

    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.content == TINY_JPEG


@pytest.mark.parametrize("filename", ["gizli.env", "veri.db", "betik.sh", "notlar.txt"])
def test_medya_ucu_medya_disi_dosyalari_vermez(
    client: TestClient, isolated_env: Settings, filename: str
) -> None:
    """Dizine düşmüş bir yedek veya not dosyası dışarıya sızmamalı."""
    # Arrange
    target = isolated_env.content_dir / "drafts" / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"GIZLI=deger")

    # Act
    response = client.get(f"/media/drafts/{filename}")

    # Assert
    assert response.status_code == 404
    assert b"GIZLI" not in response.content


def test_medya_ucu_dizin_listelemez(client: TestClient) -> None:
    assert client.get("/media/drafts/").status_code == 404
    assert client.get("/media/").status_code == 404


@pytest.mark.parametrize(
    "path",
    [
        "/media/drafts/../../data/test.db",
        "/media/drafts/..%2f..%2fdata%2ftest.db",
        "/media/../.env",
        "/media/drafts/%2e%2e%2f%2e%2e%2f.env",
    ],
)
def test_medya_ucu_dizin_disina_cikamaz(client: TestClient, path: str) -> None:
    assert client.get(path).status_code == 404


def test_medya_ucu_izinsiz_alt_dizini_reddeder(
    client: TestClient, isolated_env: Settings
) -> None:
    # Arrange — content/ altında ama izin listesinde olmayan bir dizin
    secret_dir = isolated_env.content_dir / "ozel"
    secret_dir.mkdir(parents=True, exist_ok=True)
    (secret_dir / "kare.jpg").write_bytes(TINY_JPEG)

    # Act / Assert
    assert client.get("/media/ozel/kare.jpg").status_code == 404


def test_statik_dosyalar_ozel_veri_dizininde_de_calisir(client: TestClient) -> None:
    """DATA_DIR taşındığında /static 404 veriyordu (panel stilsiz kalıyordu)."""
    response = client.get("/static/style.css")

    assert response.status_code == 200
    assert "text/css" in response.headers["content-type"]


# ===========================================================================
# 3. Planlama — iptal sonrası aynı saate tekrar planlama çöküyordu.
# ===========================================================================
def test_iptal_sonrasi_ayni_saate_tekrar_planlanabilir(isolated_env: Settings) -> None:
    """Benzersiz idempotency anahtarı yüzünden IntegrityError alınıyordu."""
    # Arrange
    when = utcnow() + timedelta(hours=3)
    with session_scope() as session:
        content_id = content_service.create_content(
            session, ContentCreate(title="tekrar")
        ).id
        content_service.schedule_content(session, content_id, when)
        content_service.cancel_schedule(session, content_id)

    # Act
    with session_scope() as session:
        schedule = content_service.schedule_content(session, content_id, when)

    # Assert
    assert schedule.status == ScheduleStatus.PENDING.value
    assert schedule.attempts == 0
    with session_scope() as session:
        rows = list(
            session.scalars(
                select(ScheduledPost).where(ScheduledPost.content_id == content_id)
            )
        )
        assert len(rows) == 1
        assert session.get(Content, content_id).status == ContentStatus.SCHEDULED.value


def test_basarisiz_icerik_ayni_saate_yeniden_planlanabilir(isolated_env: Settings) -> None:
    when = utcnow() + timedelta(hours=4)
    with session_scope() as session:
        content = content_service.create_content(session, ContentCreate(title="tekrar"))
        content_id = content.id
        content_service.schedule_content(session, content_id, when)

    with session_scope() as session:
        schedule = session.scalar(
            select(ScheduledPost).where(ScheduledPost.content_id == content_id)
        )
        schedule.status = ScheduleStatus.FAILED.value
        schedule.attempts = 3
        content_service.set_status(
            session.get(Content, content_id), ContentStatus.FAILED.value
        )

    with session_scope() as session:
        revived = content_service.schedule_content(session, content_id, when)

    assert revived.status == ScheduleStatus.PENDING.value
    assert revived.attempts == 0


# ===========================================================================
# 4. Yarıda kalan yayın — içerik `publishing` durumunda takılı kalıyordu.
# ===========================================================================
def _make_stuck(*, published: bool = False) -> int:
    """Süreç yayın ortasında ölmüş gibi bir durum kurar."""
    with session_scope() as session:
        content = content_service.create_content(
            session,
            ContentCreate(title="cokme", media_url="https://cdn.example/a.jpg"),
        )
        content_id = content.id
        schedule = content_service.schedule_content(
            session, content_id, utcnow() + timedelta(minutes=1)
        )
        # Yayın anı gelmiş, süreç o sırada ölmüş.
        schedule.scheduled_at = utcnow() - timedelta(hours=2)
        schedule.status = ScheduleStatus.RUNNING.value
        schedule.locked_at = utcnow() - timedelta(hours=2)
        content.status = ContentStatus.PUBLISHING.value
        content.updated_at = utcnow() - timedelta(hours=2)
        if published:
            session.add(
                PublishedPost(content_id=content_id, ig_media_id="media-yarim")
            )
    return content_id


def test_yarida_kalan_yayin_yeniden_kuyruga_alinir(isolated_env: Settings) -> None:
    # Arrange
    content_id = _make_stuck()

    # Act
    with session_scope() as session:
        recovered = content_service.recover_stale_publishing(session, stale_minutes=30)

    # Assert
    assert recovered == 1
    with session_scope() as session:
        content = session.get(Content, content_id)
        schedule = session.scalar(
            select(ScheduledPost).where(ScheduledPost.content_id == content_id)
        )
        assert content.status == ContentStatus.SCHEDULED.value
        assert schedule.status == ScheduleStatus.PENDING.value
        assert schedule.locked_at is None
        # Zamanı geçtiği için bir sonraki turda ele alınır.
        assert len(content_service.due_schedules(session)) == 1


def test_gercekten_yayinlanmis_icerik_tekrar_yayinlanmaz(isolated_env: Settings) -> None:
    """Instagram'a gitmiş ama veritabanına yazılamamış yayın korunmalı."""
    # Arrange
    content_id = _make_stuck(published=True)

    # Act
    with session_scope() as session:
        content_service.recover_stale_publishing(session, stale_minutes=30)

    # Assert
    with session_scope() as session:
        content = session.get(Content, content_id)
        schedule = session.scalar(
            select(ScheduledPost).where(ScheduledPost.content_id == content_id)
        )
        assert content.status == ContentStatus.PUBLISHED.value
        assert schedule.status == ScheduleStatus.DONE.value
        assert content_service.due_schedules(session) == []


def test_taze_kilit_kurtarilmaz(isolated_env: Settings) -> None:
    """Hâlâ çalışan bir yayının kilidi alınmamalı."""
    # Arrange — kilit yeni
    with session_scope() as session:
        content = content_service.create_content(session, ContentCreate(title="calisan"))
        content.status = ContentStatus.PUBLISHING.value
        content_id = content.id

    # Act
    with session_scope() as session:
        recovered = content_service.recover_stale_publishing(session, stale_minutes=30)

    # Assert
    assert recovered == 0
    with session_scope() as session:
        assert session.get(Content, content_id).status == ContentStatus.PUBLISHING.value


# ===========================================================================
# 5. Durum makinesi
# ===========================================================================
@pytest.mark.parametrize(
    ("current", "target", "expected"),
    [
        ("draft", "scheduled", True),
        ("draft", "publishing", True),
        ("scheduled", "publishing", True),
        ("publishing", "published", True),
        ("publishing", "failed", True),
        ("failed", "scheduled", True),
        ("published", "draft", False),
        ("published", "scheduled", False),
        ("published", "publishing", False),
        ("draft", "published", False),
        ("scheduled", "published", False),
    ],
)
def test_durum_gecisleri(current: str, target: str, expected: bool) -> None:
    assert is_valid_transition(current, target) is expected


def test_yayinlanmis_icerik_geri_alinamaz(isolated_env: Settings) -> None:
    with session_scope() as session:
        content = content_service.create_content(session, ContentCreate(title="bitti"))
        content.status = ContentStatus.PUBLISHED.value

        with pytest.raises(InstaFlowError, match="Geçersiz durum geçişi"):
            content_service.set_status(content, ContentStatus.DRAFT.value)


def test_taslak_dogrudan_yayinlanmis_yapilamaz(isolated_env: Settings) -> None:
    """Yayın akışını atlayan bir kod yolu sessizce başarılı görünmemeli."""
    with session_scope() as session:
        content = content_service.create_content(session, ContentCreate(title="atlama"))

        with pytest.raises(InstaFlowError, match="Geçersiz durum geçişi"):
            content_service.set_status(content, ContentStatus.PUBLISHED.value)


# ===========================================================================
# 6. Gizli değer maskeleme
# ===========================================================================
@pytest.mark.parametrize(
    ("raw", "leaked"),
    [
        ("https://graph.instagram.com/me?access_token=EAAG123SECRET", "EAAG123SECRET"),
        ("client_secret=abc123def&grant_type=x", "abc123def"),
        ("input_token=TOKEN999 geçersiz", "TOKEN999"),
    ],
)
def test_gizli_degerler_maskelenir(raw: str, leaked: str) -> None:
    redacted = redact_secrets(raw)

    assert leaked not in redacted
    assert "***" in redacted


def test_maskeleme_normal_metni_bozmaz() -> None:
    text = "Instagram medyayı işleyemedi: en-boy oranı uygun değil."

    assert redact_secrets(text) == text


# ===========================================================================
# 7. Akış hâlinde yükleme — dosyanın tamamı belleğe alınıyordu.
# ===========================================================================
def test_buyuk_dosya_sinirda_kesilir(
    isolated_env: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Sınır aşılınca yazma durur ve yarım dosya diskte bırakılmaz."""
    # Arrange — sınırı 1 MB'a çek, 3 MB gönder
    monkeypatch.setattr(isolated_env, "max_image_mb", 1.0)
    payload = TINY_JPEG + b"\x00" * (3 * 1024 * 1024)

    # Act / Assert
    with pytest.raises(MediaValidationError, match="çok büyük"):
        store_upload_stream(
            "buyuk.jpg", BytesIO(payload), settings=isolated_env
        )

    assert list((isolated_env.content_dir / "drafts").glob("buyuk*")) == []


def test_gecersiz_icerik_ilk_parcada_reddedilir(isolated_env: Settings) -> None:
    """Geçersiz dosyanın tamamı diske yazılmamalı."""
    payload = b"#!/bin/sh\n" + b"A" * (2 * 1024 * 1024)

    with pytest.raises(MediaValidationError, match="uyuşmuyor"):
        store_upload_stream("sahte.jpg", BytesIO(payload), settings=isolated_env)

    assert list((isolated_env.content_dir / "drafts").glob("sahte*")) == []


def test_akisla_yukleme_gecerli_dosyayi_kaydeder(isolated_env: Settings) -> None:
    info = store_upload_stream(
        "Örnek Kare.JPG", BytesIO(TINY_JPEG), settings=isolated_env
    )

    assert info.path.exists()
    assert info.path.name == "Ornek-Kare.jpg"
    assert info.path.read_bytes() == TINY_JPEG


def test_bos_akis_reddedilir(isolated_env: Settings) -> None:
    with pytest.raises(MediaValidationError, match="boş"):
        store_upload_stream("bos.jpg", BytesIO(b""), settings=isolated_env)


def test_web_yuklemesi_akis_kullanir(client: TestClient, isolated_env: Settings) -> None:
    """Uçtan uca: panelden yüklenen dosya diske düşmeli."""
    # Arrange
    page = client.get("/content")
    import re

    token = re.search(r'name="csrf_token" value="([^"]+)"', page.text).group(1)

    # Act
    response = client.post(
        "/content/create",
        data={"content_type": "image", "title": "Akış", "csrf_token": token},
        files={"media_file": ("yukleme.jpg", TINY_JPEG, "image/jpeg")},
        follow_redirects=True,
    )

    # Assert
    assert response.status_code == 200
    with session_scope() as session:
        items = content_service.list_contents(session)
    assert len(items) == 1
    assert items[0].media_path == "drafts/yukleme.jpg"
    assert (isolated_env.content_dir / "drafts" / "yukleme.jpg").exists()


# ===========================================================================
# 8. Yapılandırma sağlığı
# ===========================================================================
def test_secret_key_verilmezse_gecici_sayilir(
    isolated_env: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """SECRET_KEY yoksa her açılışta yeni anahtar üretilir; bu fark edilmeli."""
    # Arrange — conftest SECRET_KEY veriyor, önce onu kaldır
    assert isolated_env.is_secret_key_ephemeral is False
    monkeypatch.delenv("SECRET_KEY", raising=False)

    from app.config import Settings as SettingsClass

    # Act
    first = SettingsClass(_env_file=None)
    second = SettingsClass(_env_file=None)

    # Assert
    assert first.is_secret_key_ephemeral is True
    assert first.secret_key != second.secret_key


def test_veritabani_indeksleri_kurulur(isolated_env: Settings) -> None:
    """Sık sorgulanan sütunlar indekssiz kalmamalı."""
    from sqlalchemy import inspect

    from app.database import get_engine

    inspector = inspect(get_engine())
    for table, expected in [
        ("published_posts", "ix_published_posts_published_at"),
        ("logs", "ix_logs_created_at"),
        ("scheduled_posts", "ix_scheduled_posts_content_id"),
        ("content", "ix_content_status"),
    ]:
        names = {index["name"] for index in inspector.get_indexes(table)}
        assert expected in names, f"{table} tablosunda {expected} eksik"


def test_yabanci_anahtarlar_zorunlu(isolated_env: Settings) -> None:
    from sqlalchemy import text

    from app.database import get_engine

    with get_engine().connect() as connection:
        assert connection.execute(text("PRAGMA foreign_keys")).scalar() == 1
