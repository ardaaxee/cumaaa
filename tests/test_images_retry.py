"""429 (hız sınırı) tekrar deneme davranışını doğrular.

Ağa çıkmadan test edilir: `urlopen` ve `time.sleep` yerine sahte nesneler
konur. Böylece testler hem hızlı hem de gerçekten bekleme yapmadan çalışır.

Çalıştır:  python3 -m unittest discover -s tests -v
"""

from __future__ import annotations

import email.message
import email.utils
import io
import json
import tempfile
import unittest
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest import mock

from persona import images

URL = "https://api.replicate.com/v1/models/x/y/predictions"
CHARACTER = Path(__file__).resolve().parents[1] / "persona" / "characters" / "beyza.json"


def _http_error(code: int, *, headers: dict[str, str] | None = None, body: str = "") -> urllib.error.HTTPError:
    hdrs = email.message.Message()
    for k, v in (headers or {}).items():
        hdrs[k] = v
    return urllib.error.HTTPError(URL, code, "hata", hdrs, io.BytesIO(body.encode()))


class _FakeResponse:
    """urlopen'ın döndürdüğü context manager'ın yerine geçer."""

    def __init__(self, payload: dict) -> None:
        self._data = json.dumps(payload).encode()

    def read(self) -> bytes:
        return self._data

    def __enter__(self) -> _FakeResponse:
        return self

    def __exit__(self, *exc: object) -> bool:
        return False


