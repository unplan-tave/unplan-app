/** 수면 조건 편집 화면의 조회, draft 편집, 저장을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useUpdateSleepConditionSettingsMutation } from '@/domains/onboarding/api/mutations';
import { useSleepConditionSettingsQuery } from '@/domains/onboarding/api/queries';
import { DEFAULT_SLEEP_CONDITION_THRESHOLDS } from '@/domains/onboarding/sleep-condition';
import { t } from '@/lib/i18n';

import type { SleepConditionSettings } from '@/domains/onboarding/model';

const FALLBACK_SETTINGS: SleepConditionSettings = {
  targetSleepMinutes: 450,
  dangerThresholdMinutes: DEFAULT_SLEEP_CONDITION_THRESHOLDS.dangerMinutes,
  lackThresholdMinutes: DEFAULT_SLEEP_CONDITION_THRESHOLDS.lackMinutes,
  optimalThresholdMinutes: DEFAULT_SLEEP_CONDITION_THRESHOLDS.optimalMinutes,
};

/** 수면 조건 편집 화면이 사용할 draft와 이벤트를 반환합니다. */
export function useSleepConditionEditScreen() {
  const router = useRouter();
  const settingsQuery = useSleepConditionSettingsQuery();
  const updateMutation = useUpdateSleepConditionSettingsMutation();
  const [draft, setDraft] = useState<SleepConditionSettings | null>(null);
  const settings = draft ?? settingsQuery.data ?? FALLBACK_SETTINGS;
  /** 목표 수면 시간을 draft에 반영합니다. */
  const handleTargetSleepMinutesChange = useCallback(
    (minutes: number) => setDraft({ ...settings, targetSleepMinutes: minutes }),
    [settings],
  );
  /** 수면 상태 구간을 draft에 반영합니다. */
  const handleThresholdsChange = useCallback(
    (thresholds: { dangerMinutes: number; lackMinutes: number; optimalMinutes: number }) =>
      setDraft({
        ...settings,
        dangerThresholdMinutes: thresholds.dangerMinutes,
        lackThresholdMinutes: thresholds.lackMinutes,
        optimalThresholdMinutes: thresholds.optimalMinutes,
      }),
    [settings],
  );
  /** draft를 저장하고 성공 시 이전 화면으로 이동합니다. */
  const handleConfirm = useCallback(() => {
    if (updateMutation.isPending) return;
    updateMutation.mutate(settings, {
      onSuccess: () => router.back(),
      onError: () => Alert.alert(t('settings.updateError')),
    });
  }, [router, settings, updateMutation]);
  /** 편집을 취소합니다. */
  const handleCancel = useCallback(() => router.back(), [router]);
  return {
    settings,
    isSubmitting: updateMutation.isPending,
    handleTargetSleepMinutesChange,
    handleThresholdsChange,
    handleConfirm,
    handleCancel,
  };
}
