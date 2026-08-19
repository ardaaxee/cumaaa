"""Medya doğrulama ve güvenlik testleri."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.config import Settings
from app.errors import MediaValidationError
from app.instagram.media import MediaKind, store_upload, validate_media_file
from app.security import mask_secret, resolve_within, sanitize_filename
from tests.conftest import TINY_JPEG, TINY_MP4


def test_gecerli_jpeg_kabul_edilir(jpeg_file: Path, isolated_env: Settings) -> None:
    info = validate_media_file(jpeg_file, settings=isolated_env)

    assert info.kind is MediaKind.IMAGE
    assert info.extension == ".jpg"
    assert info.size_bytes > 0


def test_desteklenmeyen_uzanti_reddedilir(isolated_env: Settings) -> None:
    # Arrange
    bad = isolated_env.content_dir / "drafts" / "betik.sh"
    bad.parent.mkdir(parents=True, exist_ok=True)
    bad.write_bytes(b"#!/bin/sh\necho hop\n")

    # Act / Assert
    with pytest.raises(MediaValidationError, match="uzantı"):
        validate_media_file(bad, settings=isolated_env)


def test_uzantisi_yalan_soyleyen_dosya_reddedilir(isolated_env: Settings) -> None:
    # Arrange — .jpg uzantılı ama içeriği betik olan dosya
    fake = isolated_env.content_dir / "drafts" / "sahte.jpg"
    fake.parent.mkdir(parents=True, exist_ok=True)
    fake.write_bytes(b"#!/bin/sh\nrm -rf /\n")

    # Act / Assert
    with pytest.raises(MediaValidationError, match="tanınmadı"):
        validate_media_file(fake, settings=isolated_env)


def test_bos_dosya_reddedilir(isolated_env: Settings) -> None:
    empty = isolated_env.content_dir / "drafts" / "bos.jpg"
    empty.parent.mkdir(parents=True, exist_ok=True)
    empty.write_bytes(b"")

    with pytest.raises(MediaValidationError):
        validate_media_file(empty, settings=isolated_env)


def test_olmayan_dosya_acik_hata_verir(isolated_env: Settings) -> None:
    with pytest.raises(MediaValidationError, match="bulunamadı"):
        validate_media_file("drafts/yok.jpg", settings=isolated_env)


def test_beklenen_tur_uyusmazsa_reddedilir(isolated_env: Settings) -> None:
    # Arrange
    video = isolated_env.content_dir / "drafts" / "klip.mp4"
    video.parent.mkdir(parents=True, exist_ok=True)
    video.write_bytes(TINY_MP4)

    # Act / Assert — görsel beklenen yerde video verilirse
    with pytest.raises(MediaValidationError, match="bekleniyor"):
        validate_media_file(video, expected=MediaKind.IMAGE, settings=isolated_env)


def test_boyut_siniri_asilirsa_reddedilir(
    isolated_env: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange — sınırı yapay olarak çok küçült
    monkeypatch.setattr(isolated_env, "max_image_mb", 0.000001)
    target = isolated_env.content_dir / "drafts" / "buyuk.jpg"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(TINY_JPEG)

    # Act / Assert
    with pytest.raises(MediaValidationError, match="çok büyük"):
        validate_media_file(target, settings=isolated_env)


def test_yukleme_gecerli_dosyayi_kaydeder(isolated_env: Settings) -> None:
    info = store_upload("Örnek Görsel.JPG", TINY_JPEG, settings=isolated_env)

    assert info.path.exists()
    assert info.path.parent.name == "drafts"
    # Türkçe karakter ve boşluklar temizlenmiş olmalı.
    assert info.path.name == "Ornek-Gorsel.jpg"


def test_yukleme_gecersiz_icerigi_diske_yazmaz(isolated_env: Settings) -> None:
    with pytest.raises(MediaValidationError):
        store_upload("kotu.jpg", b"bu bir gorsel degil", settings=isolated_env)

    assert list((isolated_env.content_dir / "drafts").glob("kotu*")) == []


def test_ayni_ad_uzerine_yazilmaz(isolated_env: Settings) -> None:
    first = store_upload("ayni.jpg", TINY_JPEG, settings=isolated_env)
    second = store_upload("ayni.jpg", TINY_JPEG, settings=isolated_env)

    assert first.path != second.path
    assert first.path.exists() and second.path.exists()


# ------------------------------------------------------------------ güvenlik
@pytest.mark.parametrize(
    "raw",
    ["../../etc/passwd", "/etc/passwd", "..\\..\\windows\\system32", "a/b/c.jpg"],
)
def test_dosya_adi_yol_bilesenlerini_atar(raw: str) -> None:
    cleaned = sanitize_filename(raw)

    assert "/" not in cleaned
    assert "\\" not in cleaned
    assert ".." not in cleaned


def test_bos_dosya_adi_reddedilir() -> None:
    with pytest.raises(MediaValidationError):
        sanitize_filename("...")


def test_yol_taban_dizinin_disina_cikamaz(isolated_env: Settings) -> None:
    with pytest.raises(MediaValidationError, match="dışında"):
        resolve_within(isolated_env.content_dir, "../../../etc/passwd")


def test_yol_taban_dizini_icinde_kabul_edilir(isolated_env: Settings) -> None:
    resolved = resolve_within(isolated_env.content_dir, "drafts/ornek.jpg")

    assert resolved.parent.name == "drafts"


def test_gizli_deger_maskelenir() -> None:
    masked = mask_secret("SUPER-GIZLI-TOKEN-DEGERI")

    assert "GIZLI" not in masked
    assert masked.startswith("SUPE")
