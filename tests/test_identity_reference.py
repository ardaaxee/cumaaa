"""identity_reference modunun garantilerini doğrular.

Bu moddaki kurallar tercih değil garanti olduğu için testle sabitleniyor:
karede tek kişi, hayvan yok, yan karakter yok, arka plan boş.

Çalıştır:  python3 -m unittest discover -s tests -v
"""

from __future__ import annotations

import random
import unittest
from pathlib import Path

from persona import visual
from persona.models import IDENTITY_NEGATIVE, Character

CHARACTER = Path(__file__).resolve().parents[1] / "persona" / "characters" / "beyza.json"

#: Kimlik karelerinde hiçbir biçimde geçmemesi gereken sözcükler.
FORBIDDEN = ["kedi", "cat ", "poyraz", "hayvan", "evcil"]


def _subject_section(prompt: str) -> str:
    """Promptun özneyi tarif eden bölümünü döndürür.

    Yasak sözcükler yalnızca burada aranmalı: KARE KURALI satırı ve negatif
    bloklar zaten 'hayvan yok', 'no cat' gibi ifadeler içerir — orada
    geçmeleri istenen davranış, hata değil. Bir kedinin sızabileceği yer
    öznenin, kıyafetin, mekânın tarif edildiği kısımdır.
    """
    body = prompt.split("İSTENMEYEN:")[0]
    _, _, subject = body.partition("KİŞİ")
    return subject.lower()


class IdentityReferenceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER)
        cls.prompts = visual.identity_reference_prompts(cls.ch)

    def test_dort_poz_uretilir(self) -> None:
        self.assertEqual(len(self.prompts), 4)

    def test_pozlar_onden_profil_uc_ceyrek_tam_boy(self) -> None:
        beklenen = ["önden portre", "profil portre", "3/4 açı", "tam boy"]
        for prompt, parca in zip(self.prompts, beklenen):
            self.assertIn(parca, prompt)

    def test_negatif_kural_birebir_eklenir(self) -> None:
        """Karakterin kendi negatif kuralı promptun sonunda birebir durmalı."""
        kural = self.ch.visual.identity_reference.negative_en
        self.assertIn("ONLY ONE PERSON", kural)
        for prompt in self.prompts:
            self.assertIn(kural, prompt)

    def test_negatif_kural_metni_istenen_metin(self) -> None:
        self.assertEqual(
            IDENTITY_NEGATIVE,
            "ONLY ONE PERSON. No animals, no cat, no Poyraz, no other people, "
            "no secondary characters, no background people, no background animals.",
        )

    def test_yan_karakter_adi_gecmez(self) -> None:
        for prompt in self.prompts:
            for name in self.ch.companions:
                self.assertNotIn(name, prompt, f"{name} kimlik karesine sızdı")

    def test_ikinci_kisi_satiri_yok(self) -> None:
        for prompt in self.prompts:
            self.assertNotIn("İKİNCİ KİŞİ", prompt)

    def test_ozne_tarifinde_hayvan_ve_kedi_gecmez(self) -> None:
        for prompt in self.prompts:
            govde = _subject_section(prompt)
            self.assertTrue(govde, "özne bölümü bulunamadı")
            for kelime in FORBIDDEN:
                self.assertNotIn(kelime, govde, f"'{kelime}' özne tarifine sızdı")

    def test_tek_kisi_kurali_yazili(self) -> None:
        for prompt in self.prompts:
            self.assertIn("tam olarak 1 (bir) kişi", prompt)

    def test_kare_kurali_hayvan_ve_yan_karakteri_yasaklar(self) -> None:
        """Kural metninde bu yasakların açıkça yazılı olması gerekiyor."""
        for prompt in self.prompts:
            kural = prompt.split("KİŞİ")[0]
            for parca in ["Başka insan yok", "yan karakter yok", "hayvan"]:
                self.assertIn(parca, kural)

    def test_ana_karakterin_anchor_i_korunur(self) -> None:
        for prompt in self.prompts:
            self.assertIn(self.ch.visual.anchor, prompt)
            self.assertIn(self.ch.visual.hair, prompt)

    def test_deterministik(self) -> None:
        a = visual.identity_reference_prompts(self.ch)
        b = visual.identity_reference_prompts(self.ch, random.Random(999))
        self.assertEqual(a, b)

    def test_reference_sheet_prompts_ayni_ciktiyi_verir(self) -> None:
        """Geriye dönük uyumluluk: profil.md bu isim üzerinden üretiyor."""
        self.assertEqual(
            visual.reference_sheet_prompts(self.ch, random.Random(1)), self.prompts
        )


class CompanionReferenceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER)

    def test_her_companion_icin_dort_tek_kisilik_kare(self) -> None:
        for name in self.ch.companions:
            prompts = visual.companion_reference_prompts(self.ch, name)
            self.assertEqual(len(prompts), 4)
            for prompt in prompts:
                self.assertIn(IDENTITY_NEGATIVE, prompt)
                self.assertIn("tam olarak 1 (bir) kişi", prompt)
                # Ana karakterin anchor'ı companion karesine karışmamalı.
                self.assertNotIn(self.ch.visual.anchor, prompt)


class CokKisiliKarakterTest(unittest.TestCase):
    """Solo olmayan karakterlerde companion mekanizması hâlâ çalışmalı.

    Beyza artık solo; bu davranış arşivdeki çok kişili karakterle test
    ediliyor, yoksa özellik test kapsamı dışında kalırdı.
    """

    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER.parent / "arsiv" / "elif.json")

    def test_solo_degil(self) -> None:
        self.assertFalse(self.ch.solo)

    def test_companion_lu_sutun_ikinci_kisi_ekliyor(self) -> None:
        pillar = self.ch.pillar("ev")
        self.assertEqual(pillar.companion, "Beyza")
        prompt = visual.build_prompt(
            self.ch, pillar.scenes[0], rng=random.Random(1), pillar=pillar
        )
        self.assertIn("İKİNCİ KİŞİ — Beyza", prompt)

    def test_solo_kurali_eklenmiyor(self) -> None:
        """Tek-kişi kuralı yalnızca solo karakterlerde ve kimlik karelerinde."""
        pillar = self.ch.pillar("maket")
        prompt = visual.build_prompt(
            self.ch, pillar.scenes[0], rng=random.Random(2), pillar=pillar
        )
        self.assertNotIn("KARE KURALI", prompt)
        self.assertNotIn(IDENTITY_NEGATIVE, prompt)


if __name__ == "__main__":
    unittest.main()
