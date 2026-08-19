"""İstatistik ve hesap servisi testleri."""

from __future__ import annotations

import httpx
import pytest
from sqlalchemy import select

from app.config import Settings
from app.database import session_scope
from app.models import Analytics, Content, LogEntry, PublishedPost
from app.schemas import ContentCreate
from app.services import account_service, analytics_service, content_service
from app.timeutils import utcnow


def _published(session, media_id: str = "media-1") -> PublishedPost:
    """Yayınlanmış bir gönderi kaydı üretir."""
    content = content_service.create_content(session, ContentCreate(title="Yayınlanmış"))
    post = PublishedPost(content_id=content.id, ig_media_id=media_id, media_type="IMAGE")
    session.add(post)
    session.flush()
    return post


# --------------------------------------------------------------- eşitleme
async def test_metrikler_veritabanina_yazilir(
    configured_settings: Settings, mock_client_factory
) -> None:
    # Arrange
    with session_scope() as session:
        _published(session)

    def handler(request: httpx.Request) -> httpx.Response:
        if "insights" in request.url.path:
            return httpx.Response(
                200,
                json={
                    "data": [
                        {"name": "reach", "values": [{"value": 250}]},
                        {"name": "likes", "values": [{"value": 40}]},
                    ]
                },
            )
        return httpx.Response(200, json={"data": []})

    client = mock_client_factory(handler)

    # Act
    async with client:
        report = await analytics_service.sync_insights(
            client=client, settings=configured_settings
        )

    # Assert
    assert report.posts_processed == 1
    assert report.metrics_written >= 2
    with session_scope() as session:
        rows = list(session.scalars(select(Analytics).where(Analytics.scope == "media")))
        values = {row.metric: row.value for row in rows}
    assert values["reach"] == 250.0
    assert values["likes"] == 40.0


async def test_ayni_gun_tekrar_cekilirse_uzerine_yazilir(
    configured_settings: Settings, mock_client_factory
) -> None:
    # Arrange
    with session_scope() as session:
        _published(session)

    counter = {"value": 100}

    def handler(request: httpx.Request) -> httpx.Response:
        if "insights" in request.url.path:
            return httpx.Response(
                200, json={"data": [{"name": "reach", "values": [{"value": counter["value"]}]}]}
            )
        return httpx.Response(200, json={"data": []})

    client = mock_client_factory(handler)

    # Act — iki tur, ikinci turda değer artmış
    async with client:
        await analytics_service.sync_insights(client=client, settings=configured_settings)
        counter["value"] = 175
        await analytics_service.sync_insights(client=client, settings=configured_settings)

    # Assert — mükerrer satır değil, güncellenmiş tek satır
    with session_scope() as session:
        rows = list(
            session.scalars(
                select(Analytics).where(
                    Analytics.scope == "media", Analytics.metric == "reach"
                )
            )
        )
    assert len(rows) == 1
    assert rows[0].value == 175.0


async def test_desteklenmeyen_metrik_uydurulmaz(
    configured_settings: Settings, mock_client_factory
) -> None:
    """API bir metriği döndürmezse sıfır yazılmaz — satır hiç oluşmaz."""
    # Arrange
    with session_scope() as session:
        _published(session)

    def handler(request: httpx.Request) -> httpx.Response:
        metric = request.url.params.get("metric", "")
        if "," in metric:
            return httpx.Response(400, json={"error": {"message": "deprecated metric"}})
        if metric == "reach":
            return httpx.Response(200, json={"data": [{"name": "reach", "values": [{"value": 5}]}]})
        return httpx.Response(400, json={"error": {"message": f"{metric} desteklenmiyor"}})

    client = mock_client_factory(handler)

    # Act
    async with client:
        report = await analytics_service.sync_insights(
            client=client, settings=configured_settings
        )

    # Assert
    assert "views" in report.unsupported
    with session_scope() as session:
        metrics = {row.metric for row in session.scalars(select(Analytics))}
    assert "views" not in metrics
    assert "reach" in metrics


async def test_kimlik_bilgisi_yoksa_hata_raporlanir(isolated_env: Settings) -> None:
    report = await analytics_service.sync_insights(settings=isolated_env)

    assert report.ok is False
    assert any("yapılandırılmamış" in error for error in report.errors)


