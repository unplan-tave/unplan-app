import { Config } from '@/constants/config';

const prefix = Config.isDemo ? 'unplan-chatbot-demo:' : 'scheduler-app-storage:';
const memory = new Map<string, string>();

export const mmkvStorage = {
  get(key: string): string | undefined {
    return typeof localStorage === 'undefined'
      ? memory.get(key)
      : (localStorage.getItem(prefix + key) ?? undefined);
  },
  set(key: string, value: string): void {
    if (typeof localStorage === 'undefined') memory.set(key, value);
    else localStorage.setItem(prefix + key, value);
  },
  remove(key: string): void {
    if (typeof localStorage === 'undefined') memory.delete(key);
    else localStorage.removeItem(prefix + key);
  },
  clearAll(): void {
    memory.clear();
    if (typeof localStorage !== 'undefined') {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => localStorage.removeItem(key));
    }
  },
};
