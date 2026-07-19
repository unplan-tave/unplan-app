/** 회복 수단 설정 화면의 custom 입력과 store 동기화를 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard } from 'react-native';

import { type RecoveryOptionId } from '@/domains/onboarding/model';
import { onboardingRoutes } from '@/domains/onboarding/routes';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { t } from '@/lib/i18n';
import { type TranslationKey } from '@/translations/ko';

const RECOVERY_OPTION_DEFINITIONS = [
  { id: 'nap', labelKey: 'onboarding.recovery.nap', icon: '😴' },
  { id: 'music', labelKey: 'onboarding.recovery.music', icon: '🎧' },
  { id: 'walk', labelKey: 'onboarding.recovery.walk', icon: '🚶' },
  { id: 'stretching', labelKey: 'onboarding.recovery.stretching', icon: '🧘' },
  { id: 'food', labelKey: 'onboarding.recovery.food', icon: '🍽️' },
  { id: 'custom', labelKey: 'onboarding.option.custom', icon: '', isCustom: true },
] satisfies ReadonlyArray<{
  id: RecoveryOptionId;
  labelKey: TranslationKey;
  icon: string;
  isCustom?: boolean;
}>;

/** 회복 수단 화면이 렌더링에 사용할 option과 상호작용을 반환합니다. */
export function useRecoveryScreen() {
  const router = useRouter();
  const selectedIds = useOnboardingStore((state) => state.preferences.recoveryOptionIds);
  const customRecoveryLabel = useOnboardingStore((state) => state.preferences.customRecoveryLabel);
  const toggleRecoveryOption = useOnboardingStore((state) => state.toggleRecoveryOption);
  const setCustomRecoveryLabel = useOnboardingStore((state) => state.setCustomRecoveryLabel);
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState(customRecoveryLabel ?? '');

  useEffect(() => {
    if (!isCustomEditing) setCustomDraft(customRecoveryLabel ?? '');
  }, [customRecoveryLabel, isCustomEditing]);

  const recoveryOptions = useMemo(
    () => RECOVERY_OPTION_DEFINITIONS.map((option) => ({ ...option, label: t(option.labelKey) })),
    [],
  );

  /** 일반 option을 토글하거나 custom 입력 모드를 엽니다. */
  const handleOptionPress = useCallback(
    (optionId: RecoveryOptionId) => {
      if (optionId !== 'custom') {
        toggleRecoveryOption(optionId);
        return;
      }
      setCustomDraft(customRecoveryLabel ?? '');
      setIsCustomEditing(true);
    },
    [customRecoveryLabel, toggleRecoveryOption],
  );

  /** custom 회복 수단을 저장하고 편집 모드를 닫습니다. */
  const handleCustomSubmit = useCallback(() => {
    const normalizedLabel = customDraft.trim();
    setCustomRecoveryLabel(normalizedLabel || null);
    if (Boolean(normalizedLabel) !== selectedIds.includes('custom')) toggleRecoveryOption('custom');
    setIsCustomEditing(false);
    Keyboard.dismiss();
  }, [customDraft, selectedIds, setCustomRecoveryLabel, toggleRecoveryOption]);

  /** 소개 마지막 단계로 돌아갑니다. */
  const handleBack = useCallback(() => {
    router.replace({ pathname: onboardingRoutes.intro, params: { step: '3' } });
  }, [router]);
  /** 수면 조건 설정 단계로 이동합니다. */
  const handleConfirm = useCallback(() => router.push(onboardingRoutes.sleep), [router]);

  return {
    selectedIds,
    recoveryOptions,
    isCustomEditing,
    customDraft,
    setCustomDraft,
    hasSelection: selectedIds.length > 0,
    handleOptionPress,
    handleCustomSubmit,
    handleBack,
    handleConfirm,
  };
}
