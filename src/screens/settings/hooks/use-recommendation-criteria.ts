import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DEFAULT_EXCLUDE_RANGE,
  hasOverlappingRange,
  isValidMinuteRange,
} from '@/domains/ai-recommendation/model';
import { useRecommendationCriteriaStore } from '@/domains/ai-recommendation/use-recommendation-criteria-store';
import { t } from '@/lib/i18n';

import type { MinuteRange } from '@/domains/ai-recommendation/model';

const TOAST_DURATION_MS = 3000;

type RangeSheetState = { mode: 'add' } | { mode: 'edit'; index: number } | null;

export function useRecommendationCriteria() {
  const criteria = useRecommendationCriteriaStore((state) => state.criteria);
  const setMinFreeMinutes = useRecommendationCriteriaStore((state) => state.setMinFreeMinutes);
  const setExcludeEnabled = useRecommendationCriteriaStore((state) => state.setExcludeEnabled);
  const addExcludeRange = useRecommendationCriteriaStore((state) => state.addExcludeRange);
  const updateExcludeRange = useRecommendationCriteriaStore((state) => state.updateExcludeRange);
  const removeExcludeRange = useRecommendationCriteriaStore((state) => state.removeExcludeRange);

  const [isMinFreeSheetVisible, setIsMinFreeSheetVisible] = useState(false);
  const [rangeSheet, setRangeSheet] = useState<RangeSheetState>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }, []);

  const handleAddMinutes = useCallback(
    (minutes: number) => setMinFreeMinutes(criteria.minFreeMinutes + minutes),
    [criteria.minFreeMinutes, setMinFreeMinutes],
  );

  const handleSubmitRange = useCallback(
    (range: MinuteRange) => {
      if (!rangeSheet) {
        return;
      }

      if (!isValidMinuteRange(range)) {
        showToast(t('settings.recommendation.invalidRangeToast'));
        return;
      }

      const ignoreIndex = rangeSheet.mode === 'edit' ? rangeSheet.index : undefined;

      if (hasOverlappingRange(criteria.excludeRanges, range, ignoreIndex)) {
        showToast(t('settings.recommendation.overlapRangeToast'));
        return;
      }

      if (rangeSheet.mode === 'edit') {
        updateExcludeRange(rangeSheet.index, range);
      } else {
        addExcludeRange(range);
      }

      setRangeSheet(null);
    },
    [addExcludeRange, criteria.excludeRanges, rangeSheet, showToast, updateExcludeRange],
  );

  const rangeSheetInitialRange =
    rangeSheet?.mode === 'edit'
      ? (criteria.excludeRanges[rangeSheet.index] ?? DEFAULT_EXCLUDE_RANGE)
      : DEFAULT_EXCLUDE_RANGE;

  return {
    criteria,
    setExcludeEnabled,
    removeExcludeRange,
    isMinFreeSheetVisible,
    openMinFreeSheet: () => setIsMinFreeSheetVisible(true),
    closeMinFreeSheet: () => setIsMinFreeSheetVisible(false),
    handleAddMinutes,
    resetMinFreeMinutes: () => setMinFreeMinutes(0),
    rangeSheet,
    rangeSheetInitialRange,
    openAddRangeSheet: () => setRangeSheet({ mode: 'add' }),
    openEditRangeSheet: (index: number) => setRangeSheet({ mode: 'edit', index }),
    closeRangeSheet: () => setRangeSheet(null),
    handleSubmitRange,
    toastMessage,
    dismissToast: () => setToastMessage(null),
  };
}
