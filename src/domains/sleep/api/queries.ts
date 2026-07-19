/** 수면 기록 조회 hook입니다. */
import { useQuery } from '@tanstack/react-query';

import { fetchSleepRecord } from './client';
import { sleepQueryKeys } from './query-keys';

/** 수면 기록 상세를 조회합니다. */
export function useSleepRecordQuery(sleepId: number | null) {
  return useQuery({
    queryKey: sleepId == null ? sleepQueryKeys.all : sleepQueryKeys.detail(sleepId),
    queryFn: () => {
      if (sleepId == null) throw new Error('sleepId is required');

      return fetchSleepRecord(sleepId);
    },
    enabled: sleepId != null,
  });
}
