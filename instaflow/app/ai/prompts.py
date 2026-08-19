"""AI istem (prompt) şablonları.

Şablonlar tek yerde toplanır ki üslup değişikliği tek dosyadan yapılabilsin.
Hepsi Türkçe çıktı ister ve modelden **yalnızca istenen biçimi** döndürmesini
bekler — böylece ayrıştırma güvenilir olur.
"""

from __future__ import annotations

SYSTEM_PROMPT = (
    "Sen deneyimli bir Instagram içerik editörüsün. Türkçe yazarsın. "
    "Metinlerin doğal, samimi ve okunabilir olur; abartılı pazarlama dili "
    "kullanmazsın. İstenen biçimin dışına çıkmaz, açıklama eklemezsin."
)

#: Liste döndüren istemlerde ortak kural.
_JSON_LIST_RULE = (
    "Yanıtı yalnızca JSON dizisi olarak ver. Örnek: [\"birinci\", \"ikinci\"]. "
    "Kod bloğu, başlık veya açıklama ekleme."
)

CAPTION = """Aşağıdaki gönderi için Instagram açıklaması yaz.

Konu: {topic}
Ton: {tone}
İstenen uzunluk: {length}

Kurallar:
- En fazla {max_chars} karakter.
- Hashtag ekleme (ayrı üretiliyor).
- En fazla 2 emoji kullan, gerekmiyorsa hiç kullanma.
- Sonunda kısa bir etkileşim sorusu olabilir.

Yalnızca açıklama metnini yaz."""

CAPTION_VARIANTS = """Aşağıdaki gönderi için {count} farklı Instagram açıklaması yaz.

Konu: {topic}
Ton: {tone}

Her biri farklı bir açıdan yaklaşsın (hikâye, bilgi, soru gibi).
Her biri en fazla {max_chars} karakter olsun, hashtag içermesin.

{list_rule}"""

TITLE = """Aşağıdaki gönderi için kısa bir başlık üret.

Konu: {topic}

Kurallar:
- En fazla {max_chars} karakter.
- Tek satır, tırnak işareti yok.

Yalnızca başlığı yaz."""

REELS_DESCRIPTION = """Aşağıdaki Reels videosu için açıklama yaz.

Konu: {topic}
Video süresi: {duration}
Ton: {tone}

Kurallar:
- İlk cümle izleyiciyi ilk 2 saniyede tutacak bir kanca olsun.
- En fazla {max_chars} karakter.
- Hashtag ekleme.

Yalnızca açıklama metnini yaz."""

HASHTAGS = """Aşağıdaki gönderi için {count} adet Instagram hashtag'i öner.

Konu: {topic}
Dil: Türkçe ağırlıklı, gerekirse İngilizce.

Kurallar:
- Her öğe '#' ile başlasın, boşluk içermesin.
- Çok genel (#love, #instagood) ve çok niş etiketleri dengele.
- Yasaklı/spam etiketler kullanma.

{list_rule}"""

IDEAS = """Bir Instagram hesabı için {count} adet içerik fikri üret.

Hesap konusu: {topic}

Kurallar:
- Her fikir tek cümle olsun ve ne çekileceğini somut anlatsın.
- Format çeşitliliği olsun (foto, reels, carousel).

{list_rule}"""

CALENDAR = """Bir Instagram hesabı için {days} günlük içerik planı üret.

Hesap konusu: {topic}
Günde gönderi sayısı: {per_day}

Yanıtı yalnızca JSON dizisi olarak ver. Her öğe şu alanları içersin:
{{"day": "Pazartesi", "time": "18:00", "content_type": "image", "title": "...", "idea": "..."}}

content_type yalnızca şunlardan biri olabilir: image, video, reels, carousel, story.
Kod bloğu veya açıklama ekleme."""


def list_rule() -> str:
    """Liste döndüren istemlerde kullanılan ortak kural metni."""
    return _JSON_LIST_RULE
