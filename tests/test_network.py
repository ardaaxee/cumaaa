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
#: Ağ özelliği çok kişili karakterlerle çalışıyor. Varsayılan karakter
#: (Beyza) artık solo olduğu için testler arşivdeki sete bakıyor.
PATHS = sorted((CHARDIR / "arsiv").glob("*.json"))


class NetworkTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.chars = [Character.load(p) for p in PATHS]
        cls.by_name = {c.display_name: c for c in cls.chars}

    def test_arsivdeki_karakterler(self) -> None:
        self.assertEqual(sorted(self.by_name), ["Elif", "Sinan"])

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

    def test_ortak_yay_tespiti_calisiyor(self) -> None:
        """İki karakter aynı yayı taşırsa tespit edilmeli."""
        import copy

        a, b = copy.deepcopy(self.chars[0]), copy.deepcopy(self.chars[1])
        ortak = {"name": "Ortak olay", "beats": ["bir", "iki"]}
        a.arcs.append(ortak)
        b.arcs.append(dict(ortak))

        arcs = network.shared_arcs([a, b])
        self.assertIn("Ortak olay", arcs)
        self.assertEqual(len(arcs["Ortak olay"]), 2)

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
        self.assertIn("Hesaplar", doc)
        self.assertIn("Kim kimin karesinde çıkıyor", doc)


if __name__ == "__main__":
    unittest.main()
