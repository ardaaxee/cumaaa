"""Birden fazla hesabı birbirine bağlayan katman.

Üç karakterin ayrı ayrı hesabı var ama aynı evrende yaşıyorlar: aynı evde
oturuyorlar, aynı teknede çalışıyorlar, aynı olayı farklı ağızlardan
anlatıyorlar. Bu modül o bağı veriden türetir — kim kimin karesinde
çıkabilir, hangi hikâye yayı kaç hesapta geçiyor, aynı gün kim ne paylaşır.
"""

from __future__ import annotations

from .models import Character


def cross_appearances(chars: list[Character]) -> list[tuple[str, str, list[str]]]:
    """(hesap, görünen kişi, o kişinin çıktığı sütunlar) üçlüleri."""
    rows: list[tuple[str, str, list[str]]] = []
    for ch in chars:
        for name in ch.companions:
            pillars = [p.name for p in ch.pillars if p.companion == name]
            rows.append((ch.display_name, name, pillars))
    return rows


def shared_arcs(chars: list[Character]) -> dict[str, list[tuple[str, list[str]]]]:
    """Birden fazla hesapta geçen hikâye yayları → (hesap, adımlar)."""
    index: dict[str, list[tuple[str, list[str]]]] = {}
    for ch in chars:
        for arc in ch.arcs:
            index.setdefault(arc["name"], []).append(
                (ch.display_name, list(arc.get("beats", [])))
            )
    return {k: v for k, v in index.items() if len(v) > 1}


def anchor_conflicts(chars: list[Character]) -> list[str]:
    """Aynı kişinin farklı dosyalarda farklı tarif edilmesi — yüz kayması.

    Bir kişi kendi dosyasında `visual.anchor`, başkasının dosyasında
    `companions[ad]` olarak geçer. İkisi birebir aynı olmalı; olmazsa
    aynı kişi hesaplar arasında farklı görünür.
    """
    canonical = {ch.display_name: ch.visual.anchor for ch in chars}
    problems: list[str] = []
    for ch in chars:
        for name, anchor in ch.companions.items():
            expected = canonical.get(name)
            if expected is not None and expected != anchor:
                problems.append(
                    f"{ch.display_name} dosyasındaki '{name}' tarifi, "
                    f"{name}'in kendi dosyasındaki tarifle aynı değil"
                )
    return problems


def build_network_doc(chars: list[Character]) -> str:
    lines = [
        "# Hesap ağı",
        "",
        "Üç ayrı Instagram hesabı, tek bir kurgusal evren. Her hesabı kendi",
        "karakteri yönetiyor; aynı olay üç hesapta üç farklı ağızdan anlatılıyor.",
        "",
        "> Hepsi kurgusaldır ve içerikleri yapay zekâ ile üretilir.",
        "",
        "## Hesaplar",
        "",
        "| Hesap | Kim | Nerede | Ne paylaşır |",
        "|---|---|---|---|",
    ]
    for ch in chars:
        pillars = ", ".join(p.name for p in ch.pillars[:4])
        lines.append(
            f"| @{ch.handle} | {ch.display_name}, {ch.age} | {ch.city} | {pillars} |"
        )

    lines += [
        "",
        "## Kim kimin karesinde çıkıyor",
        "",
        "Bir kişi başka bir hesabın karesine giriyorsa, o hesabın karakter",
        "dosyasında `companions` altında **birebir aynı** görünüm tarifiyle",
        "kayıtlı olmalı. Yüz tutarlılığı buna bağlı.",
        "",
        "| Hesap | Karede çıkan | Hangi sütunlarda |",
        "|---|---|---|",
    ]
    for host, guest, pillars in cross_appearances(chars):
        where = ", ".join(pillars) if pillars else "— (tanımlı sütun yok)"
        lines.append(f"| @{_handle_of(chars, host)} | {guest} | {where} |")

    arcs = shared_arcs(chars)
    if arcs:
        lines += [
            "",
            "## Ortak hikâye yayları",
            "",
            "Aynı olay birden çok hesapta geçiyor. Bunları **aynı hafta içinde**",
            "yayınla; sırası önemli, çünkü takipçi ikisini de görüyor.",
            "",
        ]
        for name, owners in arcs.items():
            lines += [f"### {name}", ""]
            for who, beats in owners:
                lines.append(f"**{who} tarafından:**")
                lines += [f"{i}. {b}" for i, b in enumerate(beats, 1)]
                lines.append("")

    lines += [
        "## Çapraz paylaşım kuralları",
        "",
        "1. **Aynı olay, farklı kadraj.** İki hesap aynı anı paylaşacaksa aynı",
        "   fotoğrafı kullanma — biri geniş açı, diğeri yakın plan olsun.",
        "2. **Aynı gün değil, ertesi gün.** Olayı önce olayın 'sahibi' paylaşır,",
        "   diğer hesap ertesi gün kendi açısından değinir.",
        "3. **Etiketleme tek yönlü başlar.** Misafir olan hesap ev sahibini",
        "   etiketler; ev sahibi hikâyede yeniden paylaşır.",
        "4. **Ses karışmasın.** Herkes kendi üslubuyla yazar; aynı cümle iki",
        "   hesapta geçmez.",
        "5. **Herkes her şeyi bilmez.** Bir hesabın anlatmadığı detayı diğeri",
        "   bilmiyormuş gibi davranır. Boşluk bırakmak inandırıcılığı artırır.",
        "",
        "## Örnek: bir olay, üç hesap",
        "",
        "| Gün | Hesap | İçerik |",
        "|---|---|---|",
        "| 1 | @" + _handle_of(chars, "Sinan") + " | Dalış brifingi, ekipman karesi. Olayın sahibi. |",
        "| 1 | @" + _handle_of(chars, "Beyza") + " | Aynı günün su altı ölçümü, kendi defterinden. |",
        "| 2 | @" + _handle_of(chars, "Beyza") + " | Hikâyede dünkü brifingi yeniden paylaşır, etiketler. |",
        "| 3 | @" + _handle_of(chars, "Elif") + " | İstanbul'dan: 'o denizde, ben kartondayım' karesi. |",
        "",
        "## Profil fotoğrafları ve kullanıcı adları",
        "",
        "| Hesap | Profil fotoğrafı | Öne çıkanlar |",
        "|---|---|---|",
    ]
    for ch in chars:
        lines.append(
            f"| @{ch.handle} | `{ch.display_name.lower()}/profil.md` içindeki prompt | "
            + ", ".join(ch.highlights)
            + " |"
        )

    lines += [
        "",
        "## Kurulum sırası",
        "",
        "1. Her karakterin `identity/` klasöründeki 4 kimlik karesini üret.",
        "2. Her kişi için bir referans görsel seç ve sabitle.",
        "3. İki kişili karelerde **iki referans görseli birden** ver.",
        "4. Profil fotoğraflarını üret, hesapları aç.",
        "5. `takvim.md` sırasını takip et; ortak yayları aynı hafta yayınla.",
    ]
    return "\n".join(lines)


def _handle_of(chars: list[Character], display_name: str) -> str:
    for ch in chars:
        if ch.display_name == display_name:
            return ch.handle
    return display_name.lower()
