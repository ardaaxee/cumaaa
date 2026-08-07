"""İsteğe bağlı: açıklamaları Claude ile karakterin sesinde yeniden yaz.

Şablon üretici zaten çalışır durumda; bu modül metinleri "elle yazılmış"
hissettirmek için üstüne geçer. `pip install anthropic` ve bir kimlik bilgisi
(ANTHROPIC_API_KEY ya da `ant auth login` profili) gerekir.
"""

from __future__ import annotations

import json
from typing import Any

from .models import Character, Post, Reel

MODEL = "claude-opus-5"

CAPTION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "captions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "index": {"type": "integer"},
                    "caption": {"type": "string"},
                    "first_comment": {"type": "string"},
                },
                "required": ["index", "caption", "first_comment"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["captions"],
    "additionalProperties": False,
}


def _system_prompt(ch: Character) -> str:
    v = ch.voice
    return "\n".join(
        [
            "Bir Instagram hesabının açıklama metinlerini yazıyorsun.",
            "Hesap kurgusal bir karaktere ait ve bunu açıkça belirtiyor;",
            "metinleri o karakterin kendi ağzından, birinci tekil şahısla yaz.",
            "",
            f"KARAKTER: {ch.display_name}, {ch.age}, {ch.city}. {ch.occupation}.",
            f"Kısa tanım: {ch.tagline}",
            "",
            "GEÇMİŞİ:",
            *[f"- {b}" for b in ch.backstory],
            "",
            "ÇEVRESİ:",
            *[f"- {s['name']}: {s['role']}" for s in ch.side_characters],
            "",
            f"DİL: {v.language}, {v.person}.",
            "TON:",
            *[f"- {t}" for t in v.tone],
            "ÜSLUP ÖZELLİKLERİ:",
            *[f"- {q}" for q in v.quirks],
            "KAÇIN:",
            *[f"- {a}" for a in v.avoid],
            "",
            "KURALLAR:",
            "- Her açıklama 2-5 satır. Somut bir detay (sayı, saat, isim) içersin.",
            "- Verilen taslağın konusuna ve sahnesine sadık kal, olayı değiştirme.",
            "- Hashtag'leri açıklamaya koyma; ayrı 'first_comment' alanına yaz.",
            "- Her açıklama diğerlerinden farklı bir cümle yapısıyla başlasın.",
            "- Reklam ağzı yok, slogan yok, emoji en fazla bir tane.",
        ]
    )


def _client():
    try:
        import anthropic
    except ImportError as exc:  # pragma: no cover
        raise SystemExit(
            "anthropic paketi kurulu değil. `pip install anthropic` çalıştır."
        ) from exc
    return anthropic.Anthropic()


def _call(ch: Character, user_payload: str, effort: str) -> list[dict[str, Any]]:
    client = _client()
    with client.messages.stream(
        model=MODEL,
        max_tokens=64000,
        system=[
            {
                "type": "text",
                "text": _system_prompt(ch),
                "cache_control": {"type": "ephemeral"},
            }
        ],
        thinking={"type": "adaptive"},
        output_config={
            "effort": effort,
            "format": {"type": "json_schema", "schema": CAPTION_SCHEMA},
        },
        messages=[{"role": "user", "content": user_payload}],
    ) as stream:
        message = stream.get_final_message()

    if message.stop_reason == "refusal":
        raise SystemExit("Model isteği reddetti; taslak metinlerle devam et.")

    text = next(b.text for b in message.content if b.type == "text")
    return json.loads(text)["captions"]


def apply_caption_file(
    path: str, posts: list[Post], reels: list[Reel]
) -> tuple[int, int]:
    """Hazır yazılmış açıklamaları pakete uygular.

    Dosya biçimi `rewrite_*` fonksiyonlarının ürettiğiyle aynı:

        {"posts":  [{"index": 1, "caption": "...", "first_comment": "..."}],
         "reels":  [{"index": 1, "caption": "..."}]}

    API kimlik bilgisi olmadan da (ya da açıklamaları elle yazmak
    istediğinde) `--llm` ile aynı sonucu almanı sağlar.
    """
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)

    by_post = {r["index"]: r for r in data.get("posts", [])}
    by_reel = {r["index"]: r for r in data.get("reels", [])}

    n_posts = 0
    for p in posts:
        r = by_post.get(p.index)
        if r:
            p.caption = r["caption"].strip()
            if r.get("first_comment"):
                p.first_comment = r["first_comment"].strip()
            n_posts += 1

    n_reels = 0
    for rl in reels:
        r = by_reel.get(rl.index)
        if r:
            rl.caption = r["caption"].strip()
            n_reels += 1

    return n_posts, n_reels


def rewrite_post_captions(
    ch: Character, posts: list[Post], effort: str = "medium", batch: int = 10
) -> None:
    """Gönderi açıklamalarını yerinde günceller."""
    for start in range(0, len(posts), batch):
        chunk = posts[start : start + batch]
        payload = json.dumps(
            [
                {
                    "index": p.index,
                    "sutun": ch.pillar(p.pillar).name,
                    "sahne": p.scene,
                    "taslak": p.caption,
                    "onerilen_hashtagler": p.hashtags,
                }
                for p in chunk
            ],
            ensure_ascii=False,
            indent=2,
        )
        results = _call(
            ch,
            "Aşağıdaki gönderi taslaklarını karakterin sesiyle yeniden yaz. "
            "Her biri için index'i koruyarak caption ve first_comment döndür.\n\n"
            + payload,
            effort,
        )
        by_index = {r["index"]: r for r in results}
        for p in chunk:
            r = by_index.get(p.index)
            if r:
                p.caption = r["caption"].strip()
                p.first_comment = r["first_comment"].strip()


def rewrite_reel_captions(
    ch: Character, reels: list[Reel], effort: str = "medium", batch: int = 10
) -> None:
    for start in range(0, len(reels), batch):
        chunk = reels[start : start + batch]
        payload = json.dumps(
            [
                {
                    "index": r.index,
                    "format": r.concept,
                    "kanca": r.hook,
                    "taslak": r.caption,
                    "onerilen_hashtagler": r.hashtags,
                }
                for r in chunk
            ],
            ensure_ascii=False,
            indent=2,
        )
        results = _call(
            ch,
            "Aşağıdaki reels taslakları için açıklama yaz. index'i koru.\n\n" + payload,
            effort,
        )
        by_index = {r["index"]: r for r in results}
        for r in chunk:
            got = by_index.get(r.index)
            if got:
                r.caption = got["caption"].strip()
