#!/usr/bin/env bash
# YKS production build'ini doğrular ve gh-pages dalının yks/ klasörüne yayınlar.
# Eski hashli assetler silinmez; açık kalmış eski sekmeler deploy sırasında 404 görmez.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP="$ROOT/yks"
WT="$(mktemp -d)"

cd "$APP"
echo "YKS production build hazırlanıyor…"
npm run build

echo "Build bütünlüğü doğrulanıyor…"
node scripts/check-build.mjs

cd "$ROOT"
git fetch -q origin gh-pages
git worktree add -q "$WT" origin/gh-pages

mkdir -p "$WT/yks"
cp -r "$APP/dist/." "$WT/yks/"

cd "$WT"
git add -A yks
if git diff --cached --quiet; then
  echo "Değişiklik yok"
else
  git commit -qm "yks/: güncel sürümü yayınla"
  git push -q origin HEAD:gh-pages
  echo "Yayınlandı: https://ardaaxee.github.io/cumaaa/yks/"
fi

cd "$ROOT"
git worktree remove --force "$WT"
