"""whoisarda — Flask backend.

Design rules for this file:
  * every endpoint returns real data; nothing is simulated or padded
  * no third-party dependencies beyond Flask itself (Termux-friendly)
  * the four original endpoints (/api/status, /api/contact, /api/qr,
    /api/commands) keep their paths and stay backwards compatible
"""

import json
import os
import re
import sqlite3
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from flask import (
    Flask,
    Response,
    g,
    jsonify,
    render_template,
    request,
    send_from_directory,
)

import qrgen

BASE_DIR = Path(__file__).resolve().parent
CONTENT_DIR = BASE_DIR / "content"
INSTANCE_DIR = BASE_DIR / "instance"
DB_PATH = INSTANCE_DIR / "messages.db"

VERSION = "3.0.0"
STARTED_AT = time.time()

_ASSET_FILES = (
    "static/style.css",
    "static/app.js",
    "static/js/core.js",
    "static/js/data.js",
    "static/js/modal.js",
    "static/js/sections.js",
    "static/js/console.js",
    "static/js/connect.js",
    "templates/index.html",
)


def asset_version():
    """Fingerprint of the front-end files; changes whenever any of them do."""
    stamp = 0.0
    for name in _ASSET_FILES:
        path = BASE_DIR / name
        if path.exists():
            stamp = max(stamp, path.stat().st_mtime)
    return "%s-%d" % (VERSION, int(stamp))

# Sections that the single-page shell can deep-link into.
SECTIONS = (
    "status", "whatido", "lab", "projects", "now", "toolbox",
    "console", "connect",
)

app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.environ.get("SECRET_KEY", "dev-only-change-me"),
    JSON_SORT_KEYS=False,
    MAX_CONTENT_LENGTH=64 * 1024,
)

# Contact throttling
RATE_WINDOW_SECONDS = 3600
RATE_MAX_PER_WINDOW = 5

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s.]+\.[^@\s]+$")


# --------------------------------------------------------------------------- #
# Content loading
# --------------------------------------------------------------------------- #

_content_cache = {"mtime": None, "data": None}


def _read_json(name):
    with open(CONTENT_DIR / name, "r", encoding="utf-8") as fh:
        return json.load(fh)


def load_content(force=False):
    """Load and merge the content files, re-reading them when they change."""
    files = ["site.json", "lab.json"]
    mtime = max((CONTENT_DIR / f).stat().st_mtime for f in files)
    if not force and _content_cache["data"] is not None \
            and _content_cache["mtime"] == mtime:
        return _content_cache["data"]

    site = _read_json("site.json")
    lab = _read_json("lab.json")

    data = {
        "version": VERSION,
        "profile": site["profile"],
        "currently_building": site.get("currently_building", []),
        "drops": site.get("drops", []),
        "projects": site.get("projects", []),
        "archive": site.get("archive", []),
        "notes": site.get("notes", []),
        "lab": lab,
        "tools": TOOL_REGISTRY,
        "playground": PLAYGROUND_REGISTRY,
    }
    data["search"] = build_search_index(data)
    data["counts"] = {
        "projects": len(data["projects"]),
        "archive": len(data["archive"]),
        "notes": len(data["notes"]),
        "tools": len(TOOL_REGISTRY),
        "playground": len(PLAYGROUND_REGISTRY),
        "lab_tracks": len(lab["tracks"]),
        "lab_lessons": sum(len(t["lessons"]) for t in lab["tracks"]),
    }
    _content_cache.update(mtime=mtime, data=data)
    return data


