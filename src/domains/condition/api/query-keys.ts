/** 컨디션 단건 조회 캐시 key입니다. */
export const conditionQueryKeys = {
  all: ['condition'] as const,
  detail: (conditionId: number) => [...conditionQueryKeys.all, conditionId] as const,
};
