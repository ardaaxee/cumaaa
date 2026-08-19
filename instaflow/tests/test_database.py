"""Veritabanı katmanı testleri."""

from __future__ import annotations

import pytest
from sqlalchemy import inspect, select
from sqlalchemy.exc import IntegrityError

from app.config import Settings
from app.database import get_default_user, get_engine, init_db, session_scope
from app.models import Content, ContentStatus, PublishedPost, User

EXPECTED_TABLES = {
    "users",
    "accounts",
    "content",
    "scheduled_posts",
    "published_posts",
    "analytics",
    "logs",
}


def test_tum_tablolar_olusur(isolated_env: Settings) -> None:
    tables = set(inspect(get_engine()).get_table_names())

    assert EXPECTED_TABLES.issubset(tables)


def test_init_db_tekrar_calistirilabilir(isolated_env: Settings) -> None:
    # Arrange / Act — iki kez çağırmak hata vermemeli.
    init_db()
    init_db()

    # Assert — kullanıcı yalnızca bir kez oluşur.
    with session_scope() as session:
        users = list(session.scalars(select(User)))
    assert len(users) == 1


def test_varsayilan_kullanici_olusur(isolated_env: Settings) -> None:
    with session_scope() as session:
        user = get_default_user(session)

        assert user.username == "local"
        assert user.is_active is True


def test_oturum_hatada_geri_alir(isolated_env: Settings) -> None:
    # Arrange
    with session_scope() as session:
        user = get_default_user(session)
        user_id = user.id

    # Act — bilinçli bir hata
    with pytest.raises(RuntimeError):
        with session_scope() as session:
            session.add(Content(user_id=user_id, title="yarım kalacak"))
            raise RuntimeError("bilerek")

    # Assert — kayıt yazılmamış olmalı
    with session_scope() as session:
        assert session.scalar(select(Content)) is None


def test_yayinlanan_gonderi_content_id_benzersiz(isolated_env: Settings) -> None:
    # Arrange
    with session_scope() as session:
        user = get_default_user(session)
        content = Content(
            user_id=user.id, title="tek", status=ContentStatus.PUBLISHED.value
        )
        session.add(content)
        session.flush()
        content_id = content.id
        session.add(PublishedPost(content_id=content_id, ig_media_id="m-1"))

    # Act / Assert — aynı içerik için ikinci kayıt reddedilmeli
    with pytest.raises(IntegrityError):
        with session_scope() as session:
            session.add(PublishedPost(content_id=content_id, ig_media_id="m-2"))


def test_ayni_medya_kimligi_iki_kez_yazilamaz(isolated_env: Settings) -> None:
    # Arrange
    with session_scope() as session:
        user = get_default_user(session)
        first = Content(user_id=user.id, title="a")
        second = Content(user_id=user.id, title="b")
        session.add_all([first, second])
        session.flush()
        ids = (first.id, second.id)
        session.add(PublishedPost(content_id=ids[0], ig_media_id="ayni-medya"))

    # Act / Assert
    with pytest.raises(IntegrityError):
        with session_scope() as session:
            session.add(PublishedPost(content_id=ids[1], ig_media_id="ayni-medya"))
