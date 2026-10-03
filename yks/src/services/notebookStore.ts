/**
 * Dijital defter sayfalarının çizim verisi (PNG data URL) IndexedDB'de saklanır.
 * Meta bilgiler (başlık, ders, tarih) ana durumda (localStorage) tutulur.
 */
const DB_NAME = 'iyiki-yks';
const STORE = 'notebook';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB yok'));
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
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
        let result: T;
        req.onsuccess = () => { result = req.result; };
        req.onerror = () => reject(req.error);
        t.oncomplete = () => { db.close(); resolve(result); };
        t.onabort = () => { db.close(); reject(t.error ?? new Error('Defter kaydı tamamlanamadı')); };
        t.onerror = () => { db.close(); reject(t.error); };
      }),
  );
}

export async function getPageImage(id: string): Promise<string | null> {
  const v = await tx<string | undefined>('readonly', (s) => s.get(id) as IDBRequest<string | undefined>);
  return typeof v === 'string' ? v : null;
}

export async function setPageImage(id: string, dataUrl: string): Promise<void> {
  await tx('readwrite', (s) => s.put(dataUrl, id));
}

export async function deletePageImage(id: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(id));
  } catch {
    /* sayfa zaten yoksa sorun değil */
  }
}
