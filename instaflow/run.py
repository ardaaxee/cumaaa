#!/usr/bin/env python3
"""InstaFlow komut satırı arayüzü.

Kullanım örnekleri::

    python run.py status
    python run.py start
    python run.py instagram-test
    python run.py generate-caption "yeni teknoloji setup videom"
    python run.py schedule 3 "2026-08-20 18:00"
    python run.py publish 3
    python run.py backup
"""

from __future__ import annotations

import asyncio
import os
import shutil
import signal
import sys
import tarfile
from datetime import datetime
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.ai import captions as ai_captions  # noqa: E402
from app.ai import content as ai_content  # noqa: E402
from app.ai import hashtags as ai_hashtags  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.database import init_db, session_scope  # noqa: E402
from app.errors import InstaFlowError  # noqa: E402
from app.logging_setup import setup_logging  # noqa: E402
from app.models import ContentType  # noqa: E402
from app.schemas import ContentCreate  # noqa: E402
from app.services import (  # noqa: E402
    account_service,
    analytics_service,
    content_service,
    publishing_service,
)
from app.timeutils import format_local, parse_local  # noqa: E402

console = Console()
cli = typer.Typer(
    add_completion=False,
    no_args_is_help=True,
    help="InstaFlow — Instagram içerik otomasyonu (resmî Graph API ile).",
)

PID_FILENAME = "instaflow.pid"


def _pid_file() -> Path:
    return get_settings().data_dir / PID_FILENAME


def _read_pid() -> int | None:
    """Çalışan sunucunun PID'i (varsa ve süreç yaşıyorsa)."""
    path = _pid_file()
    if not path.exists():
        return None
    try:
        pid = int(path.read_text(encoding="utf-8").strip())
    except (ValueError, OSError):
        return None
    try:
        os.kill(pid, 0)
    except OSError:
        return None
    return pid


def _bootstrap() -> None:
    """Her komuttan önce: dizinler, log, veritabanı."""
    settings = get_settings()
    settings.ensure_directories()
    setup_logging(settings.logs_dir, debug=settings.debug)
    init_db()


def _fail(message: str) -> None:
    """Hata yazıp çıkar."""
    console.print(f"[bold red]Hata:[/] {message}")
    raise typer.Exit(code=1)


# ------------------------------------------------------------------ yaşam döngüsü
@cli.command("start")
def start(
    host: str = typer.Option("", help="Dinlenecek adres (varsayılan: .env HOST)."),
    port: int = typer.Option(0, help="Port (varsayılan: .env PORT)."),
    scheduler: bool = typer.Option(True, help="Scheduler bu süreçte çalışsın mı?"),
    reload: bool = typer.Option(False, help="Geliştirme için otomatik yeniden yükleme."),
) -> None:
    """Web sunucusunu ve scheduler'ı başlatır."""
    _bootstrap()
    settings = get_settings()
    bind_host = host or settings.host
    bind_port = port or settings.port

    existing = _read_pid()
    if existing:
        _fail(f"Zaten çalışıyor (PID {existing}). Önce 'python run.py stop' deneyin.")

    os.environ["RUN_SCHEDULER"] = "1" if scheduler else "0"
    _pid_file().write_text(str(os.getpid()), encoding="utf-8")

    console.print(
        Panel(
            f"[bold]{settings.app_name}[/] çalışıyor\n"
            f"Adres:  http://{bind_host}:{bind_port}/dashboard\n"
            f"Ortam:  {settings.app_env}\n"
            f"Scheduler: {'açık' if scheduler else 'kapalı'}\n"
            f"Durdurmak için: Ctrl+C veya python run.py stop",
            title="InstaFlow",
        )
    )

    import uvicorn

    try:
        uvicorn.run(
            "app.main:app",
            host=bind_host,
            port=bind_port,
            reload=reload,
            log_level="debug" if settings.debug else "info",
            access_log=settings.debug,
        )
    finally:
        _pid_file().unlink(missing_ok=True)


@cli.command("dashboard")
def dashboard() -> None:
    """Sunucuyu başlatır ve panel adresini gösterir (start ile aynı)."""
    start(host="", port=0, scheduler=True, reload=False)


@cli.command("stop")
def stop() -> None:
    """Çalışan sunucuyu durdurur."""
    pid = _read_pid()
    if pid is None:
        console.print("[yellow]Çalışan bir InstaFlow süreci bulunamadı.[/]")
        _pid_file().unlink(missing_ok=True)
        return
    try:
        os.kill(pid, signal.SIGTERM)
    except OSError as exc:
        _fail(f"Süreç durdurulamadı (PID {pid}): {exc}")
    _pid_file().unlink(missing_ok=True)
    console.print(f"[green]Durduruldu[/] (PID {pid}).")


