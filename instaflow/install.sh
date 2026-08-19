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
IS_TERMUX=0
[ -n "${PREFIX:-}" ] && [ -d "${PREFIX:-}/bin" ] && IS_TERMUX=1

log()  { printf '\033[1;35m[kurulum]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[kurulum]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[kurulum] HATA:\033[0m %s\n' "$*" >&2; exit 1; }

# --------------------------------------------------------------- 1. Python
log "Python kontrol ediliyor..."
PYTHON="$(command -v python3 || command -v python || true)"
[ -n "$PYTHON" ] || die "Python bulunamadı. Termux'ta: pkg install python"

PY_VERSION="$("$PYTHON" -c 'import sys; print("%d.%d" % sys.version_info[:2])')"
log "Python $PY_VERSION bulundu ($PYTHON)"

"$PYTHON" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' \
  || die "Python 3.10 veya üzeri gerekiyor (bulunan: $PY_VERSION)."

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

log "Bağımlılıklar kuruluyor (bu biraz sürebilir)..."
if ! python -m pip install -r requirements.txt; then
  die "Bağımlılıklar kurulamadı. Termux'ta önce şunları deneyin:
  pkg install python python-pip rust binutils
  export CARGO_BUILD_TARGET=\$(rustc -vV | sed -n 's|host: ||p')"
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
