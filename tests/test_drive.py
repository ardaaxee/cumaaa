import pytest

from youtube_daily.config import DriveConfig
from youtube_daily.drive import DriveFile, index_sidecars, pick_videos, resolve_folder_id


def make_file(name, mime="video/mp4", created="2026-01-01T00:00:00Z", file_id=None):
    return DriveFile(
        id=file_id or f"id-{name}",
        name=name,
        mime_type=mime,
        size=1024,
        created_time=created,
        modified_time=created,
    )


def test_pick_videos_filters_out_non_video_files():
    files = [
        make_file("a.mp4"),
        make_file("notlar.txt", mime="text/plain"),
        make_file("kapak.jpg", mime="image/jpeg"),
        make_file("b.mov", mime="video/quicktime"),
    ]
    assert [f.name for f in pick_videos(files)] == ["a.mp4", "b.mov"]


def test_pick_videos_orders_by_creation_time():
    files = [
        make_file("son.mp4", created="2026-03-01T00:00:00Z"),
        make_file("ilk.mp4", created="2026-01-01T00:00:00Z"),
        make_file("orta.mp4", created="2026-02-01T00:00:00Z"),
    ]
    assert [f.name for f in pick_videos(files)] == ["ilk.mp4", "orta.mp4", "son.mp4"]


def test_pick_videos_orders_by_name_case_insensitively():
    files = [make_file("Beta.mp4"), make_file("alfa.mp4"), make_file("Gamma.mp4")]
    ordered = [f.name for f in pick_videos(files, order="name")]
    assert ordered == ["alfa.mp4", "Beta.mp4", "Gamma.mp4"]


def test_index_sidecars_only_keeps_non_video_files():
    files = [
        make_file("video.mp4"),
        make_file("video.json", mime="application/json"),
        make_file("video.jpg", mime="image/jpeg"),
    ]
    sidecars = index_sidecars(files)
    assert set(sidecars) == {"video.json", "video.jpg"}


def test_index_sidecars_uses_lowercase_keys():
    sidecars = index_sidecars([make_file("Video.JSON", mime="application/json")])
    assert "video.json" in sidecars


def test_drive_file_stem_drops_extension():
    assert make_file("2026-08-07_bolum.mp4").stem == "2026-08-07_bolum"


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("1AbCdEfGhIjK", "1AbCdEfGhIjK"),
        ("https://drive.google.com/drive/folders/1AbCdEfGhIjK", "1AbCdEfGhIjK"),
        ("https://drive.google.com/drive/folders/1AbCdEfGhIjK?usp=sharing", "1AbCdEfGhIjK"),
        ("  1AbCdEfGhIjK  ", "1AbCdEfGhIjK"),
    ],
)
def test_resolve_folder_id_accepts_id_or_url(value, expected):
    assert resolve_folder_id(DriveConfig(folder_id=value)) == expected
