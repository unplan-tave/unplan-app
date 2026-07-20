import { parseTimeToMinutes } from '@/domains/schedule/time';
import { formatDateValue } from '@/lib/utils/date';

import type { ConditionTagId } from '@/domains/schedule/model';

/**
 * ai-recommendation 도메인의 화면 독립 모델입니다.
 * 추천 기준 설정, 제외 시간대, 추천 수락 입력처럼 API와 UI가 공유하는 순수 데이터를 정의합니다.
 */
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

export interface AcceptConditionRecommendationInput {
  recommendId: number;
  keepQueueCard?: boolean;
  recoveryMean?: string;
}

/** 추천 수락 후 생성·전환된 일정의 결과입니다. */
export interface AcceptRecommendationResult {
  scheduleId: number | null;
  created: boolean;
}

/** 빈 시간에 배치할 수 있는 큐 카드 추천입니다. */
export interface ScheduleRecommendation {
  recommendId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  estimatedMinutes: number | null;
  deadline: string | null;
  conditionTagId: ConditionTagId;
  displayOrder: number | null;
}

/** 큐 카드별 시간 후보 API의 안전한 해석 결과입니다. */
export interface QueueTimeRecommendationResult {
  candidates: ScheduleRecommendation[];
  canExtendTo14Days: boolean;
  mustChangeDuration: boolean;
}

/** 현재 기기 시각 이후에 시작하는 추천인지 확인합니다. 잘못된 날짜·시각은 표시하지 않습니다. */
export function isUpcomingScheduleRecommendation(
  recommendation: Pick<ScheduleRecommendation, 'date' | 'startTime'>,
  now = new Date(),
): boolean {
  const today = formatDateValue(now);

  if (recommendation.date > today) return true;
  if (recommendation.date < today) return false;

  const startMinutes = parseTimeToMinutes(recommendation.startTime);
  if (startMinutes == null) return false;

  return startMinutes > now.getHours() * 60 + now.getMinutes();
}

export type QueueTimeRecommendationErrorMode = 'error-no-duration' | 'error-7day' | 'error-14day';

export type RecommendationAcceptErrorKind = 'expired' | 'conflict' | 'network' | 'unknown';

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
