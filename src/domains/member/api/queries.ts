import { useQuery } from '@tanstack/react-query';

import { fetchMemberProfile } from './client';
import { memberQueryKeys } from './query-keys';

import type { MemberProfile } from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type MemberQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

export function useMemberProfileQuery(options?: MemberQueryOptions<MemberProfile>) {
  return useQuery({
    queryKey: memberQueryKeys.profile(),
    queryFn: fetchMemberProfile,
    ...options,
  });
}
