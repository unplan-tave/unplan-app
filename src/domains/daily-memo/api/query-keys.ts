/**
 * daily-memo query key factory입니다.
 * 날짜별 메모 캐시를 안정적으로 invalidate하기 위해 모든 key를 이 파일에서 생성합니다.
 */
export const dailyMemoQueryKeys = {
  all: ['daily-memo'] as const,
  byDate: (date: string) => [...dailyMemoQueryKeys.all, 'date', date] as const,
};
