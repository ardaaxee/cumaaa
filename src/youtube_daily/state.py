"""Yüklenen videoların kaydı — aynı video iki kez yüklenmesin diye."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1


class UploadState:
    """`state/uploaded.json` dosyasını okuyup yazan basit kayıt defteri."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self._entries: dict[str, dict[str, Any]] = {}
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"{self.path} okunamadı (bozuk JSON): {exc}. "
                "Dosyayı düzeltin ya da silin."
            ) from exc
        entries = data.get("uploads") if isinstance(data, dict) else None
        if isinstance(entries, dict):
            self._entries = entries

    def is_uploaded(self, drive_file_id: str) -> bool:
        return drive_file_id in self._entries

    def get(self, drive_file_id: str) -> dict[str, Any] | None:
        return self._entries.get(drive_file_id)

    def mark_uploaded(
        self,
        drive_file_id: str,
        *,
        video_id: str,
        title: str,
        file_name: str,
    ) -> None:
        self._entries[drive_file_id] = {
            "video_id": video_id,
            "title": title,
            "file_name": file_name,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "uploaded_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema_version": SCHEMA_VERSION,
            "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "uploads": self._entries,
        }
        # Atomik yazım: yarım kalan bir çalıştırma kaydı bozmasın.
        tmp = self.path.with_suffix(self.path.suffix + ".tmp")
        tmp.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        tmp.replace(self.path)

    def __len__(self) -> int:
        return len(self._entries)
