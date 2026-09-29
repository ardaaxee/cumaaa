import { describe, expect, it } from 'vitest';
import { clearAppData, createBackup, LEGACY_KEY, parseBackup, STORAGE_KEY } from '../src/store/storage';
import { defaultState } from '../src/store/schema';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

describe('clearAppData', () => {
  it('yalnız YKS anahtarlarını siler ve aynı origin üzerindeki başka veriyi korur', async () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, '{}');
    storage.setItem(LEGACY_KEY, '{}');
    storage.setItem('iyikiYks.teacherPhoto', 'data:image/jpeg;base64,x');
    storage.setItem('baska-proje.settings', 'keep-me');

    await clearAppData(storage);

    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_KEY)).toBeNull();
    expect(storage.getItem('iyikiYks.teacherPhoto')).toBeNull();
    expect(storage.getItem('baska-proje.settings')).toBe('keep-me');
    it('defter çizimlerini yedek dosyasında korur', () => {
    const state = defaultState();
    const image = 'data:image/png;base64,abc123';
    const backup = createBackup(state, null, { note1: image });
    const parsed = parseBackup(JSON.stringify(backup));

    expect(parsed.notebookImages.note1).toBe(image);
    expect(parsed.state.schemaVersion).toBe(state.schemaVersion);
  });
});
});
