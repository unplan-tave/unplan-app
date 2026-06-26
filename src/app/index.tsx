import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const hasNavigatedRef = useRef(false);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    if (!isSplashDone || !hasHydratedSession || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!hasCompletedOnboarding) {
      router.replace(onboardingRoutes.intro);
      return;
    }

    router.replace('/(tabs)');
  }, [hasCompletedOnboarding, hasHydratedSession, isAuthenticated, isSplashDone, router]);

  const handleSplashFinish = useCallback(() => {
    setIsSplashDone(true);
  }, []);

  if (!isSplashDone) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (!hasHydratedSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator accessibilityLabel="로그인 상태 확인 중" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator accessibilityLabel="초기 화면 이동 중" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