class RetryTest(unittest.TestCase):
    def _run(self, responses: list[object]):
        """responses sırayla döner; HTTPError ise fırlatılır."""
        calls = {"n": 0}

        def fake_urlopen(*args, **kwargs):
            item = responses[calls["n"]]
            calls["n"] += 1
            if isinstance(item, Exception):
                raise item
            return item

        # stderr bastırılıyor: mesaj biçimini ayrı bir test doğruluyor,
        # burada test çıktısını kirletmesin.
        with mock.patch("urllib.request.urlopen", side_effect=fake_urlopen), mock.patch(
            "persona.images.time.sleep"
        ) as sleep, mock.patch("sys.stderr", new_callable=io.StringIO):
            try:
                result = images._post(URL, {"input": {}}, {"Authorization": "x"})
                error = None
            except Exception as exc:  # noqa: BLE001 - testte hatayı da inceliyoruz
                result, error = None, exc
        return result, error, sleep, calls["n"]

    # ---- başarılı tekrar denemeler -----------------------------------------

    def test_429_sonrasi_tekrar_denenir_ve_basarili_olur(self) -> None:
        ok = _FakeResponse({"status": "succeeded"})
        result, error, sleep, n = self._run([_http_error(429, headers={"Retry-After": "3"}), ok])

        self.assertIsNone(error)
        self.assertEqual(result, {"status": "succeeded"})
        self.assertEqual(n, 2, "istek tekrar gönderilmeliydi")
        sleep.assert_called_once_with(3.0)

    def test_retry_after_basligi_okunur(self) -> None:
        ok = _FakeResponse({"ok": True})
        _, _, sleep, _ = self._run([_http_error(429, headers={"Retry-After": "42"}), ok])
        sleep.assert_called_once_with(42.0)

    def test_govdedeki_retry_after_alani_desteklenir(self) -> None:
        ok = _FakeResponse({"ok": True})
        err = _http_error(429, body=json.dumps({"detail": "slow down", "retry_after": 7}))
        _, _, sleep, _ = self._run([err, ok])
        sleep.assert_called_once_with(7.0)

    def test_baslik_govdeye_tercih_edilir(self) -> None:
        ok = _FakeResponse({"ok": True})
        err = _http_error(429, headers={"Retry-After": "2"}, body=json.dumps({"retry_after": 99}))
        _, _, sleep, _ = self._run([err, ok])
        sleep.assert_called_once_with(2.0)

    def test_baslik_ve_govde_yoksa_varsayilan_10_saniye(self) -> None:
        ok = _FakeResponse({"ok": True})
        _, _, sleep, _ = self._run([_http_error(429), ok])
        sleep.assert_called_once_with(10.0)
        self.assertEqual(images.DEFAULT_RETRY_WAIT, 10.0)

    def test_bozuk_govde_varsayilana_duser(self) -> None:
        ok = _FakeResponse({"ok": True})
        _, _, sleep, _ = self._run([_http_error(429, body="<html>bu json değil"), ok])
        sleep.assert_called_once_with(10.0)

    def test_http_tarihli_retry_after(self) -> None:
        ileri = datetime.now(timezone.utc) + timedelta(seconds=30)
        err = _http_error(429, headers={"Retry-After": email.utils.format_datetime(ileri)})
        _, _, sleep, _ = self._run([err, _FakeResponse({"ok": True})])

        sleep.assert_called_once()
        (bekleme,) = sleep.call_args.args
        self.assertGreater(bekleme, 25)
        self.assertLessEqual(bekleme, 31)

    # ---- sınırlar -----------------------------------------------------------

    def test_en_fazla_8_tekrar_sonra_vazgecer(self) -> None:
        hep_429 = [_http_error(429, headers={"Retry-After": "1"}) for _ in range(20)]
        result, error, sleep, n = self._run(hep_429)

        self.assertIsNone(result)
        self.assertIsInstance(error, RuntimeError)
        self.assertEqual(sleep.call_count, images.MAX_RETRIES, "8 kez beklenmeliydi")
        self.assertEqual(n, images.MAX_RETRIES + 1, "ilk deneme + 8 tekrar")
        self.assertEqual(images.MAX_RETRIES, 8)

    def test_vazgecince_anlasilir_hata_verir(self) -> None:
        hep_429 = [_http_error(429, headers={"Retry-After": "1"}, body="limit") for _ in range(20)]
        _, error, _, _ = self._run(hep_429)

        mesaj = str(error)
        self.assertIn("429", mesaj)
        self.assertIn("8", mesaj)
        self.assertIn("hız sınırı", mesaj)

    # ---- 429 dışı davranış değişmedi ---------------------------------------

    def test_500_hatasi_tekrar_denenmez(self) -> None:
        result, error, sleep, n = self._run([_http_error(500, body="sunucu hatası")])

        self.assertIsNone(result)
        self.assertIsInstance(error, RuntimeError)
        self.assertIn("HTTP 500", str(error))
        self.assertIn("sunucu hatası", str(error))
        sleep.assert_not_called()
        self.assertEqual(n, 1, "429 dışı hata tekrar denenmemeli")

    def test_401_hatasi_tekrar_denenmez(self) -> None:
        _, error, sleep, n = self._run([_http_error(401, body="yetkisiz")])
        self.assertIn("HTTP 401", str(error))
        sleep.assert_not_called()
        self.assertEqual(n, 1)

    # ---- kullanıcıya verilen bilgi -----------------------------------------

    def test_stderr_mesaji(self) -> None:
        ok = _FakeResponse({"ok": True})
        responses = [_http_error(429, headers={"Retry-After": "3"}), ok]
        calls = {"n": 0}

        def fake_urlopen(*args, **kwargs):
            item = responses[calls["n"]]
            calls["n"] += 1
            if isinstance(item, Exception):
                raise item
            return item

        with mock.patch("urllib.request.urlopen", side_effect=fake_urlopen), mock.patch(
            "persona.images.time.sleep"
        ), mock.patch("sys.stderr", new_callable=io.StringIO) as err:
            images._post(URL, {"input": {}}, {"Authorization": "x"})

        self.assertIn("Replicate rate limit (429), 3 saniye bekleniyor...", err.getvalue())

    def test_ondalikli_bekleme_okunabilir_yazilir(self) -> None:
        """10.0 -> '10', 2.5 -> '2.5'; mesajda '10.0 saniye' görünmesin."""
        self.assertEqual(images._format_wait(10.0), "10")
        self.assertEqual(images._format_wait(2.5), "2.5")

    def test_openai_yolu_kendi_etiketini_kullanir(self) -> None:
        ok = _FakeResponse({"ok": True})
        responses = [_http_error(429, headers={"Retry-After": "1"}), ok]
        calls = {"n": 0}

        def fake_urlopen(*args, **kwargs):
            item = responses[calls["n"]]
            calls["n"] += 1
            if isinstance(item, Exception):
                raise item
            return item

        with mock.patch("urllib.request.urlopen", side_effect=fake_urlopen), mock.patch(
            "persona.images.time.sleep"
        ), mock.patch("sys.stderr", new_callable=io.StringIO) as err:
            images._post(URL, {}, {}, label="OpenAI")

        self.assertIn("OpenAI rate limit (429)", err.getvalue())


