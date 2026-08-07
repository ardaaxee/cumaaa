"""İsteğe bağlı: promptları gerçekten görsele çevir.

Varsayılan sağlayıcı yok — `generate` komutu sadece prompt dosyaları yazar.
`persona images` komutu bu modülü kullanarak Replicate veya OpenAI üzerinden
görsel üretir. Sadece standart kütüphane kullanılır (proxy ayarlarına uyar).
"""

from __future__ import annotations

import base64
import json
import os
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path

TIMEOUT = 300


def _ssl_context() -> ssl.SSLContext:
    ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
    return ssl.create_default_context(cafile=ca) if ca else ssl.create_default_context()


def _post(url: str, payload: dict, headers: dict[str, str]) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    for k, v in headers.items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=_ssl_context()) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{url} → HTTP {e.code}: {e.read().decode('utf-8')[:500]}") from e


def _get(url: str, headers: dict[str, str]) -> dict:
    req = urllib.request.Request(url)
    for k, v in headers.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=TIMEOUT, context=_ssl_context()) as r:
        return json.loads(r.read().decode("utf-8"))


def _data_uri(path: Path) -> str:
    """Yerel görseli data: URI'ye çevirir (sağlayıcılara referans vermek için)."""
    suffix = path.suffix.lower().lstrip(".") or "jpeg"
    mime = "image/jpeg" if suffix in {"jpg", "jpeg"} else f"image/{suffix}"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def _download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=TIMEOUT, context=_ssl_context()) as r:
        dest.write_bytes(r.read())


# --- Replicate ---------------------------------------------------------------


def replicate_generate(
    prompt: str,
    dest: Path,
    *,
    model: str,
    aspect: str,
    seed: int,
    reference: Path | None = None,
) -> Path:
    token = os.environ.get("REPLICATE_API_TOKEN")
    if not token:
        raise SystemExit("REPLICATE_API_TOKEN tanımlı değil.")
    headers = {"Authorization": f"Bearer {token}", "Prefer": "wait"}
    body = {
        "input": {
            "prompt": prompt,
            "aspect_ratio": aspect,
            "seed": seed,
            "output_format": "jpg",
        }
    }
    if reference is not None:
        # Flux ailesi referans görseli `image_prompt` ile alıyor. Yüz
        # tutarlılığını sağlayan asıl mekanizma bu; promptdaki anchor
        # metni tek başına yetmiyor.
        body["input"]["image_prompt"] = _data_uri(reference)
    res = _post(f"https://api.replicate.com/v1/models/{model}/predictions", body, headers)

    # "Prefer: wait" çoğu zaman tamamlanmış sonuç döndürür; dönmezse yokla.
    deadline = time.time() + TIMEOUT
    while res.get("status") in {"starting", "processing"} and time.time() < deadline:
        time.sleep(2)
        res = _get(res["urls"]["get"], {"Authorization": f"Bearer {token}"})

    if res.get("status") != "succeeded":
        raise RuntimeError(f"Replicate başarısız: {res.get('status')} {res.get('error')}")

    out = res["output"]
    url = out[0] if isinstance(out, list) else out
    dest.parent.mkdir(parents=True, exist_ok=True)
    _download(url, dest)
    return dest


# --- OpenAI ------------------------------------------------------------------

_OPENAI_SIZES = {"4:5": "1024x1536", "9:16": "1024x1536", "1:1": "1024x1024"}


def openai_generate(prompt: str, dest: Path, *, model: str, aspect: str) -> Path:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise SystemExit("OPENAI_API_KEY tanımlı değil.")
    body = {
        "model": model,
        "prompt": prompt,
        "size": _OPENAI_SIZES.get(aspect, "1024x1536"),
        "n": 1,
    }
    res = _post(
        "https://api.openai.com/v1/images/generations",
        body,
        {"Authorization": f"Bearer {key}"},
    )
    item = res["data"][0]
    dest.parent.mkdir(parents=True, exist_ok=True)
    if "b64_json" in item:
        dest.write_bytes(base64.b64decode(item["b64_json"]))
    else:
        _download(item["url"], dest)
    return dest


PROVIDERS = {
    "replicate": "black-forest-labs/flux-1.1-pro",
    "openai": "gpt-image-1",
}


#: Referans görseli destekleyen sağlayıcılar.
SUPPORTS_REFERENCE = {"replicate"}


def generate(
    prompt: str,
    dest: Path,
    *,
    provider: str,
    model: str | None,
    aspect: str,
    seed: int,
    reference: Path | None = None,
) -> Path:
    model = model or PROVIDERS[provider]
    if provider == "replicate":
        return replicate_generate(
            prompt, dest, model=model, aspect=aspect, seed=seed, reference=reference
        )
    if provider == "openai":
        # OpenAI'nin düzenleme uç noktası farklı bir istek biçimi kullanıyor;
        # referans desteği burada yok. Sessizce yok saymak yerine söylüyoruz.
        return openai_generate(prompt, dest, model=model, aspect=aspect)
    raise SystemExit(f"Bilinmeyen sağlayıcı: {provider}")
