"""İsteğe bağlı: promptları gerçekten görsele çevir.

Varsayılan sağlayıcı yok — `generate` komutu sadece prompt dosyaları yazar.
`persona images` komutu bu modülü kullanarak Replicate veya OpenAI üzerinden
görsel üretir. Sadece standart kütüphane kullanılır (proxy ayarlarına uyar).
"""

from __future__ import annotations

import base64
import email.utils
import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from . import render

TIMEOUT = 300

#: 429 alındığında en fazla kaç kez tekrar denenir (sonsuz döngü olmasın).
MAX_RETRIES = 8

#: Retry-After başlığı da gövde de yoksa beklenecek süre.
DEFAULT_RETRY_WAIT = 10.0


def _ssl_context() -> ssl.SSLContext:
    ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
    return ssl.create_default_context(cafile=ca) if ca else ssl.create_default_context()


def _parse_retry_after(raw: str | None) -> float | None:
    """`Retry-After` başlığını saniyeye çevirir.

    Başlık ya saniye sayısı ya da HTTP tarihi olabilir (RFC 9110). İkisini de
    kabul ediyoruz; çözülemeyen değer için None dönüp çağırana karar bırakıyoruz.
    """
    if raw is None:
        return None
    raw = raw.strip()
    if not raw:
        return None
    try:
        return float(raw)
    except ValueError:
        pass
    try:
        when = email.utils.parsedate_to_datetime(raw)
    except (TypeError, ValueError):
        return None
    if when is None:
        return None
    import datetime as _dt

    now = _dt.datetime.now(_dt.timezone.utc)
    if when.tzinfo is None:
        when = when.replace(tzinfo=_dt.timezone.utc)
    return max(0.0, (when - now).total_seconds())


def _body_retry_after(body: str) -> float | None:
    """Yanıt gövdesindeki `retry_after` alanını saniyeye çevirir."""
    try:
        parsed = json.loads(body)
    except (ValueError, TypeError):
        return None
    if not isinstance(parsed, dict):
        return None

    value = parsed.get("retry_after")
    if isinstance(value, bool):  # bool, int'in alt tipi — sayı sayılmasın
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        return _parse_retry_after(value)
    return None


def _retry_after_seconds(err: urllib.error.HTTPError, body: str) -> float:
    """Bekleme süresi: önce gövdedeki `retry_after`, sonra başlık, sonra varsayılan.

    Replicate bu değeri JSON gövdesinde döndürüyor (ör. `retry_after: 6`),
    başlık her yanıtta bulunmayabiliyor. Bu yüzden gövde önce okunuyor.
    """
    seconds = _body_retry_after(body)

    if seconds is None:
        header = err.headers.get("Retry-After") if err.headers else None
        seconds = _parse_retry_after(header)

    if seconds is None:
        seconds = DEFAULT_RETRY_WAIT
    return max(0.0, seconds)


def _format_wait(seconds: float) -> str:
    return str(int(seconds)) if float(seconds).is_integer() else f"{seconds:.1f}"


def _post(
    url: str, payload: dict, headers: dict[str, str], *, label: str = "Replicate"
) -> dict:
    """POST gönderir; 429 alırsa Retry-After'a uyup tekrar dener.

    Hız sınırı geçici bir durum, hata değil — tek bir 429 yüzünden 100
    karelik bir üretimin ortasında durmak istemiyoruz. 429 dışındaki HTTP
    hatalarının davranışı değişmedi: anında RuntimeError.
    """
    data = json.dumps(payload).encode("utf-8")

    for attempt in range(MAX_RETRIES + 1):
        req = urllib.request.Request(url, data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        for k, v in headers.items():
            req.add_header(k, v)
        try:
            with urllib.request.urlopen(
                req, timeout=TIMEOUT, context=_ssl_context()
            ) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")

            if e.code != 429:
                raise RuntimeError(f"{url} → HTTP {e.code}: {body[:500]}") from e

            if attempt >= MAX_RETRIES:
                raise RuntimeError(
                    f"{url} → HTTP 429: hız sınırı {MAX_RETRIES} tekrar denemeden "
                    f"sonra da devam ediyor, vazgeçildi. Son yanıt: {body[:300]}"
                ) from e

            wait = _retry_after_seconds(e, body)
            print(
                f"{label} rate limit (429), {_format_wait(wait)} saniye bekleniyor...",
                file=sys.stderr,
            )
            time.sleep(wait)

    # Döngü ya return ya raise ile biter; buraya düşülmez.
    raise RuntimeError(f"{url} → beklenmeyen durum: tekrar denemeler tükendi")


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
    negative: str = "",
    reference_param: str | None = None,
) -> Path:
    token = os.environ.get("REPLICATE_API_TOKEN")
    if not token:
        raise SystemExit("REPLICATE_API_TOKEN tanımlı değil.")
    caps = render.caps_for(model)
    headers = {"Authorization": f"Bearer {token}", "Prefer": "wait"}
    body = {
        "input": {
            "prompt": prompt,
            "aspect_ratio": aspect,
            "seed": seed,
            "output_format": "jpg",
        }
    }

    # Negatif metin YALNIZCA modelin gerçek bir `negative_prompt` girdisi
    # varsa gönderilir. FLUX'ta yok; oraya negatif eklemek onu pozitif
    # koşullamaya çevirir ve tam istemediğimiz şeyi ürettirir.
    if negative and caps.supports_negative:
        body["input"]["negative_prompt"] = negative

    if reference is not None:
        param = reference_param or caps.reference_param
        if not param:
            raise SystemExit(
                f"{model} referans görsel almıyor (bilinen girdi yok). "
                "Yüz tutarlılığı için --model black-forest-labs/flux-kontext-pro "
                "kullan ya da --reference-param ile alan adını ver."
            )
        # Alan adı modele göre değişiyor: Kontext `input_image`, 1.1-pro
        # `image_prompt`, flux-dev `image`. Yanlış ad sessizce yok sayılır
        # ve her karede farklı bir yüz çıkar — bu yüzden şemadan geliyor.
        body["input"][param] = _data_uri(reference)

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
        label="OpenAI",
    )
    item = res["data"][0]
    dest.parent.mkdir(parents=True, exist_ok=True)
    if "b64_json" in item:
        dest.write_bytes(base64.b64decode(item["b64_json"]))
    else:
        _download(item["url"], dest)
    return dest


PROVIDERS = {
    # Kimlik kareleri metinden üretiliyor; içerik kareleri referansla.
    # Kontext ailesi verilen kişiyi koruyarak yeni sahne kurduğu için
    # varsayılan bu: 1.1-pro'nun `image_prompt`'u yüzü kilitlemiyor.
    "replicate": "black-forest-labs/flux-kontext-pro",
    "openai": "gpt-image-1",
}

#: Kimlik karelerinin varsayılan modeli: referans yok, saf metinden üretim.
IDENTITY_MODEL = "black-forest-labs/flux-1.1-pro"

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
    negative: str = "",
    reference_param: str | None = None,
) -> Path:
    model = model or PROVIDERS[provider]
    if provider == "replicate":
        return replicate_generate(
            prompt,
            dest,
            model=model,
            aspect=aspect,
            seed=seed,
            reference=reference,
            negative=negative,
            reference_param=reference_param,
        )
    if provider == "openai":
        # OpenAI'nin düzenleme uç noktası farklı bir istek biçimi kullanıyor;
        # referans desteği burada yok. Sessizce yok saymak yerine söylüyoruz.
        return openai_generate(prompt, dest, model=model, aspect=aspect)
    raise SystemExit(f"Bilinmeyen sağlayıcı: {provider}")
