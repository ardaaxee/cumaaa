"""Denetim mantığı testleri.

Graph API'ye ağ isteği yapılmaz; istemci sahte veriyle değiştirilir.
Amaç: türetilmiş metriklerin (etkileşim oranı, sıklık, karma) doğruluğu.
"""

from __future__ import annotations

import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from growth_os.audit import format_report, run_audit  # noqa: E402
from growth_os.client import GraphAPIError, redact  # noqa: E402


def _ts(days_ago: int) -> str:
    when = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return when.strftime("%Y-%m-%dT%H:%M:%S%z")


class FakeClient:
    """InstagramClient'ın denetim için kullandığı yüzeyi taklit eder."""

    def __init__(self, profile: dict, posts: list[dict], insights_fail: bool = False) -> None:
        self._profile = profile
        self._posts = posts
        self._insights_fail = insights_fail

    def profile(self, ig_user_id: str) -> dict:
        return self._profile

    def recent_media(self, ig_user_id: str, limit: int = 25) -> list[dict]:
        return self._posts[:limit]

    def account_insights(self, ig_user_id: str, metrics: list[str], **kwargs) -> dict:
        if self._insights_fail:
            raise GraphAPIError(400, {"error": {"message": "metrik desteklenmiyor", "code": 100}})
        return {"data": [{"name": "reach", "total_value": {"value": 12000}}]}


HEALTHY_PROFILE = {
    "username": "test_hesap",
    "name": "Test",
    "biography": "Yazılımcılar için haftalık pratik ipuçları ve araç incelemeleri.",
    "website": "https://ornek.com",
    "followers_count": 1000,
    "follows_count": 300,
    "media_count": 40,
}


class TestAudit(unittest.TestCase):
    def test_engagement_rate_uses_followers_and_average(self) -> None:
        posts = [
            {"id": "1", "like_count": 100, "comments_count": 20, "media_type": "IMAGE",
             "timestamp": _ts(7), "permalink": "https://x/1"},
            {"id": "2", "like_count": 60, "comments_count": 20, "media_type": "IMAGE",
             "timestamp": _ts(1), "permalink": "https://x/2"},
        ]
        report = run_audit(FakeClient(HEALTHY_PROFILE, posts), "123")

        # ortalama etkileşim = (120 + 80) / 2 = 100 → 1000 takipçinin %10'u
        self.assertEqual(report.engagement_rate, 10.0)
        self.assertEqual(report.median_likes, 80)
        self.assertEqual(report.media_count_analyzed, 2)

    def test_best_posts_ranked_by_total_engagement(self) -> None:
        posts = [
            {"id": "low", "like_count": 5, "comments_count": 0, "media_type": "IMAGE",
             "timestamp": _ts(3), "permalink": "https://x/low"},
            {"id": "high", "like_count": 50, "comments_count": 40, "media_type": "REELS",
             "media_product_type": "REELS", "timestamp": _ts(2), "permalink": "https://x/high"},
        ]
        report = run_audit(FakeClient(HEALTHY_PROFILE, posts), "123")

        self.assertEqual(report.best_posts[0]["permalink"], "https://x/high")
        self.assertEqual(report.best_posts[0]["engagement"], 90)
        self.assertEqual(report.best_posts[0]["type"], "REELS")

    def test_format_mix_counts_product_type_first(self) -> None:
        posts = [
            {"id": "a", "media_type": "VIDEO", "media_product_type": "REELS",
             "timestamp": _ts(2), "like_count": 1, "comments_count": 0},
            {"id": "b", "media_type": "IMAGE", "timestamp": _ts(4),
             "like_count": 1, "comments_count": 0},
            {"id": "c", "media_type": "VIDEO", "media_product_type": "REELS",
             "timestamp": _ts(6), "like_count": 1, "comments_count": 0},
        ]
        report = run_audit(FakeClient(HEALTHY_PROFILE, posts), "123")

        self.assertEqual(report.format_mix, {"REELS": 2, "IMAGE": 1})

    def test_cadence_computed_over_posting_span(self) -> None:
        # 2, 5, 8, 11, 14 gün önce → 12 günlük aralıkta 5 gönderi
        posts = [
            {"id": str(i), "media_type": "IMAGE", "timestamp": _ts(14 - i * 3),
             "like_count": 10, "comments_count": 1}
            for i in range(5)
        ]
        report = run_audit(FakeClient(HEALTHY_PROFILE, posts), "123")

        # 12 günlük aralıkta 5 gönderi ≈ haftada 2.92
        self.assertIsNotNone(report.posting_cadence_per_week)
        self.assertAlmostEqual(report.posting_cadence_per_week, 2.92, places=1)
        self.assertEqual(report.days_since_last_post, 2)

    def test_stale_account_and_weak_profile_produce_warnings(self) -> None:
        weak_profile = {
            "username": "zayif",
            "biography": "merhaba",   # çok kısa
            "website": "",            # link yok
            "followers_count": 500,
            "follows_count": 900,
            "media_count": 3,
        }
        posts = [{"id": "1", "media_type": "IMAGE", "timestamp": _ts(30),
                  "like_count": 2, "comments_count": 0}]
        report = run_audit(FakeClient(weak_profile, posts), "123")

        joined = " ".join(report.warnings)
        self.assertIn("Bio çok kısa", joined)
        self.assertIn("link yok", joined)
        self.assertIn("30 gün", joined)

    def test_empty_account_does_not_crash(self) -> None:
        report = run_audit(FakeClient(HEALTHY_PROFILE, []), "123")

        self.assertIsNone(report.engagement_rate)
        self.assertEqual(report.format_mix, {})
        self.assertIn("analiz edilecek gönderi yok", " ".join(report.warnings))
        self.assertIn("HESAP DENETİMİ", format_report(report))

    def test_insight_failure_is_reported_not_fatal(self) -> None:
        posts = [{"id": "1", "media_type": "IMAGE", "timestamp": _ts(1),
                  "like_count": 10, "comments_count": 2}]
        report = run_audit(FakeClient(HEALTHY_PROFILE, posts, insights_fail=True), "123")

        self.assertIsNone(report.account_insights)
        self.assertIn("Hesap içgörüleri alınamadı", " ".join(report.warnings))

    def test_missing_followers_disables_rate_with_warning(self) -> None:
        profile = dict(HEALTHY_PROFILE)
        del profile["followers_count"]
        posts = [{"id": "1", "media_type": "IMAGE", "timestamp": _ts(1),
                  "like_count": 10, "comments_count": 2}]
        report = run_audit(FakeClient(profile, posts), "123")

        self.assertIsNone(report.engagement_rate)
        self.assertIn("instagram_basic", " ".join(report.warnings))


class TestRedaction(unittest.TestCase):
    def test_token_removed_from_urls(self) -> None:
        text = "https://graph.facebook.com/v21.0/me?access_token=EAAB123SECRET&fields=id"
        self.assertNotIn("EAAB123SECRET", redact(text))
        self.assertIn("access_token=<REDACTED>", redact(text))

    def test_debug_token_parameter_also_redacted(self) -> None:
        self.assertNotIn("SECRET", redact("debug_token?input_token=SECRET"))


if __name__ == "__main__":
    unittest.main()
