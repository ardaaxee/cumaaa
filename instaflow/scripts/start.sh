#!/usr/bin/env bash
# InstaFlow başlatma betiği (Termux ve normal Linux'ta çalışır).
#
# Kullanım:
#   ./scripts/start.sh            # ön planda
#   ./scripts/start.sh --daemon   # arka planda (nohup)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

LOG_DIR="$PROJECT_DIR/logs"
PID_FILE="$PROJECT_DIR/data/instaflow.pid"
VENV_DIR="$PROJECT_DIR/.venv"

log() { printf '[start] %s\n' "$*"; }
die() { printf '[start] HATA: %s\n' "$*" >&2; exit 1; }

# ------------------------------------------------------------ ortam kontrolü
if [ -d "$VENV_DIR" ]; then
  # shellcheck disable=SC1091
  . "$VENV_DIR/bin/activate"
  log "Sanal ortam etkin: $VENV_DIR"
else
  log "Sanal ortam yok, sistem Python'ı kullanılacak."
fi

PYTHON="$(command -v python || command -v python3 || true)"
[ -n "$PYTHON" ] || die "python bulunamadı. Önce ./install.sh çalıştırın."

"$PYTHON" - <<'PY' || die "Bağımlılıklar eksik. ./install.sh çalıştırın."
import importlib.util
import sys
missing = [m for m in ("fastapi", "uvicorn", "sqlalchemy", "httpx", "apscheduler", "typer")
           if importlib.util.find_spec(m) is None]
if missing:
    print("Eksik paketler:", ", ".join(missing), file=sys.stderr)
    sys.exit(1)
PY

[ -f "$PROJECT_DIR/.env" ] || log "UYARI: .env yok. '.env.example' dosyasını kopyalayın."

mkdir -p "$LOG_DIR" "$PROJECT_DIR/data" \
         "$PROJECT_DIR/content/drafts" "$PROJECT_DIR/content/scheduled" \
         "$PROJECT_DIR/content/published" "$PROJECT_DIR/content/failed"

# ------------------------------------------------------- zaten çalışıyor mu
if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || echo '')"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    die "InstaFlow zaten çalışıyor (PID $OLD_PID). Durdurmak için ./scripts/stop.sh"
  fi
  log "Eski PID dosyası temizleniyor."
  rm -f "$PID_FILE"
fi

# ------------------------------------------------------------- veritabanı
log "Veritabanı hazırlanıyor..."
"$PYTHON" run.py init

# --------------------------------------------------------------- başlatma
if [ "${1:-}" = "--daemon" ]; then
  log "Arka planda başlatılıyor (log: $LOG_DIR/server.log)"
  # PID dosyasını run.py'nin kendisi yazar; burada yazarsak run.py kendi
  # kaydını "başka bir süreç çalışıyor" sanır.
  nohup "$PYTHON" run.py start >>"$LOG_DIR/server.log" 2>&1 &
  CHILD_PID=$!

  for _ in $(seq 1 10); do
    [ -f "$PID_FILE" ] && break
    sleep 1
  done

  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    log "Başlatıldı (PID $(cat "$PID_FILE"))."
    log "Panel: http://127.0.0.1:${PORT:-8000}/dashboard"
  else
    kill -TERM "$CHILD_PID" 2>/dev/null || true
    die "Başlatılamadı. $LOG_DIR/server.log dosyasına bakın."
  fi
else
  log "Ön planda başlatılıyor (durdurmak için Ctrl+C)."
  exec "$PYTHON" run.py start
fi
