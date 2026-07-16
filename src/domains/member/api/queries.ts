/**
 * member 조회 hook 모음입니다.
 * 사용자 프로필과 알림 설정을 settings/home 화면에서 공유할 수 있도록 query key를 분리합니다.
 */
import { useQuery } from '@tanstack/react-query';

import { fetchAlarmSettings, fetchMemberProfile } from './client';
import { memberQueryKeys } from './query-keys';

import type { AlarmSettings, MemberProfile } from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type MemberQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

export function useMemberProfileQuery(options?: MemberQueryOptions<MemberProfile>) {
  return useQuery({
    queryKey: memberQueryKeys.profile(),
    queryFn: fetchMemberProfile,
    ...options,
  });
}

export function useAlarmSettingsQuery(options?: MemberQueryOptions<AlarmSettings>) {
  return useQuery({
    queryKey: memberQueryKeys.alarmSettings(),
    queryFn: fetchAlarmSettings,
    ...options,
  });
}
