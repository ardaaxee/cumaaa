import { useEffect, useRef, useState } from 'react';
import { getTeacherPhoto, resizeImage, setTeacherPhoto } from '../services/photoStore';
import { updateSettings } from '../store/actions';
import { update, useSelector } from '../store/store';
import { toast } from './ui';

/** Öğretmen fotoğrafı (IndexedDB'den); değişince tüm ekranlar güncellenir. */
export function useTeacherPhoto(): string | null {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => void getTeacherPhoto().then((p) => alive && setPhoto(p));
    load();
    window.addEventListener('iyiki:teacher-photo', load);
    return () => {
      alive = false;
      window.removeEventListener('iyiki:teacher-photo', load);
    };
  }, []);
  return photo;
}

/** Yuvarlak öğretmen fotoğrafı (dikey odak ayarlanabilir). */
export function TeacherPhotoImage({ src, size, alt }: { src: string; size: number; alt: string }) {
  const focusY = useSelector((s) => s.settings.teacherPhotoFocusY);
  return <img className="teacher-photo" src={src} alt={alt} width={size} height={size} style={{ objectPosition: `50% ${focusY}%` }} />;
}

/** Ayarlar: öğretmen fotoğrafı seç / değiştir / kaldır. Fotoğraf cihazda (IndexedDB) kalır. */
export function TeacherPhotoSettings() {
  const photo = useTeacherPhoto();
  const name = useSelector((s) => s.settings.teacherName);
  const focusY = useSelector((s) => s.settings.teacherPhotoFocusY);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      await setTeacherPhoto(await resizeImage(file));
      toast('Öğretmen fotoğrafı kaydedildi ♡');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Fotoğraf kaydedilemedi.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <section className="card section" aria-labelledby="tphoto-h">
      <h2 id="tphoto-h" className="mb-8">
        Öğretmen fotoğrafı
      </h2>
      <div className="row nowrap" style={{ gap: 14, alignItems: 'center' }}>
        {photo ? <TeacherPhotoImage src={photo} size={84} alt={`${name} fotoğrafı`} /> : <div className="teacher-photo empty">🧑‍🏫</div>}
        <div className="grow">
          <p className="small muted" style={{ marginTop: 0 }}>
            Fotoğraf yalnız bu cihazda saklanır. Seçilmezse {name} çizim karakteriyle görünür.
          </p>
          <div className="row">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void pick(e.target.files?.[0])} />
            <button type="button" className="btn small primary" disabled={busy} onClick={() => fileRef.current?.click()}>
              {photo ? 'Fotoğrafı değiştir' : 'Fotoğraf seç'}
            </button>
            {photo && (
              <button
                type="button"
                className="btn small ghost danger"
                disabled={busy}
                onClick={() => void setTeacherPhoto(null).then(() => toast('Fotoğraf kaldırıldı.'))}
              >
                Kaldır
              </button>
            )}
          </div>
        </div>
      </div>
      {photo && (
        <label className="field mt-12">
          <span>Dikey odak (yüz ortada kalsın)</span>
          <input type="range" min={0} max={100} value={focusY} onChange={(e) => update((s) => updateSettings(s, { teacherPhotoFocusY: Number(e.target.value) }))} />
        </label>
      )}
    </section>
  );
}
