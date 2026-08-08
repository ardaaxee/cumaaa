"""Modele *gerçekten gönderilen* isteğin doğruluğunu doğrular.

Bu dosya bir hata sınıfına karşı yazıldı: promptlar Türkçeydi ve negatif
liste pozitif prompta yapıştırılıyordu. FLUX'ta `negative_prompt` girdisi
olmadığı için "male, man, child" ifadeleri modele *üretilecek şey* olarak
gidiyor ve çıktı yaşlı bir erkek oluyordu.

Buradaki testler dört şeyi garanti altına alıyor:

1. Render promptu İngilizce ve kadın kimliğiyle başlıyor.
2. Prompt gövdesinde erkek/sakal/bıyık gibi yanlış kimlik sözcüğü yok.
3. Referans görsel gerçekten istek gövdesine giriyor — ve modelin
   şemasındaki doğru alan adıyla.
4. Kimlik dosyaları doğru klasöre yazılıyor, var olanlar yeniden
   üretilmiyor.

Çalıştır:  python3 -m unittest discover -s tests -v
"""

from __future__ import annotations

import io
import json
import re
import unittest
from pathlib import Path
from unittest import mock

from persona import images, render
from persona.models import Character

CHARACTER = Path(__file__).resolve().parents[1] / "persona" / "characters" / "beyza.json"

#: Promptta geçmesi çıktının yanlış karaktere kaymasına yol açan sözcükler.
#: Negatif desteği olmayan bir modelde bunlar pozitif koşullama olur.
#:
#: Kelime sınırıyla aranıyor: "male" ifadesi "female" içinde geçtiği için
#: düz alt dizi araması bu listeyi kullanılamaz hale getirirdi.
YANLIS_KIMLIK = [
    "male",
    "man",
    "men",
    "beard",
    "moustache",
    "mustache",
    "boy",
    "child",
    "kid",
    "elderly",
    "aged",
    "wrinkled",
    "grey hair",
    "gray hair",
    "bald",
    "cat",
    "dog",
    "pet",
    "animal",
    "people",
    "crowd",
]

_YANLIS_RE = re.compile(r"\b(" + "|".join(YANLIS_KIMLIK) + r")\b", re.IGNORECASE)


def _yanlis_kimlik_bul(prompt: str) -> list[str]:
    return _YANLIS_RE.findall(prompt)


class KimlikPromptuTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER)
        cls.prompts = render.identity_render_prompts(cls.ch)

    def test_dort_kare(self) -> None:
        self.assertEqual(len(self.prompts), 4)

    def test_kadin_kimligi_ile_basliyor(self) -> None:
        """İlk cümle kim olduğunu söylemeli — modeller başa daha çok uyuyor."""
        for p in self.prompts:
            bas = p.split("\n")[0]
            self.assertIn("ONE SINGLE ADULT WOMAN", bas)
            self.assertIn("BEYZA", bas)

    def test_woman_female_ve_isim_geciyor(self) -> None:
        for p in self.prompts:
            düz = p.lower()
            self.assertIn("woman", düz)
            self.assertIn("female", düz)
            self.assertIn("beyza", düz)

    def test_yas_yaziyor(self) -> None:
        for p in self.prompts:
            self.assertIn(f"{self.ch.age}-year-old", p)

    def test_yanlis_kimlik_sozcugu_yok(self) -> None:
        """En kritik test: erkek/hayvan sözcükleri prompta hiç girmemeli."""
        for i, p in enumerate(self.prompts, 1):
            self.assertEqual(_yanlis_kimlik_bul(p), [], f"IDENTITY-{i}")

    def test_negatif_liste_prompta_yapistirilmamis(self) -> None:
        """`negative_en` prompta girerse pozitif koşullama olur."""
        for p in self.prompts:
            self.assertNotIn(self.ch.visual.negative_en, p)
            self.assertNotIn("İSTENMEYEN", p)
            self.assertNotIn("ONLY ONE PERSON. No animals", p)

    def test_dort_poz_farkli(self) -> None:
        for parca in ["front-facing", "full profile", "three-quarter", "full body"]:
            self.assertTrue(
                any(parca in p for p in self.prompts), f"'{parca}' pozu yok"
            )

    def test_makul_uzunluk(self) -> None:
        """T5 penceresi ~512 token; kaba tahmin kelime x1.35."""
        for p in self.prompts:
            self.assertLess(len(p.split()) * 1.35, 512, "prompt kırpılacak kadar uzun")


class IcerikPromptuTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ch = Character.load(CHARACTER)
        cls.prompts = []
        for p in cls.ch.pillars:
            for scene_en in p.scenes_en:
                cls.prompts.append(
                    render.content_render_prompt(
                        cls.ch,
                        scene_en,
                        kind="post",
                        wardrobe_en=p.wardrobe_en[0],
                        location_en=p.locations_en[0],
                        camera_en=p.camera_en[0],
                    )
                )

    def test_prompt_uretildi(self) -> None:
        self.assertGreater(len(self.prompts), 40)

    def test_hepsi_kadin_kimligi_ile_basliyor(self) -> None:
        for p in self.prompts:
            self.assertTrue(p.startswith("ONE SINGLE ADULT WOMAN, BEYZA."))

    def test_yanlis_kimlik_sozcugu_yok(self) -> None:
        for i, p in enumerate(self.prompts):
            self.assertEqual(_yanlis_kimlik_bul(p), [], f"içerik {i}")

    def test_tek_kisi_olumlu_ifade_ile(self) -> None:
        for p in self.prompts:
            self.assertIn("Exactly one person in the entire frame", p)
            self.assertIn("only person there", p)

    def test_ayni_yuz_tarifi_her_karede(self) -> None:
        for p in self.prompts:
            self.assertIn(self.ch.visual.anchor_en, p)

    def test_kimlik_koruma_talimati_her_karede(self) -> None:
        """Kontext'te yüzü referanstan taşıyan asıl cümle bu."""
        for p in self.prompts:
            self.assertIn("KEEP THE EXACT SAME WOMAN AS IN THE REFERENCE IMAGE", p)
            self.assertIn("Only the clothing, the location, the lighting", p)

    def test_makul_uzunluk(self) -> None:
        """T5 penceresi ~512 token; aşarsa promptun sonu kırpılır.

        Kimlik tarifi promptun ortasında olduğu için kırpılma önce
        gerçekçilik notlarını, sonra kimliği yer.
        """
        for i, p in enumerate(self.prompts):
            self.assertLess(len(p.split()) * 1.35, 512, f"içerik {i} çok uzun")

    def test_kimlik_koruma_kimlik_karelerinde_yok(self) -> None:
        """Kimlik kareleri referansı *üretiyor*; onlara referans talimatı gitmez."""
        for p in render.identity_render_prompts(self.ch):
            self.assertNotIn("REFERENCE IMAGE", p)


class ModelSemasiTest(unittest.TestCase):
    """Referans alan adı modelin gerçek şemasından gelmeli."""

    def test_kontext_input_image_kullaniyor(self) -> None:
        caps = render.caps_for("black-forest-labs/flux-kontext-pro")
        self.assertEqual(caps.reference_param, "input_image")
        self.assertTrue(caps.identity_locking)

    def test_11_pro_image_prompt_kullaniyor(self) -> None:
        caps = render.caps_for("black-forest-labs/flux-1.1-pro")
        self.assertEqual(caps.reference_param, "image_prompt")
        # Redux kimliği kilitlemiyor; varsayılan içerik modeli o değil.
        self.assertFalse(caps.identity_locking)

    def test_hicbir_flux_negatif_prompt_almiyor(self) -> None:
        for model, caps in render.MODEL_CAPS.items():
            if "flux" in model:
                self.assertFalse(caps.supports_negative, model)

    def test_bilinmeyen_model_referans_gondermez(self) -> None:
        self.assertIsNone(render.caps_for("bir/model").reference_param)

    def test_varsayilan_icerik_modeli_kimlik_kilitliyor(self) -> None:
        caps = render.caps_for(images.PROVIDERS["replicate"])
        self.assertTrue(
            caps.identity_locking,
            "varsayılan içerik modeli yüzü koruyan bir model olmalı",
        )


