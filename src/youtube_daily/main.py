"""Giriş noktası: Drive klasöründeki sıradaki videoyu YouTube'a yükler."""

from __future__ import annotations

import argparse
import logging
import os
import sys
import tempfile
from pathlib import Path

from googleapiclient.errors import HttpError

from . import drive as drive_api
from . import youtube as yt_api
from .auth import AuthError, credentials_from_env
from .config import Config, ConfigError, load_config
from .metadata import (
    JSON_SIDECAR_SUFFIX,
    TEXT_SIDECAR_SUFFIX,
    THUMBNAIL_SUFFIXES,
    build_metadata,
    parse_json_sidecar,
    parse_text_sidecar,
)
from .state import UploadState

logger = logging.getLogger("youtube_daily")


def configure_logging(verbose: bool = False) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s  %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
    )
    # Kütüphanelerin gürültülü uyarılarını kıs.
    logging.getLogger("googleapiclient.discovery_cache").setLevel(logging.ERROR)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="youtube-daily",
        description="Google Drive klasöründeki sıradaki videoyu YouTube'a yükler.",
    )
    parser.add_argument("--config", default="config.yaml", help="Ayar dosyası yolu.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Hiçbir şey yükleme; sırada ne olduğunu göster.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=None,
        help="Bu çalıştırmada yüklenecek video sayısı (config'i ezer).",
    )
    parser.add_argument("--verbose", action="store_true", help="Ayrıntılı günlük.")
    return parser.parse_args(argv)


def _load_sidecar(service, sidecars: dict, stem: str) -> dict:
    """Video için varsa .json / .txt metadata dosyasını okur."""
    json_file = sidecars.get(f"{stem}{JSON_SIDECAR_SUFFIX}".lower())
    if json_file is not None:
        logger.info("Metadata dosyası bulundu: %s", json_file.name)
        return parse_json_sidecar(drive_api.read_text_file(service, json_file.id))

    text_file = sidecars.get(f"{stem}{TEXT_SIDECAR_SUFFIX}".lower())
    if text_file is not None:
        logger.info("Metadata dosyası bulundu: %s", text_file.name)
        return parse_text_sidecar(drive_api.read_text_file(service, text_file.id))

    return {}


def _find_thumbnail(sidecars: dict, stem: str):
    for suffix in THUMBNAIL_SUFFIXES:
        found = sidecars.get(f"{stem}{suffix}".lower())
        if found is not None:
            return found
    return None


def _write_summary(lines: list[str]) -> None:
    """GitHub Actions çalıştırma özetine yaz (varsa)."""
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_path or not lines:
        return
    try:
        with open(summary_path, "a", encoding="utf-8") as handle:
            handle.write("\n".join(lines) + "\n")
    except OSError as exc:  # özet yazımı asıl işi bozmamalı
        logger.debug("Özet yazılamadı: %s", exc)


