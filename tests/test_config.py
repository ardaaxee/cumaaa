import pytest

from youtube_daily.config import ConfigError, load_config


def write_config(tmp_path, body: str):
    path = tmp_path / "config.yaml"
    path.write_text(body, encoding="utf-8")
    return path


def test_loads_values_from_yaml(tmp_path, monkeypatch):
    monkeypatch.delenv("DRIVE_FOLDER_ID", raising=False)
    path = write_config(
        tmp_path,
        """
drive:
  folder_id: klasor-123
  order: name
upload:
  videos_per_run: 2
  privacy_status: unlisted
""",
    )
    config = load_config(path)
    assert config.drive.folder_id == "klasor-123"
    assert config.drive.order == "name"
    assert config.upload.videos_per_run == 2
    assert config.upload.privacy_status == "unlisted"


def test_env_overrides_yaml(tmp_path, monkeypatch):
    path = write_config(tmp_path, "drive:\n  folder_id: yaml-klasor\n")
    monkeypatch.setenv("DRIVE_FOLDER_ID", "env-klasor")
    monkeypatch.setenv("VIDEOS_PER_RUN", "3")
    monkeypatch.setenv("PRIVACY_STATUS", "private")

    config = load_config(path)
    assert config.drive.folder_id == "env-klasor"
    assert config.upload.videos_per_run == 3
    assert config.upload.privacy_status == "private"


def test_empty_env_var_does_not_override(tmp_path, monkeypatch):
    path = write_config(tmp_path, "drive:\n  folder_id: yaml-klasor\n")
    monkeypatch.setenv("DRIVE_FOLDER_ID", "   ")
    assert load_config(path).drive.folder_id == "yaml-klasor"


def test_missing_folder_id_is_an_error(tmp_path, monkeypatch):
    monkeypatch.delenv("DRIVE_FOLDER_ID", raising=False)
    path = write_config(tmp_path, "drive:\n  folder_id: ''\n")
    with pytest.raises(ConfigError, match="Drive klasör ID"):
        load_config(path)


def test_invalid_privacy_status_is_an_error(tmp_path, monkeypatch):
    monkeypatch.setenv("DRIVE_FOLDER_ID", "x")
    path = write_config(tmp_path, "upload:\n  privacy_status: herkese-acik\n")
    with pytest.raises(ConfigError, match="privacy_status"):
        load_config(path)


def test_invalid_order_is_an_error(tmp_path, monkeypatch):
    monkeypatch.setenv("DRIVE_FOLDER_ID", "x")
    path = write_config(tmp_path, "drive:\n  order: rastgele\n")
    with pytest.raises(ConfigError, match="drive.order"):
        load_config(path)


def test_missing_config_file_falls_back_to_env(tmp_path, monkeypatch):
    monkeypatch.setenv("DRIVE_FOLDER_ID", "sadece-env")
    config = load_config(tmp_path / "yok.yaml")
    assert config.drive.folder_id == "sadece-env"
