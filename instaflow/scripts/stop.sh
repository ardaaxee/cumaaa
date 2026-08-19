#!/usr/bin/env bash
# InstaFlow'u durdurur.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/data/instaflow.pid"

log() { printf '[stop] %s\n' "$*"; }

if [ ! -f "$PID_FILE" ]; then
  log "PID dosyası yok; çalışan bir süreç görünmüyor."
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || echo '')"
if [ -z "$PID" ] || ! kill -0 "$PID" 2>/dev/null; then
  log "Süreç zaten durmuş; PID dosyası temizleniyor."
  rm -f "$PID_FILE"
  exit 0
fi

log "Durduruluyor (PID $PID)..."
kill -TERM "$PID" 2>/dev/null || true

# Nazik kapanma için 10 saniye bekle.
for _ in $(seq 1 10); do
  if ! kill -0 "$PID" 2>/dev/null; then
    rm -f "$PID_FILE"
    log "Durduruldu."
    exit 0
  fi
  sleep 1
done

log "Yanıt vermiyor, zorla kapatılıyor."
kill -KILL "$PID" 2>/dev/null || true
rm -f "$PID_FILE"
log "Durduruldu (zorla)."
