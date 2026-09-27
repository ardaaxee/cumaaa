import { useEffect, useState } from 'react';
import { getTeacherPhoto } from '../services/photoStore';
import { useSelector } from '../store/store';

export function useTeacherPhoto(): string | null {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => getTeacherPhoto().then((p) => alive && setPhoto(p));
    load();
    window.addEventListener('iyiki:teacher-photo', load);
    return () => {
      alive = false;
      window.removeEventListener('iyiki:teacher-photo', load);
    };
  }, []);
  return photo;
}

/** Yuvarlak profil alanı: görüntü kırpılmadan saklanır, object-fit: cover ile gerilmeden gösterilir. */
export function TeacherAvatar({ size = 64 }: { size?: number }) {
  const photo = useTeacherPhoto();
  const name = useSelector((s) => s.settings.teacherName);
  const focusY = useSelector((s) => s.settings.teacherPhotoFocusY);
  const initial = name.trim().charAt(0).toLocaleUpperCase('tr-TR') || 'Ö';
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {photo ? <img src={photo} alt={`${name} fotoğrafı`} style={{ objectPosition: `50% ${focusY}%` }} /> : <span aria-hidden="true">{initial}</span>}
    </div>
  );
}
