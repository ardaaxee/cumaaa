"""Kurgusal karakter veri modelleri.

Her şey JSON'dan yüklenir; kod tarafında sadece tipli erişim sağlarız.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class VisualIdentity:
    """Tüm görsellerde aynı kişiyi üretmek için kullanılan sabit çapa."""

    anchor: str
    hair: str
    wardrobe: list[str]
    palette: list[str]
    camera: list[str]
    locations: list[str]
    style_notes: list[str] = field(default_factory=list)
    negative: list[str] = field(default_factory=list)
    seed: int = 720113

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> VisualIdentity:
        return cls(**d)


@dataclass
class Voice:
    """Karakterin yazı sesi: hesabı kendisi yönetiyormuş gibi."""

    language: str
    person: str
    tone: list[str]
    quirks: list[str]
    emoji: list[str]
    signoffs: list[str]
    avoid: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> Voice:
        return cls(**d)


@dataclass
class Pillar:
    """İçerik sütunu — hesabın tekrar eden temaları.

    `wardrobe` / `locations` / `camera` boş bırakılırsa karakterin genel
    listeleri kullanılır. Doldurulursa o sütuna özel olur — laboratuvar
    gönderisine can yeleği giydirmemek için.
    """

    key: str
    name: str
    weight: int
    scenes: list[str]
    hooks: list[str]
    details: list[str]
    ctas: list[str]
    hashtags: list[str]
    wardrobe: list[str] = field(default_factory=list)
    locations: list[str] = field(default_factory=list)
    camera: list[str] = field(default_factory=list)
    #: Karede ikinci bir kişi varsa `Character.companions` içindeki adı.
    companion: str = ""

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> Pillar:
        return cls(**d)


@dataclass
class Character:
    handle: str
    display_name: str
    tagline: str
    age: int
    pronouns: str
    city: str
    occupation: str
    disclosure: str
    bio_lines: list[str]
    backstory: list[str]
    side_characters: list[dict[str, str]]
    routines: list[str]
    highlights: list[str]
    visual: VisualIdentity
    voice: Voice
    pillars: list[Pillar]
    #: Karede birlikte görünen kişilerin sabit görünüm tarifi (ad → anchor).
    #: Ana karakterin anchor'ı gibi, bu metin de her promptta aynen tekrarlanır.
    companions: dict[str, str] = field(default_factory=dict)
    #: Aylara yayılan hikâye yayları: {"name": ..., "beats": [...]}.
    #: Hesabın "devam eden hayat" hissini bunlar taşır.
    arcs: list[dict[str, Any]] = field(default_factory=list)

    # ---- yükleme / kaydetme -------------------------------------------------

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> Character:
        d = dict(d)
        d["visual"] = VisualIdentity.from_dict(d["visual"])
        d["voice"] = Voice.from_dict(d["voice"])
        d["pillars"] = [Pillar.from_dict(p) for p in d["pillars"]]
        return cls(**d)

    @classmethod
    def load(cls, path: str | Path) -> Character:
        with open(path, encoding="utf-8") as fh:
            return cls.from_dict(json.load(fh))

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    # ---- yardımcılar --------------------------------------------------------

    def pillar(self, key: str) -> Pillar:
        for p in self.pillars:
            if p.key == key:
                return p
        raise KeyError(f"Bilinmeyen içerik sütunu: {key}")

    def weighted_pillars(self) -> list[Pillar]:
        """Ağırlıklarına göre çoğaltılmış sütun listesi (rastgele seçim için)."""
        out: list[Pillar] = []
        for p in self.pillars:
            out.extend([p] * max(1, p.weight))
        return out


@dataclass
class Post:
    index: int
    date: str
    pillar: str
    slug: str
    scene: str
    image_prompts: list[str]
    caption: str
    hashtags: list[str]
    alt_text: str
    location: str
    first_comment: str


@dataclass
class Reel:
    index: int
    date: str
    pillar: str
    slug: str
    concept: str
    hook: str
    shots: list[dict[str, str]]
    voiceover: list[str]
    on_screen_text: list[str]
    audio_note: str
    caption: str
    hashtags: list[str]


@dataclass
class StoryFrame:
    kind: str
    visual: str
    text: str
    sticker: str


@dataclass
class StoryDay:
    day: int
    date: str
    theme: str
    frames: list[StoryFrame]
