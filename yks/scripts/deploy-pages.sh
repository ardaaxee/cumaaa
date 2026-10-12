#!/usr/bin/env bash
# dist/ çıktısını gh-pages dalının yks/ klasörüne tek commit ile yayınlar (dalın diğer içeriğine dokunmaz).
#
# Güvenli sıra:
#  1. dist bütünlüğü (index → JS/CSS, tüm dinamik içe aktarma hedefleri, SW listeleri) doğrulanır
#  2. yeni dosyalar gh-pages kopyasına eklenir; ESKİ /assets dosyaları SİLİNMEZ
#     (açık kalmış eski sekmeler güncellemede kırılmasın)
#  3. birleşik klasör yeniden doğrulanır, ardından TEK commit olarak itilir
#     (index.html ile yeni paketler aynı anda yayına girer; "yeni index + eksik paket" oluşmaz)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP="$ROOT/yks"

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  (cd "$APP" && npm run build)
fi
node "$APP/scripts/check-build.mjs" "$APP/dist"

WT="$(mktemp -d)"
cleanup() { cd "$ROOT" && git worktree remove --force "$WT" 2>/dev/null || true; }
trap cleanup EXIT
cd "$ROOT"
git fetch -q origin gh-pages
git worktree add -q "$WT" origin/gh-pages

mkdir -p "$WT/yks/assets"
# Önce paketler, en son giriş dosyaları (aynı commit'e girer; yerel sıra yalnız ek güvenlik).
cp -r "$APP/dist/assets/." "$WT/yks/assets/"
find "$APP/dist" -maxdepth 1 -type f -exec cp {} "$WT/yks/" \;
for d in "$APP"/dist/*/; do
  name="$(basename "$d")"
  [ "$name" = "assets" ] || cp -r "$d" "$WT/yks/"
done

# Yayına çıkacak birleşik klasör de aynı kontrolden geçmeli.
node "$APP/scripts/check-build.mjs" "$WT/yks"

cd "$WT"
git add -A yks
if git diff --cached --quiet; then
  echo "Değişiklik yok"
else
  git commit -qm "yks/: güncel sürümü yayınla ($(cd "$ROOT" && git rev-parse --short HEAD))"
  for i in 1 2 3 4; do
    if git push -q origin HEAD:gh-pages; then break; fi
    sleep $((2 ** i))
  done
  echo "Yayınlandı: https://ardaaxee.github.io/cumaaa/yks/ (gh-pages $(git rev-parse --short HEAD))"
fi