def run(config: Config, *, dry_run: bool = False, count: int | None = None) -> int:
    credentials = credentials_from_env()
    drive_service = drive_api.build_drive_service(credentials)

    folder_id = drive_api.resolve_folder_id(config.drive)
    logger.info("Drive klasörü taranıyor: %s", folder_id)

    files = drive_api.list_folder(drive_service, folder_id, config.drive.order)
    videos = drive_api.pick_videos(files, config.drive.order)
    sidecars = drive_api.index_sidecars(files)
    logger.info("Klasörde %d video bulundu.", len(videos))

    state = UploadState(config.state.path)
    pending = [video for video in videos if not state.is_uploaded(video.id)]

    if not pending:
        logger.info(
            "Yüklenecek yeni video yok (%d video daha önce yüklenmiş). "
            "Drive klasörüne yeni video ekleyin.",
            len(state),
        )
        _write_summary(["### YouTube otomasyonu", "", "Sırada yeni video yok."])
        return 0

    limit = count if count is not None else config.upload.videos_per_run
    batch = pending[: max(limit, 0)]
    logger.info("Sırada %d video var, bu çalıştırmada %d tanesi işlenecek.", len(pending), len(batch))

    if dry_run:
        summary = ["### YouTube otomasyonu (deneme çalıştırması)", ""]
        for video in batch:
            metadata = build_metadata(
                file_stem=video.stem,
                upload_config=config.upload,
                sidecar=_load_sidecar(drive_service, sidecars, video.stem),
            )
            logger.info(
                "[deneme] %s -> başlık: %r, görünürlük: %s",
                video.name,
                metadata.title,
                metadata.privacy_status,
            )
            summary.append(f"- `{video.name}` → **{metadata.title}** ({metadata.privacy_status})")
        _write_summary(summary)
        return 0

    youtube_service = yt_api.build_youtube_service(credentials)
    summary = ["### YouTube otomasyonu", ""]
    uploaded_count = 0
    failures: list[str] = []

    with tempfile.TemporaryDirectory(prefix="youtube-daily-") as tmpdir:
        for video in batch:
            logger.info("--- %s ---", video.name)
            try:
                sidecar = _load_sidecar(drive_service, sidecars, video.stem)
                metadata = build_metadata(
                    file_stem=video.stem,
                    upload_config=config.upload,
                    sidecar=sidecar,
                )

                local_path = Path(tmpdir) / video.name
                drive_api.download_file(drive_service, video.id, local_path)

                video_id = yt_api.upload_video(youtube_service, local_path, metadata)

                # Kaydı hemen yaz: sonraki adımlar patlasa bile video iki kez yüklenmesin.
                state.mark_uploaded(
                    video.id,
                    video_id=video_id,
                    title=metadata.title,
                    file_name=video.name,
                )
                state.save()
                uploaded_count += 1
                summary.append(
                    f"- ✅ **{metadata.title}** — https://www.youtube.com/watch?v={video_id}"
                )

                thumbnail = _find_thumbnail(sidecars, video.stem)
                if thumbnail is not None:
                    thumb_path = Path(tmpdir) / thumbnail.name
                    drive_api.download_file(drive_service, thumbnail.id, thumb_path)
                    yt_api.set_thumbnail(youtube_service, video_id, thumb_path)

                if config.drive.done_folder_id:
                    try:
                        drive_api.move_to_folder(
                            drive_service,
                            video.id,
                            config.drive.done_folder_id,
                            folder_id,
                        )
                    except HttpError as exc:
                        logger.warning(
                            "Drive'da taşıma başarısız (video yüklendi, sorun değil): %s", exc
                        )

                # Yerel kopyayı hemen sil: birden fazla video işlenirken disk şişmesin.
                local_path.unlink(missing_ok=True)

            except (yt_api.UploadError, HttpError) as exc:
                logger.error("%s yüklenemedi: %s", video.name, exc)
                failures.append(f"- ❌ `{video.name}` — {exc}")
                # Kotaya takıldıysak kalan videoları denemek anlamsız.
                if "kota" in str(exc).lower() or "sınır" in str(exc).lower():
                    logger.error("Kota/limit sınırı: kalan videolar bir sonraki çalıştırmaya bırakıldı.")
                    break

    state.save()

    if failures:
        summary.extend(failures)
    _write_summary(summary)

    if uploaded_count == 0 and failures:
        return 1
    logger.info("Bitti. %d video yüklendi.", uploaded_count)
    return 0


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    configure_logging(args.verbose)

    try:
        config = load_config(args.config)
    except ConfigError as exc:
        logger.error("Ayar hatası: %s", exc)
        return 2

    try:
        return run(config, dry_run=args.dry_run, count=args.count)
    except AuthError as exc:
        logger.error("Kimlik doğrulama hatası: %s", exc)
        return 2
    except HttpError as exc:
        logger.error("Google API hatası: %s", exc)
        return 1
    except KeyboardInterrupt:
        logger.warning("Kullanıcı tarafından iptal edildi.")
        return 130


if __name__ == "__main__":
    sys.exit(main())
