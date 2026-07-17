import { spacing } from '@/constants/theme';
import {
  type CardFormValues,
  type CardTab,
  getConditionTagById,
  getDateValue,
  getTimeValue,
} from '@/domains/schedule/model';

import type { useCardCreateActions } from './use-card-create-actions';
import type { useCardCreateDraft } from './use-card-create-draft';
import type { useCardCreateScroll } from './use-card-create-scroll';
import type { useCardCreateSheets } from './use-card-create-sheets';
import type { useCardCreateTags } from './use-card-create-tags';
import type { getCardCreateValidation } from '@/domains/schedule/create/validation';
import type { Control } from 'react-hook-form';

interface CreateCardCreateScreenPropsParams {
  control: Control<CardFormValues>;
  activeTab: CardTab;
  values: CardFormValues;
  keyboardHeight: number;
  validation: ReturnType<typeof getCardCreateValidation>;
  draft: ReturnType<typeof useCardCreateDraft>;
  sheets: ReturnType<typeof useCardCreateSheets>;
  actions: ReturnType<typeof useCardCreateActions>;
  scroll: ReturnType<typeof useCardCreateScroll>;
  tagFeedback: ReturnType<typeof useCardCreateTags>['tagFeedback'];
}

/** 카드 생성 화면 JSX에 전달할 props를 조합합니다. */
export function createCardCreateScreenProps({
  control,
  activeTab,
  values,
  keyboardHeight,
  validation,
  draft,
  sheets,
  actions,
  scroll,
  tagFeedback,
}: CreateCardCreateScreenPropsParams) {
  const selectedPersonalTagsById = draft.personalTags.filter((tag) =>
    values.personalTagIds.includes(tag.id),
  );
  const selectedPersonalTagLabels = new Set(selectedPersonalTagsById.map((tag) => tag.label));
  const unmatchedPersonalTags = values.personalTagLabels
    .filter((label) => !selectedPersonalTagLabels.has(label))
    .map((label) => ({
      id: `server-personal-tag:${label}`,
      label,
      createdAt: '',
    }));
  const selectedPersonalTags = [...selectedPersonalTagsById, ...unmatchedPersonalTags];

  return {
    scrollRef: scroll.scrollRef,
    headerProps: {
      deleteVisible: draft.draftMode === 'edit',
      doneEnabled: validation.isRequiredComplete && !actions.isSubmitting,
      onClose: actions.handleClose,
      onDelete: actions.handleDelete,
      onDone: actions.handleDone,
    },
    formProps: {
      control,
      activeTab,
      primaryTag: getConditionTagById(values.conditionTagId),
      personalTags: selectedPersonalTags,
      dateMode: values.dateMode,
      dateValue: getDateValue(values.dateMode, values.dateStart, values.dateEnd),
      timeFilled: values.timeFilled,
      timeValue: getTimeValue(values.timeFilled, values.timeStart, values.timeEnd),
      repeatEnabled: values.repeatEnabled,
      recurrence: values.recurrence,
      showTitleError: validation.shouldShowTitleError,
      showDateError: validation.shouldShowDateError,
      showTimeError: validation.shouldShowTimeError,
      showDueError: validation.shouldShowDueError,
      showDurationError: validation.shouldShowDurationError,
      dueDate: values.dueDate,
      durationHours: values.durationHours,
      durationMinutes: values.durationMinutes,
      durationUnknown: values.durationUnknown,
      tagFeedback,
      onChangeTab: actions.handleChangeTab,
      onOpenConditionTag: sheets.openConditionTagSheet,
      onOpenPersonalTags: sheets.openPersonalTagSheet,
      onOpenDateTime: sheets.openDateTimeSheet,
      onOpenDueDuration: sheets.openDueDurationSheet,
      onOpenLocation: sheets.openLocationSheet,
      onToggleRepeat: sheets.toggleRepeat,
      onPressRepeatChip: sheets.pressRepeatChip,
      onRemoveRepeat: sheets.removeRepeat,
      onMemoBlur: scroll.handleMemoBlur,
      onMemoFocus: scroll.handleMemoFocus,
      onMemoReachLimit: actions.handleMemoReachLimit,
    },
    tagPickerProps: {
      visible: sheets.tagSheetTab !== null,
      activeTab: sheets.tagSheetTab ?? 'condition',
      selectedConditionTagId: sheets.tagSheetSelectedId,
      personalTags: draft.personalTags,
      selectedPersonalTagIds: values.personalTagIds,
      onSwitchTab: sheets.switchTagTab,
      onClose: sheets.closeTagSheet,
      onSelectConditionTag: sheets.selectConditionTag,
      onDoneConditionTag: sheets.confirmConditionTag,
      onCreatePersonalTag: draft.createPersonalTag,
      onDonePersonalTags: sheets.confirmPersonalTags,
    },
    dateTimeSheetProps: {
      visible: sheets.isDateTimeVisible,
      focus: sheets.dateTimeFocus,
      value: {
        dateMode: values.dateMode,
        dateStart: values.dateStart,
        dateEnd: values.dateEnd,
        timeStart: values.timeStart,
        timeEnd: values.timeEnd,
      },
      onClose: sheets.closeSheet,
      onDone: sheets.saveDateTime,
    },
    dateOnlyGuideProps: {
      visible: sheets.isDateOnlyGuideVisible && activeTab === 'pin',
      onChangeToQueue: sheets.changeToQueueCard,
      onOpenTime: sheets.openTimeFromGuide,
      onKeep: sheets.keepDateOnly,
    },
    dueDurationSheetProps: {
      visible: sheets.isDueDurationVisible,
      value: {
        dueDate: values.dueDate,
        durationHours: values.durationHours,
        durationMinutes: values.durationMinutes,
        durationUnknown: values.durationUnknown,
      },
      onClose: sheets.closeSheet,
      onDone: sheets.saveDueDuration,
      onDurationUnknown: actions.handleDurationUnknown,
    },
    repeatPresetSheetProps: {
      visible: sheets.repeatSheetMode === 'preset',
      value: values.recurrence,
      onClose: sheets.closeRepeatSheet,
      onOpenCustom: sheets.openRepeatCustomSheet,
      onDone: sheets.doneRepeatPreset,
    },
    repeatCustomSheetProps: {
      visible: sheets.repeatSheetMode === 'custom',
      value: sheets.repeatCustomDefaultValue,
      scheduleDate: sheets.scheduleDate,
      onClose: sheets.closeRepeatSheet,
      onDone: sheets.doneRepeatCustom,
    },
    locationSheetProps: {
      visible: sheets.isLocationVisible,
      recentSearches: draft.locationRecentSearches,
      onClose: sheets.closeSheet,
      onSelect: sheets.selectLocation,
      onDeleteSearch: draft.deleteLocationRecentSearch,
      onDeleteAllSearches: draft.deleteAllLocationRecentSearches,
    },
    toastProps:
      actions.toast == null
        ? null
        : {
            bottomOffset: keyboardHeight > 0 ? keyboardHeight + spacing[3] : 70.5,
            message: actions.toast.message,
            variant: actions.toast.variant,
            onClose: actions.closeToast,
            onConfirm: actions.closeToast,
          },
  };
}
