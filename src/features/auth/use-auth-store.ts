import { produce } from 'immer';
import { create } from 'zustand';

import { tokenStorage } from '@/lib/auth/token-storage';

import type { AuthSession, User } from '@/features/auth/model';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setSession: (session: AuthSession) => Promise<void>;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  setUser: (user: User) =>
    set(
      produce((state: AuthState) => {
        state.user = user;
        state.isAuthenticated = true;
      }),
    ),

  setToken: (token: string) =>
    set(
      produce((state: AuthState) => {
        state.token = token;
        state.isAuthenticated = true;
      }),
    ),

  setSession: async (session: AuthSession) => {
    await tokenStorage.setTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });

    set(
      produce((state: AuthState) => {
        state.user = session.user ?? null;
        state.token = session.accessToken;
        state.refreshToken = session.refreshToken ?? null;
        state.isAuthenticated = true;
      }),
    );
  },

  hydrateSession: async () => {
    const [accessToken, refreshToken] = await Promise.all([
      tokenStorage.getAccessToken(),
      tokenStorage.getRefreshToken(),
    ]);

    set(
      produce((state: AuthState) => {
        state.token = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = Boolean(accessToken);
      }),
    );
  },

  logout: async () => {
    await tokenStorage.clearTokens();

    set(
      produce((state: AuthState) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      }),
    );
  },
}));
