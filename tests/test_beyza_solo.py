"""Beyza'nın solo garantilerini doğrular.

En kritik kural: her karede tek bir yetişkin kadın. Erkek karakter, ikinci
kişi, hayvan ya da arka planda yüz olmayacak. Bu bir tercih değil garanti
olduğu için promptların *tamamı* taranıyor — kimlik kareleri, gönderiler,
reels planları ve hikâye kareleri dahil.

Çalıştır:  python3 -m unittest discover -s tests -v
"""

from __future__ import annotations

import random
import re
import unittest
from datetime import date
from pathlib import Path

from persona import content, visual
from persona.models import Character

CHARACTER = Path(__file__).resolve().parents[1] / "persona" / "characters" / "beyza.json"

#: Promptun olumlu (üretilecek içeriği tarif eden) kısmında bulunmaması
#: gereken sözcükler. Negatif blok ayrı taranıyor.
YASAK = [
    "erkek",
    "adam",
    "kedi",
    "köpek",
    "hayvan",
    "çocuk",
    "ikinci kişi",
    "iki kişi",
    "üç kişi",
    "grup",
    "kalabalık",
    "arkadaş",
]


def _olumlu_kisim(prompt: str) -> str:
    """Promptun üretilecek içeriği tarif eden kısmını döndürür.

    İki bölge atılıyor: KARE KURALI cümlesi ve İSTENMEYEN sonrası. İkisi de
    zaten "hayvan yok", "başka insan yok" gibi yasaklar içeriyor — orada
    geçmeleri istenen davranış. Yasak sözcük taraması sahne tarifinde ve
    kişi/kıyafet/mekân bölümünde anlamlı.
    """
    govde = prompt.split("İSTENMEYEN:")[0]
    once, kural, sonra = govde.partition("KARE KURALI")
    if not kural:
        return govde.lower()
    _, _, kisi = sonra.partition("KİŞİ")
    return (once + " " + kisi).lower()


class KarakterTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER)

    def test_yukleniyor(self) -> None:
        self.assertEqual(self.ch.display_name, "Beyza")
        self.assertEqual(self.ch.age, 20)

    def test_solo_isaretli(self) -> None:
        self.assertTrue(self.ch.solo)

    def test_yan_karakteri_yok(self) -> None:
        self.assertEqual(self.ch.companions, {})
        self.assertEqual(self.ch.side_characters, [])

    def test_hicbir_sutunda_companion_yok(self) -> None:
        for p in self.ch.pillars:
            self.assertEqual(p.companion, "", f"{p.key} sütununda companion var")

    def test_dosya_on_eki(self) -> None:
        self.assertEqual(self.ch.file_prefix, "BEYZA")

    def test_istenen_negatif_kural_tanimli(self) -> None:
        n = self.ch.visual.negative_en
        for parca in ["multiple people", "male, man, child", "plastic skin", "CGI"]:
            self.assertIn(parca, n)

    def test_kimlik_negatifi_erkegi_de_disliyor(self) -> None:
        n = self.ch.visual.identity_reference.negative_en
        self.assertIn("ONLY ONE PERSON", n)
        self.assertIn("no male", n)

    def test_dogal_gorunum_tarifi(self) -> None:
        """Güzel ama filtresiz: gerçek cilt dokusu tarifi kaybolmasın."""
        a = self.ch.visual.anchor.lower()
        for parca in ["gözenek", "doğal", "makyaj", "cilt dokusu"]:
            self.assertIn(parca, a, f"anchor'da '{parca}' yok")

    def test_gercekcilik_notlari_var(self) -> None:
        self.assertTrue(self.ch.visual.realism)


