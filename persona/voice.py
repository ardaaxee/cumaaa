"""Karakterin sesiyle metin üretimi (LLM'siz, deterministik).

Amaç "iyi copywriting" değil; hesabı gerçekten o kişi yönetiyormuş gibi
duran, tekrar etmeyen, somut detay içeren metinler. `persona.llm` modülü
istenirse bu metinleri Claude ile yeniden yazar.
"""

from __future__ import annotations

import random

from .models import Character, Pillar

#: Cümle sonuna parantez içinde düşen kendine laf sokmalar.
ASIDES = [
    "bunu kimseye söylemedim",
    "not aldım",
    "düzelteceğim",
    "sayı doğru",
    "kontrol ettim, iki kere",
    "itiraf sayılır",
    "kimse sormadı ama",
    "bu kaçıncı",
]


class Deck:
    """Tükenene kadar tekrar etmeyen seçici."""

    def __init__(self, items: list[str], rng: random.Random) -> None:
        self._items = list(items)
        self._rng = rng
        self._pool: list[str] = []

    def draw(self) -> str:
        if not self._pool:
            self._pool = list(self._items)
            self._rng.shuffle(self._pool)
        return self._pool.pop()


class VoiceEngine:
    def __init__(self, ch: Character, rng: random.Random) -> None:
        self.ch = ch
        self.rng = rng
        self._decks: dict[str, Deck] = {}

    def _deck(self, key: str, items: list[str]) -> Deck:
        if key not in self._decks:
            self._decks[key] = Deck(items, self.rng)
        return self._decks[key]

    # ---- parçalar -----------------------------------------------------------

    def hook(self, p: Pillar) -> str:
        return self._deck(f"hook:{p.key}", p.hooks).draw()

    def detail(self, p: Pillar) -> str:
        return self._deck(f"detail:{p.key}", p.details).draw()

    def cta(self, p: Pillar) -> str:
        return self._deck(f"cta:{p.key}", p.ctas).draw()

    def signoff(self) -> str:
        return self._deck("signoff", self.ch.voice.signoffs).draw()

    def emoji(self) -> str:
        return self._deck("emoji", self.ch.voice.emoji).draw()

    def side_character_line(self) -> str:
        """Yan karakteri olmayan (solo) karakterlerde boş döner."""
        if not self.ch.side_characters:
            return ""
        sc = self.rng.choice(self.ch.side_characters)
        templates = [
            f"{sc['name']} bugün de kendi işini yaptı.",
            f"{sc['name']} olmasa bu iş bitmezdi (bunu ona söylemeyin).",
            f"{sc['name']}'a sordum, cevap vermedi.",
            f"fotoğraf {sc['name']}'dan.",
        ]
        return self.rng.choice(templates)

    # ---- tam metinler -------------------------------------------------------

    def caption(self, p: Pillar, *, with_cta: bool = True) -> str:
        lines = [self.hook(p)]

        body = self.detail(p)
        if self.rng.random() < 0.5:
            body += f" ({self._deck('aside', ASIDES).draw()})"
        lines.append(body)

        if self.ch.side_characters and self.rng.random() < 0.35:
            lines.append(self.side_character_line())

        if with_cta and self.rng.random() < 0.65:
            lines.append(self.cta(p))
        else:
            lines.append(self.signoff())

        text = "\n\n".join(lines)
        if self.rng.random() < 0.7:
            text += f" {self.emoji()}"
        return text

    def hashtags(self, p: Pillar, k: int = 6) -> list[str]:
        base = list(p.hashtags)
        extra = ["#kurgusalkarakter", "#aigenerated", "#yapayzeka"]
        self.rng.shuffle(base)
        return base[: max(0, k - len(extra))] + extra

    def alt_text(self, scene: str) -> str:
        return f"Görsel açıklaması: {scene}. Yapay zekâ ile üretilmiş kurgusal fotoğraf."

    def first_comment(self, p: Pillar) -> str:
        """Hashtag'leri açıklamadan ayırıp ilk yoruma koymak daha temiz durur."""
        return " ".join(self.hashtags(p, k=8))

    def bio(self) -> str:
        return "\n".join(self.ch.bio_lines)
