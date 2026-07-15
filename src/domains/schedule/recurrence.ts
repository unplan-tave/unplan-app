/**
 * schedule 반복 일정 모델과 변환 로직입니다.
 * UI preset, 종료 조건, 요일 선택 값을 API recurrence 요청과 화면 label로 이어 줍니다.
 */
export type RecurrencePreset = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type RecurrenceEndType = 'never' | 'count' | 'until';

export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceValue {
  preset: RecurrencePreset;
  interval: number;
  freq: RecurrenceFreq;
  byDay: number[];
  endType: RecurrenceEndType;
  occurrenceCount: number;
  until: string;
}

export const RECURRENCE_INTERVAL_MIN = 1;
export const RECURRENCE_INTERVAL_MAX = 999;

export const KOREAN_WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const RECURRENCE_FREQ_OPTIONS: ReadonlyArray<{
  freq: RecurrenceFreq;
  label: string;
  unitLabel: string;
}> = [
  { freq: 'DAILY', label: '일마다', unitLabel: '일' },
  { freq: 'WEEKLY', label: '주마다', unitLabel: '주' },
  { freq: 'MONTHLY', label: '개월마다', unitLabel: '개월' },
  { freq: 'YEARLY', label: '년마다', unitLabel: '년' },
];

export const RECURRENCE_END_OPTIONS: ReadonlyArray<{ type: RecurrenceEndType; label: string }> = [
  { type: 'never', label: '종료 안 함' },
  { type: 'count', label: '반복 횟수 지정' },
  { type: 'until', label: '종료일 지정' },
];

export const WEEKLY_DETAIL_DAYS = [
  { label: '월', value: 1 },
  { label: '화', value: 2 },
  { label: '수', value: 3 },
  { label: '목', value: 4 },
  { label: '금', value: 5 },
  { label: '토', value: 6 },
  { label: '일', value: 0 },
] as const;

export const DIGIT_ITEMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function cloneRecurrenceValue(value: RecurrenceValue): RecurrenceValue {
  return {
    preset: value.preset,
    interval: value.interval,
    freq: value.freq,
    byDay: [...value.byDay],
    endType: value.endType,
    occurrenceCount: value.occurrenceCount,
    until: value.until,
  };
}

export function getWeekdayFromDate(dateStart: string) {
  const date = parseDateValue(dateStart);

  if (date == null) {
    return new Date().getDay();
  }

  return date.getDay();
}

export function getMonthDayFromDate(dateStart: string) {
  const date = parseDateValue(dateStart);

  if (date == null) {
    return new Date().getDate();
  }

  return date.getDate();
}

export function createPresetRecurrence(
  preset: Exclude<RecurrencePreset, 'custom'>,
  dateStart: string,
): RecurrenceValue {
  const weekday = getWeekdayFromDate(dateStart);

  switch (preset) {
    case 'daily':
      return {
        preset,
        interval: 1,
        freq: 'DAILY',
        byDay: [],
        endType: 'never',
        occurrenceCount: 10,
        until: dateStart,
      };
    case 'weekly':
      return {
        preset,
        interval: 1,
        freq: 'WEEKLY',
        byDay: [weekday],
        endType: 'never',
        occurrenceCount: 10,
        until: dateStart,
      };
    case 'monthly':
      return {
        preset,
        interval: 1,
        freq: 'MONTHLY',
        byDay: [],
        endType: 'never',
        occurrenceCount: 10,
        until: dateStart,
      };
    case 'yearly':
      return {
        preset,
        interval: 1,
        freq: 'YEARLY',
        byDay: [],
        endType: 'never',
        occurrenceCount: 10,
        until: dateStart,
      };
  }
}

export function createDefaultCustomRecurrence(dateStart: string): RecurrenceValue {
  return {
    preset: 'custom',
    interval: 1,
    freq: 'DAILY',
    byDay: [getWeekdayFromDate(dateStart)],
    endType: 'never',
    occurrenceCount: 10,
    until: dateStart,
  };
}

