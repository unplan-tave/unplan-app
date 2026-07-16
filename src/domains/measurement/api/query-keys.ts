/**
 * measurement query key factory입니다.
 * 날짜별 daily 기록과 기간 평균 기록을 분리해 mutation 후 필요한 범위만 갱신할 수 있게 합니다.
 */
import type { FetchMeasurementAveragesInput } from './client';

export const measurementQueryKeys = {
  all: ['measurement'] as const,
  daily: (date: string) => [...measurementQueryKeys.all, 'daily', date] as const,
  averages: (input: FetchMeasurementAveragesInput) =>
    [...measurementQueryKeys.all, 'averages', input] as const,
};
