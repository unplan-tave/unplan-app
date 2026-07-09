import { getAverageRecords, getDailyRecord } from '@/lib/api/endpoints/measurement/measurement';

import { toDailyMeasurementSummary, toMeasurementAverages } from './mapper';

import type {
  DailyMeasurementSummary,
  MeasurementAverageGroupBy,
  MeasurementAverages,
  MeasurementAverageType,
} from '../model';

export interface FetchDailyMeasurementInput {
  date: string;
}

export interface FetchMeasurementAveragesInput {
  from: string;
  to: string;
  type: MeasurementAverageType;
  groupBy: MeasurementAverageGroupBy;
}

export async function fetchDailyMeasurement(
  input: FetchDailyMeasurementInput,
): Promise<DailyMeasurementSummary> {
  const response = await getDailyRecord({ date: input.date });

  return toDailyMeasurementSummary(response.data);
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
