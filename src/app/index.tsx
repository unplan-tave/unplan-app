import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { onboardingRoutes } from '@/features/onboarding/routes';
import { SplashScreen } from '@/features/onboarding/splash-screen';
import { useOnboardingStore } from '@/features/onboarding/use-onboarding-store';

export default function IndexRoute() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const hydrateOnboarding = useOnboardingStore((state) => state.hydrateOnboarding);

  useEffect(() => {
    hydrateOnboarding();
  }, [hydrateOnboarding]);

  const handleSplashFinish = useCallback(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!hasCompletedOnboarding) {
      router.replace(onboardingRoutes.recovery);
      return;
    }

    router.replace('/(tabs)');
  }, [hasCompletedOnboarding, isAuthenticated, router]);

  return <SplashScreen onFinish={handleSplashFinish} />;
}
