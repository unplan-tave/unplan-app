import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { SplashScreen } from '@/screens/onboarding/splash-screen';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';

export default function IndexRoute() {
  const router = useRouter();
  const { hasHydratedSession, isAuthenticated } = useAuth();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const hydrateOnboarding = useOnboardingStore((state) => state.hydrateOnboarding);

  useEffect(() => {
    hydrateOnboarding();
  }, [hydrateOnboarding]);

  const handleSplashFinish = useCallback(() => {
    if (!hasHydratedSession) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!hasCompletedOnboarding) {
      router.replace(onboardingRoutes.recovery);
      return;
    }

    router.replace('/(tabs)');
  }, [hasCompletedOnboarding, hasHydratedSession, isAuthenticated, router]);

  if (!hasHydratedSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator accessibilityLabel="로그인 상태 확인 중" color={colors.primary} />
      </View>
    );
  }

  return <SplashScreen onFinish={handleSplashFinish} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
