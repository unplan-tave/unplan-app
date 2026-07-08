import { useQuery } from '@tanstack/react-query';

import { isMeasurementRangeCurrent } from '../period';

import { fetchDailyMeasurement, fetchMeasurementAverages } from './client';
import { measurementQueryKeys } from './query-keys';

import type { FetchMeasurementAveragesInput } from './client';
import type { DailyMeasurementSummary, MeasurementAverages } from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type MeasurementQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

/**
 * 지난 날짜 기록은 세션 중 재방문해도 다시 부르지 않는다.
 * 데일리↔위클리↔먼슬리 반복 이동 시 과거 날짜 재요청을 막는 핵심.
 */
const PAST_DATE_STALE_TIME = Infinity;
/**
 * 오늘/이번 주·월 기록은 하루 중 바뀔 수 있으나, 갱신은 시간 폴링이 아니라
 * 컨디션·수면 기록 mutation의 invalidate로 처리한다.
 * 여기서는 짧은 stale time만 둬 잦은 뷰 이동에서 캐시를 재사용한다.
 */
const CURRENT_PERIOD_STALE_TIME = 5 * 60 * 1000;

export function useDailyMeasurementQuery(
  date: string,
  options?: MeasurementQueryOptions<DailyMeasurementSummary>,
) {
  const todayValue = formatDateValue(new Date());

  return useQuery({
    queryKey: measurementQueryKeys.daily(date),
    queryFn: () => fetchDailyMeasurement({ date }),
    // 미래 날짜는 기록이 존재할 수 없어 요청하지 않는다.
    enabled: date.length > 0 && date <= todayValue,
    staleTime: date < todayValue ? PAST_DATE_STALE_TIME : CURRENT_PERIOD_STALE_TIME,
    ...options,
  });
}

export function useMeasurementAveragesQuery(
  input: FetchMeasurementAveragesInput | null,
  options?: MeasurementQueryOptions<MeasurementAverages>,
) {
  const isCurrentPeriod = input != null && isMeasurementRangeCurrent(input.from, input.to);

  return useQuery({
    queryKey: input == null ? measurementQueryKeys.all : measurementQueryKeys.averages(input),
    queryFn: () => {
      if (input == null) {
        throw new Error('Measurement averages input is required');
      }

      return fetchMeasurementAverages(input);
    },
    enabled: input != null,
    staleTime: isCurrentPeriod ? CURRENT_PERIOD_STALE_TIME : PAST_DATE_STALE_TIME,
    ...options,
  });
}

function formatDateValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}
