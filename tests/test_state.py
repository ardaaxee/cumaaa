import json

import pytest

from youtube_daily.state import UploadState


def test_new_state_is_empty(tmp_path):
    state = UploadState(tmp_path / "uploaded.json")
    assert len(state) == 0
    assert not state.is_uploaded("abc")


def test_mark_and_reload_roundtrip(tmp_path):
    path = tmp_path / "state" / "uploaded.json"
    state = UploadState(path)
    state.mark_uploaded("drive-1", video_id="yt-1", title="Başlık", file_name="a.mp4")
    state.save()

    reloaded = UploadState(path)
    assert reloaded.is_uploaded("drive-1")
    entry = reloaded.get("drive-1")
    assert entry["video_id"] == "yt-1"
    assert entry["url"] == "https://www.youtube.com/watch?v=yt-1"
    assert entry["uploaded_at"]


def test_save_creates_parent_directories(tmp_path):
    path = tmp_path / "deep" / "nested" / "uploaded.json"
    state = UploadState(path)
    state.save()
    assert path.exists()


def test_save_writes_valid_json_with_schema_version(tmp_path):
    path = tmp_path / "uploaded.json"
    state = UploadState(path)
    state.mark_uploaded("d", video_id="v", title="t", file_name="f.mp4")
    state.save()

    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["schema_version"] == 1
    assert "d" in data["uploads"]


def test_corrupt_state_file_raises_clear_error(tmp_path):
    path = tmp_path / "uploaded.json"
    path.write_text("{bozuk", encoding="utf-8")
    with pytest.raises(ValueError, match="bozuk JSON"):
        UploadState(path)


def test_no_temp_file_left_behind(tmp_path):
    path = tmp_path / "uploaded.json"
    state = UploadState(path)
    state.save()
    assert list(tmp_path.glob("*.tmp")) == []
