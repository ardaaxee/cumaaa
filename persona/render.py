"""Görsel API'sine gönderilen İngilizce render promptu.

Neden `visual.py`'den ayrı bir modül: `visual.py` insanın okuyacağı Türkçe
promptu üretiyor (`profil.md`, `tum-promptlar.txt`). Diffusion modelleri o
metinle çalışmıyor. İki yapısal gerçek bu ayrımı zorunlu kılıyor:

1. **FLUX ailesinin hiçbir modelinde `negative_prompt` girdisi yok.**
   Negatif listeyi promptun sonuna eklemek onu *pozitif* koşullamaya
   çevirir: içinde "male, man, child" geçen bir prompt erkek üretir. Bu
   modülde kısıtlar olumlu cümlelerle kuruluyor — "exactly one adult
   woman", "completely empty background" gibi. Modelin negatif desteği
   varsa (SDXL vb.) negatif metin ayrı bir alan olarak gönderilir,
   prompta yapıştırılmaz.

2. **FLUX'un metin kodlayıcısı (T5) İngilizce eğitildi ve ~512 token
   pencereye sahip.** 2500 karakterlik Türkçe prompt hem zayıf koşullama
   veriyor hem de kırpılıyor. Buradaki promptlar İngilizce ve kısa.

Ayrıca kimlik promptu *kimlikle başlar*: modeller promptun başındaki
tanıma sondakinden çok daha fazla uyuyor.
"""

from __future__ import annotations

from dataclasses import dataclass

from .models import Character, Pillar

#: Kimlik ve içerik karelerinin en-boy oranları.
ASPECT = {
    "identity": "1:1",
    "profile": "1:1",
    "post": "4:5",
    "carousel": "4:5",
    "reel": "9:16",
    "story": "9:16",
}


@dataclass(frozen=True)
class ModelCaps:
    """Bir görsel modelinin gerçekten desteklediği girdiler.

    `reference_param` modelin şemasındaki alanın *gerçek adı*. Yanlış ad
    göndermek sessiz başarısızlık demek: Replicate bilinmeyen alanı ya
    reddediyor ya da yok sayıyor, ikisinde de referans hiç uygulanmıyor ve
    yüz her karede değişiyor.
    """

    reference_param: str | None
    #: Ayrı bir `negative_prompt` girdisi var mı? FLUX'ta yok.
    supports_negative: bool = False
    #: Referans gerçekten kimliği (yüzü) koruyor mu, yoksa sadece stil/
    #: kompozisyon mu aktarıyor?
    identity_locking: bool = False
    note: str = ""


#: Bilinen modeller ve gerçek girdi adları.
MODEL_CAPS: dict[str, ModelCaps] = {
    # Kontext ailesi: `input_image` verilen kişiyi koruyarak yeni sahne
    # kurar. Yüz tutarlılığı için doğru olan model bu.
    "black-forest-labs/flux-kontext-pro": ModelCaps(
        "input_image", False, True, "karakteri koruyarak düzenler"
    ),
    "black-forest-labs/flux-kontext-max": ModelCaps(
        "input_image", False, True, "Kontext'in yüksek kaliteli sürümü"
    ),
    # 1.1-pro'nun `image_prompt`'u Redux: stil/kompozisyon aktarır, yüzü
    # kilitlemez. Kimlik kareleri için iyi, tutarlılık için yetersiz.
    "black-forest-labs/flux-1.1-pro": ModelCaps(
        "image_prompt", False, False, "Redux: stil aktarır, yüzü kilitlemez"
    ),
    "black-forest-labs/flux-1.1-pro-ultra": ModelCaps(
        "image_prompt", False, False, "Redux: stil aktarır, yüzü kilitlemez"
    ),
    # flux-dev/schnell img2img: `image` + `prompt_strength`. Kimlik korumaz.
    "black-forest-labs/flux-dev": ModelCaps("image", False, False, "img2img"),
    "black-forest-labs/flux-schnell": ModelCaps(None, False, False, "referans almaz"),
    "openai/gpt-image-1": ModelCaps(None, False, False, "images/generations"),
}

#: Tanınmayan model için varsayılan: referans göndermeyi denemeyiz.
#: Sessizce yanlış alan adı göndermektense referansı reddetmek yeğdir.
UNKNOWN_CAPS = ModelCaps(None, False, False, "bilinmeyen model")


def caps_for(model: str) -> ModelCaps:
    return MODEL_CAPS.get(model, UNKNOWN_CAPS)


