/**
 * schedule 생성/수정 form의 제출 가능 여부를 판단하는 순수 검증입니다.
 * pin/queue 카드 타입별 필수 입력 규칙을 화면 컴포넌트 밖에 둡니다.
 */
import {
  hasDueDate,
  hasQueueDurationOrUnknown,
  isQueueFormComplete,
} from '@/domains/schedule/queue';

import type { CardFormValues, CardTab } from '@/domains/schedule/model';

interface CardCreateValidationInput {
  activeTab: CardTab;
  hasSubmitted: boolean;
  title: string;
  dateMode: CardFormValues['dateMode'];
  timeFilled: boolean;
  dueDate: string;
  durationHours: number;
  durationMinutes: number;
  durationUnknown: boolean;
  hasTitleError: boolean;
  hasDateModeError: boolean;
  hasTimeFilledError: boolean;
}

export function getCardCreateValidation(input: CardCreateValidationInput) {
  const {
    activeTab,
    hasSubmitted,
    title,
    dateMode,
    timeFilled,
    dueDate,
    durationHours,
    durationMinutes,
    durationUnknown,
    hasTitleError,
    hasDateModeError,
    hasTimeFilledError,
  } = input;

  const isTitleMissing = title.trim().length === 0;
  const isDateMissing = dateMode === 'empty';
  const isTimeMissing = !timeFilled;
  const isDueMissing = !hasDueDate(dueDate);
  const isDurationMissing = !hasQueueDurationOrUnknown(
    durationHours,
    durationMinutes,
    durationUnknown,
  );
  const isPinRequiredComplete = !isTitleMissing && !isDateMissing && !isTimeMissing;
  const isQueueRequiredComplete = isQueueFormComplete({
    title,
    dueDate,
    durationHours,
    durationMinutes,
    durationUnknown,
  });
  const isRequiredComplete =
    activeTab === 'queue' ? isQueueRequiredComplete : isPinRequiredComplete;

  return {
    isRequiredComplete,
    shouldShowTitleError: hasSubmitted && (hasTitleError || isTitleMissing),
    shouldShowDateError: activeTab === 'pin' && hasSubmitted && (hasDateModeError || isDateMissing),
    shouldShowTimeError:
      activeTab === 'pin' && hasSubmitted && (hasTimeFilledError || isTimeMissing),
    shouldShowDueError: activeTab === 'queue' && hasSubmitted && isDueMissing,
    shouldShowDurationError: activeTab === 'queue' && hasSubmitted && isDurationMissing,
  };
}
