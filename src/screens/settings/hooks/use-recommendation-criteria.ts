import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateRecommendationCriteriaSettingsMutation } from '@/domains/ai-recommendation/api/mutations';
import { useRecommendationCriteriaSettingsQuery } from '@/domains/ai-recommendation/api/queries';
import {
  DEFAULT_EXCLUDE_RANGE,
  DEFAULT_RECOMMENDATION_CRITERIA_SETTINGS,
  hasOverlappingRange,
  isValidMinuteRange,
  sortMinuteRanges,
} from '@/domains/ai-recommendation/model';
import { t } from '@/lib/i18n';

import type {
  MinuteRange,
  RecommendationCriteriaSettings,
} from '@/domains/ai-recommendation/model';

const TOAST_DURATION_MS = 3000;

type RangeSheetState = { mode: 'add' } | { mode: 'edit'; index: number } | null;

/** 추천 조건 조회·수정과 관련 sheet 상태를 관리합니다. */
export function useRecommendationCriteria() {
  const settingsQuery = useRecommendationCriteriaSettingsQuery();
  const [isMinFreeSheetVisible, setIsMinFreeSheetVisible] = useState(false);
  const [rangeSheet, setRangeSheet] = useState<RangeSheetState>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateMutation = useUpdateRecommendationCriteriaSettingsMutation();

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const settings = settingsQuery.data ?? DEFAULT_RECOMMENDATION_CRITERIA_SETTINGS;
  const criteria = {
    minFreeMinutes: settings.minFreeMinutes,
    excludeEnabled: settings.excludeEnabled,
    excludeRanges: settings.excludeRanges,
  };

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }, []);

  const applySettings = useCallback(
    (next: RecommendationCriteriaSettings) => {
      if (settingsQuery.isLoading || updateMutation.isPending) {
        return;
      }

      updateMutation.mutate(next, {
        onError: () => showToast(t('settings.updateError')),
      });
    },
    [settingsQuery.isLoading, showToast, updateMutation],
  );

  const setExcludeEnabled = useCallback(
    (enabled: boolean) => {
      const next: RecommendationCriteriaSettings = {
        ...settings,
        excludeEnabled: enabled,
      };

      if (enabled && next.excludeRanges.length === 0) {
        next.excludeRanges = [DEFAULT_EXCLUDE_RANGE];
      }

      applySettings(next);
    },
    [applySettings, settings],
  );

  const handleAddMinutes = useCallback(
    (minutes: number) => {
      applySettings({
        ...settings,
        minFreeMinutes: Math.max(0, settings.minFreeMinutes + minutes),
      });
    },
    [applySettings, settings],
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

      if (hasOverlappingRange(settings.excludeRanges, range, ignoreIndex)) {
        showToast(t('settings.recommendation.overlapRangeToast'));
        return;
      }

      if (rangeSheet.mode === 'edit') {
        applySettings({
          ...settings,
          excludeRanges: sortMinuteRanges(
            settings.excludeRanges.map((existingRange, index) =>
              index === rangeSheet.index ? range : existingRange,
            ),
          ),
        });
      } else {
        applySettings({
          ...settings,
          excludeRanges: sortMinuteRanges([...settings.excludeRanges, range]),
        });
      }

      setRangeSheet(null);
    },
    [applySettings, rangeSheet, settings, showToast],
  );

  const removeExcludeRange = useCallback(
    (index: number) => {
      applySettings({
        ...settings,
        excludeRanges: settings.excludeRanges.filter((_, currentIndex) => currentIndex !== index),
      });
    },
    [applySettings, settings],
  );

  const rangeSheetInitialRange =
    rangeSheet?.mode === 'edit'
      ? (settings.excludeRanges[rangeSheet.index] ?? DEFAULT_EXCLUDE_RANGE)
      : DEFAULT_EXCLUDE_RANGE;

  return {
    criteria,
    isLoading: settingsQuery.isLoading,
    isUpdating: updateMutation.isPending,
    setExcludeEnabled,
    removeExcludeRange,
    isMinFreeSheetVisible,
    openMinFreeSheet: () => setIsMinFreeSheetVisible(true),
    closeMinFreeSheet: () => setIsMinFreeSheetVisible(false),
    handleAddMinutes,
    resetMinFreeMinutes: () => applySettings({ ...settings, minFreeMinutes: 0 }),
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
