import { produce } from 'immer';
import { create } from 'zustand';

import { registerAuthSessionHandlers } from '@/lib/auth/auth-session-controller';
import { clearClientSessionState } from '@/lib/auth/client-session-state';
import { tokenStorage } from '@/lib/auth/token-storage';
import { getDeviceId } from '@/lib/device/device-id';

import { submitLogout } from './api/client';

import type { AuthSession } from './model';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  hasHydratedSession: boolean;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => Promise<void>;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  refreshToken: null,
  hasHydratedSession: false,
  isAuthenticated: false,

  setSession: async (session: AuthSession) => {
    clearClientSessionState();

    await tokenStorage.setTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });

    set(
      produce((state: AuthState) => {
        state.token = session.accessToken;
        state.refreshToken = session.refreshToken ?? null;
        state.hasHydratedSession = true;
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
        state.hasHydratedSession = true;
        state.isAuthenticated = Boolean(accessToken);
      }),
    );
  },

  clearSession: async () => {
    await tokenStorage.clearTokens();
    clearClientSessionState();

    set(
      produce((state: AuthState) => {
        state.token = null;
        state.refreshToken = null;
        state.hasHydratedSession = true;
        state.isAuthenticated = false;
      }),
    );
  },

  logout: async () => {
    try {
      const deviceId = await getDeviceId();
      await submitLogout({ deviceId });
    } catch (error: unknown) {
      console.error('Failed to logout on server.', error);
    } finally {
      await useAuthStore.getState().clearSession();
    }
  },
}));

registerAuthSessionHandlers({
  setSession: async (session) => useAuthStore.getState().setSession(session),
  clearSession: async () => useAuthStore.getState().clearSession(),
});