@cli.command("status")
def status() -> None:
    """Sistem durumunu gösterir."""
    _bootstrap()
    settings = get_settings()
    pid = _read_pid()

    with session_scope() as session:
        system = account_service.build_system_status(
            session, scheduler_running=pid is not None
        )

    table = Table(title="InstaFlow Durum", show_header=False)
    table.add_column("Alan", style="bold")
    table.add_column("Değer")
    table.add_row("Uygulama", f"{system.app_name} ({system.app_env})")
    table.add_row("Sunucu", f"çalışıyor (PID {pid})" if pid else "durdu")
    table.add_row("Veritabanı", system.database_path)
    table.add_row("Saat dilimi", system.timezone)
    table.add_row("Giriş kipi", system.instagram.login_mode)
    table.add_row("API sürümü", system.instagram.api_version)
    table.add_row(
        "Instagram",
        "[green]CONFIGURED[/]" if system.instagram.configured else "[red]NOT CONFIGURED[/]",
    )
    table.add_row(
        "AI",
        f"[green]{system.ai_provider}[/]" if system.ai_configured else f"[red]{system.ai_provider} (anahtar yok)[/]",
    )
    for key in ("total", "draft", "scheduled", "published", "failed"):
        table.add_row(f"İçerik: {key}", str(system.counts.get(key, 0)))
    console.print(table)

    if not system.instagram.configured:
        console.print(
            "\n[yellow]Instagram API credentials yapılandırılmamış.[/] "
            "\n.env dosyasına INSTAGRAM_ACCESS_TOKEN ve INSTAGRAM_USER_ID ekleyin "
            "veya panelden 'Instagram hesabı bağla' akışını kullanın."
        )
    if not settings.public_base_url:
        console.print(
            "\n[yellow]PUBLIC_BASE_URL tanımlı değil.[/] Yerel dosyalar yayınlanamaz; "
            "içeriklere herkese açık bir medya adresi (media_url) girin."
        )


# ------------------------------------------------------------------ instagram
@cli.command("instagram-test")
def instagram_test() -> None:
    """Instagram bağlantısını canlı olarak dener."""
    _bootstrap()
    settings = get_settings()

    if not settings.is_instagram_configured:
        console.print("[bold red]Instagram API credentials yapılandırılmamış.[/]")
        console.print(
            "\nGerekli değerler (.env):\n"
            "  INSTAGRAM_ACCESS_TOKEN=\n"
            "  INSTAGRAM_USER_ID=\n\n"
            "OAuth ile bağlanmak için ayrıca META_APP_ID, META_APP_SECRET ve "
            "OAUTH_REDIRECT_URI gerekir."
        )
        raise typer.Exit(code=1)

    result = asyncio.run(account_service.verify_connection())
    if not result.connected:
        _fail(result.message)

    table = Table(title="Instagram Bağlantısı")
    table.add_column("Alan", style="bold")
    table.add_column("Değer")
    table.add_row("Kullanıcı", f"@{result.username}" if result.username else "—")
    table.add_row("Hesap kimliği", result.ig_user_id)
    table.add_row("Hesap türü", result.account_type or "—")
    table.add_row("Takipçi", str(result.followers_count))
    table.add_row("Gönderi", str(result.media_count))
    console.print(table)
    console.print("[green]Bağlantı doğrulandı.[/]")


# --------------------------------------------------------------------- içerik
@cli.command("content-list")
def content_list(
    status_filter: str = typer.Option("", "--status", help="draft/scheduled/published/failed"),
    limit: int = typer.Option(30, help="Kaç kayıt gösterilsin."),
) -> None:
    """İçerikleri listeler."""
    _bootstrap()
    with session_scope() as session:
        items = content_service.list_contents(
            session, status=status_filter or None, limit=limit
        )
        rows = [
            (
                str(item.id),
                item.type,
                (item.title or item.caption[:32] or "—")[:40],
                item.status,
                format_local(item.scheduled_at),
                format_local(item.published_at),
            )
            for item in items
        ]

    if not rows:
        console.print("[yellow]Kayıt yok.[/]")
        return

    table = Table(title="İçerikler")
    for column in ("ID", "Tür", "Başlık", "Durum", "Plan", "Yayın"):
        table.add_column(column)
    for row in rows:
        table.add_row(*row)
    console.print(table)