async def test_okunamayan_gonderi_digerlerini_engellemez(
    configured_settings: Settings, mock_client_factory, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Bir gönderi okunamasa bile diğerlerinin metrikleri yazılır."""
    # Arrange
    monkeypatch.setattr(configured_settings, "http_backoff_base_seconds", 0.01)
    with session_scope() as session:
        _published(session, "media-1")
        _published(session, "media-2")

    def handler(request: httpx.Request) -> httpx.Response:
        if "media-1" in request.url.path:
            return httpx.Response(400, json={"error": {"message": "bu gönderi okunamıyor"}})
        return httpx.Response(200, json={"data": [{"name": "reach", "values": [{"value": 9}]}]})

    client = mock_client_factory(handler)

    # Act
    async with client:
        report = await analytics_service.sync_insights(
            client=client, settings=configured_settings
        )

    # Assert — okunamayan gönderi "desteklenmiyor" olarak raporlanır,
    # okunabilen gönderinin verisi kaydedilir.
    assert report.unsupported
    with session_scope() as session:
        rows = list(session.scalars(select(Analytics).where(Analytics.scope == "media")))
    assert {row.object_id for row in rows} == {"media-2"}
    assert rows[0].value == 9.0


async def test_yetki_hatasi_esitlemeyi_durdurur(
    configured_settings: Settings, mock_client_factory
) -> None:
    """Token geçersizken kalan gönderiler için boşuna istek atılmamalı."""
    # Arrange — üç yayınlanmış gönderi, token geçersiz
    with session_scope() as session:
        _published(session, "media-1")
        _published(session, "media-2")
        _published(session, "media-3")

    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        return httpx.Response(
            401, json={"error": {"message": "invalid token", "code": 190}}
        )

    client = mock_client_factory(handler)

    # Act
    async with client:
        report = await analytics_service.sync_insights(
            client=client, settings=configured_settings
        )

    # Assert — ilk hatada durulur, üç ayrı gönderi için üç istek atılmaz
    assert report.ok is False
    assert calls["count"] == 1
    assert any("geçersiz" in error for error in report.errors)


# ----------------------------------------------------------------- özetleme
def test_toplamlar_en_guncel_olcumu_kullanir(isolated_env: Settings) -> None:
    # Arrange — aynı gönderi için iki farklı günün kaydı
    with session_scope() as session:
        post = _published(session)
        session.add_all(
            [
                Analytics(
                    published_post_id=post.id,
                    scope="media",
                    object_id="media-1",
                    metric="reach",
                    value=100,
                    captured_on="2026-08-01",
                ),
                Analytics(
                    published_post_id=post.id,
                    scope="media",
                    object_id="media-1",
                    metric="reach",
                    value=180,
                    captured_on="2026-08-05",
                ),
            ]
        )

    # Act
    with session_scope() as session:
        totals = analytics_service.totals_by_metric(session)

    # Assert — iki ölçüm toplanmaz, en günceli alınır
    assert totals == {"reach": 180.0}


def test_gonderi_bazinda_metrikler_eslesir(isolated_env: Settings) -> None:
    with session_scope() as session:
        post = _published(session)
        session.add(
            Analytics(
                published_post_id=post.id,
                scope="media",
                object_id="media-1",
                metric="likes",
                value=12,
                captured_on="2026-08-05",
            )
        )

    with session_scope() as session:
        rows = analytics_service.per_post_metrics(session)

    assert len(rows) == 1
    _post, metrics = rows[0]
    assert metrics == {"likes": 12.0}


def test_veri_yoksa_bos_donulur(isolated_env: Settings) -> None:
    with session_scope() as session:
        assert analytics_service.has_any_data(session) is False
        assert analytics_service.totals_by_metric(session) == {}
        assert analytics_service.per_post_metrics(session) == []


def test_hesap_serisi_gune_gore_siralanir(isolated_env: Settings) -> None:
    with session_scope() as session:
        session.add_all(
            [
                Analytics(
                    scope="account",
                    object_id="17841400000000000",
                    metric="reach",
                    value=5,
                    captured_on=utcnow().strftime("%Y-%m-%d"),
                )
            ]
        )

    with session_scope() as session:
        series = analytics_service.account_series(session, "reach", days=30)

    assert len(series) == 1
    assert series[0][1] == 5.0


# ------------------------------------------------------------- hesap servisi
async def test_baglanti_dogrulamasi_hesabi_kaydeder(
    configured_settings: Settings, mock_client_factory
) -> None:
    # Arrange
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "id": "17841400000000000",
                "username": "ornek_hesap",
                "account_type": "BUSINESS",
                "followers_count": 1234,
                "media_count": 56,
            },
        )

    client = mock_client_factory(handler)

    # Act
    async with client:
        status = await account_service.verify_connection(
            client=client, settings=configured_settings
        )

    # Assert
    assert status.connected is True
    assert status.username == "ornek_hesap"
    with session_scope() as session:
        account = account_service.get_active_account(session)
    assert account is not None
    assert account.followers_count == 1234


async def test_gecersiz_token_baglantiyi_koparir(
    configured_settings: Settings, mock_client_factory
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            401, json={"error": {"message": "invalid token", "code": 190, "error_subcode": 463}}
        )

    client = mock_client_factory(handler)

    async with client:
        status = await account_service.verify_connection(
            client=client, settings=configured_settings
        )

    assert status.connected is False
    assert "süresi dolmuş" in status.message


async def test_kimlik_bilgisi_yoksa_durum_acik_soylenir(isolated_env: Settings) -> None:
    status = await account_service.verify_connection(settings=isolated_env)

    assert status.configured is False
    assert "yapılandırılmamış" in status.message


def test_hesap_kaydi_guncellenir(configured_settings: Settings) -> None:
    # Arrange
    with session_scope() as session:
        account_service.upsert_account(
            session, {"id": "17841400000000000", "username": "ilk"}, settings=configured_settings
        )

    # Act — aynı hesap yeni bilgilerle
    with session_scope() as session:
        account_service.upsert_account(
            session,
            {"id": "17841400000000000", "username": "guncel", "followers_count": 99},
            settings=configured_settings,
        )

    # Assert — ikinci kayıt açılmaz
    with session_scope() as session:
        from app.models import Account

        accounts = list(session.scalars(select(Account)))
    assert len(accounts) == 1
    assert accounts[0].username == "guncel"
    assert accounts[0].followers_count == 99


def test_token_maskeli_gosterilir(configured_settings: Settings) -> None:
    from app.instagram.auth import TokenInfo

    with session_scope() as session:
        account = account_service.upsert_account(
            session,
            {"id": "17841400000000000"},
            token=TokenInfo(access_token="COK-GIZLI-TOKEN-DEGERI", expires_in=5183944),
            settings=configured_settings,
        )
        masked = account.masked_token()

    assert "GIZLI" not in masked
    assert masked.startswith("COK-")


def test_sistem_durumu_toplanir(isolated_env: Settings) -> None:
    with session_scope() as session:
        content_service.create_content(session, ContentCreate(title="x"))
        status = account_service.build_system_status(session, scheduler_running=True)

    assert status.app_name == "InstaFlow"
    assert status.scheduler_running is True
    assert status.counts["draft"] == 1
    assert status.instagram.configured is False


def test_son_hatalar_listelenir(isolated_env: Settings) -> None:
    # Arrange
    with session_scope() as session:
        session.add_all(
            [
                LogEntry(level="ERROR", logger="test", message="bir hata"),
                LogEntry(level="INFO", logger="test", message="bilgi"),
            ]
        )

    # Act
    with session_scope() as session:
        errors = account_service.recent_errors(session)

    # Assert — yalnızca uyarı ve üzeri
    assert len(errors) == 1
    assert errors[0].message == "bir hata"


def test_eski_loglar_temizlenir(isolated_env: Settings) -> None:
    from datetime import timedelta

    with session_scope() as session:
        session.add_all(
            [
                LogEntry(level="ERROR", message="eski", created_at=utcnow() - timedelta(days=60)),
                LogEntry(level="ERROR", message="yeni"),
            ]
        )

    with session_scope() as session:
        removed = account_service.prune_logs(session, keep_days=30)

    assert removed == 1
    with session_scope() as session:
        remaining = list(session.scalars(select(LogEntry)))
    assert len(remaining) == 1
    assert remaining[0].message == "yeni"
