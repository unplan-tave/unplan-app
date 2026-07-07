import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useMemberProfileQuery } from '@/domains/member/api/queries';
import { onboardingRoutes } from '@/domains/onboarding/routes';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { useAuth } from '@/hooks/use-auth';
import { SplashScreen } from '@/screens/onboarding/splash-screen';

export default function IndexRoute() {
  const router = useRouter();
  const { hasHydratedSession, isAuthenticated } = useAuth();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const setOnboardingCompleted = useOnboardingStore((state) => state.setOnboardingCompleted);
  const profileQuery = useMemberProfileQuery({
    enabled: hasHydratedSession && isAuthenticated,
  });
  const hasNavigatedRef = useRef(false);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    if (profileQuery.data == null) {
      return;
    }

    setOnboardingCompleted(profileQuery.data.hasCompletedOnboarding);
  }, [profileQuery.data, setOnboardingCompleted]);

  useEffect(() => {
    if (!isSplashDone || !hasHydratedSession || hasNavigatedRef.current) {
      return;
    }

    if (!isAuthenticated) {
      hasNavigatedRef.current = true;
      router.replace('/login');
      return;
    }

    if (profileQuery.isLoading) {
      return;
    }

    const isOnboardingCompleted =
      profileQuery.data?.hasCompletedOnboarding ?? hasCompletedOnboarding;

    if (!isOnboardingCompleted) {
      hasNavigatedRef.current = true;
      router.replace(onboardingRoutes.intro);
      return;
    }

    hasNavigatedRef.current = true;
    router.replace('/(tabs)');
  }, [
    hasCompletedOnboarding,
    hasHydratedSession,
    isAuthenticated,
    isSplashDone,
    profileQuery.data?.hasCompletedOnboarding,
    profileQuery.isLoading,
    router,
  ]);

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
