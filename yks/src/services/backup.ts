import { restoreBackup } from './backupRestore';
import { writeAssetBatch } from './imageDb';
import { getTeacherPhoto, photoChanged } from './photoStore';
import { migrationContext, parseBackup } from '../store/storage';
import { getState, replaceStatePersisted } from '../store/store';

export const MAX_BACKUP_BYTES = 64 * 1024 * 1024;

export async function restoreBackupFile(file: File) {
  if (file.size > MAX_BACKUP_BYTES) throw new Error('Yedek dosyası 64 MB’tan büyük olamaz.');
  const parsed = parseBackup(await file.text(), migrationContext());
  await restoreBackup(parsed.state, parsed.notebookImages, parsed.teacherPhoto, getState(), {
    readPhoto: getTeacherPhoto,
    stageAssets: (images, photo) => writeAssetBatch(images, photo),
    rollbackAssets: (ids, photo) => writeAssetBatch({}, photo, ids),
    commitState: replaceStatePersisted,
    cleanupImages: (ids) => writeAssetBatch({}, undefined, ids),
  });
  photoChanged();
  return {
    report: parsed.report,
    restoredDrawings: parsed.state.notebookPages.filter((page) => !!parsed.notebookImages[page.id]).length,
  };
}
