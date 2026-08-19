#!/usr/bin/env bash
# InstaFlow kurulum betiği (Termux ve normal Linux).
#
#   bash install.sh
#
# Bu betik hiçbir API anahtarı veya gizli değer üretmez; yalnızca ortamı
# hazırlar. Anahtarları .env dosyasına siz girersiniz.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

VENV_DIR="$PROJECT_DIR/.venv"

log()  { printf '\033[1;35m[kurulum]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[kurulum]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[kurulum] HATA:\033[0m %s\n' "$*" >&2; exit 1; }

# --------------------------------------------------------------- Termux tespiti
# Termux, Android'in Bionic libc'sini kullanır. PyPI'daki manylinux (glibc) ve
# musllinux (musl) wheel'leri burada kullanılamaz, bu yüzden derlenmiş uzantısı
# olan paketler kaynaktan derlenmek zorundadır.
IS_TERMUX=0
if [ -n "${TERMUX_VERSION:-}" ] || [ -d /data/data/com.termux/files/usr ]; then
  IS_TERMUX=1
fi

prepare_termux_build() {
  # PyO3 (pydantic-core'un derleyicisi) Android'de hedef API seviyesini
  # kendi başına bulamaz ve şu hatayı verir:
  #   "Failed to determine Android API level."
  # Değer cihazdan okunur; okunamazsa Termux'un asgari desteklediği 24
  # kullanılır.
  if [ -z "${ANDROID_API_LEVEL:-}" ]; then
    local detected=""
    if command -v getprop >/dev/null 2>&1; then
      detected="$(getprop ro.build.version.sdk 2>/dev/null || true)"
    fi
    case "$detected" in
      ''|*[!0-9]*) detected=24 ;;
    esac
    export ANDROID_API_LEVEL="$detected"
    log "Termux algılandı — ANDROID_API_LEVEL=$ANDROID_API_LEVEL olarak ayarlandı."
  else
    log "Termux algılandı — mevcut ANDROID_API_LEVEL=$ANDROID_API_LEVEL kullanılıyor."
  fi

  # pydantic-core'un hazır wheel'i yoksa Rust ile derlenir.
  if ! command -v rustc >/dev/null 2>&1; then
    warn "Rust kurulu değil. pydantic-core'un hazır Android wheel'i yoktur;"
    warn "kaynaktan derlemek için:  pkg install rust binutils"
    warn "Derleme telefonda 10-20 dakika sürebilir ve bol RAM ister."
  fi
  if ! command -v cc >/dev/null 2>&1 && ! command -v clang >/dev/null 2>&1; then
    warn "C derleyicisi yok. greenlet/MarkupSafe için:  pkg install clang"
  fi
}

termux_install_failed() {
  local py_ver
  py_ver="$(python -c 'import sys; print("%d.%d" % sys.version_info[:2])' 2>/dev/null || echo '?')"

  printf '\n\033[1;31m'
  cat <<EOF
────────────────────────────────────────────────────────────
Termux Android ARM64 + mevcut Python sürümünde bu dependency
için uyumlu wheel bulunamadı.
────────────────────────────────────────────────────────────
EOF
  printf '\033[0m'

  cat <<EOF

Neden: Android, Bionic libc kullanır. PyPI'daki manylinux (glibc) ve
musllinux (musl) wheel'leri Termux'ta çalışmaz, bu yüzden pip kaynak
koddan derlemeye düşer. pydantic-core Rust ile yazılmıştır ve HİÇBİR
sürümünün Android wheel'i yoktur.

Algılanan Python sürümü: $py_ver

Seçenekler (sırayla deneyin):

  1) Termux'un kendi deposunu deneyin — varsa en temizi:
       pkg install python-pydantic

  2) Kaynaktan derleyin (Rust gerekir, 10-20 dk, bol RAM):
       pkg install rust binutils
       export ANDROID_API_LEVEL=\$(getprop ro.build.version.sdk)
       pip install -r requirements.txt

  3) Python 3.13 kullanın ve hazır Android wheel deposunu ekleyin.
     Topluluk tarafından derlenmiş wheel'ler Python 3.9-3.13'ü kapsar;
     Python 3.14 için HENÜZ yoktur. Bu ÜÇÜNCÜ TARAF bir depodur; güvenip
     güvenmemek sizin kararınız:
       INSTAFLOW_EXTRA_INDEX_URL=https://eutalix.github.io/android-pydantic-core/ \\
         bash install.sh

  4) Telefonda derlemek istemiyorsanız InstaFlow'u bir sunucuda/PC'de
     çalıştırıp panele telefondan bağlanın.

Ayrıntı: README.md → "Termux kurulumu" bölümü.

EOF
}

