/** 로그인 화면의 소셜 인증, 오류 메시지, 약관 이동을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  getSocialLoginErrorMessage,
  loginWithGoogle,
  loginWithKakao,
} from '@/domains/auth/social-login';
import { onboardingRoutes } from '@/domains/onboarding/routes';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';

import type { SocialProvider } from '@/domains/auth/model';

type TermsAgreementType = 'service' | 'privacy';

/** 로그인 화면이 렌더링에 사용할 상태와 이벤트를 반환합니다. */
export function useLoginScreen() {
  const router = useRouter();
  const setOnboardingCompleted = useOnboardingStore((state) => state.setOnboardingCompleted);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false);
  const [isKakaoLoginLoading, setIsKakaoLoginLoading] = useState(false);
  const [isTermsSheetVisible, setIsTermsSheetVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSocialLoginLoading = isGoogleLoginLoading || isKakaoLoginLoading;

  /** 선택한 약관 화면으로 이동합니다. */
  const handleTermsPress = useCallback(
    (type: TermsAgreementType) => {
      setIsTermsSheetVisible(false);
      router.push({ pathname: '/terms', params: { type } });
    },
    [router],
  );

  const openTermsSheet = useCallback(() => setIsTermsSheetVisible(true), []);
  const closeTermsSheet = useCallback(() => setIsTermsSheetVisible(false), []);

  /** 공급자별 native 로그인을 수행하고 온보딩 완료 여부에 따라 다음 화면으로 이동합니다. */
  const handleSocialLogin = useCallback(
    async (provider: SocialProvider) => {
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
    },
    [isSocialLoginLoading, router, setOnboardingCompleted],
  );

  return {
    errorMessage,
    isGoogleLoginLoading,
    isKakaoLoginLoading,
    isSocialLoginLoading,
    isTermsSheetVisible,
    handleSocialLogin,
    handleTermsPress,
    openTermsSheet,
    closeTermsSheet,
  };
}
