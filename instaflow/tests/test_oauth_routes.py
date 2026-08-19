"""OAuth bağlantı akışının web tarafı.

Kritik nokta: `state` doğrulaması. Bu olmadan saldırgan, kurbanı kendi
hesabını bağlamaya zorlayabilir (CSRF).
"""

from __future__ import annotations

from collections.abc import Iterator
from urllib.parse import parse_qs, urlparse

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.config import Settings, get_settings
from app.database import session_scope
from app.models import Account


@pytest.fixture
def oauth_client(
    isolated_env: Settings, monkeypatch: pytest.MonkeyPatch
) -> Iterator[TestClient]:
    """OAuth bilgileri tanımlı bir test istemcisi."""
    monkeypatch.setenv("RUN_SCHEDULER", "0")
    monkeypatch.setenv("META_APP_ID", "1234567890")
    monkeypatch.setenv("META_APP_SECRET", "sahte-uygulama-sirri")
    monkeypatch.setenv("OAUTH_REDIRECT_URI", "https://ornek.example/oauth/callback")
    get_settings.cache_clear()

    from app.main import create_app

    with TestClient(create_app()) as client:
        yield client


def test_connect_meta_adresine_yonlendirir(oauth_client: TestClient) -> None:
    response = oauth_client.get("/connect", follow_redirects=False)

    assert response.status_code == 303
    location = response.headers["location"]
    assert urlparse(location).netloc == "www.instagram.com"
    assert "state" in parse_qs(urlparse(location).query)


def test_uygulama_bilgisi_yoksa_ayarlara_donulur(
    isolated_env: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange — META_APP_ID tanımlı değil
    monkeypatch.setenv("RUN_SCHEDULER", "0")
    get_settings.cache_clear()
    from app.main import create_app

    # Act
    with TestClient(create_app()) as client:
        response = client.get("/connect", follow_redirects=True)

    # Assert — çökmez, kullanıcıya eksik anlatılır
    assert response.status_code == 200
    assert "META_APP_ID" in response.text


def test_state_uyusmazsa_baglanti_reddedilir(oauth_client: TestClient) -> None:
    # Arrange — önce meşru bir akış başlat (oturuma state yazılır)
    oauth_client.get("/connect", follow_redirects=False)

    # Act — saldırganın uydurduğu state ile geri dönüş
    response = oauth_client.get(
        "/oauth/callback?code=kod-123&state=saldirgan", follow_redirects=True
    )

    # Assert
    assert "state uyuşmuyor" in response.text
    with session_scope() as session:
        assert session.scalar(select(Account)) is None


def test_state_yoksa_baglanti_reddedilir(oauth_client: TestClient) -> None:
    response = oauth_client.get("/oauth/callback?code=kod-123", follow_redirects=True)

    assert "Güvenlik doğrulaması başarısız" in response.text


def test_kod_yoksa_anlasilir_hata(oauth_client: TestClient) -> None:
    response = oauth_client.get("/oauth/callback", follow_redirects=True)

    assert "Yetkilendirme kodu alınamadı" in response.text


def test_kullanici_reddederse_bildirilir(oauth_client: TestClient) -> None:
    response = oauth_client.get(
        "/oauth/callback?error=access_denied&error_description=Kullanıcı+iptal+etti",
        follow_redirects=True,
    )

    assert "Yetkilendirme reddedildi" in response.text


def test_gecerli_akis_hesabi_baglar(
    oauth_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange — Meta çağrılarını mock'la
    from app.instagram import auth as ig_auth

    async def fake_exchange(code, settings=None, **kwargs):
        assert code == "kod-123"
        return ig_auth.TokenInfo(access_token="kisa", user_id="17841400000000000")

    async def fake_long_lived(token, settings=None, **kwargs):
        return ig_auth.TokenInfo(access_token="uzun-omurlu", expires_in=5183944)

    from app import routes_oauth

    monkeypatch.setattr(routes_oauth.ig_auth, "exchange_code", fake_exchange)
    monkeypatch.setattr(routes_oauth.ig_auth, "exchange_for_long_lived", fake_long_lived)

    # state'i meşru yoldan al
    redirect = oauth_client.get("/connect", follow_redirects=False)
    state = parse_qs(urlparse(redirect.headers["location"]).query)["state"][0]

    # Act
    response = oauth_client.get(
        f"/oauth/callback?code=kod-123&state={state}", follow_redirects=True
    )

    # Assert
    assert "hesabı bağlandı" in response.text
    with session_scope() as session:
        account = session.scalar(select(Account))
    assert account is not None
    assert account.ig_user_id == "17841400000000000"
    assert account.token_expires_at is not None
    # Token sayfaya sızmamalı.
    assert "uzun-omurlu" not in response.text


def test_meta_hatasi_kullaniciya_iletilir(
    oauth_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    from app.errors import InstagramAPIError
    from app import routes_oauth

    async def failing(code, settings=None, **kwargs):
        raise InstagramAPIError("Kimlik doğrulama başarısız: kod geçersiz")

    monkeypatch.setattr(routes_oauth.ig_auth, "exchange_code", failing)

    redirect = oauth_client.get("/connect", follow_redirects=False)
    state = parse_qs(urlparse(redirect.headers["location"]).query)["state"][0]

    # Act
    response = oauth_client.get(
        f"/oauth/callback?code=kotu&state={state}", follow_redirects=True
    )

    # Assert
    assert "kod geçersiz" in response.text
    with session_scope() as session:
        assert session.scalar(select(Account)) is None


def test_state_tek_kullanimliktir(
    oauth_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Aynı state ile ikinci bir geri dönüş kabul edilmemeli (tekrar saldırısı)."""
    # Arrange
    from app.instagram import auth as ig_auth
    from app import routes_oauth

    async def fake_exchange(code, settings=None, **kwargs):
        return ig_auth.TokenInfo(access_token="kisa", user_id="17841400000000000")

    async def fake_long_lived(token, settings=None, **kwargs):
        return ig_auth.TokenInfo(access_token="uzun", expires_in=5183944)

    monkeypatch.setattr(routes_oauth.ig_auth, "exchange_code", fake_exchange)
    monkeypatch.setattr(routes_oauth.ig_auth, "exchange_for_long_lived", fake_long_lived)

    redirect = oauth_client.get("/connect", follow_redirects=False)
    state = parse_qs(urlparse(redirect.headers["location"]).query)["state"][0]

    # Act
    first = oauth_client.get(
        f"/oauth/callback?code=kod&state={state}", follow_redirects=True
    )
    second = oauth_client.get(
        f"/oauth/callback?code=kod&state={state}", follow_redirects=True
    )

    # Assert
    assert "hesabı bağlandı" in first.text
    assert "state uyuşmuyor" in second.text or "Güvenlik doğrulaması" in second.text
