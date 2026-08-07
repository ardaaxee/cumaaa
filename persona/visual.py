"""Görsel prompt üretimi.

Tek kural: karakterin yüzü/vücudu her promptta *kelimesi kelimesine aynı*
"anchor" metniyle tarif edilir. Sahne, kıyafet, ışık ve kamera değişir.
Tutarlılığı sağlayan şey budur; sabit seed ve referans görsel bunu güçlendirir.
"""

from __future__ import annotations

import random

from .models import Character, Pillar

# Aracın referans görselle çalışan sürümleri için ipuçları.
REFERENCE_HINTS = {
    "midjourney": "--cref <REFERANS_GORSEL_URL> --cw 100 --ar {ar} --style raw --seed {seed}",
    "flux": "IP-Adapter / Redux ile referans görsel ağırlığı 0.7-0.85",
    "sdxl": "IP-Adapter FaceID plus, ağırlık 0.8; ayrıca LoRA eğitilebilir",
    "nano-banana": "referans görseli ekle ve 'aynı kişi, aynı yüz' talimatını koru",
}

ASPECT = {"post": "4:5", "carousel": "4:5", "story": "9:16", "reel": "9:16", "profile": "1:1"}


def context_for(ch: Character, pillar: Pillar | None, rng: random.Random) -> dict[str, str]:
    """Sütuna uygun kıyafet / mekân / kamera seçer.

    Sütun kendi listesini tanımlamışsa onu kullanır; yoksa karakterin genel
    listesine düşer. Böylece laboratuvar karesine can yeleği gelmez.
    """
    v = ch.visual
    return {
        "wardrobe": rng.choice((pillar.wardrobe if pillar else None) or v.wardrobe),
        "location": rng.choice((pillar.locations if pillar else None) or v.locations),
        "camera": rng.choice((pillar.camera if pillar else None) or v.camera),
    }


def build_prompt(
    ch: Character,
    scene: str,
    *,
    rng: random.Random,
    kind: str = "post",
    pillar: Pillar | None = None,
    wardrobe: str | None = None,
    camera: str | None = None,
    location: str | None = None,
) -> str:
    """Tek bir görsel için tam prompt metni üretir."""
    v = ch.visual
    ctx = context_for(ch, pillar, rng)
    wardrobe = wardrobe or ctx["wardrobe"]
    camera = camera or ctx["camera"]
    location = location or ctx["location"]

    parts = [
        f"Fotoğraf. {scene}.",
        f"KİŞİ (her karede birebir aynı): {v.anchor}. Saç: {v.hair}.",
    ]

    # Karede ikinci bir kişi varsa onun görünümü de sabit tutulmalı.
    companion = pillar.companion if pillar else ""
    if companion and companion in ch.companions:
        parts.append(
            f"İKİNCİ KİŞİ — {companion} (her karede birebir aynı): "
            f"{ch.companions[companion]}."
        )

    parts += [
        f"Kıyafet: {wardrobe}.",
        f"Mekân: {location}.",
        f"Kamera/ışık: {camera}.",
        f"Renk paleti: {', '.join(v.palette)}.",
        f"Stil: {rng.choice(v.style_notes)}.",
        "Instagram gönderisi için doğal, belgesel hissi veren gerçekçi fotoğraf.",
        f"En-boy oranı {ASPECT.get(kind, '4:5')}.",
    ]
    prompt = " ".join(parts)
    if v.negative:
        prompt += "\n\nİSTENMEYEN: " + "; ".join(v.negative) + "."
    prompt += f"\nSeed: {v.seed}"
    return prompt


def build_carousel(
    ch: Character,
    pillar: Pillar,
    *,
    rng: random.Random,
    count: int = 3,
    lead: str | None = None,
) -> list[str]:
    """Aynı gün / aynı kıyafet / aynı mekân mantığıyla bir karusel serisi.

    `lead` verilirse serinin ilk karesi o olur; çağıran taraf sahneyi
    desteden çektiği için karusellerde de sahne tekrarı olmaz.
    """
    ctx = context_for(ch, pillar, rng)
    if lead is None:
        scenes = rng.sample(pillar.scenes, k=min(count, len(pillar.scenes)))
    else:
        pool = [s for s in pillar.scenes if s != lead]
        extra = rng.sample(pool, k=min(max(0, count - 1), len(pool)))
        scenes = [lead, *extra]
    return [
        build_prompt(
            ch,
            scene,
            rng=rng,
            kind="carousel",
            pillar=pillar,
            wardrobe=ctx["wardrobe"],
            camera=ctx["camera"],
            location=ctx["location"],
        )
        for scene in scenes
    ]


