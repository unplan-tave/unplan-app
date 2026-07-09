import type { FetchMeasurementAveragesInput } from './client';

export const measurementQueryKeys = {
  all: ['measurement'] as const,
  daily: (date: string) => [...measurementQueryKeys.all, 'daily', date] as const,
  averages: (input: FetchMeasurementAveragesInput) =>
    [...measurementQueryKeys.all, 'averages', input] as const,
};