class IstekGovdesiTest(unittest.TestCase):
    """Referans görsel gerçekten payload'a giriyor mu?

    Sadece prompta 'aynı kişi' yazmak yetmiyor — istek gövdesinde
    referansın bulunduğunu doğrudan doğruluyoruz.
    """

    def setUp(self) -> None:
        self.gonderilen: list[dict] = []

    def _sahte_post(self, url, payload, headers, *, label="Replicate"):
        self.gonderilen.append(payload)
        return {"status": "succeeded", "output": "https://example.invalid/x.jpg"}

    def _uret(self, tmp: Path, **kw):
        ref = tmp / "BEYZA-IDENTITY-01.jpg"
        ref.write_bytes(b"\xff\xd8\xff\xe0sahte-jpeg")
        with mock.patch.object(images, "_post", self._sahte_post), mock.patch.object(
            images, "_download", lambda url, dest: dest.write_bytes(b"x")
        ), mock.patch.dict("os.environ", {"REPLICATE_API_TOKEN": "test"}):
            images.generate(
                "a prompt",
                tmp / "cikti.jpg",
                provider="replicate",
                aspect="4:5",
                seed=1,
                reference=ref,
                **kw,
            )
        return self.gonderilen[0]["input"]

    def test_referans_govdeye_giriyor(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as t:
            girdi = self._uret(Path(t), model="black-forest-labs/flux-kontext-pro")
        self.assertIn("input_image", girdi)
        self.assertTrue(girdi["input_image"].startswith("data:image/jpeg;base64,"))

    def test_alan_adi_modele_gore_degisiyor(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as t:
            girdi = self._uret(Path(t), model="black-forest-labs/flux-1.1-pro")
        self.assertIn("image_prompt", girdi)
        self.assertNotIn("input_image", girdi)

    def test_negatif_flux_govdesine_girmiyor(self) -> None:
        """FLUX'ta `negative_prompt` alanı yok; göndermeye çalışmıyoruz."""
        import tempfile

        with tempfile.TemporaryDirectory() as t:
            girdi = self._uret(
                Path(t),
                model="black-forest-labs/flux-kontext-pro",
                negative="male, man, child",
            )
        self.assertNotIn("negative_prompt", girdi)
        self.assertNotIn("male", json.dumps(girdi["prompt"]))

    def test_referans_almayan_model_sessizce_gecmiyor(self) -> None:
        """Yanlış alan adıyla göndermektense açıkça hata vermeli."""
        import tempfile

        with tempfile.TemporaryDirectory() as t:
            with self.assertRaises(SystemExit) as ctx:
                self._uret(Path(t), model="black-forest-labs/flux-schnell")
        self.assertIn("referans", str(ctx.exception))


class KimlikAkisiTest(unittest.TestCase):
    """Kimlik kareleri önce, doğru klasöre, tekrar üretmeden."""

    def _paket(self, kok: Path) -> None:
        kok.mkdir(parents=True, exist_ok=True)
        (kok / "render-promptlari-en.txt").write_text(
            "### BEYZA-POST-001 (masa)\na prompt\n", encoding="utf-8"
        )

    def _calistir(self, kok: Path, *ek: str) -> str:
        from persona import cli

        out = io.StringIO()
        with mock.patch("sys.stdout", new=out):
            kod = cli.main(
                ["images", "--out", str(kok), "--character", str(CHARACTER),
                 "--dry-run", *ek]
            )
        self.assertEqual(kod, 0)
        return out.getvalue()

    def test_kimlik_kareleri_once_listeleniyor(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as t:
            kok = Path(t) / "cikti"
            self._paket(kok)
            cikti = self._calistir(kok, "--identity-only")
        satirlar = [s.strip() for s in cikti.splitlines() if s.strip().startswith("BEYZA-")]
        self.assertEqual(
            satirlar,
            [f"BEYZA-IDENTITY-0{i}" for i in range(1, 5)],
        )

    def test_kimlik_yoksa_icerik_uretilmiyor(self) -> None:
        """Kimlik kapısı: referanssız 130 kare = 130 farklı yüz."""
        import tempfile

        from persona import cli

        with tempfile.TemporaryDirectory() as t:
            kok = Path(t) / "cikti"
            self._paket(kok)
            with self.assertRaises(SystemExit) as ctx:
                cli.main(["images", "--out", str(kok), "--character", str(CHARACTER)])
        self.assertIn("Kimlik kareleri eksik", str(ctx.exception))

    def test_var_olan_kimlik_karesi_yeniden_uretilmiyor(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as t:
            kok = Path(t) / "cikti"
            self._paket(kok)
            ident = kok / "gorseller" / "identity"
            ident.mkdir(parents=True)
            (ident / "BEYZA-IDENTITY-01.jpg").write_bytes(b"x")
            (ident / "BEYZA-IDENTITY-02.jpg").write_bytes(b"x")

            cikti = self._calistir(kok, "--identity-only")
        self.assertIn("2 zaten var", cikti)
        self.assertNotIn("BEYZA-IDENTITY-01", cikti)
        self.assertIn("BEYZA-IDENTITY-03", cikti)

    def test_kimlik_klasoru_dogru(self) -> None:
        from persona import export

        self.assertEqual(export.IMAGE_DIRS["IDENTITY"], "identity")


if __name__ == "__main__":
    unittest.main()
