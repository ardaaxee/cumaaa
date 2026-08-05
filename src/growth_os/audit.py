"""Hesap denetimi: profil sağlığı, içerik karması ve etkileşim analizi.

Buradaki tüm sayılar API'den gelen ham verilerden hesaplanır. Tahmin veya
sektör ortalaması uydurulmaz; veri yoksa alan `None` kalır ve raporda
"veri yok" olarak görünür.
"""

from __future__ import annotations

import logging
import statistics
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .client import GraphAPIError, InstagramClient

log = logging.getLogger(__name__)

# Yeni Graph sürümlerinde desteklenen hesap metrikleri. Sürüm uyumsuzluğunda
# istek hata verir ve rapor bunu "doğrulanmalı" olarak işaretler.
ACCOUNT_METRICS = ["reach", "accounts_engaged", "profile_views"]

# Medya türüne göre anlamlı metrikler farklıdır.
MEDIA_METRICS = {
    "REELS": ["reach", "saved", "shares", "comments", "likes", "total_interactions"],
    "IMAGE": ["reach", "saved", "shares", "total_interactions"],
    "CAROUSEL_ALBUM": ["reach", "saved", "shares", "total_interactions"],
    "VIDEO": ["reach", "saved", "shares", "total_interactions"],
}

# Bio 150 karakterle sınırlıdır; çok kısa bio değer önerisi taşıyamaz.
MIN_HEALTHY_BIO_LENGTH = 40


@dataclass
class AuditReport:
    profile: dict[str, Any]
    media_count_analyzed: int
    followers: int | None
    engagement_rate: float | None
    median_likes: float | None
    median_comments: float | None
    format_mix: dict[str, int]
    best_posts: list[dict[str, Any]] = field(default_factory=list)
    weakest_posts: list[dict[str, Any]] = field(default_factory=list)
    posting_cadence_per_week: float | None = None
    days_since_last_post: int | None = None
    account_insights: dict[str, Any] | None = None
    warnings: list[str] = field(default_factory=list)


def _engagement(post: dict[str, Any]) -> int:
    return (post.get("like_count") or 0) + (post.get("comments_count") or 0)


