import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateRecoveryMethodsSettingsMutation } from '@/domains/onboarding/api/mutations';
import { useRecoveryMethodsSettingsQuery } from '@/domains/onboarding/api/queries';
import { t } from '@/lib/i18n';

import type { RecoveryMethodsSettings, RecoveryOptionId } from '@/domains/onboarding/model';

const TOAST_DURATION_MS = 3000;
const CUSTOM_METHOD_MAX_LENGTH = 20;

const EMPTY_SETTINGS: RecoveryMethodsSettings = {
  recoveryOptionIds: [],
  customMethods: [],
};

/** 회복 방법 설정의 조회·수정 상태를 관리합니다. */
export function useRecoveryMethods() {
  const settingsQuery = useRecoveryMethodsSettingsQuery();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateMutation = useUpdateRecoveryMethodsSettingsMutation();

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const settings = settingsQuery.data ?? EMPTY_SETTINGS;

  const showError = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setErrorMessage(t('settings.updateError'));
    toastTimerRef.current = setTimeout(() => setErrorMessage(null), TOAST_DURATION_MS);
  }, []);

  const applySettings = useCallback(
    (next: RecoveryMethodsSettings) => {
      if (settingsQuery.isLoading || updateMutation.isPending) {
        return;
      }

      updateMutation.mutate(next, {
        onError: () => showError(),
      });
    },
    [settingsQuery.isLoading, showError, updateMutation],
  );

  const toggleDefaultOption = useCallback(
    (optionId: Exclude<RecoveryOptionId, 'custom'>) => {
      const isSelected = settings.recoveryOptionIds.includes(optionId);

      applySettings({
        ...settings,
        recoveryOptionIds: isSelected
          ? settings.recoveryOptionIds.filter((selectedId) => selectedId !== optionId)
          : [...settings.recoveryOptionIds, optionId],
      });
    },
    [applySettings, settings],
  );

  const removeCustomMethod = useCallback(
    (method: string) => {
      applySettings({
        ...settings,
        customMethods: settings.customMethods.filter((customMethod) => customMethod !== method),
      });
    },
    [applySettings, settings],
  );

  const addCustomMethod = useCallback(
    (method: string) => {
      const normalizedMethod = method.trim().slice(0, CUSTOM_METHOD_MAX_LENGTH);

      if (!normalizedMethod || settings.customMethods.includes(normalizedMethod)) {
        return;
      }

      applySettings({
        ...settings,
        customMethods: [...settings.customMethods, normalizedMethod],
      });
    },
    [applySettings, settings],
  );

  return {
    isLoading: settingsQuery.isLoading,
    isUpdating: updateMutation.isPending,
    settings,
    toggleDefaultOption,
    removeCustomMethod,
    addCustomMethod,
    customMethodMaxLength: CUSTOM_METHOD_MAX_LENGTH,
    errorMessage,
    dismissError: () => setErrorMessage(null),
  };
}
