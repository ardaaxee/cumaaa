/**
 * Dijital defter sayfalarının çizim verisi (PNG data URL) IndexedDB'de saklanır.
 * Meta bilgiler (başlık, ders, tarih) ana durumda (localStorage) tutulur.
 */
import { imageRequest } from './imageDb';

export async function getPageImageStrict(id: string): Promise<string | null> {
  const value = await imageRequest<string | undefined>('notebook', 'readonly', (store) => store.get(id));
  return typeof value === 'string' ? value : null;
}

export async function getPageImage(id: string): Promise<string | null> {
  try {
    return await getPageImageStrict(id);
  } catch {
    return null;
  }
}

export async function setPageImage(id: string, dataUrl: string): Promise<void> {
  await imageRequest('notebook', 'readwrite', (s) => s.put(dataUrl, id));
}

export async function deletePageImage(id: string): Promise<void> {
  try {
    await imageRequest('notebook', 'readwrite', (s) => s.delete(id));
  } catch {
    /* sayfa zaten yoksa sorun değil */
  }
}
