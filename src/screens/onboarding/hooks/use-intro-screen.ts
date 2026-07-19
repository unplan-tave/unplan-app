/** 온보딩 소개 화면의 단계 이동과 Android 뒤로가기를 관리합니다. */
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { BackHandler } from 'react-native';

import { onboardingRoutes } from '@/domains/onboarding/routes';

const STEP_COUNT = 4;

/** 소개 route 파라미터를 유효한 0 기반 단계로 변환합니다. */
function getInitialStepIndex(step: string | undefined): number {
  const parsedStep = Number(step);
  return Number.isInteger(parsedStep) ? Math.min(STEP_COUNT - 1, Math.max(0, parsedStep)) : 0;
}

/** 소개 화면이 사용할 현재 단계와 이동 이벤트를 반환합니다. */
export function useIntroScreen() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step?: string }>();
  const [stepIndex, setStepIndex] = useState(() => getInitialStepIndex(step));
  const progressDots = useMemo(() => Array.from({ length: STEP_COUNT }, (_, index) => index), []);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEP_COUNT - 1;

  /** 현재 단계보다 한 단계 이전으로 이동합니다. */
  const handleBack = useCallback(() => {
    setStepIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (stepIndex <= 0) return false;
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [handleBack, stepIndex]),
  );

  /** 선택한 소개 단계로 이동합니다. */
  const handleStepSelect = useCallback((nextStepIndex: number) => setStepIndex(nextStepIndex), []);

  /** 다음 소개 단계 또는 회복 수단 설정 단계로 이동합니다. */
  const handleNext = useCallback(() => {
    if (isLastStep) {
      router.replace(onboardingRoutes.recovery);
      return;
    }
    setStepIndex((currentIndex) => currentIndex + 1);
  }, [isLastStep, router]);

  return {
    stepIndex,
    progressDots,
    isFirstStep,
    isLastStep,
    handleBack,
    handleNext,
    handleStepSelect,
  };
}
