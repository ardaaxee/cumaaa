"""Veritabanı bağlantısı ve oturum yönetimi.

SQLite tek dosya üzerinde çalışır; scheduler ve web sunucusu aynı süreçte
olduğu için WAL kipi ve makul bir `busy_timeout` yazma çakışmalarını çözer.
"""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import Engine, create_engine, event, select
from sqlalchemy.orm import Session, sessionmaker

from .config import get_settings
from .logging_setup import get_logger
from .models import Base, User

logger = get_logger("db")

_engine: Engine | None = None
_SessionFactory: sessionmaker[Session] | None = None

DEFAULT_USERNAME = "local"


def _configure_sqlite(dbapi_connection, _connection_record) -> None:
    """Her yeni bağlantıda SQLite pragmalarını ayarla."""
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=10000")
    finally:
        cursor.close()


def get_engine() -> Engine:
    """Süreç genelinde tek engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        url = settings.resolved_database_url
        connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
        _engine = create_engine(
            url,
            echo=False,
            future=True,
            pool_pre_ping=True,
            connect_args=connect_args,
        )
        if url.startswith("sqlite"):
            event.listen(_engine, "connect", _configure_sqlite)
        logger.debug("Veritabanı motoru hazır: %s", url)
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    """Oturum fabrikası."""
    global _SessionFactory
    if _SessionFactory is None:
        _SessionFactory = sessionmaker(
            bind=get_engine(), autoflush=False, expire_on_commit=False, future=True
        )
    return _SessionFactory


@contextmanager
def session_scope() -> Iterator[Session]:
    """Commit/rollback'i yöneten oturum bağlamı."""
    session = get_session_factory()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db() -> Iterator[Session]:
    """FastAPI bağımlılığı."""
    with session_scope() as session:
        yield session


def init_db() -> None:
    """Tabloları oluştur ve varsayılan yerel kullanıcıyı garanti et."""
    settings = get_settings()
    settings.ensure_directories()
    Base.metadata.create_all(bind=get_engine())
    with session_scope() as session:
        exists = session.scalar(select(User).where(User.username == DEFAULT_USERNAME))
        if exists is None:
            session.add(User(username=DEFAULT_USERNAME, display_name="Yerel kullanıcı"))
            logger.info("Varsayılan yerel kullanıcı oluşturuldu.")


def get_default_user(session: Session) -> User:
    """Varsayılan yerel kullanıcıyı döndürür, yoksa oluşturur."""
    user = session.scalar(select(User).where(User.username == DEFAULT_USERNAME))
    if user is None:
        user = User(username=DEFAULT_USERNAME, display_name="Yerel kullanıcı")
        session.add(user)
        session.flush()
    return user


def reset_engine() -> None:
    """Testler için: motoru ve oturum fabrikasını sıfırla."""
    global _engine, _SessionFactory
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _SessionFactory = None