def profile_picture_prompt(ch: Character, rng: random.Random) -> str:
    return build_prompt(
        ch,
        "omuz üstü portre, hafif yandan, kameraya bakmıyor, arkada bulanık deniz",
        rng=rng,
        kind="profile",
        wardrobe="haki keten gömlek, kolları kıvrık",
        location="açık havada, kıyıda",
        camera="50mm, sığ alan derinliği, doğal gün ışığı",
    )


#: identity_reference modunda kullanılan dosya adı kökleri (poz sırasıyla).
IDENTITY_SLUGS = ["01-onden", "02-profil", "03-uc-ceyrek", "04-tam-boy"]


def identity_reference_prompts(
    ch: Character, rng: random.Random | None = None
) -> list[str]:
    """`identity_reference` modu — yalnızca ana karakteri sabitleyen kareler.

    Bilerek `build_prompt`'u kullanmaz: o fonksiyon sütuna bağlı companion
    (yan karakter) satırı ekleyebiliyor. Burada karede tam olarak bir kişi
    olması bir garanti, rastgeleliğe bırakılmış bir tercih değil — bu yüzden
    prompt sıfırdan, sabit ve companion'a erişmeden kuruluyor.

    `rng` kabul edilir ama kullanılmaz; bu modun çıktısı deterministiktir.
    """
    v = ch.visual
    ir = v.identity_reference

    prompts: list[str] = []
    for pose in ir.poses:
        parts = [
            f"Kimlik referans fotoğrafı — {pose}.",
            "KARE KURALI: karede tam olarak 1 (bir) kişi var. Başka insan yok, "
            "yan karakter yok, hayvan veya evcil hayvan yok; arka planda da "
            "insan ya da hayvan yok. Arka plan tamamen boş.",
            f"KİŞİ (tek kişi, her karede birebir aynı): {v.anchor}. Saç: {v.hair}.",
            f"Kıyafet: {ir.wardrobe}.",
            f"Mekân: {ir.location}.",
            f"Kamera/ışık: {ir.camera}.",
            "Amaç: yüzü, saçı ve vücut kimliğini sabitlemek. Doğal ve gerçekçi "
            "fotoğraf; ten dokusu görünür, retouch ve güzelleştirme yok.",
            f"En-boy oranı {ir.aspect}.",
        ]
        prompt = " ".join(parts)
        if v.negative:
            prompt += "\n\nİSTENMEYEN: " + "; ".join(v.negative) + "."
        prompt += "\n" + ir.negative_en
        prompt += f"\nSeed: {v.seed}"
        prompts.append(prompt)
    return prompts


def reference_sheet_prompts(ch: Character, rng: random.Random | None = None) -> list[str]:
    """Karakter referans sayfası — artık identity_reference modunu kullanır.

    Geriye dönük uyumluluk için isim korundu.
    """
    return identity_reference_prompts(ch, rng)


def companion_reference_prompts(
    ch: Character, name: str, rng: random.Random | None = None
) -> list[str]:
    """Tekrar eden ikinci kişiler için ayrı referans sayfası.

    Aynı identity_reference kuralları geçerli: karede tek kişi, hayvan yok,
    arka plan boş. Ana karakterin anchor'ı burada geçmez — kare sadece o
    kişiye ait. Çıktı deterministiktir; `rng` kabul edilir ama kullanılmaz.
    """
    anchor = ch.companions[name]
    ir = ch.visual.identity_reference

    out = []
    for pose in ir.poses:
        parts = [
            f"Kimlik referans fotoğrafı — {pose}.",
            "KARE KURALI: karede tam olarak 1 (bir) kişi var. Başka insan yok, "
            "hayvan yok; arka plan tamamen boş.",
            f"KİŞİ — {name} (tek kişi, her karede birebir aynı): {anchor}.",
            f"Kıyafet: {ir.wardrobe}.",
            f"Mekân: {ir.location}.",
            f"Kamera/ışık: {ir.camera}.",
            "Doğal ve gerçekçi fotoğraf; ten dokusu görünür, retouch yok.",
            f"En-boy oranı {ir.aspect}.",
        ]
        prompt = " ".join(parts)
        if ch.visual.negative:
            prompt += "\n\nİSTENMEYEN: " + "; ".join(ch.visual.negative) + "."
        prompt += "\n" + ir.negative_en
        prompt += f"\nSeed: {ch.visual.seed}"
        out.append(prompt)
    return out


def tool_hint(tool: str, ch: Character, kind: str = "post") -> str:
    template = REFERENCE_HINTS.get(tool, "")
    return template.format(ar=ASPECT.get(kind, "4:5"), seed=ch.visual.seed)
