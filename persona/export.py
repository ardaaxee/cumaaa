"""Üretilen içeriği diske yazar."""

from __future__ import annotations

import csv
import json
import random
from dataclasses import asdict
from pathlib import Path

from . import render, visual
from .models import Character, Post, Reel, StoryDay
from .voice import VoiceEngine


def _write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")


def export_profile(ch: Character, out: Path, rng: random.Random) -> None:
    voice = VoiceEngine(ch, rng)
    lines = [
        f"# {ch.display_name} (@{ch.handle})",
        "",
        f"> {ch.disclosure}",
        "",
        "## Profil",
        "",
        f"- **Görünen ad:** {ch.display_name}",
        f"- **Kullanıcı adı:** @{ch.handle}",
        f"- **Yaş / şehir:** {ch.age} · {ch.city}",
        f"- **Meslek:** {ch.occupation}",
        f"- **Kısa tanım:** {ch.tagline}",
        "",
    ]

    if ch.handle_suggestions:
        lines += [
            "### Kullanıcı adı önerileri",
            "",
            *[f"- `@{h}`" for h in ch.handle_suggestions],
            "",
        ]

    lines += [
        "## Biyografi (Instagram bio alanına yapıştır)",
        "",
        "```",
        voice.bio(),
        "```",
        "",
        "## Profil fotoğrafı promptu",
        "",
        "```",
        visual.profile_picture_prompt(ch, rng),
        "```",
        "",
        "## Öne çıkanlar (highlights)",
        "",
        *[f"- {h}" for h in ch.highlights],
        "",
        "## Renk paleti",
        "",
        *[f"- {c}" for c in ch.visual.palette],
        "",
        "## İçerik kategorileri",
        "",
        "| Sütun | Ağırlık | Ne anlatır |",
        "|---|---|---|",
        *[
            f"| {p.name} | {p.weight} | {p.scenes[0][:60]}… |"
            for p in ch.pillars
        ],
        "",
        "## Arka plan (paylaşılmaz, tutarlılık için)",
        "",
        *[f"- {b}" for b in ch.backstory],
        "",
        "## Yan karakterler",
        "",
        *[f"- **{s['name']}** — {s['role']}" for s in ch.side_characters],
        "",
        "## Rutinler",
        "",
        *[f"- {r}" for r in ch.routines],
        "",
    ]

    if ch.personality:
        lines += ["## Kişilik", "", *[f"- {p}" for p in ch.personality], ""]
    if ch.interests:
        lines += ["## İlgi alanları", "", *[f"- {i}" for i in ch.interests], ""]
    if ch.weekly_plan:
        lines += [
            "## Haftalık paylaşım takvimi",
            "",
            *[f"- {w}" for w in ch.weekly_plan],
            "",
        ]

    lines += [
        "## Konuşma tarzı",
        "",
        f"Dil: {ch.voice.language}, {ch.voice.person}.",
        "",
        "**Ton:**",
        *[f"- {t}" for t in ch.voice.tone],
        "",
        "**Üslup özellikleri:**",
        *[f"- {q}" for q in ch.voice.quirks],
        "",
        "**Kaçınılanlar:**",
        *[f"- {a}" for a in ch.voice.avoid],
        "",
    ]

    if ch.arcs:
        lines += [
            "## Hikâye yayları",
            "",
            "Hesabı canlı tutan şey tek tek gönderiler değil, aylara yayılan bu",
            "hikâyeler. Takvimi doldururken her yayın bir sonraki adımını sıraya koy.",
            "",
        ]
        for arc in ch.arcs:
            lines += [f"### {arc['name']}", ""]
            lines += [f"{i}. {b}" for i, b in enumerate(arc.get("beats", []), 1)]
            lines.append("")

    lines += [
        "## Karakter referans sayfası (ÖNCE BUNU ÜRET)",
        "",
        "Aşağıdaki 4 kareyi üret, en iyisini seç ve bundan sonraki tüm görsellerde",
        "referans görsel olarak kullan. Yüz tutarlılığı buradan gelir.",
        "",
    ]
    for i, p in enumerate(visual.reference_sheet_prompts(ch, rng), 1):
        lines += [f"### Referans {i}", "", "```", p, "```", ""]

    for name in ch.companions:
        lines += [
            f"## {name} — referans sayfası",
            "",
            f"{name} birden çok karede görünüyor; onun yüzü de sabit kalmalı.",
            "Aynı yöntem: üret, birini seç, iki kişili karelerde ikinci referans",
            "görsel olarak ver.",
            "",
        ]
        for i, p in enumerate(visual.companion_reference_prompts(ch, name, rng), 1):
            lines += [f"### {name} referans {i}", "", "```", p, "```", ""]

    lines += [
        "## Araç ipuçları",
        "",
        *[f"- **{k}:** {visual.tool_hint(k, ch)}" for k in visual.REFERENCE_HINTS],
    ]
    _write(out / "profil.md", "\n".join(lines))


