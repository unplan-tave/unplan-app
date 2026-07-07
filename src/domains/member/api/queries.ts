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
