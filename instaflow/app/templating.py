"""Jinja2 şablon ortamı.

Otomatik HTML kaçışı açıktır (Starlette varsayılanı); şablonlarda `|safe`
kullanılmaz. Şablonlara asla gizli değer geçilmez — yalnızca maskelenmiş
gösterimler.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi.templating import Jinja2Templates

from .config import get_settings
from .timeutils import format_local, to_local

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


def _status_label(status: str) -> str:
    """Durum kodunu Türkçe etikete çevirir."""
    labels = {
        "draft": "Taslak",
        "scheduled": "Planlandı",
        "publishing": "Yayınlanıyor",
        "published": "Yayınlandı",
        "failed": "Başarısız",
    }
    return labels.get(status, status)


def _type_label(content_type: str) -> str:
    """İçerik türünü Türkçe etikete çevirir."""
    labels = {
        "image": "Görsel",
        "video": "Video",
        "reels": "Reels",
        "carousel": "Carousel",
        "story": "Hikâye",
    }
    return labels.get(content_type, content_type)


def _number(value: Any) -> str:
    """Sayıyı okunur biçime getirir."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return "-"
    if number >= 1000:
        return f"{number:,.0f}".replace(",", ".")
    return f"{number:.0f}"


templates.env.filters["localtime"] = format_local
templates.env.filters["localdt"] = to_local
templates.env.filters["status_label"] = _status_label
templates.env.filters["type_label"] = _type_label
templates.env.filters["number"] = _number
templates.env.globals["app_name"] = get_settings().app_name
