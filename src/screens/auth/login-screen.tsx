import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SocialLoginButton } from '@/components/auth/social-login-button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { HomeIndicator } from '@/components/ui/Footer';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/lib/i18n';
import { onboardingRoutes } from '@/state/onboarding/routes';

export function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSocialLogin = (provider: 'apple' | 'google' | 'kakao') => {
    setUser({
      id: `${provider}-preview-user`,
      email: `${provider}@unplan.local`,
      name: 'Unplan User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.replace(onboardingRoutes.recovery);
  };

  return (
    <ScreenLayout
      backgroundColor="#BFDDF2"
      contentStyle={styles.content}
      footer={<HomeIndicator />}
    >
      <View style={styles.logoArea}>
        <BrandLogo />
      </View>
      <View style={styles.bottomArea}>
        <View style={styles.buttonGroup}>
          <SocialLoginButton
            provider="apple"
            label={t('auth.login.apple')}
            onPress={() => handleSocialLogin('apple')}
          />
          <SocialLoginButton
            provider="google"
            label={t('auth.login.google')}
            onPress={() => handleSocialLogin('google')}
          />
          <SocialLoginButton
            provider="kakao"
            label={t('auth.login.kakao')}
            onPress={() => handleSocialLogin('kakao')}
          />
        </View>
        <Typography variant="caption" color={colors.gray[600]} align="center" style={styles.terms}>
          {t('auth.login.termsNotice')}
        </Typography>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 112,
    paddingHorizontal: spacing[5],
  },
  logoArea: {
    paddingTop: 63,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 26,
    gap: 60,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  terms: {
    width: '100%',
  },
});
