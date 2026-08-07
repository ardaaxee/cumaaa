#!/usr/bin/env python3
"""Bir kereye mahsus çalıştırılır: YouTube + Drive için refresh token üretir.

Kullanım (kendi bilgisayarınızda):

    pip install -r requirements.txt
    python scripts/get_refresh_token.py --client-secrets client_secret.json

Tarayıcı açılır, Google hesabınızla izin verirsiniz ve ekrana yazdırılan üç
değeri GitHub repo ayarlarında secret olarak kaydedersiniz.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:  # pragma: no cover - kurulum hatası için açıklayıcı mesaj
    sys.exit("Önce bağımlılıkları kurun:  pip install -r requirements.txt")

YOUTUBE_UPLOAD = "https://www.googleapis.com/auth/youtube.upload"
DRIVE_READONLY = "https://www.googleapis.com/auth/drive.readonly"
DRIVE_FULL = "https://www.googleapis.com/auth/drive"


def build_scopes(drive_access: str) -> list[str]:
    drive_scope = DRIVE_FULL if drive_access == "full" else DRIVE_READONLY
    return [YOUTUBE_UPLOAD, drive_scope]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--client-secrets",
        default="client_secret.json",
        help="Google Cloud'dan indirdiğiniz masaüstü OAuth istemci dosyası.",
    )
    parser.add_argument(
        "--drive-access",
        choices=("readonly", "full"),
        default="readonly",
        help=(
            "readonly: sadece okuma (varsayılan). "
            "full: yüklenen videoyu 'bitti' klasörüne taşımak istiyorsanız gerekir."
        ),
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Tarayıcıyı otomatik açma, bağlantıyı ekrana yazdır.",
    )
    args = parser.parse_args()

    secrets_path = Path(args.client_secrets)
    if not secrets_path.exists():
        return _fail(
            f"{secrets_path} bulunamadı.\n"
            "Google Cloud Console > API'ler ve Hizmetler > Kimlik Bilgileri bölümünden "
            "'Masaüstü uygulaması' türünde bir OAuth istemcisi oluşturup JSON'unu indirin."
        )

    try:
        client_config = json.loads(secrets_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return _fail(f"{secrets_path} geçerli bir JSON değil: {exc}")

    if "installed" not in client_config:
        return _fail(
            f"{secrets_path} bir 'Masaüstü uygulaması' istemcisi değil. "
            "Google Cloud Console'da uygulama türünü 'Masaüstü uygulaması' seçin."
        )

    flow = InstalledAppFlow.from_client_config(client_config, build_scopes(args.drive_access))
    credentials = flow.run_local_server(
        port=0,
        open_browser=not args.no_browser,
        access_type="offline",   # refresh token için şart
        prompt="consent",        # daha önce izin verildiyse de yeni token üret
    )

    if not credentials.refresh_token:
        return _fail(
            "Google refresh token döndürmedi. Hesabınızın 'Üçüncü taraf erişimi' "
            "ayarlarından bu uygulamanın iznini kaldırıp tekrar deneyin."
        )

    installed = client_config["installed"]
    print("\n" + "=" * 70)
    print("Başarılı! Aşağıdaki üç değeri GitHub'da secret olarak kaydedin:")
    print("Repo > Settings > Secrets and variables > Actions > New repository secret")
    print("=" * 70)
    print(f"\nGOOGLE_CLIENT_ID\n{installed['client_id']}")
    print(f"\nGOOGLE_CLIENT_SECRET\n{installed['client_secret']}")
    print(f"\nGOOGLE_REFRESH_TOKEN\n{credentials.refresh_token}")
    print("\n" + "=" * 70)
    print("Ayrıca DRIVE_FOLDER_ID secret'ını da ekleyin (Drive klasörünüzün ID'si).")
    print("client_secret.json dosyasını repoya EKLEMEYİN.")
    print("=" * 70)
    return 0


def _fail(message: str) -> int:
    print(f"HATA: {message}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
