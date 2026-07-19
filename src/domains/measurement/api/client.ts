/**
 * measurement 도메인의 서버 API 경계입니다.
 * 기간 평균 조회를 감싸고, 화면은 이 파일이 반환하는 요약 모델만 사용합니다.
 */
import { getAverageRecords, getDailyRecord } from '@/lib/api/endpoints/measurement/measurement';

import { toDailyMeasurementSummary, toMeasurementAverages } from './mapper';

import type {
  MeasurementAverageGroupBy,
  MeasurementAverages,
  MeasurementAverageType,
  DailyMeasurementSummary,
} from '../model';

export interface FetchMeasurementAveragesInput {
  from: string;
  to: string;
  type: MeasurementAverageType;
  groupBy: MeasurementAverageGroupBy;
}

export async function fetchMeasurementAverages(
  input: FetchMeasurementAveragesInput,
): Promise<MeasurementAverages> {
  const response = await getAverageRecords({
    from: input.from,
    to: input.to,
    type: input.type,
    groupBy: input.groupBy,
  });

  return toMeasurementAverages(response.data);
}

/** 선택 날짜의 컨디션·수면 원본 기록을 조회합니다. */
export async function fetchDailyMeasurement(date: string): Promise<DailyMeasurementSummary> {
  const response = await getDailyRecord({ date });

  return toDailyMeasurementSummary(response.data);
}
