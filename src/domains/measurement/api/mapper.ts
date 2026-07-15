import { toConditionRecordEntry } from '@/domains/condition/api/mapper';

import type {
  DailyMeasurementSummary,
  MeasurementAverageGroupBy,
  MeasurementAverageItem,
  MeasurementAverages,
  MeasurementAverageType,
} from '../model';
import type {
  AverageItem,
  MeasurementAverageResponse,
  MeasurementRecordResponse,
} from '@/lib/api/model';

export function toDailyMeasurementSummary(
  response?: MeasurementRecordResponse,
): DailyMeasurementSummary {
  return {
    date: response?.date ?? '',
    finalConditionScore: response?.final_condition_score ?? null,
    conditionLevel: response?.condition_level ?? '',
    conditionTag: response?.condition_tag ?? '',
    bodyScorePercent: normalizePercent(response?.body_score_percent),
    mindScorePercent: normalizePercent(response?.mind_score_percent),
    sleepScore: normalizePercent(response?.sleep_score),
    sleepDurationMinutes: response?.sleep_duration_minutes ?? 0,
    conditionRecords: (response?.conditions?.data ?? []).map(toConditionRecordEntry),
  };
}

export function toMeasurementAverages(response?: MeasurementAverageResponse): MeasurementAverages {
  return {
    from: response?.from ?? '',
    to: response?.to ?? '',
    type: toMeasurementAverageType(response?.type),
    groupBy: toMeasurementAverageGroupBy(response?.group_by),
    items: (response?.items ?? []).map(toMeasurementAverageItem),
  };
}

function toMeasurementAverageItem(item: AverageItem): MeasurementAverageItem {
  return {
    periodStart: item.period_start ?? '',
    periodEnd: item.period_end ?? '',
    label: item.label ?? '',
    finalConditionScore: item.final_condition_score_average ?? null,
    bodyScorePercent: normalizePercent(item.body_score_percent_average),
    mindScorePercent: normalizePercent(item.mind_score_percent_average),
    sleepScore: normalizePercent(item.sleep_score_average),
    sleepDurationMinutes: Math.round(item.sleep_duration_minutes_average ?? 0),
  };
}

function toMeasurementAverageType(value?: string): MeasurementAverageType {
  if (value === 'CONDITION' || value === 'SLEEP') {
    return value;
  }

  return 'ALL';
}

function toMeasurementAverageGroupBy(value?: string): MeasurementAverageGroupBy {
  if (value === 'DAY' || value === 'MONTH') {
    return value;
  }

  return 'WEEK';
}

function normalizePercent(value: number | undefined) {
  if (value == null || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}
