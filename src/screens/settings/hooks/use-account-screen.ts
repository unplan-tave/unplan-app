/** 계정 화면의 프로필 표시 값과 route 이동을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { t } from '@/lib/i18n';

import { useSettingsAccount } from './use-settings-account';

/** 계정 화면이 사용할 profile ViewModel과 이벤트를 반환합니다. */
export function useAccountScreen() {
  const router = useRouter();
  const account = useSettingsAccount();
  const profile = useMemo(
    () => ({
      nickname: account.isProfileLoading
        ? ''
        : (account.profile?.nickname ?? t('settings.profileFallback.nickname')),
      email: account.isProfileLoading
        ? ''
        : (account.profile?.email ?? t('settings.profileFallback.email')),
    }),
    [account.isProfileLoading, account.profile?.email, account.profile?.nickname],
  );
  /** 이전 화면으로 이동합니다. */
  const handleBack = useCallback(() => router.back(), [router]);
  /** 닉네임 편집 화면으로 이동합니다. */
  const handleNicknamePress = useCallback(() => router.push('/settings/nickname'), [router]);
  return { account, profile, handleBack, handleNicknamePress };
}
