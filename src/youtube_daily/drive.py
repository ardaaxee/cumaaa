"""Google Drive tarafı: klasördeki videoları listeleme ve indirme."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from .config import DriveConfig
from .retry import execute_with_retry

logger = logging.getLogger(__name__)

FIELDS = "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents)"

ORDER_BY = {
    "created_time": "createdTime",
    "modified_time": "modifiedTime",
    "name": "name_natural",
}

# Drive'ın kendi listelemesi bazı hesaplarda tutarsız sıralayabildiği için
# istemci tarafında da aynı anahtarla sıralıyoruz.
SORT_KEY = {
    "created_time": lambda f: (f.created_time, f.name),
    "modified_time": lambda f: (f.modified_time, f.name),
    "name": lambda f: (f.name.lower(), f.created_time),
}


@dataclass(frozen=True)
class DriveFile:
    id: str
    name: str
    mime_type: str
    size: int
    created_time: str
    modified_time: str

    @property
    def stem(self) -> str:
        """Uzantısız dosya adı — sidecar eşleştirmesi ve başlık için."""
        return Path(self.name).stem

    @property
    def is_video(self) -> bool:
        return self.mime_type.startswith("video/")


def build_drive_service(credentials: Any):
    return build("drive", "v3", credentials=credentials, cache_discovery=False)


def _to_file(raw: dict[str, Any]) -> DriveFile:
    return DriveFile(
        id=raw["id"],
        name=raw.get("name", ""),
        mime_type=raw.get("mimeType", ""),
        size=int(raw.get("size") or 0),
        created_time=raw.get("createdTime", ""),
        modified_time=raw.get("modifiedTime", ""),
    )


def list_folder(service: Any, folder_id: str, order: str = "created_time") -> list[DriveFile]:
    """Klasördeki (çöp kutusunda olmayan) tüm dosyaları döndürür."""
    order_by = ORDER_BY.get(order, "createdTime")
    query = f"'{folder_id}' in parents and trashed = false"
    files: list[DriveFile] = []
    page_token: str | None = None

    while True:
        request = service.files().list(
            q=query,
            fields=FIELDS,
            orderBy=order_by,
            pageSize=200,
            pageToken=page_token,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        )
        response = execute_with_retry(request, description=f"Drive klasör listeleme ({folder_id})")
        files.extend(_to_file(item) for item in response.get("files", []))
        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return files


def pick_videos(files: Iterable[DriveFile], order: str = "created_time") -> list[DriveFile]:
    """Listeden yalnızca video dosyalarını alır ve yükleme sırasına dizer."""
    videos = [f for f in files if f.is_video]
    key = SORT_KEY.get(order, SORT_KEY["created_time"])
    return sorted(videos, key=key)


def index_sidecars(files: Iterable[DriveFile]) -> dict[str, DriveFile]:
    """Video olmayan dosyaları adlarına göre indeksler (metadata/kapak dosyaları)."""
    return {f.name.lower(): f for f in files if not f.is_video}


def download_file(service: Any, file_id: str, destination: str | Path) -> Path:
    """Drive dosyasını diske indirir."""
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)

    request = service.files().get_media(fileId=file_id, supportsAllDrives=True)
    with destination.open("wb") as handle:
        downloader = MediaIoBaseDownload(handle, request, chunksize=16 * 1024 * 1024)
        done = False
        last_logged = -1
        while not done:
            status, done = downloader.next_chunk(num_retries=5)
            if status:
                percent = int(status.progress() * 100)
                if percent >= last_logged + 20:
                    logger.info("İndiriliyor... %%%d", percent)
                    last_logged = percent

    logger.info("İndirildi: %s (%.1f MB)", destination.name, destination.stat().st_size / 1e6)
    return destination


def read_text_file(service: Any, file_id: str) -> str:
    """Küçük metin dosyalarını (sidecar) doğrudan belleğe okur."""
    request = service.files().get_media(fileId=file_id, supportsAllDrives=True)
    content = execute_with_retry(request, description=f"Drive metin okuma ({file_id})")
    if isinstance(content, bytes):
        return content.decode("utf-8", errors="replace")
    return str(content)


def move_to_folder(service: Any, file_id: str, dest_folder_id: str, src_folder_id: str) -> None:
    """Yüklenen videoyu 'bitti' klasörüne taşır (tam drive yetkisi gerektirir)."""
    request = service.files().update(
        fileId=file_id,
        addParents=dest_folder_id,
        removeParents=src_folder_id,
        fields="id, parents",
        supportsAllDrives=True,
    )
    execute_with_retry(request, description=f"Drive taşıma ({file_id})")
    logger.info("Drive'da '%s' klasörüne taşındı.", dest_folder_id)


def resolve_folder_id(config: DriveConfig) -> str:
    """Kullanıcı tam Drive URL'si yapıştırdıysa da çalışsın diye ID'yi ayıklar."""
    value = config.folder_id.strip()
    if "drive.google.com" in value:
        # .../folders/<ID>?usp=... biçiminden ID'yi çıkar.
        tail = value.split("/folders/")[-1]
        value = tail.split("?")[0].split("/")[0]
    return value
