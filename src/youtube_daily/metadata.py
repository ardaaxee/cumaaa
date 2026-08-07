"""Video başlığı/açıklaması/etiketleri: şablonlar + Drive'daki sidecar dosyaları.

Bir video için `video.mp4` yanına konabilecek dosyalar:
  video.json  -> {"title": "...", "description": "...", "tags": ["a", "b"]}
  video.txt   -> ilk satır başlık, kalanı açıklama
  video.jpg   -> küçük resim (kanal doğrulaması gerektirir)
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from datetime import date

from .config import UploadConfig

logger = logging.getLogger(__name__)

# YouTube API sınırları.
MAX_TITLE_LENGTH = 100
MAX_DESCRIPTION_LENGTH = 5000
MAX_TAGS_TOTAL_LENGTH = 500

# YouTube başlık ve açıklamada '<' ve '>' karakterlerini reddeder.
FORBIDDEN_CHARS = re.compile(r"[<>]")

JSON_SIDECAR_SUFFIX = ".json"
TEXT_SIDECAR_SUFFIX = ".txt"
THUMBNAIL_SUFFIXES = (".jpg", ".jpeg", ".png")


@dataclass
class VideoMetadata:
    title: str
    description: str
    tags: list[str] = field(default_factory=list)
    category_id: str = "22"
    privacy_status: str = "public"
    made_for_kids: bool = False

    def to_body(self) -> dict:
        """YouTube videos.insert gövdesi."""
        return {
            "snippet": {
                "title": self.title,
                "description": self.description,
                "tags": self.tags,
                "categoryId": self.category_id,
            },
            "status": {
                "privacyStatus": self.privacy_status,
                "selfDeclaredMadeForKids": self.made_for_kids,
            },
        }


def sanitize_title(value: str) -> str:
    """Yasak karakterleri temizler, sınıra kırpar, boşsa yedek başlık üretir."""
    cleaned = FORBIDDEN_CHARS.sub("", value).strip()
    cleaned = " ".join(cleaned.split())
    if not cleaned:
        cleaned = f"Video {date.today().isoformat()}"
    if len(cleaned) > MAX_TITLE_LENGTH:
        cleaned = cleaned[: MAX_TITLE_LENGTH - 1].rstrip() + "…"
    return cleaned


def sanitize_description(value: str) -> str:
    cleaned = FORBIDDEN_CHARS.sub("", value).strip()
    return cleaned[:MAX_DESCRIPTION_LENGTH]


def sanitize_tags(tags: list[str]) -> list[str]:
    """Tekrarları atar ve toplam 500 karakter sınırını aşmadan doldurur."""
    result: list[str] = []
    seen: set[str] = set()
    total = 0
    for tag in tags:
        cleaned = " ".join(str(tag).split())
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        # Virgül içeren etiketler tırnaklandığı için 2 karakter fazladan yer kaplar.
        cost = len(cleaned) + (2 if "," in cleaned else 0) + (1 if result else 0)
        if total + cost > MAX_TAGS_TOTAL_LENGTH:
            break
        seen.add(key)
        result.append(cleaned)
        total += cost
    return result


def humanize_name(stem: str) -> str:
    """`2026-08-07_bolum-12` -> `bolum 12` gibi okunur bir başlık üretir."""
    text = stem.replace("_", " ").replace("-", " ")
    # Baştaki tarih ön ekini at: "2026 08 07 ..." ya da "20260807 ..."
    text = re.sub(r"^\s*(\d{4}\s+\d{2}\s+\d{2}|\d{8})\s+", "", text)
    return " ".join(text.split()) or stem


def parse_text_sidecar(content: str) -> dict:
    """İlk satır başlık, kalan metin açıklama."""
    lines = content.strip().splitlines()
    if not lines:
        return {}
    return {
        "title": lines[0].strip(),
        "description": "\n".join(lines[1:]).strip(),
    }


def parse_json_sidecar(content: str) -> dict:
    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        logger.warning("Sidecar JSON okunamadı, yok sayılıyor: %s", exc)
        return {}
    if not isinstance(data, dict):
        logger.warning("Sidecar JSON bir sözlük değil, yok sayılıyor.")
        return {}
    return data


def build_metadata(
    *,
    file_stem: str,
    upload_config: UploadConfig,
    sidecar: dict | None = None,
    today: date | None = None,
) -> VideoMetadata:
    """Şablon değerlerini üretir, sidecar varsa onun alanlarıyla ezer."""
    sidecar = sidecar or {}
    today = today or date.today()
    variables = {"name": humanize_name(file_stem), "date": today.isoformat()}

    def render(template: str) -> str:
        try:
            return template.format(**variables)
        except (KeyError, IndexError) as exc:
            logger.warning(
                "Şablon değişkeni çözülemedi (%s); şablon ham haliyle kullanılıyor.", exc
            )
            return template

    title = str(sidecar.get("title") or render(upload_config.title_template))
    description = str(
        sidecar.get("description") or render(upload_config.description_template)
    )

    sidecar_tags = sidecar.get("tags") or []
    if isinstance(sidecar_tags, str):
        sidecar_tags = [part.strip() for part in sidecar_tags.split(",")]

    return VideoMetadata(
        title=sanitize_title(title),
        description=sanitize_description(description),
        tags=sanitize_tags([*upload_config.default_tags, *sidecar_tags]),
        category_id=str(sidecar.get("category_id") or upload_config.category_id),
        privacy_status=str(
            sidecar.get("privacy_status") or upload_config.privacy_status
        ),
        made_for_kids=bool(sidecar.get("made_for_kids", upload_config.made_for_kids)),
    )
