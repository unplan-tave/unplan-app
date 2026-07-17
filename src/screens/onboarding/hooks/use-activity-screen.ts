/** 활동 시간 설정 화면의 온보딩 store 선택과 다음 단계 이동을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { onboardingRoutes } from '@/domains/onboarding/routes';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';

/** 활동 시간 설정 화면이 사용할 preferences와 이벤트를 반환합니다. */
export function useActivityScreen() {
  const router = useRouter();
  const preferences = useOnboardingStore((state) => state.preferences);
  const toggleActivityHour = useOnboardingStore((state) => state.toggleActivityHour);

  /** 교통수단 설정 단계로 이동합니다. */
  const handleConfirm = useCallback(() => {
    router.push(onboardingRoutes.transport);
  }, [router]);

  return {
    preferences,
    toggleActivityHour,
    hasSleepTime: preferences.sleepTimeRanges.length > 0,
    handleConfirm,
  };
}
