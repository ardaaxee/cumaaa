"""Merkezi loglama.

İki hedefe yazar:

* `logs/app.log` — döngüsel dosya (varsayılan 2 MB x 3 yedek, Termux'ta disk
  dostu).
* `logs` tablosu — yalnızca WARNING ve üzeri. Dashboard "son hatalar"
  bölümünü buradan okur.

Veritabanı handler'ı bilinçli olarak "sessiz başarısız" olur: log yazarken
oluşan bir hata uygulamanın asıl işini durdurmamalı.
"""

from __future__ import annotations

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

_LOG_FORMAT = "%(asctime)s %(levelname)-8s %(name)s | %(message)s"
_MAX_BYTES = 2 * 1024 * 1024
_BACKUP_COUNT = 3

_configured = False


class DatabaseLogHandler(logging.Handler):
    """WARNING ve üzeri kayıtları `logs` tablosuna yazar."""

    def __init__(self, level: int = logging.WARNING) -> None:
        super().__init__(level=level)

    def emit(self, record: logging.LogRecord) -> None:
        # Döngüsel içe aktarma olmaması için gecikmeli import.
        try:
            from .database import session_scope
            from .models import LogEntry

            with session_scope() as session:
                session.add(
                    LogEntry(
                        level=record.levelname,
                        logger=record.name,
                        message=self.format(record)[:4000],
                    )
                )
        except Exception:  # noqa: BLE001 - log yazımı asıl akışı bozmamalı
            pass


def setup_logging(
    logs_dir: Path,
    *,
    debug: bool = False,
    to_database: bool = True,
) -> logging.Logger:
    """Kök logger'ı bir kez yapılandırır ve uygulama logger'ını döndürür."""
    global _configured
    logger = logging.getLogger("instaflow")
    if _configured:
        return logger

    logs_dir.mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter(_LOG_FORMAT)
    level = logging.DEBUG if debug else logging.INFO

    logger.setLevel(level)
    logger.propagate = False

    file_handler = RotatingFileHandler(
        logs_dir / "app.log",
        maxBytes=_MAX_BYTES,
        backupCount=_BACKUP_COUNT,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Terminale yalnızca uyarı ve üzeri düşer; ayrıntı dosyada kalır. Böylece
    # CLI çıktısı okunur olur.
    stream_handler = logging.StreamHandler(stream=sys.stderr)
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(logging.DEBUG if debug else logging.WARNING)
    logger.addHandler(stream_handler)

    if to_database:
        db_handler = DatabaseLogHandler()
        db_handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(db_handler)

    _configured = True
    return logger


def get_logger(name: str) -> logging.Logger:
    """`instaflow.<name>` altında bir logger döndürür."""
    return logging.getLogger(f"instaflow.{name}")