class RetryAfterAyristirmaTest(unittest.TestCase):
    def test_bos_ve_gecersiz_degerler_none_doner(self) -> None:
        for raw in (None, "", "   ", "yakında", "!!"):
            self.assertIsNone(images._parse_retry_after(raw), raw)

    def test_sayisal_deger(self) -> None:
        self.assertEqual(images._parse_retry_after("15"), 15.0)
        self.assertEqual(images._parse_retry_after(" 2.5 "), 2.5)

    def test_gecmis_tarih_negatif_dondurmez(self) -> None:
        geride = datetime.now(timezone.utc) - timedelta(minutes=5)
        self.assertEqual(images._parse_retry_after(email.utils.format_datetime(geride)), 0.0)


class MevcutDosyalariAtlamaTest(unittest.TestCase):
    """Retry değişikliği `images` komutunun devam etme davranışını bozmamalı.

    Kimlik kareleri gorseller/identity/ altına yazılıyor; 'zaten var mı'
    kontrolünün oraya bakması gerekiyor. Bu ayrışırsa yarıda kesilen bir
    üretim kimlik karelerini baştan üretir ve kimse fark etmez.
    """

    def _paket_kur(self, kok: Path) -> None:
        (kok).mkdir(parents=True, exist_ok=True)
        (kok / "tum-promptlar.txt").write_text(
            "### POST 01-1 (saha)\nbir prompt\n\n### REEL 01-1 (lab)\nbaşka bir prompt\n",
            encoding="utf-8",
        )

    def _dry_run(self, kok: Path) -> str:
        from persona import cli

        out = io.StringIO()
        with mock.patch("sys.stdout", new=out):
            kod = cli.main(
                [
                    "images",
                    "--out",
                    str(kok),
                    "--character",
                    str(CHARACTER),
                    "--dry-run",
                ]
            )
        self.assertEqual(kod, 0)
        return out.getvalue()

    def test_hicbiri_yokken_hepsi_listelenir(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            kok = Path(tmp) / "cikti"
            self._paket_kur(kok)
            cikti = self._dry_run(kok)
            # 4 kimlik + 2 içerik
            self.assertIn("Üretilecek: 6 görsel", cikti)
            self.assertIn("IDENTITY-01-onden", cikti)

    def test_var_olan_kimlik_karesi_atlanir(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            kok = Path(tmp) / "cikti"
            self._paket_kur(kok)
            ident = kok / "gorseller" / "identity"
            ident.mkdir(parents=True)
            (ident / "IDENTITY-01-onden.jpg").write_bytes(b"x")

            cikti = self._dry_run(kok)
            self.assertIn("1 zaten var", cikti)
            self.assertNotIn("IDENTITY-01-onden", cikti)
            self.assertIn("IDENTITY-02-profil", cikti)

    def test_post_ve_reel_adlari_cakismaz(self) -> None:
        """POST 01-1 ve REEL 01-1 aynı dosyaya yazarsa biri kaybolur."""
        with tempfile.TemporaryDirectory() as tmp:
            kok = Path(tmp) / "cikti"
            self._paket_kur(kok)
            (kok / "gorseller").mkdir(parents=True)
            (kok / "gorseller" / "POST-01-1.jpg").write_bytes(b"x")

            cikti = self._dry_run(kok)
            self.assertIn("1 zaten var", cikti)
            self.assertIn("REEL-01-1", cikti, "reels karesi ayrı ad almalı")


if __name__ == "__main__":
    unittest.main()
