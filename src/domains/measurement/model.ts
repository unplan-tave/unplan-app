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
  body: { value: string; progress: number };
  mind: { value: string; progress: number };
  sleep: { value: string; progress: number };
}

export function toConditionSummaryFromDaily(
  measurement?: DailyMeasurementSummary,
): ConditionSummary {
  return {
    finalScore: measurement?.finalConditionScore ?? 0,
    body: {
      value: `${measurement?.bodyScorePercent ?? 0}%`,
      progress: measurement?.bodyScorePercent ?? 0,
    },
    mind: {
      value: `${measurement?.mindScorePercent ?? 0}%`,
      progress: measurement?.mindScorePercent ?? 0,
    },
    sleep: {
      value: formatSleepDuration(measurement?.sleepDurationMinutes ?? 0),
      progress: measurement?.sleepScore ?? 0,
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
    },
    mind: {
      value: `${item?.mindScorePercent ?? 0}%`,
      progress: item?.mindScorePercent ?? 0,
    },
    sleep: {
      value: formatSleepDuration(item?.sleepDurationMinutes ?? 0),
      progress: item?.sleepScore ?? 0,
    },
  };
}

export function formatSleepDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}