# Tools and playground experiments live in the frontend, but their metadata is
# declared here so search, the command palette and deep links all agree.
TOOL_REGISTRY = [
    {"id": "qr", "title": "QR Generator", "desc": "Metin veya bağlantıdan QR üret, PNG indir.", "keywords": ["qr", "kod", "link", "paylas"]},
    {"id": "json", "title": "JSON Formatter", "desc": "JSON'u biçimlendir, küçült ve doğrula.", "keywords": ["json", "format", "beautify", "minify", "validate"]},
    {"id": "base64", "title": "Base64", "desc": "Metni base64'e çevir veya geri çöz.", "keywords": ["base64", "encode", "decode", "kodla"]},
    {"id": "url", "title": "URL Encoder", "desc": "URL bileşenlerini kodla ve çöz.", "keywords": ["url", "encode", "decode", "percent"]},
    {"id": "hash", "title": "Hash", "desc": "SHA-1, SHA-256 ve SHA-512 özeti hesapla.", "keywords": ["hash", "sha", "sha256", "ozet", "checksum"]},
    {"id": "timestamp", "title": "Timestamp", "desc": "Unix zaman damgası ile tarih arasında çevir.", "keywords": ["timestamp", "unix", "epoch", "tarih", "zaman"]},
    {"id": "color", "title": "Color Tool", "desc": "HEX, RGB, HSL çevir; tonlar ve kontrast üret.", "keywords": ["renk", "color", "hex", "rgb", "hsl", "kontrast"]},
    {"id": "text", "title": "Text Tools", "desc": "Büyük/küçük harf, slug, sayaç, ters çevir, sırala.", "keywords": ["metin", "text", "slug", "case", "sayac"]},
    {"id": "uuid", "title": "UUID", "desc": "Kriptografik olarak güvenli UUID v4 üret.", "keywords": ["uuid", "guid", "id", "rastgele"]},
    {"id": "jwt", "title": "JWT Decoder", "desc": "JWT başlık ve gövdesini çöz — imza doğrulaması yapılmaz.", "keywords": ["jwt", "token", "decode", "jose"]},
]

PLAYGROUND_REGISTRY = [
    {"id": "field", "title": "Field", "desc": "Dokunmaya tepki veren parçacık alanı.", "keywords": ["parcacik", "particle", "canvas", "dokunma"]},
    {"id": "life", "title": "Life", "desc": "Conway's Game of Life — hücreleri sen çiz.", "keywords": ["life", "conway", "otomat", "simulasyon"]},
    {"id": "tone", "title": "Tone", "desc": "Web Audio ile çalışan dokunmatik ses pedleri.", "keywords": ["ses", "audio", "synth", "muzik", "ton"]},
    {"id": "scramble", "title": "Scramble", "desc": "Metin karıştırma efektini kendi yazınla dene.", "keywords": ["glitch", "scramble", "metin", "efekt"]},
]

COMMANDS = [
    {"name": "help", "desc": "Tüm komutları listele", "action": "help"},
    {"name": "home", "desc": "Ana ekrana dön", "action": "nav", "target": "home"},
    {"name": "explore", "desc": "Keşif destesini aç", "action": "nav", "target": "explore"},
    {"name": "terminal", "desc": "İnteraktif terminali aç", "action": "nav", "target": "terminal"},
    {"name": "cheatsheet", "desc": "Komut kartını aç", "action": "nav", "target": "cheatsheet"},
    {"name": "status", "desc": "Sistem durumunu aç", "action": "nav", "target": "status"},
    {"name": "lab", "desc": "Termux LAB'i aç", "action": "nav", "target": "lab"},
    {"name": "termux", "desc": "Termux LAB'i aç (lab ile aynı)", "action": "nav", "target": "lab"},
    {"name": "tools", "desc": "Araçları aç", "action": "nav", "target": "tools"},
    {"name": "projects", "desc": "Projeleri aç", "action": "nav", "target": "projects"},
    {"name": "playground", "desc": "Deneyleri aç", "action": "nav", "target": "playground"},
    {"name": "notes", "desc": "Notları aç", "action": "nav", "target": "notes"},
    {"name": "archive", "desc": "Arşivi aç", "action": "nav", "target": "archive"},
    {"name": "drops", "desc": "Son güncellemeleri göster", "action": "nav", "target": "drops"},
    {"name": "contact", "desc": "İletişim formunu aç", "action": "nav", "target": "contact"},
    {"name": "share", "desc": "Paylaşım ve QR panelini aç", "action": "nav", "target": "share"},
    {"name": "instagram", "desc": "Instagram profilini aç", "action": "external", "target": "https://instagram.com/lov4ardaa"},
    {"name": "github", "desc": "GitHub profilini aç", "action": "external", "target": "https://github.com/ardaaxee"},
    {"name": "theme", "desc": "Kontrast modunu değiştir", "action": "theme"},
    {"name": "motion", "desc": "Hareket efektlerini aç/kapat", "action": "motion"},
    {"name": "ping", "desc": "Sunucu durumunu satır içi göster", "action": "status"},
    {"name": "clear", "desc": "Komut geçmişini temizle", "action": "clear"},
]