@cli.command("content-add")
def content_add(
    title: str = typer.Argument(..., help="İçerik başlığı."),
    caption: str = typer.Option("", help="Gönderi açıklaması."),
    hashtags: str = typer.Option("", help="Hashtag'ler."),
    media_url: str = typer.Option("", help="Herkese açık medya adresi (https)."),
    media_path: str = typer.Option("", help="content/ altındaki yerel dosya."),
    content_type: str = typer.Option("image", "--type", help="image/video/reels/carousel/story"),
) -> None:
    """Komut satırından taslak içerik ekler."""
    _bootstrap()
    try:
        payload = ContentCreate(
            type=ContentType(content_type),
            title=title,
            caption=caption,
            hashtags=hashtags,
            media_url=media_url,
            media_path=media_path,
        )
    except ValueError as exc:
        _fail(str(exc))

    with session_scope() as session:
        try:
            content = content_service.create_content(session, payload)
        except InstaFlowError as exc:
            _fail(str(exc))
        console.print(f"[green]İçerik #{content.id} oluşturuldu[/] (taslak).")


@cli.command("schedule")
def schedule(
    content_id: int = typer.Argument(..., help="İçerik kimliği."),
    when: str = typer.Argument(..., help="Yerel saat, örn. '2026-08-20 18:00'."),
) -> None:
    """İçeriği belirtilen zamana planlar."""
    _bootstrap()
    try:
        moment = parse_local(when)
    except ValueError as exc:
        _fail(str(exc))

    with session_scope() as session:
        try:
            content_service.schedule_content(session, content_id, moment)
        except InstaFlowError as exc:
            _fail(str(exc))
    console.print(
        f"[green]İçerik #{content_id} planlandı:[/] {format_local(moment)} "
        f"({get_settings().timezone})"
    )


@cli.command("cancel")
def cancel(content_id: int = typer.Argument(..., help="İçerik kimliği.")) -> None:
    """Planı iptal eder."""
    _bootstrap()
    with session_scope() as session:
        try:
            content_service.cancel_schedule(session, content_id)
        except InstaFlowError as exc:
            _fail(str(exc))
    console.print(f"[green]İçerik #{content_id} planı iptal edildi.[/]")


@cli.command("publish")
def publish(content_id: int = typer.Argument(..., help="İçerik kimliği.")) -> None:
    """İçeriği hemen yayınlar."""
    _bootstrap()
    result = asyncio.run(publishing_service.publish_content(content_id))
    if result.success:
        console.print(f"[green]Yayınlandı:[/] media_id={result.ig_media_id}")
        if result.permalink:
            console.print(result.permalink)
        return
    console.print(f"[bold red]Yayınlanamadı:[/] {result.message}")
    raise typer.Exit(code=1)


@cli.command("publish-due")
def publish_due() -> None:
    """Zamanı gelmiş tüm gönderileri işler (scheduler'ın yaptığı iş)."""
    _bootstrap()
    results = asyncio.run(publishing_service.publish_due())
    if not results:
        console.print("Zamanı gelen gönderi yok.")
        return
    for result in results:
        mark = "[green]✓[/]" if result.success else "[red]✗[/]"
        console.print(f"{mark} #{result.content_id} — {result.message}")


# ------------------------------------------------------------------------ AI
@cli.command("generate-caption")
def generate_caption(
    topic: str = typer.Argument(..., help="Konu."),
    save: bool = typer.Option(False, "--save", help="Taslak olarak kaydet."),
    variants: int = typer.Option(1, help="Kaç seçenek üretilsin (1-10)."),
) -> None:
    """Gönderi açıklaması üretir."""
    _bootstrap()
    if variants > 1:
        result = asyncio.run(
            ai_captions.generate_caption_variants(topic, count=min(variants, 10))
        )
        for index, text in enumerate(result.items, start=1):
            console.print(Panel(text, title=f"Seçenek {index}"))
        _print_source(result.provider, result.model, result.fallback_used)
        return

    result = asyncio.run(ai_captions.generate_caption(topic))
    console.print(Panel(result.text, title="Açıklama"))
    _print_source(result.provider, result.model, result.fallback_used)

    if save:
        tags = asyncio.run(ai_hashtags.generate_hashtags(topic))
        with session_scope() as session:
            content = content_service.create_content(
                session,
                ContentCreate(
                    type=ContentType.IMAGE,
                    title=topic[:255],
                    caption=result.text,
                    hashtags=" ".join(tags.items),
                ),
            )
            console.print(f"[green]Taslak olarak kaydedildi:[/] #{content.id}")


