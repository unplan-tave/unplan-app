/** 수면 조건 설정 화면의 온보딩 store와 다음 단계 이동을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { onboardingRoutes } from '@/domains/onboarding/routes';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';

/** 수면 조건 화면이 렌더링에 사용할 설정과 이벤트를 반환합니다. */
export function useSleepScreen() {
  const router = useRouter();
  const preferences = useOnboardingStore((state) => state.preferences);
  const setTargetSleepMinutes = useOnboardingStore((state) => state.setTargetSleepMinutes);
  const setSleepConditionThresholds = useOnboardingStore(
    (state) => state.setSleepConditionThresholds,
  );

  /** 활동 시간 설정 단계로 이동합니다. */
  const handleConfirm = useCallback(() => {
    router.push(onboardingRoutes.activity);
  }, [router]);

  return { preferences, setTargetSleepMinutes, setSleepConditionThresholds, handleConfirm };
}
