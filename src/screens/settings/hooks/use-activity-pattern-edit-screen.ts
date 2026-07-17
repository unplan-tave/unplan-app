/** 활동 패턴 편집 화면의 조회, draft 편집, 저장을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  toggleActivityHourRange,
  toggleContinuousSleepRange,
} from '@/domains/onboarding/activity-time-ranges';
import { useUpdateActivityPatternSettingsMutation } from '@/domains/onboarding/api/mutations';
import { useActivityPatternSettingsQuery } from '@/domains/onboarding/api/queries';
import { t } from '@/lib/i18n';

import type { ActivityPatternSettings } from '@/domains/onboarding/model';

const EMPTY_SETTINGS: ActivityPatternSettings = {
  focusTimeRanges: [],
  sleepyTimeRanges: [],
  sleepTimeRanges: [],
};

/** 활동 패턴 편집 화면이 사용할 draft와 이벤트를 반환합니다. */
export function useActivityPatternEditScreen() {
  const router = useRouter();
  const settingsQuery = useActivityPatternSettingsQuery();
  const updateMutation = useUpdateActivityPatternSettingsMutation();
  const [draft, setDraft] = useState<ActivityPatternSettings | null>(null);
  const settings = draft ?? settingsQuery.data ?? EMPTY_SETTINGS;
  const hasSleepTime = settings.sleepTimeRanges.length > 0;
  /** 선택한 시간 rail을 갱신합니다. */
  const handleToggleHour = useCallback(
    (rangeKey: keyof ActivityPatternSettings, hour: number) => {
      setDraft({
        ...settings,
        [rangeKey]:
          rangeKey === 'sleepTimeRanges'
            ? toggleContinuousSleepRange(settings[rangeKey], hour)
            : toggleActivityHourRange(settings[rangeKey], hour),
      });
    },
    [settings],
  );
  /** draft를 저장하고 성공 시 이전 화면으로 이동합니다. */
  const handleConfirm = useCallback(() => {
    if (updateMutation.isPending || !hasSleepTime) return;
    updateMutation.mutate(settings, {
      onSuccess: () => router.back(),
      onError: () => Alert.alert(t('settings.updateError')),
    });
  }, [hasSleepTime, router, settings, updateMutation]);
  /** 편집을 취소합니다. */
  const handleCancel = useCallback(() => router.back(), [router]);
  return {
    settings,
    hasSleepTime,
    isSubmitting: updateMutation.isPending,
    handleToggleHour,
    handleConfirm,
    handleCancel,
  };
}
