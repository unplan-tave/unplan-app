/**
 * queue card를 pin card로 전환할 때 필요한 순수 변환 로직입니다.
 * 추천 수락이나 수동 시간 지정에서 기존 queue 정보를 유지하며 pin form 값으로 바꿉니다.
 */
import type { CardFormValues, CardItem } from './model';

export const UNKNOWN_DURATION_LABEL = '시간 미정';

export const DURATION_INCREMENT_BUTTONS = [
  { label: '1분', minutes: 1 },
  { label: '5분', minutes: 5 },
  { label: '10분', minutes: 10 },
  { label: '30분', minutes: 30 },
  { label: '1시간', minutes: 60 },
  { label: '3시간', minutes: 180 },
] as const;

export interface DueDurationDraft {
  dueDate: string;
  durationHours: number;
  durationMinutes: number;
  durationUnknown: boolean;
}

export function formatDueDateDisplay(dueDate: string): string {
  if (dueDate.trim().length === 0) {
    return '0000.00.00';
  }

  return dueDate.replace(/-/g, '.');
}

export function parseDueDateToDate(dueDate: string): Date | null {
  const parts = dueDate.replace(/-/g, '.').split('.');

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function formatDueDateForStorage(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export function formatDueCountdown(dueDate: string, today = new Date()): string {
  const due = parseDueDateToDate(dueDate);

  if (due == null) {
    return 'D-0';
  }

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'D-Day';
  }

  if (diffDays > 0) {
    return `D-${diffDays}`;
  }

  return `D+${Math.abs(diffDays)}`;
}

export function formatDurationInline(hours: number, minutes: number): string {
  return `${hours}시간 ${minutes}분`;
}

export function formatDurationDisplay(
  hours: number,
  minutes: number,
  options: { includeSuffix?: boolean; includePrefix?: boolean } = {},
): string {
  const { includeSuffix = true, includePrefix = true } = options;
  const prefix = includePrefix ? '약 ' : '';
  const suffix = includeSuffix ? ' 소요' : '';

  return `${prefix}${formatDurationInline(hours, minutes)}${suffix}`;
}

export function addDurationMinutes(hours: number, minutes: number, addMinutes: number) {
  const totalMinutes = hours * 60 + minutes + addMinutes;

  return {
    durationHours: Math.floor(totalMinutes / 60),
    durationMinutes: totalMinutes % 60,
  };
}

export function createDefaultDurationDraft(): Pick<
  DueDurationDraft,
  'durationHours' | 'durationMinutes' | 'durationUnknown'
> {
  return {
    durationHours: 0,
    durationMinutes: 0,
    durationUnknown: false,
  };
}

export function hasQueueDuration(hours: number, minutes: number): boolean {
  return hours > 0 || minutes > 0;
}

export function hasQueueDurationOrUnknown(
  hours: number,
  minutes: number,
  durationUnknown: boolean,
): boolean {
  return durationUnknown || hasQueueDuration(hours, minutes);
}

export function hasDueDate(dueDate: string): boolean {
  return (dueDate ?? '').trim().length > 0;
}

export function isQueueFormComplete(
  values: Pick<
    CardFormValues,
    'title' | 'dueDate' | 'durationHours' | 'durationMinutes' | 'durationUnknown'
  >,
): boolean {
  return (
    values.title.trim().length > 0 &&
    hasDueDate(values.dueDate) &&
    hasQueueDurationOrUnknown(values.durationHours, values.durationMinutes, values.durationUnknown)
  );
}

export function isDueDateInPast(value: string, today = new Date()): boolean {
  const due = parseDueDateToDate(value);

  if (due == null || value.length === 0) {
    return false;
  }

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return due.getTime() < todayStart.getTime();
}

export function compareDueDateValues(first: string, second: string): number {
  const firstDate = parseDueDateToDate(first);
  const secondDate = parseDueDateToDate(second);

  if (firstDate == null || secondDate == null) {
    return 0;
  }

  return firstDate.getTime() - secondDate.getTime();
}

export function getMockRecommendationLabel(): string {
  return '오늘 오후 2:00 ~ 6:30';
}

export function getMockRecommendationDate(today = new Date()): string {
  return formatDueDateForStorage(today);
}

export function getMockRecommendationTimeRange(): readonly [string, string] {
  return ['14:00', '18:30'] as const;
}

export function createQueueToPinValues(card: CardItem, today = new Date()): CardFormValues {
  const [timeStart, timeEnd] = getMockRecommendationTimeRange();

  return {
    ...card,
    dateMode: 'single',
    dateStart: getMockRecommendationDate(today),
    dateEnd: '',
    timeFilled: true,
    timeStart,
    timeEnd,
    recommendationAcknowledged: true,
  };
}

export interface RecommendationCandidate {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export function getMockRecommendationCandidates(today = new Date()): RecommendationCandidate[] {
  const todayStr = formatDueDateForStorage(today);
  const day1Str = formatDueDateForStorage(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  );
  const day2Str = formatDueDateForStorage(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
  );

  return [
    {
      id: '1',
      date: todayStr,
      startTime: '14:30',
      endTime: '16:00',
      description: '다음 일정 전까지 충분한 여유가 있으며,\n몰입하기 좋은 시간대예요.',
    },
    {
      id: '2',
      date: todayStr,
      startTime: '17:00',
      endTime: '19:30',
      description: '저녁 전 집중력이 높아지는 시간대예요.',
    },
    {
      id: '3',
      date: day1Str,
      startTime: '10:00',
      endTime: '12:30',
      description: '오전 집중 시간대로 능률이 가장 높아요.',
    },
    {
      id: '4',
      date: day2Str,
      startTime: '15:00',
      endTime: '17:00',
      description: '오후 활동 에너지가 충분한 시간대예요.',
    },
  ];
}

export function createQueueToPinValuesFromCandidate(
  card: CardItem,
  candidate: RecommendationCandidate,
): CardFormValues {
  return {
    ...card,
    dateMode: 'single',
    dateStart: candidate.date,
    dateEnd: '',
    timeFilled: true,
    timeStart: candidate.startTime,
    timeEnd: candidate.endTime,
    recommendationAcknowledged: true,
  };
}