def export_posts(posts: list[Post], out: Path) -> None:
    for p in posts:
        d = out / "posts" / f"{p.index:02d}-{p.slug}"
        _write(d / "aciklama.txt", p.caption)
        _write(d / "ilk-yorum.txt", p.first_comment)
        _write(d / "alt-metin.txt", p.alt_text)
        for i, prompt in enumerate(p.image_prompts, 1):
            name = "gorsel.txt" if len(p.image_prompts) == 1 else f"gorsel-{i}.txt"
            _write(d / name, prompt)
        _write(d / "meta.json", json.dumps(asdict(p), ensure_ascii=False, indent=2))


def export_reels(reels: list[Reel], out: Path) -> None:
    for r in reels:
        d = out / "reels" / f"{r.index:02d}-{r.slug}"
        lines = [
            f"# Reels {r.index:02d} — {r.concept}",
            "",
            f"- **Tarih:** {r.date}",
            f"- **Sütun:** {r.pillar}",
            f"- **Ses:** {r.audio_note}",
            "",
            "## Kanca (ilk 2 saniye)",
            "",
            r.hook,
            "",
            "## Çekim listesi",
            "",
        ]
        for s in r.shots:
            lines += [
                f"### Plan {s['no']} ({s['sure']})",
                "",
                s["gorsel"],
                "",
                "```",
                s["prompt"],
                "```",
                "",
            ]
        lines += [
            "## Dış ses metni",
            "",
            *[f"{i}. {line}" for i, line in enumerate(r.voiceover, 1)],
            "",
            "## Ekran yazıları",
            "",
            *[f"- {t}" for t in r.on_screen_text],
            "",
            "## Açıklama",
            "",
            r.caption,
            "",
            " ".join(r.hashtags),
        ]
        _write(d / "senaryo.md", "\n".join(lines))
        _write(d / "aciklama.txt", r.caption + "\n\n" + " ".join(r.hashtags))


def export_stories(stories: list[StoryDay], out: Path) -> None:
    for s in stories:
        lines = [f"# Gün {s.day:02d} — {s.date} — {s.theme}", ""]
        for i, f in enumerate(s.frames, 1):
            lines += [
                f"## Kare {i} · {f.kind}",
                "",
                f"- **Yazı:** {f.text}",
                f"- **Sticker:** {f.sticker}",
                "",
                "```",
                f.visual,
                "```",
                "",
            ]
        _write(out / "stories" / f"gun-{s.day:02d}.md", "\n".join(lines))


def export_calendar(rows: list[dict[str, str]], out: Path) -> None:
    lines = [
        "# İçerik takvimi",
        "",
        "| Tarih | Tür | Sütun | Başlık | Dosya |",
        "|---|---|---|---|---|",
    ]
    for r in rows:
        baslik = r["baslik"].replace("|", "/")
        lines.append(
            f"| {r['tarih']} | {r['tur']} | {r['sutun']} | {baslik} | `{r['dosya']}` |"
        )
    _write(out / "takvim.md", "\n".join(lines))

    csv_path = out / "takvim.csv"
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["tarih", "tur", "sutun", "baslik", "dosya"])
        w.writeheader()
        w.writerows(rows)


#: gorseller/ altında oluşturulan klasörler (ad ön ekiyle eşleşir).
IMAGE_DIRS = {
    "IDENTITY": "identity",
    "PROFILE": "profile",
    "POST": "posts",
    "REEL": "reels",
    "STORY": "stories",
}


def image_name(ch: Character, kind: str, number: int) -> str:
    """BEYZA-POST-001 gibi benzersiz bir görsel adı üretir."""
    width = 2 if kind in {"IDENTITY", "PROFILE"} else 3
    return f"{ch.file_prefix}-{kind}-{number:0{width}d}"


