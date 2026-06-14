import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { SocialLoginButton } from '@/components/auth/social-login-button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { HomeIndicator } from '@/components/ui/Footer';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';
import { getSocialLoginErrorMessage, loginWithKakao } from '@/state/auth/social-login';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';

const loginBackground = require('../../../assets/login-background.jpg');

export function LoginScreen() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const [isKakaoLoginLoading, setIsKakaoLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUnavailableLogin = () => {
    setErrorMessage('아직 지원하지 않는 로그인 방식입니다.');
  };

  const handleKakaoLogin = async () => {
    if (isKakaoLoginLoading) {
      return;
    }

    setIsKakaoLoginLoading(true);
    setErrorMessage(null);

    try {
      await loginWithKakao();
      router.replace(hasCompletedOnboarding ? '/(tabs)' : onboardingRoutes.recovery);
    } catch (error) {
      setErrorMessage(getSocialLoginErrorMessage(error));
    } finally {
      setIsKakaoLoginLoading(false);
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
              disabled={isKakaoLoginLoading}
              onPress={handleUnavailableLogin}
            />
            <SocialLoginButton
              provider="google"
              label={t('auth.login.google')}
              disabled={isKakaoLoginLoading}
              onPress={handleUnavailableLogin}
            />
            <SocialLoginButton
              provider="kakao"
              label={isKakaoLoginLoading ? '로그인 중' : t('auth.login.kakao')}
              disabled={isKakaoLoginLoading}
              onPress={handleKakaoLogin}
            />
            {isKakaoLoginLoading ? (
              <ActivityIndicator
                accessibilityLabel="카카오 로그인 처리 중"
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
          <Typography
            variant="caption"
            color={colors.gray[600]}
            align="center"
            style={styles.terms}
          >
            {t('auth.login.termsNotice')}
          </Typography>
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
});