@cli.command("generate-hashtags")
def generate_hashtags(
    topic: str = typer.Argument(..., help="Konu."),
    count: int = typer.Option(15, help="Kaç etiket (1-30)."),
) -> None:
    """Hashtag önerir."""
    _bootstrap()
    result = asyncio.run(ai_hashtags.generate_hashtags(topic, count=count))
    console.print(Panel(" ".join(result.items), title="Hashtag önerileri"))
    _print_source(result.provider, result.model, result.fallback_used)


@cli.command("generate-ideas")
def generate_ideas(
    topic: str = typer.Argument("içerik hesabım", help="Hesabın konusu."),
    count: int = typer.Option(7, help="Kaç fikir."),
    save: bool = typer.Option(False, "--save", help="Fikirleri taslak olarak kaydet."),
) -> None:
    """İçerik fikirleri üretir."""
    _bootstrap()
    result = asyncio.run(ai_content.generate_ideas(topic, count=count))

    table = Table(title="İçerik fikirleri")
    table.add_column("#")
    table.add_column("Fikir")
    for index, idea in enumerate(result.items, start=1):
        table.add_row(str(index), idea)
    console.print(table)
    _print_source(result.provider, result.model, result.fallback_used)

    if save:
        with session_scope() as session:
            for idea in result.items:
                content_service.create_content(
                    session,
                    ContentCreate(type=ContentType.IMAGE, title=idea[:255]),
                )
        console.print(f"[green]{len(result.items)} fikir taslak olarak kaydedildi.[/]")


@cli.command("generate-calendar")
def generate_calendar(
    topic: str = typer.Argument("içerik hesabım", help="Hesabın konusu."),
    days: int = typer.Option(7, help="Kaç günlük plan."),
    per_day: int = typer.Option(1, help="Günde kaç gönderi."),
) -> None:
    """Haftalık içerik planı üretir."""
    _bootstrap()
    result = asyncio.run(
        ai_content.generate_calendar(topic, days=days, per_day=per_day)
    )

    table = Table(title=f"{days} günlük plan")
    for column in ("Gün", "Saat", "Tür", "Başlık", "Fikir"):
        table.add_column(column)
    for slot in result.slots:
        table.add_row(slot.day, slot.time, slot.content_type, slot.title, slot.idea)
    console.print(table)
    _print_source(result.provider, result.model, result.fallback_used)
    console.print(
        "\n[dim]Planı uygulamak için içerikleri 'content-add' ile ekleyip "
        "'schedule' komutuyla zamanlayın.[/]"
    )


def _print_source(provider: str, model: str, fallback: bool) -> None:
    """Metnin hangi kaynaktan geldiğini bildirir."""
    note = " (yerel üreticiye düşüldü)" if fallback else ""
    console.print(f"[dim]Kaynak: {provider} / {model}{note}[/]")


# ----------------------------------------------------------------- analytics
@cli.command("analytics")
def analytics(
    sync: bool = typer.Option(False, "--sync", help="Önce API'den güncel veriyi çek."),
) -> None:
    """İstatistikleri gösterir."""
    _bootstrap()

    if sync:
        report = asyncio.run(analytics_service.sync_insights())
        console.print(
            f"{report.posts_processed} gönderi işlendi, "
            f"{report.metrics_written} metrik yazıldı."
        )
        if report.unsupported:
            console.print(
                "[yellow]Bu özellikler mevcut API izinleriyle desteklenmiyor:[/] "
                + ", ".join(sorted(report.unsupported))
            )
        for error in report.errors:
            console.print(f"[red]{error}[/]")

    with session_scope() as session:
        totals = analytics_service.totals_by_metric(session)
        rows = [
            (
                format_local(post.published_at),
                post.media_type or "—",
                metrics,
            )
            for post, metrics in analytics_service.per_post_metrics(session, limit=15)
        ]

    if not totals and not rows:
        console.print(
            "[yellow]Henüz istatistik yok.[/] Instagram bağlantısı kurulup en az bir "
            "gönderi yayınlandıktan sonra 'python run.py analytics --sync' çalıştırın."
        )
        return

    summary = Table(title="Toplam metrikler")
    summary.add_column("Metrik")
    summary.add_column("Değer", justify="right")
    for metric, value in sorted(totals.items()):
        summary.add_row(metric, f"{value:,.0f}".replace(",", "."))
    console.print(summary)

    if rows:
        metric_names = get_settings().media_metrics
        detail = Table(title="Gönderi bazında")
        detail.add_column("Yayın")
        detail.add_column("Tür")
        for name in metric_names:
            detail.add_column(name, justify="right")
        for published_at, media_type, metrics in rows:
            detail.add_row(
                published_at,
                media_type,
                *[
                    f"{metrics[name]:,.0f}".replace(",", ".") if name in metrics else "—"
                    for name in metric_names
                ],
            )
        console.print(detail)


