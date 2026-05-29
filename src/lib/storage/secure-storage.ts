import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  },
};
