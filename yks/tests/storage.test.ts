import { describe, expect, it } from 'vitest';
import { clearAppData, createBackup, LEGACY_KEY, parseBackup, STORAGE_KEY, RECOVERY_KEY, loadState, saveState } from '../src/store/storage';
import { defaultState } from '../src/store/schema';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

describe('YKS storage safety', () => {
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
  });

  it('defter çizimlerini yedek dosyasında korur', () => {
    const state = defaultState();
    const image = 'data:image/png;base64,abc123';
    const backup = createBackup(state, null, { note1: image });
    const parsed = parseBackup(JSON.stringify(backup));

    expect(parsed.notebookImages.note1).toBe(image);
    expect(parsed.state.schemaVersion).toBe(state.schemaVersion);
  });
});

describe('automatic storage recovery',()=>{
 const context={topics:[]};
 it('recovers the previous committed profile when the primary JSON is corrupt',()=>{
   const storage=new MemoryStorage();const first=defaultState();first.profile.name='Zeynep';
   expect(saveState(first,storage)).toBe(true);
   const second={...first,profile:{...first.profile,name:'Yeni kayıt'}};
   expect(saveState(second,storage)).toBe(true);
   storage.setItem(STORAGE_KEY,'{broken');
   const loaded=loadState(storage,context);
   expect(loaded.recovered).toBe(true);expect(loaded.error).toBeNull();expect(loaded.state.profile.name).toBe('Zeynep');
   expect(saveState(loaded.state,storage)).toBe(true);
   expect(JSON.parse(storage.getItem(RECOVERY_KEY)!).profile.name).toBe('Zeynep');
 });
 it('does not report success without storage',()=>{expect(saveState(defaultState(),undefined)).toBe(false);});
 it('keeps primary writes working when recovery storage is full',()=>{
   const storage=new MemoryStorage();saveState(defaultState(),storage);
   const original=storage.setItem.bind(storage);storage.setItem=(key,value)=>{if(key===RECOVERY_KEY)throw new Error('Quota');original(key,value);};
   const state=defaultState();state.profile.name='Kaydedildi';
   expect(saveState(state,storage)).toBe(true);expect(loadState(storage,context).state.profile.name).toBe('Kaydedildi');
 });
 it('does not silently treat an unrecognized record as a new account',()=>{
   const storage=new MemoryStorage();storage.setItem(STORAGE_KEY,'{}');expect(loadState(storage,context).error).toBeTruthy();
 });
});
