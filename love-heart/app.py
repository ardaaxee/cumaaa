"""Sevgiliye özel, tek kalpli minimal web sitesi.

Lokal calistirma:   python3 app.py
Production:         gunicorn app:app --bind 0.0.0.0:$PORT
"""

from __future__ import annotations

import json
import os
import re
import secrets
from pathlib import Path

from flask import Flask, g, render_template, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"

# config.json bozuk, eksik ya da hic yok olsa bile site acilmaya devam etsin
# diye her alanin bir varsayilani var.
DEFAULT_CONFIG = {
    "heart_color": "#ff2e63",
    "secondary_color": "#ff9dbb",
    "background_color": "#120912",
    # Sayfada gorunmez; yalnizca tarayici sekmesinin basligi.
    "page_title": "❤",
}

# Eski anahtar isimleriyle yazilmis config'ler de calissin.
ALIASES = {
    "secondary_color": ("heart_color_2",),
    "background_color": ("background",),
    "page_title": ("title",),
}

# Renk alanlari dogrudan CSS'e giriyor: yalnizca hex ve basit renk adi kabul.
COLOR_KEYS = ("heart_color", "secondary_color", "background_color")
COLOR_RE = re.compile(r"^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|[a-zA-Z]{3,20})$")

app = Flask(__name__)

_cached_config = None
_cached_mtime = None


def _pick(data: dict, key: str):
    """Once asil anahtari, sonra eski isimlerini dene."""
    for name in (key,) + ALIASES.get(key, ()):
        value = data.get(name)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def load_config() -> dict:
    """config.json'u oku; eksik/bozuk alanlari varsayilanla tamamla."""
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
    except (json.JSONDecodeError, OSError, UnicodeDecodeError) as exc:
        app.logger.warning("config.json okunamadi (%s), varsayilanlar kullanildi.", exc)

    config = {}
    for key, default in DEFAULT_CONFIG.items():
        value = _pick(data, key)
        if value is None:
            value = default
        elif key in COLOR_KEYS and not COLOR_RE.match(value):
            app.logger.warning("config.json: '%s' gecerli bir renk degil (%r).", key, value)
            value = default
        config[key] = value
    return config


def get_config() -> dict:
    """config.json degistiyse yeniden oku, degismediyse onbellekten ver."""
    global _cached_config, _cached_mtime
    try:
        mtime = CONFIG_PATH.stat().st_mtime
    except OSError:
        mtime = None
    if _cached_config is None or mtime != _cached_mtime:
        _cached_config = load_config()
        _cached_mtime = mtime
    return _cached_config


# Ilk yukleme uygulama acilirken yapilsin.
get_config()


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


@app.route("/favicon.ico")
def favicon():
    """Bazi tarayicilar <link rel=icon> olsa da /favicon.ico istiyor;
    404 log kirliligi olmasin diye ayni SVG kalbi donduruyoruz."""
    return send_from_directory(
        app.static_folder, "favicon.svg", mimetype="image/svg+xml"
    )


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
    # Site tamamen kendi sunucusundan geliyor; CSP disariya hicbir kaynak
    # birakmiyor (CDN, font, analytics yok).
    nonce = getattr(g, "csp_nonce", "")
    style_src = "style-src 'self' 'nonce-%s'" % nonce if nonce else "style-src 'self'"
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; %s; "
        "script-src 'self'; connect-src 'none'; object-src 'none'; "
        "base-uri 'none'; form-action 'none'; frame-ancestors 'none'" % style_src,
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
    # 0.0.0.0: ayni Wi-Fi'daki telefondan da test edilebilsin. Debug kapali.
    app.run(host="0.0.0.0", port=port)