class PromptTest(unittest.TestCase):
    """Üretilen tüm promptlar taranıyor."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER)
        rng = random.Random(11)
        start = date(2026, 9, 1)
        cls.posts = content.build_posts(cls.ch, 30, start, rng)
        cls.reels = content.build_reels(cls.ch, 20, start, rng)
        cls.stories = content.build_stories(cls.ch, 30, start, rng)

        cls.prompts: list[tuple[str, str]] = []
        for i, p in enumerate(visual.identity_reference_prompts(cls.ch), 1):
            cls.prompts.append((f"IDENTITY-{i}", p))
        cls.prompts.append(("PROFILE", visual.profile_picture_prompt(cls.ch, rng)))
        for post in cls.posts:
            for j, p in enumerate(post.image_prompts, 1):
                cls.prompts.append((f"POST-{post.index}-{j}", p))
        for reel in cls.reels:
            for s in reel.shots:
                cls.prompts.append((f"REEL-{reel.index}-{s['no']}", s["prompt"]))
        for day in cls.stories:
            for k, f in enumerate(day.frames, 1):
                cls.prompts.append((f"STORY-{day.day}-{k}", f.visual))

    def test_prompt_uretildi(self) -> None:
        self.assertGreater(len(self.prompts), 200)

    def test_her_promptta_tek_kisi_kurali(self) -> None:
        for ad, prompt in self.prompts:
            self.assertIn("tam olarak 1 (bir)", prompt, ad)

    def test_her_promptta_beyza_anchor_i(self) -> None:
        for ad, prompt in self.prompts:
            self.assertIn(self.ch.visual.anchor, prompt, ad)

    def test_hicbir_promptta_ikinci_kisi_yok(self) -> None:
        for ad, prompt in self.prompts:
            self.assertNotIn("İKİNCİ KİŞİ", prompt, ad)

    def test_olumlu_kisimda_yasak_sozcuk_yok(self) -> None:
        for ad, prompt in self.prompts:
            govde = _olumlu_kisim(prompt)
            for kelime in YASAK:
                self.assertNotIn(kelime, govde, f"{ad}: '{kelime}'")

    def test_arsivlenen_karakterlerin_adi_gecmiyor(self) -> None:
        """Elif/Sinan artık Beyza'nın evreninde değil."""
        for ad, prompt in self.prompts:
            for isim in ["Elif", "Sinan", "Poyraz", "Hayri", "Nermin"]:
                self.assertNotIn(isim, prompt, f"{ad}: {isim}")

    def test_her_promptta_istenen_negatif(self) -> None:
        for ad, prompt in self.prompts:
            self.assertIn(self.ch.visual.negative_en, prompt, ad)

    def test_her_promptta_tek_kisi_negatifi(self) -> None:
        for ad, prompt in self.prompts:
            self.assertIn("ONLY ONE PERSON", prompt, ad)

    def test_seed_her_promptta(self) -> None:
        for ad, prompt in self.prompts:
            self.assertIn(f"Seed: {self.ch.visual.seed}", prompt, ad)


class DosyaAdiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER)

    def test_ad_bicimi(self) -> None:
        from persona import export

        self.assertEqual(export.image_name(self.ch, "IDENTITY", 1), "BEYZA-IDENTITY-01")
        self.assertEqual(export.image_name(self.ch, "POST", 1), "BEYZA-POST-001")
        self.assertEqual(export.image_name(self.ch, "REEL", 12), "BEYZA-REEL-012")
        self.assertEqual(export.image_name(self.ch, "STORY", 130), "BEYZA-STORY-130")

    def test_paket_adlari_benzersiz(self) -> None:
        import tempfile

        from persona import export

        rng = random.Random(11)
        start = date(2026, 9, 1)
        posts = content.build_posts(self.ch, 30, start, rng)
        reels = content.build_reels(self.ch, 20, start, rng)
        stories = content.build_stories(self.ch, 30, start, rng)

        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            export.export_prompt_bundle(self.ch, posts, reels, stories, out, rng)
            metin = (out / "tum-promptlar.txt").read_text(encoding="utf-8")

        adlar = re.findall(r"^### (\S+)", metin, flags=re.MULTILINE)
        self.assertEqual(len(adlar), len(set(adlar)), "çakışan görsel adı var")
        self.assertTrue(all(a.startswith("BEYZA-") for a in adlar))
        for tur in ("IDENTITY", "PROFILE", "POST", "REEL", "STORY"):
            if tur == "IDENTITY":
                continue  # kimlik kareleri pakete değil, images komutuna ait
            self.assertTrue(
                any(f"-{tur}-" in a for a in adlar), f"{tur} karesi yok"
            )


if __name__ == "__main__":
    unittest.main()
