"""run() akışının uçtan uca testi — Drive ve YouTube sahte (fake) servislerle."""

from pathlib import Path

import pytest

from youtube_daily import drive as drive_api
from youtube_daily import main as main_module
from youtube_daily import youtube as yt_api
from youtube_daily.config import Config, DriveConfig, StateConfig, UploadConfig
from youtube_daily.drive import DriveFile
from youtube_daily.state import UploadState


def make_file(name, mime="video/mp4", created="2026-01-01T00:00:00Z"):
    return DriveFile(
        id=f"id-{name}",
        name=name,
        mime_type=mime,
        size=2048,
        created_time=created,
        modified_time=created,
    )


@pytest.fixture
def config(tmp_path):
    return Config(
        drive=DriveConfig(folder_id="klasor-1"),
        upload=UploadConfig(title_template="{name}", description_template="{name}"),
        state=StateConfig(path=str(tmp_path / "uploaded.json")),
    )


@pytest.fixture
def fake_google(monkeypatch, tmp_path):
    """Tüm ağ çağrılarını kayıt tutan sahtelerle değiştirir."""
    recorder = {"uploaded": [], "downloaded": [], "moved": [], "thumbnails": []}
    recorder["files"] = [make_file("ilk.mp4"), make_file("ikinci.mp4", created="2026-02-01T00:00:00Z")]
    recorder["texts"] = {}

    monkeypatch.setattr(main_module, "credentials_from_env", lambda: "sahte-kimlik")
    monkeypatch.setattr(drive_api, "build_drive_service", lambda creds: "sahte-drive")
    monkeypatch.setattr(yt_api, "build_youtube_service", lambda creds: "sahte-youtube")
    monkeypatch.setattr(
        drive_api, "list_folder", lambda service, folder, order: recorder["files"]
    )
    monkeypatch.setattr(
        drive_api, "read_text_file", lambda service, file_id: recorder["texts"][file_id]
    )

    def fake_download(service, file_id, destination):
        destination = Path(destination)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(b"sahte video verisi")
        recorder["downloaded"].append(file_id)
        return destination

    def fake_upload(service, video_path, metadata, **kwargs):
        recorder["uploaded"].append((Path(video_path).name, metadata))
        return f"yt-{len(recorder['uploaded'])}"

    monkeypatch.setattr(drive_api, "download_file", fake_download)
    monkeypatch.setattr(yt_api, "upload_video", fake_upload)
    monkeypatch.setattr(
        yt_api, "set_thumbnail", lambda s, v, p: recorder["thumbnails"].append(v) or True
    )
    monkeypatch.setattr(
        drive_api,
        "move_to_folder",
        lambda s, f, dest, src: recorder["moved"].append((f, dest)),
    )
    return recorder


def test_uploads_one_video_per_run(config, fake_google):
    assert main_module.run(config) == 0
    assert len(fake_google["uploaded"]) == 1
    assert fake_google["uploaded"][0][0] == "ilk.mp4"


def test_second_run_picks_the_next_video(config, fake_google):
    main_module.run(config)
    main_module.run(config)
    assert [name for name, _ in fake_google["uploaded"]] == ["ilk.mp4", "ikinci.mp4"]


def test_already_uploaded_videos_are_not_reuploaded(config, fake_google):
    main_module.run(config)
    main_module.run(config)
    # Üçüncü çalıştırmada sırada video kalmadı.
    assert main_module.run(config) == 0
    assert len(fake_google["uploaded"]) == 2


def test_state_records_the_youtube_video_id(config, fake_google):
    main_module.run(config)
    state = UploadState(config.state.path)
    entry = state.get("id-ilk.mp4")
    assert entry["video_id"] == "yt-1"
    assert entry["file_name"] == "ilk.mp4"


def test_dry_run_uploads_nothing(config, fake_google):
    assert main_module.run(config, dry_run=True) == 0
    assert fake_google["uploaded"] == []
    assert UploadState(config.state.path).is_uploaded("id-ilk.mp4") is False


def test_count_argument_overrides_config(config, fake_google):
    assert main_module.run(config, count=2) == 0
    assert len(fake_google["uploaded"]) == 2


def test_empty_folder_is_not_an_error(config, fake_google):
    fake_google["files"] = []
    assert main_module.run(config) == 0


def test_json_sidecar_overrides_title(config, fake_google):
    fake_google["files"].append(make_file("ilk.json", mime="application/json"))
    fake_google["texts"]["id-ilk.json"] = '{"title": "Sidecar Başlığı", "tags": ["a"]}'

    main_module.run(config)
    _, metadata = fake_google["uploaded"][0]
    assert metadata.title == "Sidecar Başlığı"
    assert metadata.tags == ["a"]


def test_text_sidecar_sets_title_and_description(config, fake_google):
    fake_google["files"].append(make_file("ilk.txt", mime="text/plain"))
    fake_google["texts"]["id-ilk.txt"] = "Metin Başlık\n\nMetin açıklama"

    main_module.run(config)
    _, metadata = fake_google["uploaded"][0]
    assert metadata.title == "Metin Başlık"
    assert metadata.description == "Metin açıklama"


def test_thumbnail_sidecar_is_applied(config, fake_google):
    fake_google["files"].append(make_file("ilk.jpg", mime="image/jpeg"))
    main_module.run(config)
    assert fake_google["thumbnails"] == ["yt-1"]


def test_done_folder_move_only_when_configured(config, fake_google):
    main_module.run(config)
    assert fake_google["moved"] == []

    config.drive.done_folder_id = "bitti-klasoru"
    main_module.run(config)
    assert fake_google["moved"] == [("id-ikinci.mp4", "bitti-klasoru")]


def test_upload_failure_returns_error_code_and_keeps_video_pending(
    config, fake_google, monkeypatch
):
    def failing_upload(service, video_path, metadata, **kwargs):
        raise yt_api.UploadError("yükleme patladı")

    monkeypatch.setattr(yt_api, "upload_video", failing_upload)

    assert main_module.run(config) == 1
    # Başarısız video kayda geçmemeli ki sonraki çalıştırmada tekrar denensin.
    assert UploadState(config.state.path).is_uploaded("id-ilk.mp4") is False


def test_quota_error_stops_the_batch_early(config, fake_google, monkeypatch):
    attempts = {"n": 0}

    def quota_upload(service, video_path, metadata, **kwargs):
        attempts["n"] += 1
        raise yt_api.UploadError("YouTube API günlük kotası doldu.")

    monkeypatch.setattr(yt_api, "upload_video", quota_upload)

    main_module.run(config, count=2)
    assert attempts["n"] == 1
