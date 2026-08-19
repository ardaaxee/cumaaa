"""Yapılandırma testleri."""

from __future__ import annotations

import pytest

from app.config import Settings, get_settings


def test_varsayilan_ayarlar_yuklenir(isolated_env: Settings) -> None:
    # Arrange / Act
    settings = isolated_env

    # Assert
    assert settings.app_name == "InstaFlow"
    assert settings.instagram_api_version.startswith("v")
    assert settings.data_dir.exists()
    assert settings.content_dir.exists()


def test_api_surumu_gecersizse_hata_verir() -> None:
    with pytest.raises(ValueError, match="v"):
        Settings(instagram_api_version="25.0")


def test_graph_adresi_giris_kipine_gore_degisir(monkeypatch: pytest.MonkeyPatch) -> None:
    # Arrange
    monkeypatch.setenv("INSTAGRAM_LOGIN_MODE", "facebook")
    get_settings.cache_clear()

    # Act
    settings = get_settings()

    # Assert
    assert settings.graph_host == "https://graph.facebook.com"
    assert "instagram_basic" in settings.oauth_scopes


def test_kimlik_bilgisi_yoksa_yapilandirilmamis_sayilir(isolated_env: Settings) -> None:
    assert isolated_env.is_instagram_configured is False
    assert isolated_env.is_oauth_configured is False


def test_kimlik_bilgisi_varsa_yapilandirilmis_sayilir(configured_settings: Settings) -> None:
    assert configured_settings.is_instagram_configured is True


def test_metrik_listesi_ayristirilir(isolated_env: Settings) -> None:
    metrics = isolated_env.media_metrics

    assert "reach" in metrics
    # Meta 2025'te bu metrikleri kaldırdı; varsayılan listede olmamalı.
    assert "impressions" not in metrics
    assert "video_views" not in metrics
    assert "views" in metrics


def test_ai_saglayici_anahtarsiz_yapilandirilmamis(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "openai")
    get_settings.cache_clear()

    settings = get_settings()

    assert settings.ai_provider == "openai"
    assert settings.is_ai_configured is False


def test_yerel_saglayici_her_zaman_hazir(isolated_env: Settings) -> None:
    assert isolated_env.ai_provider == "local"
    assert isolated_env.is_ai_configured is True
