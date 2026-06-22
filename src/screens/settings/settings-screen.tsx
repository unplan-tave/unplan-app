import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { useAuthStore } from '@/state/auth/use-auth-store';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';

export function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleOnboardingReset = () => {
    resetOnboarding();
    router.replace(onboardingRoutes.recovery);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      router.replace('/login');
    } catch {
      setLogoutError('로그아웃하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="titleL">설정</Typography>
      <View style={styles.actions}>
        {__DEV__ ? (
          <Button label="온보딩 초기화" disabled={isLoggingOut} onPress={handleOnboardingReset} />
        ) : null}
        <Button
          label={isLoggingOut ? '로그아웃 중' : '로그아웃'}
          variant="primary"
          disabled={isLoggingOut}
          onPress={() => void handleLogout()}
        />
        {logoutError ? (
          <Typography
            variant="bodyS"
            color={colors.secondary}
            align="center"
            accessibilityLiveRegion="polite"
          >
            {logoutError}
          </Typography>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[10],
    gap: spacing[8],
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: spacing[3],
  },
});
