/** 컨디션 화면의 하위 화면 hook과 safe area를 조합합니다. */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConditionRecommendation } from './use-condition-recommendation';
import { useConditionView } from './use-condition-view';

/** 컨디션 화면 전체에 필요한 상태와 이벤트를 반환합니다. */
export function useConditionScreen() {
  const insets = useSafeAreaInsets();
  const view = useConditionView();
  const recommendation = useConditionRecommendation(view.selectedDate);
  /** 컨디션·수면 기록 내역 전체 화면으로 이동합니다. */
  const openRecordScreen = useCallback(() => {
    router.push({ pathname: '/sleep/record', params: { tab: 'bodyMind' } });
  }, []);

  return {
    insets,
    view,
    recommendation,
    openRecordScreen,
  };
}
