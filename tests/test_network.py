"""Hesap ağının tutarlılığını doğrular.

En kritik garanti: aynı kişi üç dosyada da birebir aynı tarif ediliyor.
Beyza kendi dosyasında `visual.anchor`, Elif'in ve Sinan'ın dosyasında
`companions["Beyza"]`. Bu üçü birbirinden ayrışırsa aynı karakter
hesaplar arasında farklı bir yüze dönüşür ve bu sessizce olur.
"""

from __future__ import annotations

import unittest
from pathlib import Path

from persona import network
from persona.models import Character

CHARDIR = Path(__file__).resolve().parents[1] / "persona" / "characters"
PATHS = sorted(CHARDIR.glob("*.json"))


class NetworkTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.chars = [Character.load(p) for p in PATHS]
        cls.by_name = {c.display_name: c for c in cls.chars}

    def test_uc_karakter_var(self) -> None:
        self.assertEqual(
            sorted(self.by_name), ["Beyza", "Elif", "Sinan"]
        )

    def test_kullanici_adlari_benzersiz(self) -> None:
        handles = [c.handle for c in self.chars]
        self.assertEqual(len(handles), len(set(handles)))

    def test_seedler_benzersiz(self) -> None:
        """Aynı seed farklı karakterlerde aynı yüzü zorlayabilir."""
        seeds = [c.visual.seed for c in self.chars]
        self.assertEqual(len(seeds), len(set(seeds)))

    def test_ayni_kisi_her_dosyada_ayni_tarif(self) -> None:
        sorunlar = network.anchor_conflicts(self.chars)
        self.assertEqual(sorunlar, [], "\n".join(sorunlar))

    def test_companion_tarifinde_kiyafet_yok(self) -> None:
        """Kıyafet anchor'da olursa promptun 'Kıyafet:' satırıyla çakışır."""
        for ch in self.chars:
            for name, anchor in ch.companions.items():
                for kelime in ["gömlek giyer", "genelde neopren", "tulum giyer"]:
                    self.assertNotIn(kelime, anchor, f"{ch.display_name}/{name}")

    def test_karsilikli_taniyorlar(self) -> None:
        """Beyza'nın karesinde Elif varsa, Elif'in dosyasında da Beyza olmalı."""
        for ch in self.chars:
            for name in ch.companions:
                other = self.by_name.get(name)
                if other is not None:
                    self.assertIn(
                        ch.display_name,
                        other.companions,
                        f"{name}, {ch.display_name}'i tanımıyor",
                    )

    def test_ortak_hikaye_yayi_var(self) -> None:
        arcs = network.shared_arcs(self.chars)
        self.assertIn("Kış saha kampanyası", arcs)
        self.assertIn("Elif'in ilk sergisi", arcs)

    def test_her_karakterin_kimlik_modu_calisiyor(self) -> None:
        from persona import visual

        for ch in self.chars:
            prompts = visual.identity_reference_prompts(ch)
            self.assertEqual(len(prompts), 4)
            for prompt in prompts:
                self.assertIn(ch.visual.anchor, prompt)
                for name in ch.companions:
                    self.assertNotIn(name, prompt)

    def test_ag_dokumani_uretilebiliyor(self) -> None:
        doc = network.build_network_doc(self.chars)
        for ch in self.chars:
            self.assertIn(ch.handle, doc)
        self.assertIn("Ortak hikâye yayları", doc)


if __name__ == "__main__":
    unittest.main()
