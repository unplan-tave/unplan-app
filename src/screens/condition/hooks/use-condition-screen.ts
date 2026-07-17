/** 컨디션 화면의 하위 화면 hook과 safe area·GNB 이벤트를 조합합니다. */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabNavigation } from '@/hooks/use-tab-navigation';

import { useConditionRecommendation } from './use-condition-recommendation';
import { useConditionRecordForm } from './use-condition-record-form';
import { useConditionView } from './use-condition-view';

/** 컨디션 화면 전체에 필요한 상태와 이벤트를 반환합니다. */
export function useConditionScreen() {
  const insets = useSafeAreaInsets();
  const view = useConditionView();
  const recommendation = useConditionRecommendation(view.selectedDate);
  const conditionRecordForm = useConditionRecordForm(view.selectedDate, view.conditionRecord);
  const handleNavChange = useTabNavigation();
  /** 카드 생성 화면으로 이동합니다. */
  const handleCreateCard = useCallback(() => router.push('/card/new'), []);

  return { insets, view, recommendation, conditionRecordForm, handleNavChange, handleCreateCard };
}
