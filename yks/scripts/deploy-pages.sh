#!/usr/bin/env bash
# dist/ çıktısını gh-pages dalının yks/ klasörüne yayınlar (dalın diğer içeriğine dokunmaz).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WT="$(mktemp -d)"
cd "$ROOT"
git fetch -q origin gh-pages
git worktree add -q "$WT" origin/gh-pages
rm -rf "$WT/yks" && mkdir -p "$WT/yks" && cp -r "$ROOT/yks/dist/." "$WT/yks/"
cd "$WT"
git add -A yks
if git diff --cached --quiet; then echo "Değişiklik yok"; else
  git commit -qm "yks/: güncel sürümü yayınla"
  git push -q origin HEAD:gh-pages
  echo "Yayınlandı: https://ardaaxee.github.io/cumaaa/yks/"
fi
cd "$ROOT" && git worktree remove --force "$WT"
