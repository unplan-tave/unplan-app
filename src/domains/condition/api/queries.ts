/** 컨디션 단건 조회 hook입니다. */
import { useQuery } from '@tanstack/react-query';

import { fetchConditionRecord } from './client';
import { conditionQueryKeys } from './query-keys';

/** 컨디션 기록 상세를 조회합니다. */
export function useConditionRecordQuery(conditionId: number | null) {
  return useQuery({
    queryKey: conditionId == null ? conditionQueryKeys.all : conditionQueryKeys.detail(conditionId),
    queryFn: () => {
      if (conditionId == null) throw new Error('conditionId is required');

      return fetchConditionRecord(conditionId);
    },
    enabled: conditionId != null,
  });
}
