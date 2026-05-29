import { produce } from 'immer';
import { create } from 'zustand';

import type { User } from '@/features/auth/model';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
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
      }),
    ),

  logout: () =>
    set(
      produce((state: AuthState) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }),
    ),
}));
