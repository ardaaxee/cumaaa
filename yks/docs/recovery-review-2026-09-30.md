# Yanlış sorudan öğrenmeye geçiş

Yanlışlar defterinden, konu içi sorulardan ve öğrenme modundaki test geri bildiriminden `#/pekistir/{soruId}` açılır. Önce kazanım, ipucu, yaygın hata ve kısa konu özeti gösterilir; tam anlatıma bağlantı vardır.

Asıl soru hariç aynı konudan en fazla üç farklı soru seçilir. Aynı alt konu önceliklidir; o grupta görülmemiş sorular önce gelir. Havuz yetersizse gerçek sayı gösterilir. Pekiştirme tamamlanınca ilk soru yeniden çözülür. Cevaplar normal çalışma kaydına işlenir; devam eden test değiştirilmez. Okumak ya da farklı soruları çözmek asıl yanlışı öğrenilmiş saymaz; mevcut iki ardışık doğru doğrulaması korunur.

## İçerik doğrulaması

Matematik ve fenden 27 sayısal soru, kökteki verilerle bağımsız hesaplanarak kontrol edildi. Sayısal sonuçla seçili şık ve tek doğru şık tutarlılığı kalıcı testlerle korunur. Bu örneklem 2929 sorunun tamamının bilimsel doğruluğunun doğrulandığı anlamına gelmez.

`tytfiz-hareket-ve-kuvvet-q203` kökünde hareket ettiği belirtilmişken başlangıçta duruyor olma olasılığı doğru sayılıyordu. Kök artık başlangıçtaki hareket durumunun belirtilmediğini açıkça söyler; çözüm ve cevapla tutarlıdır.

Bilimsel dayanak: https://openstax.org/books/university-physics-volume-1/pages/5-2-newtons-first-law

Doğrulama: 112 test / 21 dosya geçti. Üretim derlemesi başarılı. Akış testi, pekiştirme tamamlanmadan ilk soruya geçilemediğini ve dört cevabın ayrı ayrı kaydedildiğini kontrol eder.