export function clampRecurrenceInterval(value: number) {
  return Math.min(RECURRENCE_INTERVAL_MAX, Math.max(RECURRENCE_INTERVAL_MIN, value));
}

export function splitIntervalDigits(value: number) {
  const clamped = clampRecurrenceInterval(value);
  const hundreds = Math.floor(clamped / 100);
  const tens = Math.floor((clamped % 100) / 10);
  const ones = clamped % 10;

  return { hundreds, tens, ones };
}

export function combineIntervalDigits(hundreds: number, tens: number, ones: number) {
  return clampRecurrenceInterval(hundreds * 100 + tens * 10 + ones);
}

export function normalizeRecurrenceForCustomEdit(
  value: RecurrenceValue,
  scheduleDate: string,
): RecurrenceValue {
  if (value.preset === 'custom') {
    return cloneRecurrenceValue(value);
  }

  const presetValue = createPresetRecurrence(value.preset, scheduleDate);

  return {
    ...presetValue,
    preset: 'custom',
    endType: value.endType,
    occurrenceCount: value.occurrenceCount,
    until: value.until,
    byDay: value.byDay.length > 0 ? [...value.byDay] : presetValue.byDay,
  };
}

function formatRecurrenceCycleLabel(value: RecurrenceValue) {
  if (value.preset === 'daily') {
    return '매일';
  }

  if (value.preset === 'weekly') {
    return '매주';
  }

  if (value.preset === 'monthly') {
    return '매월';
  }

  if (value.preset === 'yearly') {
    return '매년';
  }

  const unit = RECURRENCE_FREQ_OPTIONS.find((option) => option.freq === value.freq)?.unitLabel;

  return unit != null ? `${value.interval}${unit}마다` : null;
}

function formatRecurrenceWeeklyDetailLabel(value: RecurrenceValue) {
  const isWeekly =
    value.preset === 'weekly' || (value.preset === 'custom' && value.freq === 'WEEKLY');

  if (!isWeekly || value.byDay.length === 0) {
    return null;
  }

  const dayLabels = [...value.byDay]
    .sort((first, second) => first - second)
    .map((day) => KOREAN_WEEKDAY_LABELS[day])
    .join(', ');

  return `(${dayLabels})`;
}

function formatRecurrenceEndDetailLabel(value: RecurrenceValue) {
  if (value.endType === 'count') {
    return `${value.occurrenceCount}회 반복`;
  }

  if (value.endType === 'until') {
    return `${value.until}까지`;
  }

  return null;
}

export function formatRecurrenceSummary(value: RecurrenceValue) {
  const parts = [
    formatRecurrenceCycleLabel(value),
    formatRecurrenceWeeklyDetailLabel(value),
    formatRecurrenceEndDetailLabel(value),
  ].filter((part): part is string => part != null);

  return parts.join(' · ');
}

export function formatRecurrenceChipSegments(value: RecurrenceValue) {
  const segments: Array<{ text: string; muted: boolean }> = [];

  const pushMutedDot = () => {
    if (segments.length > 0) {
      segments.push({ text: '∙', muted: true });
    }
  };

  const cycleLabel = formatRecurrenceCycleLabel(value);

  if (cycleLabel != null) {
    segments.push({ text: cycleLabel, muted: false });
  }

  const weeklyDetail = formatRecurrenceWeeklyDetailLabel(value);

  if (weeklyDetail != null) {
    pushMutedDot();
    segments.push({ text: weeklyDetail, muted: false });
  }

  const endDetail = formatRecurrenceEndDetailLabel(value);

  if (endDetail != null) {
    pushMutedDot();
    segments.push({ text: endDetail, muted: false });
  }

  return segments;
}

export function isDateOnOrAfterSchedule(dateValue: string, scheduleDate: string) {
  if (scheduleDate.length === 0) {
    return true;
  }

  return dateValue >= scheduleDate;
}

function parseDateValue(dateValue: string) {
  const [year, month, day] = dateValue.split('.').map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}
