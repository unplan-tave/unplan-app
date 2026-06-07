import { useAuthStore } from '@/features/auth/use-auth-store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const hasHydratedSession = useAuthStore((state) => state.hasHydratedSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    token,
    refreshToken,
    hasHydratedSession,
    isAuthenticated,
    setSession,
    hydrateSession,
    logout,
  };
}
