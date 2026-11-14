import { Config } from '@/constants/config';

import type * as MMKV from 'react-native-mmkv';

const demoStorage = new Map<string, string>();
const createMMKV = () => {
  const mmkv = require('react-native-mmkv') as typeof MMKV;
  return mmkv.createMMKV({ id: 'scheduler-app-storage' });
};

const storage = Config.isDemo
  ? {
      getString: (key: string) => demoStorage.get(key),
      set: (key: string, value: string) => {
        demoStorage.set(key, value);
      },
      remove: (key: string) => {
        demoStorage.delete(key);
      },
      clearAll: () => {
        demoStorage.clear();
      },
    }
  : createMMKV();

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
