import type { AppState } from '../store/schema';
import { uid } from '../utils/ids';

interface RestorePorts {
  readPhoto(): Promise<string | null>;
  stageAssets(images: Record<string, string>, photo: string | null): Promise<void>;
  rollbackAssets(ids: string[], photo: string | null): Promise<void>;
  commitState(state: AppState): boolean;
  cleanupImages(ids: string[]): Promise<void>;
}

/** Stage drawings under fresh IDs so a failed import cannot overwrite existing pages. */
export async function restoreBackup(
  incoming: AppState,
  images: Record<string, string>,
  photo: string | null,
  previous: AppState,
  ports: RestorePorts,
): Promise<void> {
  const stagedImages: Record<string, string> = {};
  const notebookPages = incoming.notebookPages.map((page) => {
    const id = uid('note');
    if (images[page.id]) stagedImages[id] = images[page.id];
    return { ...page, id };
  });
  const removedIds = new Set([...previous.notebookPages, ...incoming.notebookPages].map((page) => page.id));
  const deleted = { ...incoming.deleted, ...Object.fromEntries([...removedIds].map((id) => [id, new Date().toISOString()])) };
  const next = { ...incoming, notebookPages, deleted };
  const oldPhoto = await ports.readPhoto();
  await ports.stageAssets(stagedImages, photo);
  try {
    if (!ports.commitState(next)) throw new Error('Yedek kaydedilemedi. Cihaz depolamasında yer açıp tekrar dene.');
  } catch (error) {
    await ports.rollbackAssets(Object.keys(stagedImages), oldPhoto);
    throw error;
  }
  // Cleanup happens only after persistence; failure leaves harmless unused images.
  await ports.cleanupImages(previous.notebookPages.map((page) => page.id)).catch(() => undefined);
}
