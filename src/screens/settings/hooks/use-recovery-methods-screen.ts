/** 회복 수단 화면의 custom 입력 interaction과 뒤로가기를 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';

import { t } from '@/lib/i18n';

import { useRecoveryMethods } from './use-recovery-methods';

const defaultOptions = [
  { id: 'nap', label: t('settings.recovery.nap') },
  { id: 'music', label: t('settings.recovery.music') },
  { id: 'walk', label: t('settings.recovery.walk') },
  { id: 'stretching', label: t('settings.recovery.stretching') },
  { id: 'food', label: t('settings.recovery.food') },
] as const;

/** 회복 수단 화면이 사용할 설정과 custom 입력 이벤트를 반환합니다. */
export function useRecoveryMethodsScreen() {
  const router = useRouter();
  const recoveryMethods = useRecoveryMethods();
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  /** custom 회복 수단을 저장합니다. */
  const handleCustomSubmit = useCallback(() => {
    const normalizedDraft = customDraft.trim();
    if (!normalizedDraft) return;
    recoveryMethods.addCustomMethod(normalizedDraft);
    setCustomDraft('');
    setIsCustomEditing(false);
    Keyboard.dismiss();
  }, [customDraft, recoveryMethods]);
  /** 빈 custom 입력을 취소합니다. */
  const handleCustomBlur = useCallback(() => {
    if (!customDraft.trim()) {
      setIsCustomEditing(false);
      setCustomDraft('');
    }
  }, [customDraft]);
  /** 이전 화면으로 이동합니다. */
  const handleBack = useCallback(() => router.back(), [router]);
  /** custom 입력칸을 엽니다. */
  const openCustomEditor = useCallback(() => setIsCustomEditing(true), []);
  return {
    ...recoveryMethods,
    isCustomEditing,
    customDraft,
    setCustomDraft,
    defaultOptions,
    openCustomEditor,
    handleCustomSubmit,
    handleCustomBlur,
    handleBack,
  };
}
