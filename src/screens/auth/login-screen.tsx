import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { SocialLoginButton } from '@/components/features/auth/social-login-button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { HomeIndicator } from '@/components/ui/Footer';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import {
  getSocialLoginErrorMessage,
  loginWithGoogle,
  loginWithKakao,
} from '@/domains/auth/social-login';
import { onboardingRoutes } from '@/domains/onboarding/routes';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { t } from '@/lib/i18n';

import type { SocialProvider } from '@/domains/auth/model';

const loginBackground = require('../../../assets/login-background.jpg');

export function LoginScreen() {
  const router = useRouter();
  const setOnboardingCompleted = useOnboardingStore((state) => state.setOnboardingCompleted);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false);
  const [isKakaoLoginLoading, setIsKakaoLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSocialLoginLoading = isGoogleLoginLoading || isKakaoLoginLoading;

  const handleUnavailableLogin = () => {
    setErrorMessage(t('auth.login.unavailable'));
  };

  const handleTermsPress = (type: 'service' | 'privacy') => {
    router.push({
      pathname: '/terms',
      params: { type },
    });
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    if (isSocialLoginLoading) {
      return;
    }

    const setLoading = provider === 'kakao' ? setIsKakaoLoginLoading : setIsGoogleLoginLoading;
    const login = provider === 'kakao' ? loginWithKakao : loginWithGoogle;

    setLoading(true);
    setErrorMessage(null);

    try {
      const session = await login();
      const hasCompletedOnboarding = session.hasCompletedOnboarding === true;

      setOnboardingCompleted(hasCompletedOnboarding);
      router.replace(hasCompletedOnboarding ? '/(tabs)' : onboardingRoutes.intro);
    } catch (error) {
      setErrorMessage(getSocialLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Image source={loginBackground} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <ScreenLayout
        backgroundColor="transparent"
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
              disabled={isSocialLoginLoading}
              onPress={handleUnavailableLogin}
            />
            <SocialLoginButton
              provider="google"
              label={isGoogleLoginLoading ? t('auth.login.loading') : t('auth.login.google')}
              disabled={isSocialLoginLoading}
              onPress={() => void handleSocialLogin('google')}
            />
            <SocialLoginButton
              provider="kakao"
              label={isKakaoLoginLoading ? t('auth.login.loading') : t('auth.login.kakao')}
              disabled={isSocialLoginLoading}
              onPress={() => void handleSocialLogin('kakao')}
            />
            {isSocialLoginLoading ? (
              <ActivityIndicator
                accessibilityLabel={t('auth.login.loadingAccessibilityLabel')}
                color={colors.gray[800]}
                style={styles.loadingIndicator}
              />
            ) : null}
          </View>
          {errorMessage ? (
            <Typography
              variant="bodyS"
              color={colors.secondary}
              align="center"
              accessibilityLiveRegion="polite"
            >
              {errorMessage}
            </Typography>
          ) : null}
          <View style={styles.termsBlock}>
            <Typography
              variant="caption"
              color={colors.gray[600]}
              align="center"
              style={styles.terms}
            >
              {t('auth.login.termsNotice')}
            </Typography>
            <View style={styles.termsLinks}>
              <Pressable
                accessibilityLabel={t('terms.service.title')}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => handleTermsPress('service')}
              >
                <Typography variant="caption" color={colors.gray[700]} style={styles.termsLink}>
                  {t('terms.service.link')}
                </Typography>
              </Pressable>
              <Pressable
                accessibilityLabel={t('terms.privacy.title')}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => handleTermsPress('privacy')}
              >
                <Typography variant="caption" color={colors.gray[700]} style={styles.termsLink}>
                  {t('terms.privacy.link')}
                </Typography>
              </Pressable>
            </View>
          </View>
        </View>
      </ScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.onboardingBackground,
  },
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
  loadingIndicator: {
    position: 'absolute',
    right: spacing[4],
    bottom: 20,
  },
  terms: {
    width: '100%',
  },
  termsBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing[2],
  },
  termsLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});
