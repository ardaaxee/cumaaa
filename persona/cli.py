"""Komut satırı arayüzü."""

from __future__ import annotations

import argparse
import random
import shutil
import sys
from datetime import date
from pathlib import Path

from . import content, export, images, visual
from .models import Character

DEFAULT_CHARACTER = Path(__file__).parent / "characters" / "beyza.json"


def _load_character(path: str | None) -> Character:
    return Character.load(path or DEFAULT_CHARACTER)


def cmd_generate(args: argparse.Namespace) -> int:
    ch = _load_character(args.character)
    rng = random.Random(args.seed if args.seed is not None else ch.visual.seed)
    if args.seed is not None:
        ch.visual.seed = args.seed

    start = date.fromisoformat(args.start) if args.start else date.today()
    out = Path(args.out)

    posts = content.build_posts(ch, args.posts, start, rng, cadence_days=args.cadence)
    reels = content.build_reels(ch, args.reels, start, rng)
    stories = content.build_stories(ch, args.stories, start, rng)

    if args.captions:
        from . import llm

        np_, nr = llm.apply_caption_file(args.captions, posts, reels)
        print(f"Hazır açıklamalar uygulandı: {np_} gönderi, {nr} reels", file=sys.stderr)
    elif args.llm:
        from . import llm

        print("Claude ile açıklamalar yeniden yazılıyor…", file=sys.stderr)
        llm.rewrite_post_captions(ch, posts, effort=args.effort)
        llm.rewrite_reel_captions(ch, reels, effort=args.effort)

    rows = content.build_calendar(posts, reels, stories)
    export.export_all(ch, posts, reels, stories, rows, out, rng)

    print(f"✓ {ch.display_name} (@{ch.handle}) paketi hazır: {out}")
    print(f"  {len(posts)} gönderi · {len(reels)} reels · {len(stories)} gün hikâye")
    print(f"  Toplam görsel promptu: "
          f"{sum(len(p.image_prompts) for p in posts) + sum(len(r.shots) for r in reels)}")
    print(f"  Başla: {out / 'profil.md'}")
    return 0


def cmd_images(args: argparse.Namespace) -> int:
    out = Path(args.out)
    bundle = out / "tum-promptlar.txt"
    if not bundle.exists():
        raise SystemExit(f"{bundle} yok. Önce `persona generate` çalıştır.")

    ch = _load_character(args.character)
    blocks: list[tuple[str, str]] = []
    for chunk in bundle.read_text(encoding="utf-8").split("### ")[1:]:
        header, _, body = chunk.partition("\n")
        name = header.split(" ")[1] if " " in header else header
        blocks.append((name.strip(), body.strip()))

    if args.limit:
        blocks = blocks[: args.limit]

    dest_dir = out / "gorseller"
    made = 0
    for name, prompt in blocks:
        dest = dest_dir / f"{name}.jpg"
        if dest.exists() and not args.overwrite:
            continue
        aspect = "9:16" if name.startswith("REEL") else "4:5"
        print(f"→ {name}", file=sys.stderr)
        images.generate(
            prompt,
            dest,
            provider=args.provider,
            model=args.model,
            aspect=aspect,
            seed=ch.visual.seed,
        )
        made += 1
    print(f"✓ {made} görsel üretildi: {dest_dir}")
    return 0


def cmd_new_character(args: argparse.Namespace) -> int:
    dest = Path(args.path)
    if dest.exists() and not args.overwrite:
        raise SystemExit(f"{dest} zaten var (--overwrite ile üzerine yaz).")
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(DEFAULT_CHARACTER, dest)
    print(f"✓ Şablon kopyalandı: {dest}")
    print("  Düzenle, sonra: persona generate --character", dest)
    return 0


