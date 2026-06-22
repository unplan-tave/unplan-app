import { useAuthStore } from '@/state/auth/use-auth-store';

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const hasHydratedSession = useAuthStore((state) => state.hasHydratedSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const logout = useAuthStore((state) => state.logout);

  return {
    token,
    refreshToken,
    hasHydratedSession,
    isAuthenticated,
    setSession,
    hydrateSession,
    logout,
  };
}
