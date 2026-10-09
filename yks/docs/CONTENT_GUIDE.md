# İçerik Yazım Rehberi (müfredat · konu anlatımı · soru bankası)

Bu rehber `src/data/` altındaki tüm içerik dosyaları için bağlayıcıdır.
Tipler: `src/domain/types.ts` (Subject, LessonSeed, QuestionSeed).

## Dosya yerleşimi

| İçerik | Yol | Dışa aktarım |
|---|---|---|
| Müfredat (ders → ünite → konu → alt konu → kazanım) | `src/data/curriculum/<subjectId>.ts` | `export const subject: Subject` |
| Konu anlatımları | `src/data/lessons/<subjectId>[-N].ts` | `export const lessons: LessonSeed[]` |
| Soru bankası | `src/data/questions/<subjectId>[-N].ts` | `export const questions: QuestionSeed[]` |

İçe aktarım: `import type { Subject } from '../../domain/types';` (lessons/questions için aynı yol).
Dosyalar Vite `import.meta.glob` ile otomatik bulunur; kayıt dosyası düzenlemek gerekmez.

## Kimlik kuralları

- Ünite: `<subjectId>-u1`, `<subjectId>-u2` …
- Konu: görev tanımında verilen kimlik **aynen** kullanılır.
- Alt konu: `<topicId>-s1`, `<topicId>-s2` …
- Kazanım: `<subtopicId>-k1`, `<subtopicId>-k2` …
- Soru: `<topicId>-q01`, `<topicId>-q02` …

## Müfredat

- 12. sınıf ve YKS kapsamı **MEB ortaöğretim öğretim programı mantığına** göre (2018 programları; 2026–2027'de 12. sınıfta önceki program sürer).
- Her konu için `grade` (9/10/11/12) MEB programındaki sınıf düzeyidir.
- Öncelikli konular `priority: true` alır (görev tanımında belirtilir).
- Her konu 2–6 alt konu, her alt konu 1–4 kazanım içerir.
- Kazanım metinleri MEB kazanım üslubunda yazılır ("… açıklar.", "… hesaplar.", "… yorumlar.").
- **Resmî MEB kazanım kodu uydurma.** Kod alanı yoktur; kimlikler yukarıdaki kurala göredir.

## Konu anlatımı (LessonSeed)

Her konu için bir anlatım. Yüzeysel iki cümle yazılmaz; gerçek ders anlatımıdır.

| Alan | Öncelikli konu | Diğer konular |
|---|---|---|
| `intro` (doğal öğrenci dili, paragraflar `\n\n`) | ≥ 400 karakter, 2–4 paragraf | ≥ 200 karakter |
| `prerequisites` | ≥ 3 | ≥ 2 |
| `concepts` (terim + tanım) | ≥ 5 | ≥ 3 |
| `formulas` (bağıntı + anlamı) | ≥ 5 (sözel derslerde kural/kalıp) | uygun olduğu kadar |
| `logic` ("Neden böyle?") | ≥ 300 karakter | ≥ 150 karakter |
| `examples` (adım adım) | 3: kolay → orta → zor | ≥ 2 |
| `osymThinking` (soru nasıl gizlenir, neyi ölçer) | ≥ 120 karakter | ≥ 120 karakter |
| `commonMistakes` | ≥ 4 | ≥ 3 |
| `tips` (püf noktası) | ≥ 3 | ≥ 2 |
| `summary` (1 dakikalık özet) | 5–7 madde | ≥ 3 madde |

Sözel derslerde `formulas` alanı kural/kalıp listesi olarak kullanılabilir (expr: kural, meaning: açıklama).

## Soru bankası (QuestionSeed)

- Öncelikli konu: **en az 12** soru; diğer konular: **en az 6** soru.
- Tam olarak **5 seçenek** (A–E). Seçeneğin başına harf yazılmaz.
- `correctAnswer` 0–4. Doğru cevaplar şıklara dengeli dağıtılır (bir şık %35'i geçmez).
- Zorluk karışık: `kolay`, `orta`, `zor`, `yeni-nesil` (öncelikli konularda yeni nesil mutlaka olur).
- Tip karışık: `bilgi`, `islem`, `yorum`, `grafik`, `tablo`, `deney`, `onculu`, `problem`, `cok-adimli`, `yeni-nesil`.
- Öncüllü sorularda ifadeler `premises` dizisine yazılır (başına "I." yazılmaz; uygulama numaralandırır). Seçenekler "Yalnız I", "I ve II", "I, II ve III" gibi olur.
- Tablo gerektiren sorularda `table: { caption?, headers, rows }` kullanılır (her satır başlık sayısı kadar hücre).
- Grafik soruları, grafiği kelimelerle ya da değer tablosuyla tanımlar (görsel yok).
- Çeldiriciler tipik öğrenci hatalarından üretilir (işaret hatası, birim hatası, eksik adım, kavram karışıklığı).
- `solution`: adım adım, gerekçeli çözüm. `hint`: çözümü vermeden yön gösterir. `commonMistake`: bu soruda sık yapılan hata. `teacherNote`: sorunun ölçtüğü beceri ve kalıcı ders (1–2 cümle).
- `outcome`: sorunun ölçtüğü kazanımın metni (müfredattaki kazanımlarla uyumlu).
- `subtopic`: yalnız müfredat dosyasında gerçekten var olan alt konu kimliği yazılır; emin değilsen alanı yazma.

### Özgünlük ve doğruluk (kesin kurallar)

1. **Gerçek ÖSYM sorusu kopyalanmaz, taklit edilmez, yeniden yazılmaz.** Ticari kaynaklardan soru alınmaz. Sorular özgündür.
2. Soru metninde "ÖSYM", "çıkmış soru" gibi iddialar geçmez.
3. Her hesap iki kez kontrol edilir; sayısal sorular mümkünse `python3` ile doğrulanır. Tam olarak **bir** seçenek doğrudur.
4. Bilgi soruları güncel ve bilimsel olarak doğru olmalıdır. Emin olmadığın bilgiyi soru yapma.
5. "2+2 kaçtır?" seviyesinde anlamsız soru yazılmaz; YKS mantığında kavram, yorum, dikkat ve çok adımlı muhakeme ölçülür.

## Yazım

- Türkçe karakterler doğru kullanılır (ç, ğ, ı, İ, ö, ş, ü).
- Matematik Unicode ile yazılır: ², ³, √, π, ≤, ≥, ≠, ±, ∞, ∫, Σ, ·, →, logₐ, x₁, x₂, f′(x), f″(x). LaTeX kullanılmaz.
- Kesirler `a/b` ya da `(x+1)/(x−2)` biçiminde yazılır.
- TS dizelerinde çift tırnak kullan; Türkçe ek kesme işareti için tipografik `’` kullan ("2’nin"), böylece kaçış gerekmez.
- Satır sonu gerekiyorsa dize içinde `\n` kullan.

## Doğrulama

```bash
cd yks
npx tsc --noEmit                                            # tip kontrolü
CHECK_SUBJECTS=<subjectId> npx vitest run tests/content.test.ts   # içerik bütünlüğü
```