def export_prompt_bundle(
    ch: Character,
    posts: list[Post],
    reels: list[Reel],
    stories: list[StoryDay],
    out: Path,
    rng: random.Random,
) -> None:
    """Tüm görsel promptları tek dosyada — toplu üretim için.

    İki dosya yazılır ve **adlandırma ikisinde de birebir aynıdır**:

    - `tum-promptlar.txt` — Türkçe, insanın okuması için.
    - `render-promptlari-en.txt` — İngilizce, `persona images` bunu modele
      gönderir. Nedeni `render.py` başında: FLUX'un metin kodlayıcısı
      İngilizce ve negatif prompt girdisi yok.

    Adlar `persona images` tarafından hem dosya adı hem klasör seçimi için
    kullanılıyor; tür ön eki ve sıra numarası burada belirleniyor.
    """
    tr_chunks: list[str] = []
    en_chunks: list[str] = []

    def add(name: str, note: str, tr: str, en: str) -> None:
        tr_chunks.append(f"### {name} ({note})\n{tr}")
        en_chunks.append(f"### {name} ({note})\n{en}")

    add(
        image_name(ch, "PROFILE", 1),
        "profil fotoğrafı",
        visual.profile_picture_prompt(ch, rng),
        render.profile_render_prompt(ch),
    )

    n = 0
    for p in posts:
        for i, prompt in enumerate(p.image_prompts):
            n += 1
            en = p.render_prompts[i] if i < len(p.render_prompts) else ""
            add(image_name(ch, "POST", n), p.pillar, prompt, en)

    n = 0
    for r in reels:
        for s in r.shots:
            n += 1
            add(
                image_name(ch, "REEL", n),
                f"{r.pillar} · plan {s['no']}",
                s["prompt"],
                s.get("render", ""),
            )

    n = 0
    for day in stories:
        for f in day.frames:
            n += 1
            add(
                image_name(ch, "STORY", n),
                f"gün {day.day:02d} · {f.kind}",
                f.visual,
                f.render,
            )

    _write(out / "tum-promptlar.txt", "\n\n".join(tr_chunks))
    _write(out / "render-promptlari-en.txt", "\n\n".join(en_chunks))

    # Kimlik promptları da dosyaya düşsün: üretmeden önce okunabilsinler.
    _write(
        out / "kimlik-promptlari-en.txt",
        "\n\n".join(
            f"### {image_name(ch, 'IDENTITY', i)}\n{p}"
            for i, p in enumerate(render.identity_render_prompts(ch), 1)
        ),
    )

    # İstenen klasör yapısı üretim başlamadan hazır dursun.
    for sub in IMAGE_DIRS.values():
        (out / "gorseller" / sub).mkdir(parents=True, exist_ok=True)


def export_readme(ch: Character, out: Path, counts: dict[str, int]) -> None:
    lines = [
        f"# {ch.display_name} — içerik paketi",
        "",
        f"> **{ch.disclosure}**",
        "",
        f"- {counts['posts']} gönderi (bazıları karusel)",
        f"- {counts['reels']} reels senaryosu",
        f"- {counts['stories']} günlük hikâye planı",
        "",
        "## Nereden başlanır",
        "",
        "1. `profil.md` → karakter referans kareleri üret, birini seç.",
        "2. O kareyi görsel aracına **referans görsel** olarak ver.",
        "3. `tum-promptlar.txt` içindeki promptları sırayla çalıştır.",
        "4. `takvim.md` sırasını takip ederek paylaş.",
        "",
        "## Klasörler",
        "",
        "| Klasör | İçerik |",
        "|---|---|",
        "| `profil.md` | Bio, profil fotoğrafı, referans sayfası |",
        "| `posts/` | Her gönderi: görsel promptu, açıklama, alt metin, ilk yorum |",
        "| `reels/` | Çekim listesi, dış ses metni, ekran yazıları |",
        "| `stories/` | Günlük hikâye kareleri ve sticker önerileri |",
        "| `takvim.md` / `takvim.csv` | Yayın takvimi |",
        "| `tum-promptlar.txt` | Tüm görsel promptlar tek dosyada |",
        "| `karakter.json` | Karakterin kaynak dosyası |",
        "",
        "## Önemli",
        "",
        "Bu hesap kurgusal bir karaktere ait. Instagram, yapay zekâ ile üretilen",
        "gerçekçi içeriğin etiketlenmesini istiyor: paylaşırken **\"Yapay zekâ ile",
        "üretildi\"** işaretini kullan ve biyografideki açıklama satırını silme.",
        "Gerçek bir kişiye benzeyen yüz üretme, gerçek bir kişiymiş gibi davranma.",
    ]
    _write(out / "README.md", "\n".join(lines))


def export_all(
    ch: Character,
    posts: list[Post],
    reels: list[Reel],
    stories: list[StoryDay],
    rows: list[dict[str, str]],
    out: Path,
    rng: random.Random,
) -> None:
    out.mkdir(parents=True, exist_ok=True)
    _write(out / "karakter.json", json.dumps(ch.to_dict(), ensure_ascii=False, indent=2))
    export_profile(ch, out, rng)
    export_posts(posts, out)
    export_reels(reels, out)
    export_stories(stories, out)
    export_calendar(rows, out)
    export_prompt_bundle(ch, posts, reels, stories, out, rng)
    export_readme(
        ch, out, {"posts": len(posts), "reels": len(reels), "stories": len(stories)}
    )
