"""Sevgiliye özel, tek kalpli minimal web sitesi.

Lokal calistirma:   python3 app.py
Production:         gunicorn app:app
"""

from __future__ import annotations

import json
import os
import secrets
from pathlib import Path

from flask import Flask, g, render_template

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"

# config.json bozuk ya da eksik olsa bile site acilmaya devam etsin diye
# her alanin bir varsayilani var.
DEFAULT_CONFIG = {
    "message": "Seni seviyorum ❤️",
    "hint": "kalbe dokun",
    "page_title": "Seni seviyorum ❤️",
    "heart_color": "#ff4d7e",
    "heart_color_2": "#ff8fb1",
    "background": "#140a16",
    "background_2": "#2a0f22",
}

app = Flask(__name__)


def load_config() -> dict:
    """config.json'u oku, eksik/bozuk alanlari varsayilanla tamamla."""
    data = {}
    try:
        with CONFIG_PATH.open("r", encoding="utf-8") as fh:
            loaded = json.load(fh)
        if isinstance(loaded, dict):
            data = loaded
        else:
            app.logger.warning("config.json bir JSON nesnesi degil, varsayilanlar kullanildi.")
    except FileNotFoundError:
        app.logger.warning("config.json bulunamadi, varsayilanlar kullanildi.")
    except (json.JSONDecodeError, OSError) as exc:
        app.logger.warning("config.json okunamadi (%s), varsayilanlar kullanildi.", exc)

    config = dict(DEFAULT_CONFIG)
    for key, default in DEFAULT_CONFIG.items():
        value = data.get(key)
        if isinstance(value, str) and value.strip():
            config[key] = value.strip()
        else:
            config[key] = default
    return config


# Production'da config bir kez okunur; development'ta her istekte tazelenir.
_CACHED_CONFIG = load_config()


def get_config() -> dict:
    if app.debug:
        return load_config()
    return _CACHED_CONFIG


@app.before_request
def create_nonce():
    # config.json'daki renkler sayfaya kucuk bir <style> blogu olarak giriyor.
    # CSP'yi gevsetmemek icin her istekte tek kullanimlik nonce uretiyoruz.
    g.csp_nonce = secrets.token_urlsafe(16)


@app.context_processor
def inject_nonce():
    return {"csp_nonce": getattr(g, "csp_nonce", "")}


@app.route("/")
def index():
    return render_template("index.html", config=get_config())


@app.route("/healthz")
def healthz():
    """Hosting platformlarinin saglik kontrolu icin."""
    return {"status": "ok"}, 200


@app.errorhandler(404)
def not_found(_error):
    # Tek sayfalik site: bilinmeyen adresler de kalbe gitsin.
    return render_template("index.html", config=get_config()), 404


@app.after_request
def add_headers(response):
    # Sade ama makul guvenlik basliklari. Site tamamen self-contained oldugu
    # icin CSP disariya hicbir kaynak birakmiyor.
    nonce = getattr(g, "csp_nonce", "")
    style_src = "style-src 'self' 'nonce-%s'" % nonce if nonce else "style-src 'self'"
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; %s; "
        "script-src 'self'; base-uri 'none'; form-action 'none'; "
        "frame-ancestors 'none'" % style_src,
    )
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
    # HTML her istekte yeni bir nonce tasidigi icin onbellege alinmamali.
    if response.mimetype == "text/html":
        response.headers.setdefault("Cache-Control", "no-cache")
    return response


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    debug = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    # 0.0.0.0: ayni Wi-Fi'daki telefondan da test edilebilsin.
    app.run(host="0.0.0.0", port=port, debug=debug)
