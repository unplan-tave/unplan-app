/**
 * measurement 도메인의 화면 요약 모델입니다.
 * 서버 기록을 condition summary, metric card, home header에서 재사용할 수 있는 형태로 정규화합니다.
 */
import type { ConditionRecordEntry } from '@/domains/condition/model';
import type { SleepDayRecord } from '@/domains/sleep/model';

export type MeasurementAverageType = 'ALL' | 'CONDITION' | 'SLEEP';
export type MeasurementAverageGroupBy = 'DAY' | 'WEEK' | 'MONTH';

export interface DailyMeasurementSummary {
  date: string;
  finalConditionScore: number | null;
  conditionLevel: string;
  conditionTag: string;
  bodyScorePercent: number;
  mindScorePercent: number;
  sleepScore: number;
  sleepDurationMinutes: number;
  /** GET /measurements 응답의 개별 기록 상태 문구입니다. 기록이 없으면 빈 문자열입니다. */
  bodyComment: string;
  mindComment: string;
  sleepComment: string;
  /** 선택 일자에 속한 개별 수면 기록 카드입니다. */
  sleepRecords: SleepDayRecord[];
  conditionRecords: ConditionRecordEntry[];
}

export interface MeasurementAverageItem {
  periodStart: string;
  periodEnd: string;
  label: string;
  finalConditionScore: number | null;
  bodyScorePercent: number;
  mindScorePercent: number;
  sleepScore: number;
  sleepDurationMinutes: number;
  bodyComment: string;
  mindComment: string;
  sleepComment: string;
}

export interface MeasurementAverages {
  from: string;
  to: string;
  type: MeasurementAverageType;
  groupBy: MeasurementAverageGroupBy;
  items: MeasurementAverageItem[];
}

export interface ConditionSummary {
  finalScore: number;
  body: { value: string; progress: number; comment: string };
  mind: { value: string; progress: number; comment: string };
  sleep: { value: string; progress: number; comment: string };
}

export function toConditionSummaryFromDaily(
  measurement?: DailyMeasurementSummary,
): ConditionSummary {
  return {
    finalScore: measurement?.finalConditionScore ?? 0,
    body: {
      value: `${measurement?.bodyScorePercent ?? 0}%`,
      progress: measurement?.bodyScorePercent ?? 0,
      comment: measurement?.bodyComment ?? '',
    },
    mind: {
      value: `${measurement?.mindScorePercent ?? 0}%`,
      progress: measurement?.mindScorePercent ?? 0,
      comment: measurement?.mindComment ?? '',
    },
    sleep: {
      value: formatSleepDuration(measurement?.sleepDurationMinutes ?? 0),
      progress: sleepDurationProgress(measurement?.sleepDurationMinutes ?? 0),
      comment: measurement?.sleepComment ?? '',
    },
  };
}

export function toConditionSummaryFromAverage(item?: MeasurementAverageItem): ConditionSummary {
  const finalScore = item?.finalConditionScore == null ? 0 : Math.round(item.finalConditionScore);

  return {
    finalScore,
    body: {
      value: `${item?.bodyScorePercent ?? 0}%`,
      progress: item?.bodyScorePercent ?? 0,
      comment: item?.bodyComment ?? '',
    },
    mind: {
      value: `${item?.mindScorePercent ?? 0}%`,
      progress: item?.mindScorePercent ?? 0,
      comment: item?.mindComment ?? '',
    },
    sleep: {
      value: formatSleepDuration(item?.sleepDurationMinutes ?? 0),
      progress: sleepDurationProgress(item?.sleepDurationMinutes ?? 0),
      comment: item?.sleepComment ?? '',
    },
  };
}

export function formatSleepDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

/** 권장 수면(8시간)을 100%로 보고 실제 수면 시간을 게이지 진행률로 환산합니다. */
const SLEEP_TARGET_MINUTES = 8 * 60;

export function sleepDurationProgress(totalMinutes: number): number {
  const ratio = (Math.max(0, totalMinutes) / SLEEP_TARGET_MINUTES) * 100;

  return Math.min(100, Math.round(ratio));
}
