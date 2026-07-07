export interface MinuteRange {
  /** 자정 기준 경과 분 (0 ~ 1439) */
  startMinutes: number;
  endMinutes: number;
}

export interface RecommendationCriteria {
  minFreeMinutes: number;
  excludeEnabled: boolean;
  excludeRanges: MinuteRange[];
}

export interface RecommendationCriteriaSettings extends RecommendationCriteria {
  isRecommendOn: boolean;
}

export const MINUTES_PER_DAY = 24 * 60;

export const DEFAULT_EXCLUDE_RANGE: MinuteRange = {
  startMinutes: 0,
  endMinutes: 8 * 60,
};

export const DEFAULT_RECOMMENDATION_CRITERIA: RecommendationCriteria = {
  minFreeMinutes: 0,
  excludeEnabled: false,
  excludeRanges: [],
};

export const DEFAULT_RECOMMENDATION_CRITERIA_SETTINGS: RecommendationCriteriaSettings = {
  isRecommendOn: true,
  ...DEFAULT_RECOMMENDATION_CRITERIA,
};

export function isValidMinuteRange(range: MinuteRange): boolean {
  return (
    range.startMinutes >= 0 &&
    range.endMinutes < MINUTES_PER_DAY &&
    range.startMinutes < range.endMinutes
  );
}

export function hasOverlappingRange(
  ranges: MinuteRange[],
  candidate: MinuteRange,
  ignoreIndex?: number,
): boolean {
  return ranges.some(
    (range, index) =>
      index !== ignoreIndex &&
      candidate.startMinutes < range.endMinutes &&
      range.startMinutes < candidate.endMinutes,
  );
}

/** 분 → "0시간 20분" */
export function formatDurationLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}시간 ${minutes}분`;
}

/** 분 → "07:30" */
export function formatClockLabel(totalMinutes: number): string {
  return toClockTime(totalMinutes);
}

export function toClockTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseClockToMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function sortMinuteRanges(ranges: MinuteRange[]): MinuteRange[] {
  return [...ranges].sort((first, second) => first.startMinutes - second.startMinutes);
}