# --------------------------------------------------------------------- bakım
@cli.command("init")
def init() -> None:
    """Dizinleri ve veritabanını hazırlar."""
    _bootstrap()
    settings = get_settings()
    console.print(f"[green]Hazır.[/] Veritabanı: {settings.data_dir / 'instaflow.db'}")


@cli.command("backup")
def backup(
    output_dir: str = typer.Option("", help="Yedeğin yazılacağı dizin."),
    keep: int = typer.Option(7, help="Saklanacak yedek sayısı."),
) -> None:
    """Veritabanını ve içerikleri yedekler."""
    _bootstrap()
    settings = get_settings()
    target_dir = Path(output_dir).expanduser() if output_dir else settings.data_dir / "backups"
    target_dir.mkdir(parents=True, exist_ok=True)

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    archive = target_dir / f"instaflow-{stamp}.tar.gz"

    db_path = Path(settings.resolved_database_url.replace("sqlite:///", ""))
    with tarfile.open(archive, "w:gz") as tar:
        if db_path.exists():
            tar.add(db_path, arcname=db_path.name)
        # WAL kipinde yan dosyalar da gerekir.
        for suffix in ("-wal", "-shm"):
            side = db_path.with_name(db_path.name + suffix)
            if side.exists():
                tar.add(side, arcname=side.name)
        if settings.content_dir.exists():
            tar.add(settings.content_dir, arcname="content")

    size_mb = archive.stat().st_size / (1024 * 1024)
    console.print(f"[green]Yedek alındı:[/] {archive} ({size_mb:.1f} MB)")

    backups = sorted(target_dir.glob("instaflow-*.tar.gz"))
    for old in backups[:-keep] if keep > 0 else []:
        old.unlink(missing_ok=True)
        console.print(f"[dim]Eski yedek silindi: {old.name}[/]")


@cli.command("prune-logs")
def prune_logs(days: int = typer.Option(30, help="Kaç günden eski kayıtlar silinsin.")) -> None:
    """Veritabanındaki eski log kayıtlarını temizler."""
    _bootstrap()
    with session_scope() as session:
        removed = account_service.prune_logs(session, keep_days=days)
    console.print(f"[green]{removed} log kaydı silindi.[/]")


@cli.command("doctor")
def doctor() -> None:
    """Kurulumu kontrol eder ve eksikleri listeler."""
    _bootstrap()
    settings = get_settings()
    problems: list[str] = []

    if not (BASE_DIR / ".env").exists():
        problems.append(".env dosyası yok — .env.example dosyasını kopyalayın.")
    if not settings.is_instagram_configured:
        problems.append("Instagram API credentials yapılandırılmamış.")
    if not settings.is_oauth_configured:
        problems.append("OAuth için META_APP_ID / META_APP_SECRET / OAUTH_REDIRECT_URI eksik.")
    if not settings.public_base_url:
        problems.append(
            "PUBLIC_BASE_URL yok — yerel dosyalar yayınlanamaz (media_url girin)."
        )
    if settings.ai_provider in ("openai", "anthropic") and not settings.is_ai_configured:
        problems.append(
            f"AI_PROVIDER={settings.ai_provider} seçili ama API anahtarı yok; "
            "yerel üretici kullanılacak."
        )
    if settings.app_env == "production" and settings.debug:
        problems.append("Üretimde DEBUG açık — kapatın.")
    if shutil.disk_usage(settings.data_dir).free < 50 * 1024 * 1024:
        problems.append("Disk alanı 50 MB'ın altında.")

    if not problems:
        console.print("[green]Her şey yolunda.[/]")
        return
    console.print("[yellow]Eksikler:[/]")
    for problem in problems:
        console.print(f"  • {problem}")


def main() -> None:
    """Giriş noktası."""
    cli()


if __name__ == "__main__":
    main()
