import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useUpdateTransportSettingsMutation } from '@/domains/onboarding/api/mutations';
import { useTransportSettingsQuery } from '@/domains/onboarding/api/queries';
import { t } from '@/lib/i18n';

import type { TransportOptionId } from '@/domains/onboarding/model';

const TOAST_DURATION_MS = 3000;

export function useTransportSettings() {
  const settingsQuery = useTransportSettingsQuery();
  const [draft, setDraft] = useState<TransportOptionId[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateMutation = useUpdateTransportSettingsMutation({
    onSuccess: () => setDraft(null),
  });

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const selectedOptionIds = useMemo(
    () => draft ?? settingsQuery.data ?? [],
    [draft, settingsQuery.data],
  );

  const toggleOption = useCallback(
    (optionId: TransportOptionId) => {
      const isSelected = selectedOptionIds.includes(optionId);
      const next = isSelected
        ? selectedOptionIds.filter((selectedId) => selectedId !== optionId)
        : [...selectedOptionIds, optionId];
      const previous = draft;

      setDraft(next);
      updateMutation.mutate(next, {
        onError: () => {
          setDraft(previous);

          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }

          setErrorMessage(t('settings.recovery.updateError'));
          toastTimerRef.current = setTimeout(() => setErrorMessage(null), TOAST_DURATION_MS);
        },
      });
    },
    [draft, selectedOptionIds, updateMutation],
  );

  return {
    isLoading: settingsQuery.isLoading,
    selectedOptionIds,
    toggleOption,
    errorMessage,
    dismissError: () => setErrorMessage(null),
  };
}