# --- İngilizce prompt parçaları ----------------------------------------------


def _lead(ch: Character) -> str:
    """Promptun ilk cümlesi: kim, kaç yaşında, hangi cinsiyet, kaç kişi.

    Bilerek olumlu ve tekrarlı. "Do not generate a male person" gibi bir
    olumsuzlama yazmıyoruz: negatif desteği olmayan bir modelde bu cümle
    "male person" tokenlarını pozitif koşullamaya sokar ve tam istemediğimiz
    şeyi üretir.
    """
    return (
        f"ONE SINGLE ADULT WOMAN, {ch.display_name.upper()}. "
        f"This is a fictional {ch.age}-year-old woman. "
        f"The subject is FEMALE, a young adult woman in her twenties. "
        f"Exactly one person in the entire frame, completely alone."
    )


def _identity_lines(ch: Character) -> list[str]:
    v = ch.visual
    return [
        f"FACE (identical in every photograph): {v.anchor_en}",
        f"HAIR: {v.hair_en}",
        f"BODY: {v.body_en}",
    ]


#: Her prompta giren gerçekçilik cümlesi — hepsi olumlu ifade.
REALISM_EN = (
    "Photorealistic photograph of a real human being. Real skin texture with "
    "visible pores and natural minor blemishes, uneven natural skin tone, "
    "individual hair strands, realistic fabric texture and creases, realistic "
    "shadows and physically accurate light, natural muted colours, realistic "
    "lens depth of field, subtle natural sensor grain. Shot on a real camera."
)

#: İçerik kareleri için ek his: hazırlıksız günlük fotoğraf.
CANDID_EN = (
    "Candid everyday snapshot, the kind of photo a real person takes on their "
    "own phone or DSLR. Relaxed natural pose, unposed, imperfect framing."
)


def identity_render_prompts(ch: Character) -> list[str]:
    """Dört kimlik karesinin İngilizce promptu.

    `visual.identity_reference_prompts` ile aynı pozları kullanır ama metni
    modelin anladığı dilde ve negatif enjeksiyonu olmadan kurar.
    """
    ir = ch.visual.identity_reference
    out: list[str] = []
    for pose in ir.poses_en:
        parts = [
            _lead(ch),
            f"IDENTITY REFERENCE PHOTOGRAPH — {pose}",
            *_identity_lines(ch),
            f"WEARING: {ir.wardrobe_en}",
            f"BACKGROUND: {ir.location_en} The background is completely empty.",
            f"CAMERA AND LIGHT: {ir.camera_en}",
            "Purpose of this photograph: to lock her face, hair and body "
            "identity for later photographs. Bare untouched skin, "
            "straight out of camera.",
            REALISM_EN,
            f"Aspect ratio {ir.aspect}.",
        ]
        out.append("\n\n".join(parts))
    return out


def content_render_prompt(
    ch: Character,
    scene_en: str,
    *,
    kind: str = "post",
    wardrobe_en: str,
    location_en: str,
    camera_en: str,
) -> str:
    """Tek bir içerik karesinin İngilizce promptu."""
    parts = [
        _lead(ch),
        f"SCENE: {scene_en}",
        *_identity_lines(ch),
        f"WEARING: {wardrobe_en}",
        # Olumlu kuruluş: "başka kimse yok" demek yerine "tek kişi o" ve
        # "geri kalanı sadece mekân". Negatif desteği olmayan bir modelde
        # olumsuz cümle, olumsuzladığı şeyi üretmeye yarıyor.
        f"PLACE: {location_en} She is the only person there, "
        "and the rest of the frame is just the room itself.",
        f"CAMERA AND LIGHT: {camera_en}",
        CANDID_EN,
        REALISM_EN,
        f"Aspect ratio {ASPECT.get(kind, '4:5')}.",
    ]
    return "\n\n".join(parts)


def profile_render_prompt(ch: Character) -> str:
    """Profil fotoğrafı: omuz üstü, sıcak, tanınabilir tek kare."""
    v = ch.visual
    return content_render_prompt(
        ch,
        "relaxed head and shoulders portrait, turned slightly away from the "
        "camera, soft natural smile, looking just past the lens",
        kind="profile",
        wardrobe_en=v.wardrobe_en[0] if v.wardrobe_en else "a plain t-shirt",
        location_en="indoors next to a bright window, plain soft background.",
        camera_en="50mm lens, shallow depth of field, soft daylight from the window",
    )
