import { STORAGE_KEYS } from '@/constants';
import { secureStorage } from '@/lib/storage/secure-storage';

export interface StoredAuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setTokens({ accessToken, refreshToken }: StoredAuthTokens): Promise<void> {
    try {
      if (refreshToken) {
        await secureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      } else {
        await secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      }

      await secureStorage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    } catch (error) {
      await Promise.allSettled([
        secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN),
        secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
      throw error;
    }
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN),
      secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },
};
