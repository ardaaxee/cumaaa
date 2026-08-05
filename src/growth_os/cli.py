"""Komut satırı arayüzü.

    python -m growth_os connect   # bağlantıyı ve izinleri doğrula
    python -m growth_os audit     # hesap denetimi çalıştır
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import datetime, timezone

from .audit import format_report, run_audit
from .client import GraphAPIError, InstagramClient
from .config import ConfigError, load_settings

# Token'ın çalışması için gereken minimum izinler.
REQUIRED_SCOPES = {
    "instagram_basic",
    "pages_show_list",
    "pages_read_engagement",
}
RECOMMENDED_SCOPES = {"instagram_manage_insights"}

SETUP_HINT = """
Bağlanmak için gerekenler (tek seferlik kurulum):

  1. Instagram hesabını Business veya Creator hesabına çevirin.
  2. Hesabı bir Facebook Sayfası'na bağlayın.
  3. developers.facebook.com üzerinde bir uygulama oluşturun.
  4. Şu izinlerle uzun ömürlü bir kullanıcı token'ı alın:
       instagram_basic, instagram_manage_insights,
       pages_show_list, pages_read_engagement
  5. `.env.example` dosyasını `.env` olarak kopyalayıp token'ı girin.

Ayrıntılı adımlar: README.md
"""


def _configure_logging(verbose: bool) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


def cmd_connect(client: InstagramClient) -> int:
    """Token'ı doğrular, izinleri kontrol eder, bağlı IG hesabını bulur."""
    print("→ Token doğrulanıyor…")
    info = client.debug_token().get("data", {})

    if not info.get("is_valid"):
        print("✗ Token geçersiz veya süresi dolmuş.")
        print(SETUP_HINT)
        return 1

    expires = info.get("expires_at")
    if expires:
        when = datetime.fromtimestamp(expires, tz=timezone.utc)
        remaining = (when - datetime.now(timezone.utc)).days
        print(f"✓ Token geçerli — son kullanma: {when:%Y-%m-%d} ({remaining} gün)")
        if remaining < 7:
            print("  ⚠ Token yakında dolacak; yenilemeyi planlayın.")
    else:
        print("✓ Token geçerli (süresiz)")

    scopes = set(info.get("scopes", []))
    missing = REQUIRED_SCOPES - scopes
    if missing:
        print(f"✗ Eksik zorunlu izinler: {', '.join(sorted(missing))}")
        print(SETUP_HINT)
        return 1
    print(f"✓ Zorunlu izinler tamam ({len(scopes)} izin)")

    missing_recommended = RECOMMENDED_SCOPES - scopes
    if missing_recommended:
        print(f"  ⚠ Önerilen izin eksik: {', '.join(sorted(missing_recommended))}"
              " — içgörü metrikleri alınamayacak.")

    print("→ Bağlı hesaplar aranıyor…")
    pages = client.list_pages()
    if not pages:
        print("✗ Token'a bağlı Facebook Sayfası yok.")
        return 1

    for page in pages:
        ig = page.get("instagram_business_account")
        label = f"@{ig['username']}" if ig and ig.get("username") else "IG bağlı değil"
        print(f"   • {page.get('name')} (id {page.get('id')}) → {label}")

    ig_user_id = client.resolve_ig_user_id()
    profile = client.profile(ig_user_id)
    print()
    print(f"✓ BAĞLANTI BAŞARILI — @{profile.get('username')} "
          f"({profile.get('followers_count')} takipçi, "
          f"{profile.get('media_count')} gönderi)")
    print(f"  IG_USER_ID={ig_user_id}  ← bunu .env dosyanıza ekleyin (istek sayısını azaltır)")
    return 0


def cmd_audit(client: InstagramClient, args: argparse.Namespace) -> int:
    ig_user_id = client.resolve_ig_user_id()
    report = run_audit(client, ig_user_id, media_limit=args.limit)

    if args.json:
        payload = {
            "profile": report.profile,
            "followers": report.followers,
            "engagement_rate_pct": report.engagement_rate,
            "median_likes": report.median_likes,
            "median_comments": report.median_comments,
            "format_mix": report.format_mix,
            "best_posts": report.best_posts,
            "posting_cadence_per_week": report.posting_cadence_per_week,
            "days_since_last_post": report.days_since_last_post,
            "account_insights": report.account_insights,
            "warnings": report.warnings,
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(format_report(report))
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="growth_os",
        description="Instagram Growth OS — resmi Graph API üzerinden hesap bağlantısı ve denetimi.",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="ayrıntılı log")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("connect", help="token ve hesap bağlantısını doğrula")

    audit = sub.add_parser("audit", help="hesap denetimi çalıştır")
    audit.add_argument("--limit", type=int, default=30, help="analiz edilecek gönderi sayısı")
    audit.add_argument("--json", action="store_true", help="JSON çıktısı")

    args = parser.parse_args(argv)
    _configure_logging(args.verbose)

    try:
        settings = load_settings()
    except ConfigError as exc:
        print(f"✗ Yapılandırma eksik: {exc}", file=sys.stderr)
        print(SETUP_HINT, file=sys.stderr)
        return 2

    logging.getLogger(__name__).info(
        "Graph API %s, token %s", settings.api_version, settings.token_fingerprint
    )
    client = InstagramClient(settings)

    try:
        if args.command == "connect":
            return cmd_connect(client)
        return cmd_audit(client, args)
    except GraphAPIError as exc:
        print(f"✗ Graph API hatası: {exc}", file=sys.stderr)
        if exc.is_auth_error:
            print("  Token süresi dolmuş olabilir; yeniden alın.", file=sys.stderr)
        elif exc.is_permission_error:
            print("  Uygulamanın gerekli izinleri yok. `connect` komutuyla kontrol edin.",
                  file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
