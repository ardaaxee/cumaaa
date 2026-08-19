#!/usr/bin/env bash
# Veritabanı ve içerik yedeği alır.
#
# Kullanım:
#   ./scripts/backup.sh                 # data/backups altına
#   ./scripts/backup.sh ~/storage/downloads

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ -d "$PROJECT_DIR/.venv" ]; then
  # shellcheck disable=SC1091
  . "$PROJECT_DIR/.venv/bin/activate"
fi

PYTHON="$(command -v python || command -v python3 || true)"
[ -n "$PYTHON" ] || { echo "[backup] HATA: python bulunamadı." >&2; exit 1; }

OUT_DIR="${1:-}"
if [ -n "$OUT_DIR" ]; then
  "$PYTHON" run.py backup --output-dir "$OUT_DIR"
else
  "$PYTHON" run.py backup
fi