def cmd_identity(args: argparse.Namespace) -> int:
    """identity_reference modu: sadece kimlik sabitleme kareleri."""
    ch = _load_character(args.character)

    targets: list[tuple[str, list[str]]] = [(ch.display_name, visual.identity_reference_prompts(ch))]
    if args.companions:
        for name in ch.companions:
            targets.append((name, visual.companion_reference_prompts(ch, name)))

    out = Path(args.out) if args.out else None
    for who, prompts in targets:
        for slug, prompt in zip(visual.IDENTITY_SLUGS, prompts):
            if out:
                path = out / content.slugify(who) / f"{slug}.txt"
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(prompt + "\n", encoding="utf-8")
            else:
                print(f"### {who} · {slug}\n{prompt}\n")

    total = sum(len(p) for _, p in targets)
    if out:
        print(f"✓ {total} kimlik referans promptu yazıldı: {out}")
    return 0


def cmd_prompt(args: argparse.Namespace) -> int:
    """Tek seferlik prompt üret (hızlı deneme için)."""
    ch = _load_character(args.character)
    rng = random.Random(args.seed if args.seed is not None else ch.visual.seed)
    print(visual.build_prompt(ch, args.scene, rng=rng, kind=args.kind))
    return 0


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(
        prog="persona",
        description="Kurgusal bir Instagram karakteri için içerik paketi üretir.",
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("generate", help="Tüm içerik paketini üret")
    g.add_argument("--character", help="Karakter JSON yolu")
    g.add_argument("--out", default="cikti", help="Çıktı klasörü (varsayılan: cikti)")
    g.add_argument("--posts", type=int, default=24, help="Gönderi sayısı")
    g.add_argument("--reels", type=int, default=8, help="Reels sayısı")
    g.add_argument("--stories", type=int, default=14, help="Hikâye planı gün sayısı")
    g.add_argument("--cadence", type=int, default=2, help="Gönderiler arası gün")
    g.add_argument("--start", help="Başlangıç tarihi (YYYY-AA-GG)")
    g.add_argument("--seed", type=int, help="Rastgelelik tohumu")
    g.add_argument("--llm", action="store_true", help="Açıklamaları Claude ile yaz")
    g.add_argument(
        "--captions",
        help="Hazır açıklama JSON'u uygula (API gerekmez; --llm'i geçersiz kılar)",
    )
    g.add_argument(
        "--effort",
        default="medium",
        choices=["low", "medium", "high", "xhigh", "max"],
        help="Claude effort seviyesi (--llm ile)",
    )
    g.set_defaults(func=cmd_generate)

    i = sub.add_parser("images", help="Promptlardan görsel üret")
    i.add_argument("--out", default="cikti", help="generate ile aynı klasör")
    i.add_argument("--character", help="Karakter JSON yolu")
    i.add_argument("--provider", default="replicate", choices=list(images.PROVIDERS))
    i.add_argument("--model", help="Sağlayıcıya özel model kimliği")
    i.add_argument("--limit", type=int, help="Sadece ilk N promptu üret")
    i.add_argument("--overwrite", action="store_true")
    i.set_defaults(func=cmd_images)

    n = sub.add_parser("new-character", help="Yeni karakter için şablon kopyala")
    n.add_argument("path", help="Hedef JSON yolu")
    n.add_argument("--overwrite", action="store_true")
    n.set_defaults(func=cmd_new_character)

    idn = sub.add_parser(
        "identity",
        help="Kimlik referans kareleri (tek kişi, hayvan yok, boş arka plan)",
    )
    idn.add_argument("--character", help="Karakter JSON yolu")
    idn.add_argument("--out", help="Klasöre yaz (verilmezse ekrana basar)")
    idn.add_argument(
        "--companions",
        action="store_true",
        help="Yan karakterler için de ayrı kimlik kareleri üret",
    )
    idn.set_defaults(func=cmd_identity)

    p = sub.add_parser("prompt", help="Tek bir sahne için görsel promptu yazdır")
    p.add_argument("scene", help="Sahne açıklaması")
    p.add_argument("--character")
    p.add_argument("--kind", default="post", choices=list(visual.ASPECT))
    p.add_argument("--seed", type=int)
    p.set_defaults(func=cmd_prompt)

    return ap


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)
