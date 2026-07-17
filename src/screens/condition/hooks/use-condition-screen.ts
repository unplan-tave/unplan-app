/** 컨디션 화면의 하위 화면 hook과 safe area를 조합합니다. */
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConditionRecommendation } from './use-condition-recommendation';
import { useConditionRecordForm } from './use-condition-record-form';
import { useConditionView } from './use-condition-view';

/** 컨디션 화면 전체에 필요한 상태와 이벤트를 반환합니다. */
export function useConditionScreen() {
  const insets = useSafeAreaInsets();
  const view = useConditionView();
  const recommendation = useConditionRecommendation(view.selectedDate);
  const conditionRecordForm = useConditionRecordForm(view.selectedDate, view.conditionRecord);

  return {
    insets,
    view,
    recommendation,
    conditionRecordForm,
  };
}
