#!/usr/bin/env bash
# YKS Canlı — Android emülatöründe gerçek uçtan uca test (CI'da reactivecircus/android-emulator-runner içinde çalışır).
#   1) Uygulama web'deki "Ekranımı paylaş" bağlantısıyla (ykslive://join?room=…&share=1) açılır, ekranını paylaşır;
#      tarayıcıdaki kişi (Playwright) aynı odada Android ekranını görür (doğrudan ya da yedek yoldan).
#   2) Tarayıcı ekranını paylaşır; uygulamaya karelerin geldiği günlükten doğrulanır.
# Gereken: derlenmiş debug APK, yks/dist ve Playwright Chromium.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APK="$ROOT/yks-android/app/build/outputs/apk/debug/app-debug.apk"
PKG=com.ardaaxee.ykslive
OUT="$ROOT/live-test-logs"
mkdir -p "$OUT"
ROOM="$(node -e "const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<24;i++)s+=a[Math.floor(Math.random()*a.length)];console.log(s)")"
echo "Oda: ${ROOM:0:4}…"

adb wait-for-device
adb install -r "$APK"
adb shell pm grant "$PKG" android.permission.POST_NOTIFICATIONS || true
# Ekran yakalama izni: kullanıcı onayı penceresini atlamak için (yalnız test cihazında).
adb shell appops set "$PKG" PROJECT_MEDIA allow || true
adb logcat -c

# İzin penceresi yine çıkarsa "Başlat" düğmesine dokun.
tap_consent() {
  for _ in $(seq 1 15); do
    adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1 || true
    local xml bounds
    xml="$(adb shell cat /sdcard/ui.xml 2>/dev/null || true)"
    bounds="$(printf '%s' "$xml" | grep -oiE 'text="(start now|start|şimdi başlat|başlat)"[^>]*bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' | head -n1 | grep -oE '[0-9]+' | tail -n4 | tr '\n' ' ' || true)"
    if [ -n "$bounds" ]; then
      read -r x1 y1 x2 y2 <<<"$bounds"
      echo "İzin penceresi bulundu, dokunuluyor"
      adb shell input tap $(((x1 + x2) / 2)) $(((y1 + y2) / 2))
      return 0
    fi
    if adb logcat -d -s YksLive:I | grep -q "Ekran yakalama açık"; then return 0; fi
    sleep 2
  done
}

echo "== 1) Android paylaşır, tarayıcı izler =="
(cd "$ROOT/yks" && node scripts/live-peer.mjs watch "$ROOM" 120) >"$OUT/watch.log" 2>&1 &
WATCH=$!
sleep 10
adb shell am start -W -a android.intent.action.VIEW -d "ykslive://join?room=$ROOM\&share=1" "$PKG"
tap_consent
set +e
wait "$WATCH"
WATCH_CODE=$?
set -e
cat "$OUT/watch.log"
adb logcat -d -s YksLive:I >"$OUT/android-1.log" || true
cat "$OUT/android-1.log"
if [ "$WATCH_CODE" -ne 0 ]; then
  echo "::error::Tarayıcı Android ekranını göremedi"
  exit 1
fi

echo "== 2) Tarayıcı paylaşır, Android izler =="
(cd "$ROOT/yks" && node scripts/live-peer.mjs share "$ROOM" 60) >"$OUT/share.log" 2>&1 &
SHARE=$!
OK=""
for _ in $(seq 1 55); do
  LOG="$(adb logcat -d -s YksLive:I || true)"
  if printf '%s' "$LOG" | grep -q "remote frames 30"; then OK="doğrudan"; break; fi
  if [ "$(printf '%s' "$LOG" | grep -c "relay frame")" -ge 3 ]; then OK="yedek yol"; break; fi
  sleep 1
done
kill "$SHARE" 2>/dev/null || true
wait "$SHARE" 2>/dev/null || true
cat "$OUT/share.log"
adb logcat -d -s YksLive:I >"$OUT/android-2.log" || true
tail -n 40 "$OUT/android-2.log"
if [ -z "$OK" ]; then
  echo "::error::Android uygulaması tarayıcının ekranını almadı"
  exit 1
fi
echo "Android tarayıcının ekranını aldı: $OK"

echo "== 3) Doğrudan bağlantı engelli: Android ekranı yedek yoldan gider =="
set +e
(cd "$ROOT/yks" && LIVE_BLOCK_DIRECT=1 node scripts/live-peer.mjs watch "$ROOM" 90) >"$OUT/relay.log" 2>&1
RELAY_CODE=$?
set -e
cat "$OUT/relay.log"
adb logcat -d -s YksLive:I >"$OUT/android-3.log" || true
tail -n 20 "$OUT/android-3.log"
if [ "$RELAY_CODE" -ne 0 ] || ! grep -q "Android ekranı görüldü: yedek yol" "$OUT/relay.log"; then
  echo "::error::Yedek yol: tarayıcı Android ekranını göremedi"
  exit 1
fi
echo "Canlı paylaşım emülatör testi geçti (doğrudan + ters yön + yedek yol)."
