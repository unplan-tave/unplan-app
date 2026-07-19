import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useUpdateTransportSettingsMutation } from '@/domains/onboarding/api/mutations';
import { useTransportSettingsQuery } from '@/domains/onboarding/api/queries';
import { t } from '@/lib/i18n';

import type { TransportOptionId } from '@/domains/onboarding/model';

const TOAST_DURATION_MS = 3000;

/** 기본 이동 수단 설정의 조회·저장 상태를 관리합니다. */
export function useTransportSettings() {
  const settingsQuery = useTransportSettingsQuery();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateMutation = useUpdateTransportSettingsMutation();

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const selectedOptionIds = useMemo(() => settingsQuery.data ?? [], [settingsQuery.data]);

  const toggleOption = useCallback(
    (optionId: TransportOptionId) => {
      if (settingsQuery.isLoading || updateMutation.isPending) {
        return;
      }

      const isSelected = selectedOptionIds.includes(optionId);
      const next = isSelected
        ? selectedOptionIds.filter((selectedId) => selectedId !== optionId)
        : [...selectedOptionIds, optionId];

      updateMutation.mutate(next, {
        onError: () => {
          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }

          setErrorMessage(t('settings.updateError'));
          toastTimerRef.current = setTimeout(() => setErrorMessage(null), TOAST_DURATION_MS);
        },
      });
    },
    [selectedOptionIds, settingsQuery.isLoading, updateMutation],
  );

  return {
    isLoading: settingsQuery.isLoading,
    isUpdating: updateMutation.isPending,
    selectedOptionIds,
    toggleOption,
    errorMessage,
    dismissError: () => setErrorMessage(null),
  };
}