def build_search_index(data):
    """Flatten everything addressable into one searchable list."""
    index = []

    for project in data["projects"]:
        index.append({
            "id": "project:" + project["id"],
            "type": "project",
            "title": project["title"],
            "sub": project["summary"],
            "target": "projects",
            "arg": project["id"],
            "keywords": [project["kind"], project["status"]] + project.get("tech", []),
        })

    for item in data["archive"]:
        index.append({
            "id": "archive:" + item["title"],
            "type": "archive",
            "title": item["title"],
            "sub": item.get("note", ""),
            "target": "archive",
            "arg": item["title"],
            "keywords": ["arsiv", "archive"],
        })

    for note in data["notes"]:
        index.append({
            "id": "note:" + note["id"],
            "type": "note",
            "title": note["title"],
            "sub": note.get("excerpt", ""),
            "target": "notes",
            "arg": note["id"],
            "keywords": note.get("tags", []),
        })

    for tool in data["tools"]:
        index.append({
            "id": "tool:" + tool["id"],
            "type": "tool",
            "title": tool["title"],
            "sub": tool["desc"],
            "target": "tools",
            "arg": tool["id"],
            "keywords": tool["keywords"],
        })

    for exp in data["playground"]:
        index.append({
            "id": "play:" + exp["id"],
            "type": "playground",
            "title": exp["title"],
            "sub": exp["desc"],
            "target": "playground",
            "arg": exp["id"],
            "keywords": exp["keywords"],
        })

    for track in data["lab"]["tracks"]:
        for lesson in track["lessons"]:
            index.append({
                "id": "lesson:" + lesson["id"],
                "type": "lesson",
                "title": lesson["title"],
                "sub": "%s — %s" % (track["label"], lesson["subtitle"]),
                "target": "lab",
                "arg": "%s/%s" % (track["id"], lesson["id"]),
                "keywords": [track["id"], lesson["command"], "termux", "komut"],
            })

    return index


# --------------------------------------------------------------------------- #
# Database
# --------------------------------------------------------------------------- #

