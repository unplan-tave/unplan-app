import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/use-auth';

export default function IndexRoute() {
  const { hasHydratedSession, isAuthenticated } = useAuth();

  if (!hasHydratedSession) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
