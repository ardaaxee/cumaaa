"""Gönderi, reels ve hikâye planı üretimi."""

from __future__ import annotations

import random
import re
import unicodedata
from datetime import date, timedelta

from . import render, visual
from .models import Character, Pillar, Post, Reel, StoryDay, StoryFrame
from .voice import Deck, VoiceEngine

_TR_MAP = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")


def slugify(text: str, limit: int = 40) -> str:
    text = text.translate(_TR_MAP)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:limit].strip("-") or "gonderi"


def _pick_pillar(ch: Character, rng: random.Random, recent: list[str]) -> Pillar:
    """Ağırlıklı seçim, ama son iki gönderinin sütununu tekrar etme."""
    pool = [p for p in ch.weighted_pillars() if p.key not in recent[-2:]]
    return rng.choice(pool or ch.weighted_pillars())


def _pair(
    ch: Character,
    p: Pillar,
    scene: str,
    ctx: dict[str, str],
    *,
    kind: str,
    rng: random.Random,
    suffix_tr: str = "",
    suffix_en: str = "",
) -> tuple[str, str]:
    """Aynı kare için (Türkçe belge promptu, İngilizce render promptu).

    İkisi aynı `ctx`'i paylaşıyor: kıyafet, mekân ve kamera iki dilde de
    aynı. Türkçe olan `profil.md` ve `tum-promptlar.txt` içindir; modele
    giden İngilizce olandır (nedeni `render.py` başında yazılı).
    """
    scene_tr = f"{scene} ({suffix_tr})" if suffix_tr else scene
    tr = visual.build_prompt(
        ch,
        scene_tr,
        rng=rng,
        kind=kind,
        pillar=p,
        wardrobe=ctx["wardrobe"],
        camera=ctx["camera"],
        location=ctx["location"],
    )

    scene_en = p.scene_en(scene) or scene
    if suffix_en:
        scene_en = f"{scene_en} ({suffix_en})"
    en = render.content_render_prompt(
        ch,
        scene_en,
        kind=kind,
        wardrobe_en=ctx["wardrobe_en"],
        location_en=ctx["location_en"],
        camera_en=ctx["camera_en"],
    )
    return tr, en


def build_posts(
    ch: Character, count: int, start: date, rng: random.Random, cadence_days: int = 2
) -> list[Post]:
    voice = VoiceEngine(ch, rng)
    posts: list[Post] = []
    recent: list[str] = []
    used_openers: set[str] = set()
    # Sahneler sütun başına destelenir: havuz tükenmeden aynı kare iki kez
    # düşmesin. Aksi halde aynı fotoğraf akışta 3-4 kez tekrar ediyor.
    scene_decks: dict[str, Deck] = {}

    for i in range(count):
        p = _pick_pillar(ch, rng, recent)
        recent.append(p.key)

        deck = scene_decks.setdefault(p.key, Deck(p.scenes, rng))
        scene = deck.draw()

        # Karusel: aynı gün, aynı kıyafet, aynı mekân — o yüzden tek ctx.
        ctx = visual.context_for(ch, p, rng)
        scenes = [scene]
        if rng.random() < 0.35:
            pool = [s for s in p.scenes if s != scene]
            scenes += rng.sample(pool, k=min(rng.randint(1, 2), len(pool)))

        pairs = [
            _pair(ch, p, s, ctx, kind="carousel" if len(scenes) > 1 else "post", rng=rng)
            for s in scenes
        ]
        prompts = [t for t, _ in pairs]
        renders = [e for _, e in pairs]

        # Aynı kanca cümlesiyle başlayan iki gönderi olmasın.
        for _ in range(6):
            caption = voice.caption(p)
            first = caption.splitlines()[0]
            if first not in used_openers:
                break
        used_openers.add(first)

        posts.append(
            Post(
                index=i + 1,
                date=(start + timedelta(days=i * cadence_days)).isoformat(),
                pillar=p.key,
                slug=slugify(caption.splitlines()[0]),
                scene=scene,
                image_prompts=prompts,
                render_prompts=renders,
                caption=caption,
                hashtags=voice.hashtags(p),
                alt_text=voice.alt_text(scene),
                location=ctx["location"],
                first_comment=voice.first_comment(p),
            )
        )
    return posts


REEL_FORMATS = [
    ("bir gün", "sabahtan akşama tek günün 6 kesiti, hızlı kurgu"),
    ("süreç", "bir işin baştan sona nasıl yapıldığı, adım adım"),
    ("öncesi/sonrası", "aynı kadraj iki farklı durumda"),
    ("sesli anlatım", "tek kadraj üstüne dış ses, yavaş tempo"),
    ("soru-cevap", "gelen bir soruya kamera karşısında cevap"),
    ("liste", "3 madde, her madde bir kesit"),
]


