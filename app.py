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
import datetime
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
CONTENT_DIR = BASE_DIR / "content"
SITE_JSON = CONTENT_DIR / "site.json"
MESSAGES_FILE = CONTENT_DIR / "messages.jsonl"  # contact mesajları buraya eklenir

# SPA kök index.html'den servis edilir (statik hosting ile de uyumlu tek kaynak)
app = Flask(__name__, static_folder="static", static_url_path="/static")

# Basit e-posta doğrulama deseni
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


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
    """Basit sağlık kontrolü."""
    return jsonify({"status": "ok", "service": "arda.os", "time": datetime.datetime.utcnow().isoformat() + "Z"})


# ---------------------------------------------------------------------------
# Contact — gerçek form gönderimi (mesajı dosyaya yazar)
# ---------------------------------------------------------------------------
@app.route("/api/contact", methods=["POST"])
def contact():
    """
    Contact formu gönderimini alır, doğrular ve messages.jsonl'e ekler.
    Beklenen JSON: { name, email, message }
    """
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
        "ip": request.headers.get("X-Forwarded-For", request.remote_addr),
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
