import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';
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
    router.replace(onboardingRoutes.intro);
  };

  const handleUiPrimitivesOpen = () => {
    router.push('/settings-ui-primitives');
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
      setLogoutError(t('settings.logoutError'));
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="titleL">{t('settings.title')}</Typography>
      <View style={styles.actions}>
        {__DEV__ ? (
          <>
            <Button
              label={t('settings.openUiPrimitives')}
              disabled={isLoggingOut}
              onPress={handleUiPrimitivesOpen}
            />
            <Button
              label={t('settings.resetOnboarding')}
              disabled={isLoggingOut}
              onPress={handleOnboardingReset}
            />
          </>
        ) : null}
        <Button
          label={isLoggingOut ? t('settings.loggingOut') : t('settings.logout')}
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
