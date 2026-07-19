/** 수면 조건 조회 화면의 서버 상태, 표시 값, 라우팅을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useSleepConditionSettingsQuery } from '@/domains/onboarding/api/queries';
import { formatSleepDurationLabel } from '@/domains/onboarding/sleep-condition';

/** 수면 조건 화면이 사용할 표시 모델과 이벤트를 반환합니다. */
export function useSleepConditionScreen() {
  const router = useRouter();
  const settingsQuery = useSleepConditionSettingsQuery();
  const values = useMemo(() => {
    const settings = settingsQuery.data;
    if (!settings) return null;
    return {
      risk: `${formatSleepDurationLabel(0)} ~ ${formatSleepDurationLabel(settings.dangerThresholdMinutes)}`,
      lack: `${formatSleepDurationLabel(settings.dangerThresholdMinutes + 1)} ~ ${formatSleepDurationLabel(settings.lackThresholdMinutes)}`,
      optimal: `${formatSleepDurationLabel(settings.lackThresholdMinutes + 1)} ~ ${formatSleepDurationLabel(settings.optimalThresholdMinutes)}`,
      excess: `${formatSleepDurationLabel(settings.optimalThresholdMinutes + 1)} ~`,
      target: formatSleepDurationLabel(settings.targetSleepMinutes),
    };
  }, [settingsQuery.data]);
  /** 이전 화면으로 이동합니다. */
  const handleBack = useCallback(() => router.back(), [router]);
  /** 수면 조건 편집 화면으로 이동합니다. */
  const handleEdit = useCallback(() => router.push('/settings/sleep-condition-edit'), [router]);
  return { values, handleBack, handleEdit };
}
