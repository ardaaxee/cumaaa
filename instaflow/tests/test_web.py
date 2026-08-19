"""Web arayüzü ve JSON API testleri.

Scheduler bu testlerde kapalıdır (`RUN_SCHEDULER=0`); amaç HTTP katmanını
sınamak.
"""

from __future__ import annotations

import re
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.database import session_scope
from app.models import Content, ContentStatus
from app.schemas import ContentCreate
from app.services import content_service

CSRF_PATTERN = re.compile(r'name="csrf_token" value="([^"]+)"')


@pytest.fixture
def client(isolated_env: Settings, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    """Scheduler'sız test istemcisi."""
    monkeypatch.setenv("RUN_SCHEDULER", "0")
    from app.main import create_app

    with TestClient(create_app()) as test_client:
        yield test_client


def _csrf(client: TestClient, path: str = "/content") -> str:
    """Sayfadan CSRF token'ı çıkarır (oturum çerezi de kurulur)."""
    response = client.get(path)
    match = CSRF_PATTERN.search(response.text)
    assert match, "Sayfada CSRF token'ı bulunamadı"
    return match.group(1)


# --------------------------------------------------------------------- sayfalar
@pytest.mark.parametrize(
    "path", ["/dashboard", "/content", "/calendar", "/analytics", "/settings"]
)
def test_sayfalar_acilir(client: TestClient, path: str) -> None:
    response = client.get(path)

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_kok_adres_panele_yonlendirir(client: TestClient) -> None:
    response = client.get("/", follow_redirects=False)

    assert response.status_code == 307
    assert response.headers["location"] == "/dashboard"


def test_guvenlik_basliklari_eklenir(client: TestClient) -> None:
    response = client.get("/dashboard")

    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "frame-ancestors 'none'" in response.headers["Content-Security-Policy"]
    assert response.headers["Referrer-Policy"] == "no-referrer"


def test_saglik_ucu_calisir(client: TestClient) -> None:
    response = client.get("/healthz")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ------------------------------------------------------------------------ CSRF
def test_csrf_tokensiz_post_reddedilir(client: TestClient) -> None:
    response = client.post("/content/create", data={"title": "izinsiz"})

    assert response.status_code == 400
    with session_scope() as session:
        assert content_service.list_contents(session) == []


def test_sahte_csrf_tokeni_reddedilir(client: TestClient) -> None:
    client.get("/content")

    response = client.post(
        "/content/create", data={"title": "izinsiz", "csrf_token": "uydurma"}
    )

    assert response.status_code == 400


def test_gecerli_csrf_ile_icerik_olusur(client: TestClient) -> None:
    # Arrange
    token = _csrf(client)

    # Act
    response = client.post(
        "/content/create",
        data={
            "content_type": "image",
            "title": "Panelden eklendi",
            "caption": "merhaba",
            "csrf_token": token,
        },
        follow_redirects=True,
    )

    # Assert
    assert response.status_code == 200
    with session_scope() as session:
        items = content_service.list_contents(session)
        assert len(items) == 1
        assert items[0].title == "Panelden eklendi"
        assert items[0].status == ContentStatus.DRAFT.value


# -------------------------------------------------------------------- güvenlik
def test_gecersiz_dosya_yuklemesi_reddedilir(client: TestClient) -> None:
    # Arrange
    token = _csrf(client)

    # Act — .jpg uzantılı ama içeriği betik olan dosya
    response = client.post(
        "/content/create",
        data={"content_type": "image", "title": "kötü", "csrf_token": token},
        files={"media_file": ("zararli.jpg", b"#!/bin/sh\nrm -rf /\n", "image/jpeg")},
        follow_redirects=True,
    )

    # Assert
    assert response.status_code == 200
    assert "reddedildi" in response.text
    with session_scope() as session:
        assert content_service.list_contents(session) == []


def test_xss_denemesi_kacislanir(client: TestClient) -> None:
    # Arrange
    token = _csrf(client)
    payload = "<script>alert('xss')</script>"

    # Act
    client.post(
        "/content/create",
        data={"content_type": "image", "title": payload, "csrf_token": token},
        follow_redirects=True,
    )
    response = client.get("/content")

    # Assert — ham etiket sayfaya girmemeli
    assert "<script>alert" not in response.text
    assert "&lt;script&gt;" in response.text


def test_ayarlar_sayfasi_gizli_deger_sizdirmaz(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange — gerçekçi bir token tanımla
    secret = "GIZLI-TOKEN-DEGERI-1234567890"
    monkeypatch.setenv("INSTAGRAM_ACCESS_TOKEN", secret)
    monkeypatch.setenv("INSTAGRAM_USER_ID", "17841400000000000")
    get_settings.cache_clear()

    # Act
    response = client.get("/settings")

    # Assert
    assert response.status_code == 200
    assert secret not in response.text
    assert "tanımlı" in response.text


def test_api_config_gizli_deger_dondurmez(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    secret = "GIZLI-TOKEN-DEGERI-1234567890"
    monkeypatch.setenv("INSTAGRAM_ACCESS_TOKEN", secret)
    get_settings.cache_clear()

    response = client.get("/api/config")

    assert secret not in response.text
    assert response.json()["data"]["configured"] is not None


# ----------------------------------------------------------------------- API
def test_api_durum_zarfi_dogru(client: TestClient) -> None:
    response = client.get("/api/status")
    body = response.json()

    assert response.status_code == 200
    assert body["success"] is True
    assert body["error"] is None
    assert body["data"]["app_name"] == "InstaFlow"


def test_api_icerik_olusturur_ve_listeler(client: TestClient) -> None:
    # Act
    created = client.post(
        "/api/content",
        json={"type": "image", "title": "API'den", "caption": "metin"},
    )

    # Assert
    assert created.status_code == 201
    content_id = created.json()["data"]["id"]

    listed = client.get("/api/content")
    assert listed.json()["meta"]["total"] == 1

    single = client.get(f"/api/content/{content_id}")
    assert single.json()["data"]["title"] == "API'den"


def test_api_gecersiz_medya_adresini_reddeder(client: TestClient) -> None:
    response = client.post(
        "/api/content", json={"type": "image", "media_url": "http://güvensiz.example/a.jpg"}
    )

    assert response.status_code == 422


def test_api_olmayan_icerik_icin_anlasilir_hata(client: TestClient) -> None:
    response = client.get("/api/content/9999")
    body = response.json()

    assert response.status_code == 400
    assert body["success"] is False
    assert "bulunamadı" in body["error"]


def test_api_planlama_ve_iptal(client: TestClient) -> None:
    # Arrange
    with session_scope() as session:
        content = content_service.create_content(
            session, ContentCreate(title="Planlanacak")
        )
        content_id = content.id

    # Act
    scheduled = client.post(
        f"/api/content/{content_id}/schedule",
        json={"content_id": content_id, "scheduled_at": "2030-01-15 18:00"},
    )

    # Assert
    assert scheduled.status_code == 200
    with session_scope() as session:
        assert session.get(Content, content_id).status == ContentStatus.SCHEDULED.value

    cancelled = client.post(f"/api/content/{content_id}/cancel")
    assert cancelled.json()["success"] is True
    with session_scope() as session:
        assert session.get(Content, content_id).status == ContentStatus.DRAFT.value


def test_api_gecersiz_tarih_anlasilir_hata_verir(client: TestClient) -> None:
    with session_scope() as session:
        content_id = content_service.create_content(
            session, ContentCreate(title="x")
        ).id

    response = client.post(
        f"/api/content/{content_id}/schedule",
        json={"content_id": content_id, "scheduled_at": "yarın akşam"},
    )

    assert response.status_code == 400
    assert "Tarih anlaşılamadı" in response.json()["error"]


def test_api_yapilandirilmamis_hesapta_yayin_reddedilir(client: TestClient) -> None:
    with session_scope() as session:
        content_id = content_service.create_content(
            session,
            ContentCreate(title="Yayın denemesi", media_url="https://cdn.example/a.jpg"),
        ).id

    response = client.post(f"/api/content/{content_id}/publish")
    body = response.json()

    assert body["success"] is False
    assert "yapılandırılmamış" in body["error"]


def test_api_ai_ucu_yerel_uretici_ile_calisir(client: TestClient) -> None:
    response = client.post("/api/ai/caption", params={"topic": "kahve demleme"})
    body = response.json()

    assert body["success"] is True
    assert body["data"]["provider"] == "local"
    assert len(body["data"]["text"]) > 10


def test_api_analytics_bos_veriyle_calisir(client: TestClient) -> None:
    response = client.get("/api/analytics")
    body = response.json()

    assert body["success"] is True
    assert body["data"]["totals"] == {}
    assert body["data"]["posts"] == []


def test_uretim_ortaminda_docs_kapali(monkeypatch: pytest.MonkeyPatch) -> None:
    # Arrange
    monkeypatch.setenv("RUN_SCHEDULER", "0")
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DEBUG", "false")
    get_settings.cache_clear()

    from app.main import create_app

    # Act
    with TestClient(create_app()) as production_client:
        docs = production_client.get("/docs")
        schema = production_client.get("/openapi.json")

    # Assert
    assert docs.status_code == 404
    assert schema.status_code == 404
