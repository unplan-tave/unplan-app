import { useAuthStore } from '@/features/auth/use-auth-store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout,
  };
}
