/**
 * Öğretmen fotoğrafı IndexedDB'de saklanır (localStorage kotasını doldurmamak için).
 * IndexedDB yoksa localStorage'a düşer.
 */
const DB_NAME = 'iyiki-yks';
const STORE = 'files';
const KEY = 'teacherPhoto';
const FALLBACK_KEY = 'iyikiYks.teacherPhoto';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB yok'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export async function getTeacherPhoto(): Promise<string | null> {
  try {
    const v = await tx<string | undefined>('readonly', (s) => s.get(KEY) as IDBRequest<string | undefined>);
    return typeof v === 'string' ? v : null;
  } catch {
    try {
      return localStorage.getItem(FALLBACK_KEY);
    } catch {
      return null;
    }
  }
}

export async function setTeacherPhoto(dataUrl: string | null): Promise<void> {
  try {
    if (dataUrl) await tx('readwrite', (s) => s.put(dataUrl, KEY));
    else await tx('readwrite', (s) => s.delete(KEY));
  } catch {
    if (dataUrl) localStorage.setItem(FALLBACK_KEY, dataUrl);
    else localStorage.removeItem(FALLBACK_KEY);
  }
  window.dispatchEvent(new CustomEvent('iyiki:teacher-photo'));
}

/**
 * Yüklenen fotoğrafı en-boy oranını KORUYARAK en uzun kenarı 640 px olacak
 * şekilde küçültür (kırpma ve germe yok). Görüntü yuvarlak alanda
 * object-fit: cover ile gösterilir; dikey odak ayarlanabilir.
 */
export function resizeImage(file: File, maxSide = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Lütfen bir görsel dosyası seç.'));
    if (file.size > 15 * 1024 * 1024) return reject(new Error('Görsel 15 MB’tan büyük olamaz.'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Görsel işlenemedi.'));
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Görsel okunamadı.'));
    };
    img.src = url;
  });
}
