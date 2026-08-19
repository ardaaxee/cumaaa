"""Test altyapısı.

Her test yalıtılmış bir çalışma dizini ve kendi SQLite veritabanını alır.
Gerçek Instagram hesabına **hiçbir** istek gitmez: tüm HTTP çağrıları
`httpx.MockTransport` ile karşılanır.
"""

from __future__ import annotations

import sys
from collections.abc import Callable, Iterator
from pathlib import Path

import httpx
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.config import Settings, get_settings  # noqa: E402
from app.database import init_db, reset_engine  # noqa: E402
from app.instagram.client import InstagramClient  # noqa: E402
from app.logging_setup import setup_logging  # noqa: E402

TEST_IG_USER_ID = "17841400000000000"
TEST_TOKEN = "test-token-not-a-real-secret"

#: 1x1 piksel JPEG (geçerli imza taşır).
TINY_JPEG = bytes.fromhex(
    "ffd8ffe000104a46494600010100000100010000ffdb004300ffffffffffffff"
    "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    "ffc00011080001000103012200021101031101ffc4001f00000105010101010101"
    "00000000000000000102030405060708090a0bffda0008010100003f00d2cf20"
    "ffd9"
)
#: Küçük MP4 başlığı (ftyp kutusu).
TINY_MP4 = b"\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2" + b"\x00" * 32


@pytest.fixture(scope="session", autouse=True)
def configure_logging(tmp_path_factory: pytest.TempPathFactory) -> None:
    """Loglama zincirini bir kez kurar.

    `setup_logging` süreç başına yalnızca bir kez yapılandırır; burada
    çağırmazsak veritabanı log handler'ı hiç bağlanmaz ve "hatalar logs
    tablosuna yazılıyor mu" sorusu test edilemez.
    """
    setup_logging(tmp_path_factory.mktemp("logs"), debug=False, to_database=True)


@pytest.fixture(autouse=True)
def isolated_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[Settings]:
    """Her test için temiz dizinler, temiz veritabanı, temiz ayarlar."""
    data_dir = tmp_path / "data"
    content_dir = tmp_path / "content"
    logs_dir = tmp_path / "logs"

    monkeypatch.setenv("DATA_DIR", str(data_dir))
    monkeypatch.setenv("CONTENT_DIR", str(content_dir))
    monkeypatch.setenv("LOGS_DIR", str(logs_dir))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{(data_dir / 'test.db').as_posix()}")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-for-signing-only")
    monkeypatch.setenv("TIMEZONE", "Europe/Istanbul")
    monkeypatch.setenv("APP_ENV", "development")

    # Testler asla gerçek kimlik bilgisi kullanmamalı.
    for name in (
        "INSTAGRAM_ACCESS_TOKEN",
        "INSTAGRAM_USER_ID",
        "META_APP_ID",
        "META_APP_SECRET",
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "PUBLIC_BASE_URL",
    ):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("AI_PROVIDER", "local")

    get_settings.cache_clear()
    reset_engine()

    settings = get_settings()
    settings.ensure_directories()
    init_db()

    yield settings

    reset_engine()
    get_settings.cache_clear()


@pytest.fixture
def configured_settings(monkeypatch: pytest.MonkeyPatch) -> Settings:
    """Instagram kimlik bilgileri tanımlıymış gibi davranan ayarlar."""
    monkeypatch.setenv("INSTAGRAM_ACCESS_TOKEN", TEST_TOKEN)
    monkeypatch.setenv("INSTAGRAM_USER_ID", TEST_IG_USER_ID)
    get_settings.cache_clear()
    settings = get_settings()
    settings.ensure_directories()
    return settings


@pytest.fixture
def mock_client_factory() -> Callable[[Callable[[httpx.Request], httpx.Response]], InstagramClient]:
    """Verilen yanıtlayıcıyı kullanan sahte bir Instagram istemcisi üretir."""

    def factory(handler: Callable[[httpx.Request], httpx.Response]) -> InstagramClient:
        transport = httpx.MockTransport(handler)
        http_client = httpx.AsyncClient(transport=transport)
        return InstagramClient(
            TEST_TOKEN,
            TEST_IG_USER_ID,
            settings=get_settings(),
            http_client=http_client,
        )

    return factory


@pytest.fixture
def publish_handler() -> Callable[[httpx.Request], httpx.Response]:
    """Başarılı bir yayın akışını taklit eden yanıtlayıcı."""

    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path.endswith("/media_publish"):
            return httpx.Response(200, json={"id": "media-1"})
        if path.endswith("/media"):
            return httpx.Response(200, json={"id": "container-1"})
        if path.endswith("/container-1"):
            return httpx.Response(200, json={"status_code": "FINISHED"})
        if path.endswith("/media-1"):
            return httpx.Response(
                200,
                json={
                    "id": "media-1",
                    "permalink": "https://www.instagram.com/p/TEST/",
                    "media_type": "IMAGE",
                },
            )
        return httpx.Response(404, json={"error": {"message": "bilinmeyen yol", "code": 100}})

    return handler


@pytest.fixture
def jpeg_file(isolated_env: Settings) -> Path:
    """content/drafts altında geçerli bir JPEG."""
    target = isolated_env.content_dir / "drafts" / "ornek.jpg"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(TINY_JPEG)
    return target
