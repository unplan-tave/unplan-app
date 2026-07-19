/**
 * measurement API DTO를 home/condition 화면에서 쓰는 요약 모델로 변환합니다.
 * paginated condition/sleep 기록 구조와 평균 응답의 null/percent 보정은 이 파일에서 처리합니다.
 */
import { toConditionRecordEntry } from '@/domains/condition/api/mapper';
import { toSleepDayRecord } from '@/domains/sleep/api/mapper';

import type {
  DailyMeasurementSummary,
  MeasurementAverageGroupBy,
  MeasurementAverageItem,
  MeasurementAverages,
  MeasurementAverageType,
} from '../model';
import type {
  AverageItem,
  ConditionRecord,
  MeasurementAverageResponse,
  MeasurementRecordResponse,
  SleepRecord,
} from '@/lib/api/model';

export function toDailyMeasurementSummary(
  response?: MeasurementRecordResponse,
): DailyMeasurementSummary {
  const latestCondition = latestByTime(response?.conditions, (record) => record.date_time);
  const latestSleep = latestByTime(response?.sleeps, (record) => record.created_at);
  const sleepRecords = (response?.sleeps ?? []).map((record) =>
    toSleepDayRecord(record, response?.date ?? ''),
  );

  return {
    date: response?.date ?? '',
    finalConditionScore: response?.final_condition_score ?? null,
    conditionLevel: response?.condition_level ?? '',
    conditionTag: response?.condition_tag ?? '',
    bodyScorePercent: normalizePercent(response?.body_score_percent),
    mindScorePercent: normalizePercent(response?.mind_score_percent),
    sleepScore: normalizePercent(response?.sleep_score),
    sleepDurationMinutes: response?.sleep_duration_minutes ?? 0,
    bodyComment: latestCondition?.body_comment ?? '',
    mindComment: latestCondition?.mind_comment ?? '',
    sleepComment: latestSleep?.sleep_record_comment ?? '',
    sleepRecords,
    conditionRecords: (response?.conditions ?? []).map(toConditionRecordEntry),
  };
}

/** 하루에 여러 기록이 있을 때 가장 최근 기록을 대표 문구로 씁니다. */
function latestByTime<T extends ConditionRecord | SleepRecord>(
  records: T[] | undefined,
  getTime: (record: T) => string | undefined,
): T | undefined {
  if (records == null || records.length === 0) {
    return undefined;
  }

  return [...records].sort((a, b) => (getTime(b) ?? '').localeCompare(getTime(a) ?? ''))[0];
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
    bodyComment: item.body_comment ?? '',
    mindComment: item.mind_comment ?? '',
    sleepComment: item.sleep_comment ?? '',
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
