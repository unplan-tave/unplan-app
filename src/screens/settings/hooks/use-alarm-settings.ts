import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateAlarmSettingsMutation } from '@/domains/member/api/mutations';
import { useAlarmSettingsQuery } from '@/domains/member/api/queries';
import { DEFAULT_ALARM_SETTINGS } from '@/domains/member/model';
import { t } from '@/lib/i18n';

import type { AlarmSettings } from '@/domains/member/model';

const TOAST_DURATION_MS = 3000;

/** 알림 설정 조회·저장 mutation과 오류 상태를 관리합니다. */
export function useAlarmSettings() {
  const settingsQuery = useAlarmSettingsQuery();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateMutation = useUpdateAlarmSettingsMutation();

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const settings = settingsQuery.data ?? DEFAULT_ALARM_SETTINGS;

  const showError = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setErrorMessage(t('settings.updateError'));
    toastTimerRef.current = setTimeout(() => setErrorMessage(null), TOAST_DURATION_MS);
  }, []);

  const updateSetting = useCallback(
    (patch: Partial<AlarmSettings>) => {
      if (settingsQuery.isLoading || updateMutation.isPending) {
        return;
      }

      updateMutation.mutate(
        { ...settings, ...patch },
        {
          onError: () => showError(),
        },
      );
    },
    [settings, settingsQuery.isLoading, showError, updateMutation],
  );

  return {
    scheduleEndNotification: settings.scheduleEndAlarmOn,
    conditionRecordNotification: settings.conditionRecordAlarmOn,
    recommendationPushEnabled: settings.recommendAlarmOn,
    isLoading: settingsQuery.isLoading,
    isUpdating: updateMutation.isPending,
    setScheduleEndNotification: (enabled: boolean) =>
      updateSetting({ scheduleEndAlarmOn: enabled }),
    setConditionRecordNotification: (enabled: boolean) =>
      updateSetting({ conditionRecordAlarmOn: enabled }),
    setRecommendationPushEnabled: (enabled: boolean) =>
      updateSetting({ recommendAlarmOn: enabled }),
    errorMessage,
    dismissError: () => setErrorMessage(null),
  };
}