def get_db():
    if "db" not in g:
        INSTANCE_DIR.mkdir(exist_ok=True)
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    INSTANCE_DIR.mkdir(exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT,
            message    TEXT NOT NULL,
            source     TEXT,
            ip_hash    TEXT,
            user_agent TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    con.execute(
        "CREATE INDEX IF NOT EXISTS idx_messages_created "
        "ON messages(created_at)"
    )
    con.commit()
    con.close()


def client_fingerprint():
    """Hash the caller's IP so rate limiting works without storing addresses."""
    import hashlib
    forwarded = request.headers.get("X-Forwarded-For", "")
    ip = forwarded.split(",")[0].strip() or request.remote_addr or "unknown"
    salt = app.config["SECRET_KEY"]
    return hashlib.sha256((salt + ip).encode()).hexdigest()[:32]


def notify(name, email, message):
    """Best-effort Telegram notification. Silent no-op when unconfigured."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return False
    text = "whoisarda — yeni mesaj\n\nAd: %s\nE-posta: %s\n\n%s" % (
        name, email or "-", message)
    payload = urllib.parse.urlencode({"chat_id": chat_id, "text": text}).encode()
    url = "https://api.telegram.org/bot%s/sendMessage" % token
    try:
        with urllib.request.urlopen(url, data=payload, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False


# --------------------------------------------------------------------------- #
# Pages
# --------------------------------------------------------------------------- #

@app.context_processor
def inject_asset_version():
    return {"asset_v": asset_version()}


@app.route("/")
def index():
    return render_template("index.html", content=load_content(), version=VERSION)


@app.route("/<section>")
def section_page(section):
    """Deep links render the same shell; the client opens the right panel."""
    if section not in SECTIONS:
        return render_template("index.html", content=load_content(),
                               version=VERSION), 404
    return render_template("index.html", content=load_content(), version=VERSION)


# --------------------------------------------------------------------------- #
# API — original four endpoints
# --------------------------------------------------------------------------- #

@app.route("/api/status")
def api_status():
    """Real process and content facts only — no invented metrics."""
    content = load_content()
    now = time.time()
    return jsonify({
        "ok": True,
        "service": "whoisarda",
        "version": VERSION,
        "server_time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "uptime_seconds": int(now - STARTED_AT),
        "content": content["counts"],
        "endpoints": [
            "/api/status", "/api/contact", "/api/qr",
            "/api/commands", "/api/content", "/api/note/<id>",
        ],
    })


@app.route("/api/commands")
def api_commands():
    return jsonify({"ok": True, "commands": COMMANDS})


@app.route("/api/qr")
def api_qr():
    """Render a QR code. format=svg (default) or format=json for the matrix."""
    data = request.args.get("data", "").strip()
    if not data:
        data = request.url_root.rstrip("/")
    if len(data.encode("utf-8")) > 400:
        return jsonify({"ok": False, "error": "veri çok uzun (en fazla 400 bayt)"}), 400

    ec = request.args.get("ec", "M").upper()
    if ec not in ("L", "M"):
        ec = "M"

    fmt = request.args.get("format", "svg").lower()
    try:
        if fmt == "json":
            matrix = qrgen.encode(data, ec)
            return jsonify({
                "ok": True,
                "size": len(matrix),
                "ec": ec,
                "matrix": [[1 if v else 0 for v in row] for row in matrix],
            })

        try:
            scale = max(1, min(20, int(request.args.get("scale", 8))))
        except ValueError:
            scale = 8
        dark = request.args.get("dark", "#000000")
        light = request.args.get("light", "#ffffff")
        if not re.fullmatch(r"#[0-9a-fA-F]{3,8}", dark):
            dark = "#000000"
        if not re.fullmatch(r"#[0-9a-fA-F]{3,8}|transparent", light):
            light = "#ffffff"

        svg = qrgen.svg(data, ec=ec, scale=scale, dark=dark, light=light)
        return Response(svg, mimetype="image/svg+xml", headers={
            "Cache-Control": "public, max-age=86400",
        })
    except ValueError as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400


@app.route("/api/contact", methods=["POST"])
def api_contact():
    payload = request.get_json(silent=True) or request.form

    # Honeypot: real users never fill a hidden field.
    if (payload.get("website") or "").strip():
        return jsonify({"ok": True, "id": None})

    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    message = (payload.get("message") or "").strip()
    source = (payload.get("source") or "site").strip()[:40]

    errors = {}
    if not 2 <= len(name) <= 80:
        errors["name"] = "İsim 2-80 karakter olmalı."
    if email and not EMAIL_RE.match(email):
        errors["email"] = "Geçerli bir e-posta gir ya da boş bırak."
    if len(email) > 120:
        errors["email"] = "E-posta çok uzun."
    if not 10 <= len(message) <= 4000:
        errors["message"] = "Mesaj 10-4000 karakter olmalı."
    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    fingerprint = client_fingerprint()
    db = get_db()
    cutoff = datetime.fromtimestamp(
        time.time() - RATE_WINDOW_SECONDS, timezone.utc).isoformat()
    recent = db.execute(
        "SELECT COUNT(*) AS n FROM messages WHERE ip_hash = ? AND created_at > ?",
        (fingerprint, cutoff),
    ).fetchone()["n"]
    if recent >= RATE_MAX_PER_WINDOW:
        return jsonify({
            "ok": False,
            "error": "Çok fazla mesaj gönderdin. Bir saat sonra tekrar dene.",
        }), 429

    cur = db.execute(
        "INSERT INTO messages (name, email, message, source, ip_hash, "
        "user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (name, email, message, source, fingerprint,
         (request.headers.get("User-Agent") or "")[:200],
         datetime.now(timezone.utc).isoformat(timespec="seconds")),
    )
    db.commit()

    notified = notify(name, email, message)
    return jsonify({"ok": True, "id": cur.lastrowid, "notified": notified})


# --------------------------------------------------------------------------- #
# API — additions
# --------------------------------------------------------------------------- #

@app.route("/api/content")
def api_content():
    return jsonify({"ok": True, **load_content()})


@app.route("/api/note/<note_id>")
def api_note(note_id):
    for note in load_content()["notes"]:
        if note["id"] == note_id:
            return jsonify({"ok": True, "note": note})
    return jsonify({"ok": False, "error": "not bulunamadı"}), 404


@app.route("/api/messages")
def api_messages():
    """Read stored messages. Requires ADMIN_TOKEN; disabled when unset."""
    expected = os.environ.get("ADMIN_TOKEN")
    if not expected:
        return jsonify({"ok": False, "error": "devre dışı"}), 404
    supplied = request.args.get("token") or request.headers.get("X-Admin-Token")
    if supplied != expected:
        return jsonify({"ok": False, "error": "yetkisiz"}), 401
    rows = get_db().execute(
        "SELECT id, name, email, message, source, created_at "
        "FROM messages ORDER BY id DESC LIMIT 200"
    ).fetchall()
    return jsonify({"ok": True, "messages": [dict(r) for r in rows]})


@app.route("/api/health")
def api_health():
    return jsonify({"ok": True, "uptime_seconds": int(time.time() - STARTED_AT)})


# --------------------------------------------------------------------------- #
# Static extras
# --------------------------------------------------------------------------- #

@app.route("/manifest.webmanifest")
def manifest():
    profile = load_content()["profile"]
    return jsonify({
        "name": "%s — %s" % (profile["name"], profile["handle"]),
        "short_name": profile["name"],
        "description": profile["tagline"],
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "background_color": "#050506",
        "theme_color": "#050506",
        "orientation": "portrait",
        "icons": [
            {"src": "/static/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/static/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "/static/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    })


@app.route("/sw.js")
def service_worker():
    return send_from_directory(app.static_folder, "sw.js",
                               mimetype="application/javascript")


@app.route("/robots.txt")
def robots():
    body = "User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n" % request.url_root
    return Response(body, mimetype="text/plain")


@app.route("/sitemap.xml")
def sitemap():
    root = request.url_root.rstrip("/")
    urls = ["%s/" % root] + ["%s/%s" % (root, s) for s in SECTIONS]
    body = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        body.append("<url><loc>%s</loc></url>" % url)
    body.append("</urlset>")
    return Response("".join(body), mimetype="application/xml")


@app.after_request
def security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault(
        "Permissions-Policy", "geolocation=(), camera=(), microphone=()")
    if request.path.startswith("/static/"):
        # Static URLs carry a fingerprint, so they may be cached hard.
        if request.args.get("v"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        else:
            response.headers["Cache-Control"] = "no-cache"
    elif response.mimetype == "text/html":
        # The shell must always be revalidated or an old design lingers.
        response.headers["Cache-Control"] = "no-cache, must-revalidate"
    return response


@app.errorhandler(404)
def not_found(_e):
    if request.path.startswith("/api/"):
        return jsonify({"ok": False, "error": "bulunamadı"}), 404
    return render_template("index.html", content=load_content(),
                           version=VERSION), 404


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    host = os.environ.get("HOST", "127.0.0.1")
    app.run(host=host, port=port, debug=bool(os.environ.get("DEBUG")))
