from datetime import date

import pytest

from youtube_daily.config import UploadConfig
from youtube_daily.metadata import (
    MAX_TAGS_TOTAL_LENGTH,
    MAX_TITLE_LENGTH,
    build_metadata,
    humanize_name,
    parse_json_sidecar,
    parse_text_sidecar,
    sanitize_description,
    sanitize_tags,
    sanitize_title,
)


def test_sanitize_title_strips_forbidden_characters():
    assert sanitize_title("Merhaba <dünya>") == "Merhaba dünya"


def test_sanitize_title_truncates_to_youtube_limit():
    result = sanitize_title("a" * 250)
    assert len(result) == MAX_TITLE_LENGTH


def test_sanitize_title_falls_back_when_empty():
    assert sanitize_title("   <>  ").startswith("Video ")


def test_sanitize_description_respects_limit():
    assert len(sanitize_description("x" * 9000)) == 5000


def test_sanitize_tags_drops_duplicates_case_insensitively():
    assert sanitize_tags(["Vlog", "vlog", " VLOG "]) == ["Vlog"]


def test_sanitize_tags_stays_under_total_length_budget():
    tags = sanitize_tags([f"etiket{i}" * 5 for i in range(50)])
    assert sum(len(t) for t in tags) <= MAX_TAGS_TOTAL_LENGTH


@pytest.mark.parametrize(
    ("stem", "expected"),
    [
        ("2026-08-07_bolum-12", "bolum 12"),
        ("20260807 gunluk video", "gunluk video"),
        ("basit_ad", "basit ad"),
    ],
)
def test_humanize_name(stem, expected):
    assert humanize_name(stem) == expected


def test_parse_text_sidecar_splits_title_and_description():
    parsed = parse_text_sidecar("Başlık burada\n\nAçıklama satırı")
    assert parsed["title"] == "Başlık burada"
    assert parsed["description"] == "Açıklama satırı"


def test_parse_json_sidecar_ignores_invalid_json():
    assert parse_json_sidecar("{bozuk") == {}


def test_build_metadata_uses_templates_when_no_sidecar():
    config = UploadConfig(
        title_template="{name} — {date}",
        description_template="Açıklama: {name}",
        default_tags=["kanal"],
    )
    metadata = build_metadata(
        file_stem="2026-08-07_ilk-video",
        upload_config=config,
        today=date(2026, 8, 7),
    )
    assert metadata.title == "ilk video — 2026-08-07"
    assert metadata.description == "Açıklama: ilk video"
    assert metadata.tags == ["kanal"]


def test_build_metadata_sidecar_overrides_templates():
    metadata = build_metadata(
        file_stem="video",
        upload_config=UploadConfig(default_tags=["kanal"], privacy_status="public"),
        sidecar={
            "title": "Elle yazılmış başlık",
            "description": "Elle yazılmış açıklama",
            "tags": ["özel"],
            "privacy_status": "unlisted",
        },
    )
    assert metadata.title == "Elle yazılmış başlık"
    assert metadata.privacy_status == "unlisted"
    assert metadata.tags == ["kanal", "özel"]


def test_build_metadata_accepts_comma_separated_tag_string():
    metadata = build_metadata(
        file_stem="video",
        upload_config=UploadConfig(),
        sidecar={"tags": "bir, iki , üç"},
    )
    assert metadata.tags == ["bir", "iki", "üç"]


def test_to_body_matches_youtube_shape():
    body = build_metadata(file_stem="video", upload_config=UploadConfig()).to_body()
    assert body["snippet"]["title"]
    assert body["status"]["privacyStatus"] == "public"
    assert body["status"]["selfDeclaredMadeForKids"] is False
