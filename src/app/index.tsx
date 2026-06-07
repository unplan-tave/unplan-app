import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { SplashScreen } from '@/screens/onboarding/splash-screen';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';

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
