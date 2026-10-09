import { useState } from 'react';
import { PageHeader } from '../components/Layout';
import { toast } from '../components/ui';

export default function GuidePage() {
  const [copied, setCopied] = useState(false);
  const url = new URL('./', window.location.href).href;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast('Uygulama bağlantısı kopyalandı.');
    } catch {
      toast('Bağlantıyı aşağıdaki alandan seçip kopyalayabilirsin.');
    }
  };
  return <>
    <PageHeader title="Kullanım rehberi" sub="İyi ki • YKS · Sürüm 3.1" />
    <section className="card">
      <h2>Başlamak için</h2>
      <ol>
        <li><a href="#/dersler">Konu anlatımını</a> açıp ders ve konu seç. Özeti, anlatımı ve çözümlü örnekleri çalış.</li>
        <li><a href="#/testler">Soru bankasında</a> öğrenme moduyla çöz; sınav modunda çözümler test bittikten sonra görünür.</li>
        <li><a href="#/yanlislar">Yanlışlarımda</a> “Anlatım ve pekiştirme”yi aç. Bilgiyi tamamla, farklı soruları çöz, ilk soruyu yeniden dene.</li>
        <li><a href="#/plan">Planını</a> takip et ve <a href="#/tekrar">zamanı gelen tekrarları</a> tamamla.</li>
      </ol>
      <p>Sorular özgün çalışma sorularıdır. Resmî sınav sorularına <a href="#/cikmis">ÖSYM çıkmış sorular</a> bölümünden ulaşabilirsin. Gelecek sınavda hangi soruların çıkacağı garanti edilemez.</p>
    </section>
    <section className="card mt-16">
      <h2>Telefonuna ekle</h2>
      <p>Bağlantıyı Chrome’da aç. Menüden “Uygulamayı yükle” veya “Ana ekrana ekle”yi seç. Uygulamada görünen “Uygulamayı telefona yükle” düğmesini de kullanabilirsin.</p>
      <p>İlk açılışı internet açıkken yap. Çevrimdışı içerik indirmesinin tamamlanması için uygulamayı bir süre açık bırak. İnternet olmadan bazı içerikler açılmıyorsa yeniden çevrimiçi açıp tekrar dene. Bulut, canlı paylaşım, dış kaynaklar ve çevrimiçi öğretmen internet gerektirir.</p>
    </section>
    <section className="card mt-16">
      <h2>Kayıtlarını koru</h2>
      <p>Profilin ve çalışma kayıtların kullandığın tarayıcıda saklanır. Başka birine link göndermek kişisel kayıtlarını paylaşmaz. Gizli sekme veya tarayıcı verilerini temizlemek kayıtlarını kaybetmene yol açabilir.</p>
      <p><a href="#/ayarlar">Ayarlar → Veriyi dışa aktar</a> ile yedek indir. Telefon değiştirirken aynı sayfadan “İçe aktar” ile geri yükle. Bulut eşitlemesi ayrıca kurulum gerektirir.</p>
    </section>
    <section className="card mt-16">
      <h2>Bağlantıyı paylaş</h2>
      <label className="field"><span>Uygulama bağlantısı</span><input className="input" readOnly value={url} onFocus={event => event.currentTarget.select()} /></label>
      <button className="btn primary" onClick={copy}>{copied ? 'Bağlantı kopyalandı ✓' : 'Bağlantıyı kopyala'}</button>
      <p className="tiny muted mt-8">Bağlantıyı mesajlaşma uygulamanda paylaşabilirsin. Her kişi kendi profilini oluşturur.</p>
    </section>
  </>;
}
