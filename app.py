"""
ARDA.OS — Flask backend
-----------------------
Statik dijital profil sitesini sunar + gerçek bir contact endpoint'i sağlar.
İçerik content/site.json üzerinden yönetilir (frontend bunu fetch eder).

Çalıştırma:
    python app.py            # http://localhost:8080
Ortam değişkenleri:
    PORT   (varsayılan 8080)
    HOST   (varsayılan 0.0.0.0)
"""

import json
import os
import re
import time
import threading
import datetime
from collections import deque
from pathlib import Path
from urllib.parse import urlparse

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
CONTENT_DIR = BASE_DIR / "content"
SITE_JSON = CONTENT_DIR / "site.json"
MESSAGES_FILE = CONTENT_DIR / "messages.jsonl"  # contact mesajları buraya eklenir

# SPA kök index.html'den servis edilir (statik hosting ile de uyumlu tek kaynak)
app = Flask(__name__, static_folder="static", static_url_path="/static")

# İstek gövdesi üst sınırı — büyük payload'ları Flask otomatik 413 ile reddeder
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # 16 KB

# Basit e-posta doğrulama deseni
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# ---------------------------------------------------------------------------
# Bellek-içi rate limit (harici bağımlılık yok) — /api/contact için
#   IP başına: dakikada en fazla 3, günde en fazla 20 istek.
# Not: tek süreç içindir; çok-işçili (gunicorn) dağıtımda süreç başına sayar.
# ---------------------------------------------------------------------------
RATE_MINUTE = 3
RATE_DAY = 20
_rate_hits = {}            # ip -> deque[timestamp]
_rate_lock = threading.Lock()


def _rate_check(ip):
    """(izin_var_mı, retry_after_saniye) döndürür ve başarılıysa isteği kaydeder."""
    now = time.time()
    with _rate_lock:
        dq = _rate_hits.get(ip)
        if dq is None:
            dq = deque()
            _rate_hits[ip] = dq
        # Bir günden eski kayıtları temizle
        while dq and now - dq[0] > 86400:
            dq.popleft()
        # Günlük sınır
        if len(dq) >= RATE_DAY:
            return False, int(86400 - (now - dq[0])) + 1
        # Dakikalık sınır
        last_min = [t for t in dq if now - t < 60]
        if len(last_min) >= RATE_MINUTE:
            return False, int(60 - (now - last_min[0])) + 1
        dq.append(now)
        # Bellek sızıntısını önlemek için ara sıra boş IP'leri temizle
        if len(_rate_hits) > 5000:
            for k in [k for k, v in _rate_hits.items() if not v]:
                _rate_hits.pop(k, None)
        return True, 0


def _same_origin_ok():
    """Origin/Referer kendi host'umuzla eşleşiyor mu? Header yoksa engelleme (uyumluluk)."""
    allowed = urlparse(request.host_url).netloc  # Host header'ından
    localhosts = {"localhost", "127.0.0.1", "0.0.0.0"}
    origin = request.headers.get("Origin")
    ref = request.headers.get("Referer")
    src = origin or ref
    if not src:
        return True  # tarayıcı Origin göndermediyse normal davranışı bozma
    netloc = urlparse(src).netloc
    if netloc == allowed:
        return True
    # Yalnızca *isteği yapan* origin localhost ise (geliştirme) izin ver
    host = netloc.split(":")[0]
    return host in localhosts


def _client_ip():
    """Proxy arkasındaysa gerçek IP; değilse remote_addr."""
    fwd = request.headers.get("X-Forwarded-For", "")
    return fwd.split(",")[0].strip() if fwd else (request.remote_addr or "unknown")


# ---------------------------------------------------------------------------
# Güvenlik başlıkları — tüm yanıtlara uygulanır
# ---------------------------------------------------------------------------
CSP = (
    "default-src 'self'; "
    "img-src 'self' data:; "
    "style-src 'self' 'unsafe-inline'; "
    "script-src 'self'; "
    "base-uri 'none'; "
    "frame-ancestors 'none'"
)


@app.after_request
def _security_headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Content-Security-Policy"] = CSP
    return resp


# ---------------------------------------------------------------------------
# Sayfalar
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    """Ana sayfa (tek sayfalık uygulama) — kök index.html."""
    return send_from_directory(str(BASE_DIR), "index.html")


# ---------------------------------------------------------------------------
# İçerik API'si — frontend site.json'u buradan (ya da statik olarak) çeker
# ---------------------------------------------------------------------------
@app.route("/content/site.json")
def site_content():
    """Düzenlenebilir içerik dosyasını döndürür."""
    if SITE_JSON.exists():
        return send_from_directory(str(CONTENT_DIR), "site.json", mimetype="application/json")
    return jsonify({"error": "content not found"}), 404


@app.route("/api/health")
def health():
    """Basit sağlık kontrolü — minimal çıktı."""
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# Contact — gerçek form gönderimi (mesajı dosyaya yazar)
# ---------------------------------------------------------------------------
@app.route("/api/contact", methods=["POST"])
def contact():
    """
    Contact formu gönderimini alır, doğrular ve messages.jsonl'e ekler.
    Beklenen JSON: { name, email, message }
    """
    # 1) Origin/Referer kontrolü — yabancı origin'den gelen POST'u reddet (header yoksa izin ver)
    if not _same_origin_ok():
        return jsonify({"ok": False, "errors": {"_": "Geçersiz origin."}}), 403

    # 2) Rate limit — IP başına dakikada 3 / günde 20
    ip = _client_ip()
    allowed, retry_after = _rate_check(ip)
    if not allowed:
        resp = jsonify({"ok": False, "errors": {"_": "Çok fazla istek. Lütfen sonra tekrar dene."}})
        resp.status_code = 429
        resp.headers["Retry-After"] = str(max(1, retry_after))
        return resp

    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    # Doğrulama
    errors = {}
    if not name or len(name) > 80:
        errors["name"] = "İsim gerekli (max 80)."
    if not EMAIL_RE.match(email) or len(email) > 120:
        errors["email"] = "Geçerli bir e-posta gerekli."
    if not message or len(message) < 2 or len(message) > 2000:
        errors["message"] = "Mesaj 2-2000 karakter olmalı."

    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    # Basit honeypot (bot koruması) — 'website' dolu ise sessizce başarı dön
    if (data.get("website") or "").strip():
        return jsonify({"ok": True}), 200

    record = {
        "ts": datetime.datetime.utcnow().isoformat() + "Z",
        "name": name,
        "email": email,
        "message": message,
        "ip": ip,
    }

    try:
        CONTENT_DIR.mkdir(exist_ok=True)
        with open(MESSAGES_FILE, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    except OSError:
        return jsonify({"ok": False, "errors": {"_": "Mesaj kaydedilemedi."}}), 500

    return jsonify({"ok": True, "message": "Mesaj alındı. Teşekkürler."}), 200


# ---------------------------------------------------------------------------
# Statik dosya yardımcıları (Netlify/GitHub Pages ile de uyumlu yollar)
# ---------------------------------------------------------------------------
@app.route("/favicon.ico")
def favicon():
    return ("", 204)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    host = os.environ.get("HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=False)
