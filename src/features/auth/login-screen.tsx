import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

import { getSocialLoginErrorMessage, loginWithKakao } from './social-login';

export function LoginScreen() {
  const [isKakaoLoginLoading, setIsKakaoLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleKakaoLogin = async () => {
    if (isKakaoLoginLoading) {
      return;
    }

    setIsKakaoLoginLoading(true);
    setErrorMessage(null);

    try {
      await loginWithKakao();
    } catch (error) {
      setErrorMessage(getSocialLoginErrorMessage(error));
    } finally {
      setIsKakaoLoginLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="titleL" align="center">
          로그인
        </Typography>

        <View style={styles.socialLoginGroup}>
          <Button
            label={isKakaoLoginLoading ? '로그인 중' : '카카오로 로그인'}
            disabled={isKakaoLoginLoading}
            fullWidth
            accessibilityLabel="카카오로 로그인"
            onPress={handleKakaoLogin}
            style={styles.kakaoButton}
            textStyle={styles.kakaoButtonText}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing[6],
  },
  content: {
    width: '100%',
    gap: spacing[8],
  },
  socialLoginGroup: {
    gap: spacing[3],
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
  },
  kakaoButtonText: {
    color: '#000000',
  },
  loadingIndicator: {
    position: 'absolute',
    right: spacing[4],
    top: 10,
  },
});
