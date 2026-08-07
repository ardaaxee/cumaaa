"""Google API çağrıları için üstel geri çekilmeli yeniden deneme."""

from __future__ import annotations

import logging
import random
import time
from typing import Any, Callable, TypeVar

from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

T = TypeVar("T")

# Geçici sunucu hataları ve hız sınırı — tekrar denemeye değer.
RETRIABLE_STATUS = frozenset({429, 500, 502, 503, 504})
MAX_ATTEMPTS = 5
BASE_DELAY_SECONDS = 2.0


def _status_of(error: HttpError) -> int | None:
    return getattr(error.resp, "status", None)


def is_retriable(error: BaseException) -> bool:
    if isinstance(error, HttpError):
        return _status_of(error) in RETRIABLE_STATUS
    # Ağ kesintileri (ConnectionResetError, TimeoutError, ssl hataları vb.)
    return isinstance(error, (ConnectionError, TimeoutError, OSError))


def backoff_delay(attempt: int) -> float:
    """attempt 1'den başlar: 2s, 4s, 8s, 16s (+ jitter)."""
    return BASE_DELAY_SECONDS * (2 ** (attempt - 1)) + random.uniform(0, 1)


def call_with_retry(
    func: Callable[[], T],
    *,
    description: str,
    max_attempts: int = MAX_ATTEMPTS,
    sleep: Callable[[float], None] = time.sleep,
) -> T:
    """`func`'u geçici hatalarda yeniden dener; kalıcı hatalarda hemen fırlatır."""
    last_error: BaseException | None = None

    for attempt in range(1, max_attempts + 1):
        try:
            return func()
        except BaseException as error:  # noqa: BLE001 - hata türünü is_retriable belirler
            if not is_retriable(error):
                raise
            last_error = error
            if attempt == max_attempts:
                break
            delay = backoff_delay(attempt)
            logger.warning(
                "%s başarısız (deneme %d/%d): %s — %.1f sn sonra tekrar denenecek.",
                description,
                attempt,
                max_attempts,
                error,
                delay,
            )
            sleep(delay)

    raise RuntimeError(
        f"{description}: {max_attempts} denemenin tamamı başarısız oldu."
    ) from last_error


def execute_with_retry(request: Any, *, description: str, **kwargs: Any) -> Any:
    """Bir googleapiclient isteğini yeniden denemeli çalıştırır."""
    return call_with_retry(lambda: request.execute(**kwargs), description=description)
