"""config.yaml okuma ve ortam değişkeni ile ezme."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

VALID_ORDERS = ("created_time", "modified_time", "name")
VALID_PRIVACY = ("public", "unlisted", "private")


class ConfigError(ValueError):
    """config.yaml geçersiz olduğunda fırlatılır."""


@dataclass
class DriveConfig:
    folder_id: str = ""
    done_folder_id: str = ""
    order: str = "created_time"


@dataclass
class UploadConfig:
    videos_per_run: int = 1
    privacy_status: str = "public"
    category_id: str = "22"
    made_for_kids: bool = False
    default_tags: list[str] = field(default_factory=list)
    title_template: str = "{name}"
    description_template: str = "{name}"


@dataclass
class StateConfig:
    path: str = "state/uploaded.json"


@dataclass
class Config:
    drive: DriveConfig = field(default_factory=DriveConfig)
    upload: UploadConfig = field(default_factory=UploadConfig)
    state: StateConfig = field(default_factory=StateConfig)

    def validate(self) -> None:
        if not self.drive.folder_id:
            raise ConfigError(
                "Drive klasör ID'si yok. config.yaml içindeki drive.folder_id alanını "
                "doldurun ya da DRIVE_FOLDER_ID ortam değişkenini tanımlayın."
            )
        if self.drive.order not in VALID_ORDERS:
            raise ConfigError(
                f"drive.order geçersiz: {self.drive.order!r}. "
                f"Geçerli değerler: {', '.join(VALID_ORDERS)}"
            )
        if self.upload.privacy_status not in VALID_PRIVACY:
            raise ConfigError(
                f"upload.privacy_status geçersiz: {self.upload.privacy_status!r}. "
                f"Geçerli değerler: {', '.join(VALID_PRIVACY)}"
            )
        if self.upload.videos_per_run < 1:
            raise ConfigError("upload.videos_per_run en az 1 olmalı.")


def _env_str(name: str, current: str) -> str:
    value = os.environ.get(name, "").strip()
    return value or current


def _env_int(name: str, current: int) -> int:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return current
    try:
        return int(raw)
    except ValueError as exc:
        raise ConfigError(f"{name} bir tam sayı olmalı, alınan: {raw!r}") from exc


def _env_bool(name: str, current: bool) -> bool:
    raw = os.environ.get(name, "").strip().lower()
    if not raw:
        return current
    return raw in ("1", "true", "yes", "on", "evet")


def load_config(path: str | Path = "config.yaml") -> Config:
    """config.yaml dosyasını okur, ortam değişkenlerini uygular ve doğrular."""
    raw: dict[str, Any] = {}
    config_path = Path(path)
    if config_path.exists():
        loaded = yaml.safe_load(config_path.read_text(encoding="utf-8"))
        if loaded is not None:
            if not isinstance(loaded, dict):
                raise ConfigError(f"{config_path} bir YAML sözlüğü olmalı.")
            raw = loaded

    drive_raw = raw.get("drive") or {}
    upload_raw = raw.get("upload") or {}
    state_raw = raw.get("state") or {}

    drive = DriveConfig(
        folder_id=str(drive_raw.get("folder_id") or ""),
        done_folder_id=str(drive_raw.get("done_folder_id") or ""),
        order=str(drive_raw.get("order") or "created_time"),
    )
    upload = UploadConfig(
        videos_per_run=int(upload_raw.get("videos_per_run", 1)),
        privacy_status=str(upload_raw.get("privacy_status") or "public"),
        category_id=str(upload_raw.get("category_id") or "22"),
        made_for_kids=bool(upload_raw.get("made_for_kids", False)),
        default_tags=list(upload_raw.get("default_tags") or []),
        title_template=str(upload_raw.get("title_template") or "{name}"),
        description_template=str(upload_raw.get("description_template") or "{name}"),
    )
    state = StateConfig(path=str(state_raw.get("path") or "state/uploaded.json"))

    drive.folder_id = _env_str("DRIVE_FOLDER_ID", drive.folder_id)
    drive.done_folder_id = _env_str("DRIVE_DONE_FOLDER_ID", drive.done_folder_id)
    upload.videos_per_run = _env_int("VIDEOS_PER_RUN", upload.videos_per_run)
    upload.privacy_status = _env_str("PRIVACY_STATUS", upload.privacy_status)
    upload.made_for_kids = _env_bool("MADE_FOR_KIDS", upload.made_for_kids)

    config = Config(drive=drive, upload=upload, state=state)
    config.validate()
    return config
