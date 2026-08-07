"""Üretilen içeriği diske yazar."""

from __future__ import annotations

import csv
import json
import random
from dataclasses import asdict
from pathlib import Path

from . import visual
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
        f"- **Ad:** {ch.display_name}",
        f"- **Kullanıcı adı:** @{ch.handle}",
        f"- **Kategori önerisi:** Bilim / Eğitim",
        f"- **Yaş / şehir:** {ch.age} · {ch.city}",
        f"- **Meslek:** {ch.occupation}",
        "",
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


def export_prompt_bundle(posts: list[Post], reels: list[Reel], out: Path) -> None:
    """Tüm görsel promptları tek dosyada — toplu üretim için."""
    chunks: list[str] = []
    for p in posts:
        for i, prompt in enumerate(p.image_prompts, 1):
            chunks.append(f"### POST {p.index:02d}-{i} ({p.pillar})\n{prompt}")
    for r in reels:
        for s in r.shots:
            chunks.append(f"### REEL {r.index:02d}-{s['no']} ({r.pillar})\n{s['prompt']}")
    _write(out / "tum-promptlar.txt", "\n\n".join(chunks))


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
    export_prompt_bundle(posts, reels, out)
    export_readme(
        ch, out, {"posts": len(posts), "reels": len(reels), "stories": len(stories)}
    )