def build_reels(
    ch: Character, count: int, start: date, rng: random.Random, cadence_days: int = 5
) -> list[Reel]:
    voice = VoiceEngine(ch, rng)
    reels: list[Reel] = []
    formats = Deck([f"{n}|{d}" for n, d in REEL_FORMATS], rng)
    recent: list[str] = []
    for i in range(count):
        p = _pick_pillar(ch, rng, recent)
        recent.append(p.key)
        fmt_name, fmt_desc = formats.draw().split("|", 1)
        hook = voice.hook(p)

        scene_pool = list(p.scenes)
        rng.shuffle(scene_pool)
        shot_count = min(len(scene_pool), rng.randint(4, 6))
        shots = []
        seconds = [0]
        for n in range(shot_count):
            dur = rng.choice([2, 3, 3, 4, 5])
            ctx = visual.context_for(ch, p, rng)
            tr, en = _pair(ch, p, scene_pool[n], ctx, kind="reel", rng=rng)
            shots.append(
                {
                    "no": str(n + 1),
                    "sure": f"{seconds[0]}-{seconds[0] + dur}s",
                    "gorsel": scene_pool[n],
                    "prompt": tr,
                    "render": en,
                }
            )
            seconds[0] += dur

        vo = [hook, voice.detail(p), voice.detail(p), voice.cta(p)]
        on_screen = [
            hook[:38],
            voice.detail(p)[:38],
            rng.choice(["devamı geliyor", "son kısım", "not aldım"]),
        ]

        reels.append(
            Reel(
                index=i + 1,
                date=(start + timedelta(days=i * cadence_days)).isoformat(),
                pillar=p.key,
                slug=slugify(f"{fmt_name}-{hook}"),
                concept=f"{fmt_name.upper()} — {fmt_desc}",
                hook=hook,
                shots=shots,
                voiceover=vo,
                on_screen_text=on_screen,
                audio_note=rng.choice(
                    [
                        "ortam sesi (deniz/rüzgâr) + düşük seviyede sakin enstrümantal",
                        "sadece ortam sesi, müzik yok",
                        "trend olan sakin bir parça, sözsüz bölümü kullan",
                        "dış ses + hafif dalga sesi altta",
                    ]
                ),
                caption=voice.caption(p),
                hashtags=voice.hashtags(p),
            )
        )
    return reels


#: (tür, Türkçe kadraj notu, İngilizce kadraj notu, sticker)
STORY_KINDS = [
    ("anlık", "o an çekilmiş dikey kare", "vertical shot taken in the moment",
     "yazı: tek cümle"),
    ("anket", "basit bir görsel", "simple uncluttered composition",
     "sticker: anket, iki seçenek"),
    ("soru kutusu", "sade arka plan", "plain quiet background",
     "sticker: soru kutusu"),
    ("perde arkası", "dağınık, hazırlıksız kare", "messy unprepared candid shot",
     "yazı: kısa açıklama"),
    ("geri sayım", "mekân görseli", "wider shot of the place",
     "sticker: geri sayım"),
    ("tekrar paylaşım", "son gönderinin kadrajı", "same framing as the last post",
     "yazı: 'yeni gönderi'"),
    ("müzik", "manzara", "wider atmospheric view", "sticker: müzik"),
]


def build_stories(
    ch: Character, days: int, start: date, rng: random.Random
) -> list[StoryDay]:
    voice = VoiceEngine(ch, rng)
    out: list[StoryDay] = []
    recent: list[str] = []
    for d in range(days):
        p = _pick_pillar(ch, rng, recent)
        recent.append(p.key)
        frames: list[StoryFrame] = []
        kinds = rng.sample(STORY_KINDS, k=rng.randint(3, 5))
        for kind, vis_tr, vis_en, sticker in kinds:
            scene = rng.choice(p.scenes)
            ctx = visual.context_for(ch, p, rng)
            tr, en = _pair(
                ch, p, scene, ctx, kind="story", rng=rng,
                suffix_tr=vis_tr, suffix_en=vis_en,
            )
            frames.append(
                StoryFrame(
                    kind=kind,
                    visual=tr,
                    render=en,
                    text=_story_text(kind, p, voice, rng),
                    sticker=sticker,
                )
            )
        out.append(
            StoryDay(
                day=d + 1,
                date=(start + timedelta(days=d)).isoformat(),
                theme=p.name,
                frames=frames,
            )
        )
    return out


def _story_text(kind: str, p: Pillar, voice: VoiceEngine, rng: random.Random) -> str:
    if kind == "anket":
        return rng.choice(
            [
                "bugün: sahaya mı çıkayım, veriyi mi temizleyeyim?",
                "kahve mi, uyku mu? (cevabı biliyorum)",
                "bu koya isim verelim mi?",
            ]
        )
    if kind == "soru kutusu":
        return rng.choice(
            [
                "deniz biyolojisi hakkında ne merak ediyorsunuz?",
                "sahayla ilgili sorusu olan?",
                "doktora soruları buraya.",
            ]
        )
    if kind == "geri sayım":
        return "cumartesi kıyı temizliği. yer DM'de."
    if kind == "tekrar paylaşım":
        return "yeni gönderi ↗"
    return voice.detail(p)


def build_calendar(
    posts: list[Post], reels: list[Reel], stories: list[StoryDay]
) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for p in posts:
        rows.append(
            {
                "tarih": p.date,
                "tur": "gönderi",
                "sutun": p.pillar,
                "baslik": p.caption.splitlines()[0],
                "dosya": f"posts/{p.index:02d}-{p.slug}",
            }
        )
    for r in reels:
        rows.append(
            {
                "tarih": r.date,
                "tur": "reels",
                "sutun": r.pillar,
                "baslik": r.hook,
                "dosya": f"reels/{r.index:02d}-{r.slug}",
            }
        )
    for s in stories:
        rows.append(
            {
                "tarih": s.date,
                "tur": "hikâye",
                "sutun": s.theme,
                "baslik": f"{len(s.frames)} kare",
                "dosya": f"stories/gun-{s.day:02d}.md",
            }
        )
    rows.sort(key=lambda r: (r["tarih"], r["tur"]))
    return rows