# --------------------------------------------------------------- 1. Python
log "Python kontrol ediliyor..."
PYTHON="$(command -v python3 || command -v python || true)"
[ -n "$PYTHON" ] || die "Python bulunamadı. Termux'ta: pkg install python"

PY_VERSION="$("$PYTHON" -c 'import sys; print("%d.%d" % sys.version_info[:2])')"
log "Python $PY_VERSION bulundu ($PYTHON)"

"$PYTHON" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' \
  || die "Python 3.10 veya üzeri gerekiyor (bulunan: $PY_VERSION)."

# Termux'ta Python 3.14, pydantic-core için hazır wheel bulunamayan tek
# sürümdür (topluluk depoları 3.13'e kadar). Sistem Python'ına dokunulmaz,
# yalnızca bilgilendirilir.
if [ "$IS_TERMUX" -eq 1 ]; then
  if "$PYTHON" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 14) else 1)'; then
    warn "Termux + Python $PY_VERSION: pydantic-core için hazır Android wheel'i"
    warn "bulunmuyor (topluluk wheel'leri Python 3.13'e kadar). Derleme"
    warn "gerekecek. Sorun yaşarsanız Python 3.13 önerilir; ayrıntı README'de."
  fi
fi

# ------------------------------------------------------------------ 2. pip
log "pip kontrol ediliyor..."
if ! "$PYTHON" -m pip --version >/dev/null 2>&1; then
  if [ "$IS_TERMUX" -eq 1 ]; then
    die "pip yok. Termux'ta: pkg install python-pip"
  fi
  die "pip yok. Dağıtımınızın python3-pip paketini kurun."
fi
log "pip hazır."

# ----------------------------------------------------------- 3. sanal ortam
if [ -d "$VENV_DIR" ]; then
  log "Sanal ortam zaten var: $VENV_DIR"
else
  log "Sanal ortam oluşturuluyor..."
  "$PYTHON" -m venv "$VENV_DIR" \
    || die "venv oluşturulamadı. Termux'ta: pkg install python && pip install virtualenv"
fi

# shellcheck disable=SC1091
. "$VENV_DIR/bin/activate"
log "Sanal ortam etkin."

# --------------------------------------------------------- 4. bağımlılıklar
log "pip güncelleniyor..."
python -m pip install --upgrade pip --quiet || warn "pip güncellenemedi, devam ediliyor."

PIP_EXTRA_ARGS=""
if [ "$IS_TERMUX" -eq 1 ]; then
  prepare_termux_build
  [ -n "${INSTAFLOW_EXTRA_INDEX_URL:-}" ] && \
    PIP_EXTRA_ARGS="--extra-index-url ${INSTAFLOW_EXTRA_INDEX_URL}"
fi

log "Bağımlılıklar kuruluyor (bu biraz sürebilir)..."
# shellcheck disable=SC2086
if ! python -m pip install $PIP_EXTRA_ARGS -r requirements.txt; then
  if [ "$IS_TERMUX" -eq 1 ]; then
    termux_install_failed
  fi
  die "Bağımlılıklar kurulamadı. Yukarıdaki pip çıktısına bakın."
fi
log "Bağımlılıklar kuruldu."

# -------------------------------------------------------------------- 5. env
if [ -f "$PROJECT_DIR/.env" ]; then
  log ".env zaten var, dokunulmadı."
else
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  chmod 600 "$PROJECT_DIR/.env"
  log ".env oluşturuldu (.env.example kopyalandı)."
  warn "Gizli değerleri .env içine SİZ girmelisiniz; bu betik anahtar üretmez."
fi

# --------------------------------------------------------------- 6. dizinler
log "Dizinler hazırlanıyor..."
mkdir -p data logs content/drafts content/scheduled content/published content/failed
chmod 700 data logs 2>/dev/null || true

# ------------------------------------------------------------ 7. veritabanı
log "Veritabanı hazırlanıyor..."
python run.py init

# ---------------------------------------------------------------- 8. kontrol
log "Kurulum kontrol ediliyor..."
python run.py doctor || true

chmod +x scripts/*.sh 2>/dev/null || true

cat <<'EOF'

────────────────────────────────────────────────────────────
  Kurulum tamamlandı.

  Sıradaki adımlar:

    1. Gizli değerleri girin:
         nano .env

    2. Sanal ortamı etkinleştirin:
         source .venv/bin/activate

    3. Durumu kontrol edin:
         python run.py status

    4. Instagram bağlantısını deneyin:
         python run.py instagram-test

    5. Paneli başlatın:
         ./scripts/start.sh
       veya arka planda:
         ./scripts/start.sh --daemon

       Panel: http://127.0.0.1:8000/dashboard

  Meta Developer kurulumu ve izinler için README.md'ye bakın.
────────────────────────────────────────────────────────────
EOF