def _parse_ts(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        # Graph API biçimi: 2024-01-31T12:00:00+0000
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S%z")
    except ValueError:
        log.debug("Zaman damgası çözümlenemedi: %s", value)
        return None


def _cadence(posts: list[dict[str, Any]]) -> tuple[float | None, int | None]:
    """Haftalık paylaşım sıklığı ve son paylaşımdan bu yana geçen gün."""
    stamps = sorted(t for t in (_parse_ts(p.get("timestamp")) for p in posts) if t)
    if not stamps:
        return None, None

    now = datetime.now(timezone.utc)
    days_since = (now - stamps[-1]).days

    if len(stamps) < 2:
        return None, days_since

    span_days = (stamps[-1] - stamps[0]).total_seconds() / 86400
    if span_days < 1:
        return None, days_since
    return round(len(stamps) / (span_days / 7), 2), days_since


def run_audit(client: InstagramClient, ig_user_id: str, media_limit: int = 30) -> AuditReport:
    """Profil + son N gönderiyi çekip türetilmiş metrikleri hesaplar."""
    warnings: list[str] = []

    profile = client.profile(ig_user_id)
    followers = profile.get("followers_count")
    log.info("Profil alındı: @%s (%s takipçi)", profile.get("username"), followers)

    posts = client.recent_media(ig_user_id, limit=media_limit)
    log.info("%s gönderi analiz ediliyor", len(posts))

    if not posts:
        warnings.append("Hesapta analiz edilecek gönderi yok — içerik üretimi ilk adım.")

    likes = [p.get("like_count") or 0 for p in posts]
    comments = [p.get("comments_count") or 0 for p in posts]

    engagement_rate = None
    if posts and followers:
        avg_engagement = sum(_engagement(p) for p in posts) / len(posts)
        engagement_rate = round(avg_engagement / followers * 100, 2)
    elif posts and not followers:
        warnings.append(
            "Takipçi sayısı okunamadı; etkileşim oranı hesaplanamadı. "
            "Token'da `instagram_basic` izni olduğunu doğrulayın."
        )

    ranked = sorted(posts, key=_engagement, reverse=True)

    def _summarize(post: dict[str, Any]) -> dict[str, Any]:
        return {
            "permalink": post.get("permalink"),
            "type": post.get("media_product_type") or post.get("media_type"),
            "timestamp": post.get("timestamp"),
            "likes": post.get("like_count"),
            "comments": post.get("comments_count"),
            "engagement": _engagement(post),
            "caption_preview": (post.get("caption") or "")[:120],
        }

    cadence, days_since = _cadence(posts)

    # Hesap düzeyi içgörüler yalnızca Business hesaplarda ve yeterli erişimde gelir.
    account_insights: dict[str, Any] | None = None
    try:
        account_insights = client.account_insights(ig_user_id, ACCOUNT_METRICS)
    except GraphAPIError as exc:
        warnings.append(
            f"Hesap içgörüleri alınamadı ({exc.message}). Metrik adları Graph API "
            "sürümüne göre değişir; IG_API_VERSION ve izinler doğrulanmalı."
        )

    # Profil sağlığı kontrolleri
    bio = profile.get("biography") or ""
    if len(bio) < MIN_HEALTHY_BIO_LENGTH:
        warnings.append(
            f"Bio çok kısa ({len(bio)} karakter) — kim için, ne değer sunduğunuz net değil."
        )
    if not profile.get("website"):
        warnings.append("Profilde link yok — trafik ve dönüşüm yolu kapalı.")
    if days_since is not None and days_since > 7:
        warnings.append(f"Son paylaşımdan bu yana {days_since} gün geçti — erişim düşer.")

    return AuditReport(
        profile=profile,
        media_count_analyzed=len(posts),
        followers=followers,
        engagement_rate=engagement_rate,
        median_likes=statistics.median(likes) if likes else None,
        median_comments=statistics.median(comments) if comments else None,
        format_mix=dict(Counter(
            p.get("media_product_type") or p.get("media_type") or "UNKNOWN" for p in posts
        )),
        best_posts=[_summarize(p) for p in ranked[:5]],
        weakest_posts=[_summarize(p) for p in ranked[-3:]] if len(ranked) > 5 else [],
        posting_cadence_per_week=cadence,
        days_since_last_post=days_since,
        account_insights=account_insights,
        warnings=warnings,
    )


def format_report(report: AuditReport) -> str:
    """Denetim raporunu terminal için okunabilir metne çevirir."""
    p = report.profile
    out: list[str] = []
    add = out.append

    add("=" * 62)
    add(f"  HESAP DENETİMİ — @{p.get('username', '?')}")
    add("=" * 62)
    add("")
    add("1) PROFİL")
    add(f"   Ad            : {p.get('name') or '—'}")
    add(f"   Takipçi       : {report.followers if report.followers is not None else 'veri yok'}")
    add(f"   Takip edilen  : {p.get('follows_count', '—')}")
    add(f"   Gönderi       : {p.get('media_count', '—')}")
    add(f"   Website       : {p.get('website') or '— (yok)'}")
    add(f"   Bio ({len(p.get('biography') or '')} karakter): {(p.get('biography') or '—')[:200]}")
    add("")

    add("2) ETKİLEŞİM")
    er = report.engagement_rate
    add(f"   Analiz edilen gönderi : {report.media_count_analyzed}")
    add(f"   Etkileşim oranı       : {f'%{er}' if er is not None else 'hesaplanamadı'}")
    add(f"   Medyan beğeni         : {report.median_likes if report.median_likes is not None else '—'}")
    add(f"   Medyan yorum          : {report.median_comments if report.median_comments is not None else '—'}")
    cadence = report.posting_cadence_per_week
    add(f"   Haftalık sıklık       : {f'{cadence} gönderi' if cadence else 'veri yetersiz'}")
    add(f"   Son paylaşım          : {f'{report.days_since_last_post} gün önce' if report.days_since_last_post is not None else '—'}")
    add("")

    add("3) İÇERİK KARMASI")
    if report.format_mix:
        total = sum(report.format_mix.values())
        for fmt, count in sorted(report.format_mix.items(), key=lambda kv: -kv[1]):
            add(f"   {fmt:<18} {count:>3} gönderi  (%{round(count / total * 100)})")
    else:
        add("   Veri yok.")
    add("")

    if report.best_posts:
        add("4) EN İYİ GÖNDERİLER")
        for i, post in enumerate(report.best_posts, 1):
            add(f"   {i}. [{post['type']}] {post['engagement']} etkileşim "
                f"({post['likes']} beğeni / {post['comments']} yorum)")
            add(f"      {post['permalink']}")
            if post["caption_preview"]:
                add(f"      \"{post['caption_preview']}…\"")
        add("")

    if report.account_insights:
        add("5) HESAP İÇGÖRÜLERİ (son 28 gün)")
        for item in report.account_insights.get("data", []):
            values = item.get("total_value", {}).get("value")
            if values is None:
                series = item.get("values", [])
                values = sum(v.get("value", 0) for v in series) if series else "—"
            add(f"   {item.get('name'):<20} {values}")
        add("")

    if report.warnings:
        add("⚠  DİKKAT EDİLECEKLER")
        for warning in report.warnings:
            add(f"   • {warning}")
        add("")

    add("=" * 62)
    return "\n".join(out)
