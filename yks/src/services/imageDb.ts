type ImageStore = 'files' | 'notebook';

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('Bu tarayıcı defter depolamasını desteklemiyor.'));
    const request = indexedDB.open('iyiki-yks', 2);
    let blocked = false;
    request.onupgradeneeded = () => {
      for (const name of ['files', 'notebook']) {
        if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name);
      }
    };
    request.onblocked = () => {
      blocked = true;
      reject(new Error('Diğer YKS sekmelerini kapatıp tekrar dene.'));
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) { db.close(); return; }
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}

export async function imageRequest<T>(store: ImageStore, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openImageDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    let request: IDBRequest<T>;
    try { request = run(transaction.objectStore(store)); }
    catch (error) { transaction.abort(); db.close(); reject(error); return; }
    // A successful request can still be rolled back (for example when the quota is exceeded).
    transaction.oncomplete = () => { db.close(); resolve(request.result); };
    transaction.onabort = () => { db.close(); reject(transaction.error ?? request.error ?? new Error('Çizim kaydedilemedi.')); };
    transaction.onerror = () => undefined;
  });
}

/** All staged drawings and the photo commit together, or none of them do. */
export async function writeAssetBatch(images: Record<string, string>, photo?: string | null, removeIds: string[] = []): Promise<void> {
  const db = await openImageDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['files', 'notebook'], 'readwrite');
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onabort = () => { db.close(); reject(transaction.error ?? new Error('Yedek çizimleri kaydedilemedi.')); };
    transaction.onerror = () => undefined;
    const notebook = transaction.objectStore('notebook');
    for (const id of removeIds) notebook.delete(id);
    for (const [id, image] of Object.entries(images)) notebook.put(image, id);
    if (photo !== undefined) {
      const files = transaction.objectStore('files');
      if (photo === null) files.delete('teacherPhoto');
      else files.put(photo, 'teacherPhoto');
    }
  });
}
