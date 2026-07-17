/** 설정 메인 화면의 프로필, 알림 설정, route 이동을 조합합니다. */
import Constants from 'expo-constants';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useMemberProfileQuery } from '@/domains/member/api/queries';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
import { t } from '@/lib/i18n';

import { useAlarmSettings } from './use-alarm-settings';

/** 설정 메인 화면이 렌더링에 사용할 상태와 navigation 이벤트를 반환합니다. */
export function useSettingsScreen() {
  const router = useRouter();
  const profileQuery = useMemberProfileQuery();
  const alarmSettings = useAlarmSettings();
  const profile = useMemo(
    () => ({
      nickname: profileQuery.isLoading
        ? ''
        : (profileQuery.data?.nickname ?? t('settings.profileFallback.nickname')),
      email: profileQuery.isLoading
        ? ''
        : (profileQuery.data?.email ?? t('settings.profileFallback.email')),
    }),
    [profileQuery.data?.email, profileQuery.data?.nickname, profileQuery.isLoading],
  );
  /** 새 카드 생성 화면으로 이동합니다. */
  const handleAddCard = useCallback(() => router.push('/card/new'), [router]);
  /** 계정 화면으로 이동합니다. */
  const handleAccountPress = useCallback(() => router.push('/settings/account'), [router]);
  /** 특정 설정 route로 이동합니다. */
  const createSettingsNavigation = useCallback(
    (pathname: Href) => () => router.push(pathname),
    [router],
  );
  /** 약관 화면으로 이동합니다. */
  const handleTermsPress = useCallback(
    (type: 'service' | 'privacy') => router.push({ pathname: '/terms', params: { type } }),
    [router],
  );
  return {
    profile,
    appVersion: Constants.expoConfig?.version ?? '1.0.0',
    alarmSettings,
    isAlarmSettingsDisabled: alarmSettings.isLoading || alarmSettings.isUpdating,
    handleNavChange: useTabNavigation(),
    handleAddCard,
    handleAccountPress,
    createSettingsNavigation,
    handleTermsPress,
  };
}
