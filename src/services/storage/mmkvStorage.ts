import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({
  id: 'scheduler-app-storage',
});

export const mmkvStorage = {
  get(key: string): string | undefined {
    return storage.getString(key);
  },

  set(key: string, value: string): void {
    storage.set(key, value);
  },

  remove(key: string): void {
    storage.remove(key);
  },

  clearAll(): void {
    storage.clearAll();
  },
};
