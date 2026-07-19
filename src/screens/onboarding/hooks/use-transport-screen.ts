/** 교통수단 설정 화면의 선택 상태와 온보딩 제출을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { t } from '@/lib/i18n';

const HOME_WITH_NOTIFICATION_PROMPT = {
  pathname: '/(tabs)',
  params: { onboardingNotification: '1' },
} as const;

const transportOptions = [
  { id: 'walk', label: t('onboarding.transport.walk'), icon: '🚶' },
  { id: 'bicycle', label: t('onboarding.transport.bicycle'), icon: '🚲' },
  { id: 'publicTransit', label: t('onboarding.transport.publicTransit'), icon: '🚆' },
  { id: 'car', label: t('onboarding.transport.car'), icon: '🚗' },
] as const;

/** 교통수단 설정 화면이 사용할 store 값과 제출 이벤트를 반환합니다. */
export function useTransportScreen() {
  const router = useRouter();
  const selectedIds = useOnboardingStore((state) => state.preferences.transportOptionIds);
  const toggleTransportOption = useOnboardingStore((state) => state.toggleTransportOption);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const isSubmitting = useOnboardingStore((state) => state.isSubmitting);
  const submissionError = useOnboardingStore((state) => state.submissionError);

  /** 선택한 교통수단을 포함해 온보딩을 저장합니다. */
  const handleConfirm = useCallback(async () => {
    if (isSubmitting) return;
    if (await completeOnboarding()) router.replace(HOME_WITH_NOTIFICATION_PROMPT);
  }, [completeOnboarding, isSubmitting, router]);

  /** 교통수단을 생략하고 온보딩을 저장합니다. */
  const handleSkip = useCallback(async () => {
    if (isSubmitting) return;
    if (await completeOnboarding({ skipTransport: true })) {
      router.replace(HOME_WITH_NOTIFICATION_PROMPT);
    }
  }, [completeOnboarding, isSubmitting, router]);

  return {
    selectedIds,
    toggleTransportOption,
    isSubmitting,
    submissionError,
    transportOptions,
    handleConfirm,
    handleSkip,
  };
}
