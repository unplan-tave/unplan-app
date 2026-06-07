import { useAuthStore } from '@/features/auth/use-auth-store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setSession = useAuthStore((state) => state.setSession);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    setUser,
    setToken,
    setSession,
    hydrateSession,
    logout,
  };
}
