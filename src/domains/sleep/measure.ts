/** 수면 측정(기록 추가/수정) 화면의 순수 시간 계산 로직입니다. */

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** 'HH:mm' 문자열을 자정 기준 분으로 변환합니다. 형식이 어긋나면 0을 반환합니다. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map((part) => Number.parseInt(part, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;

  return hours * MINUTES_PER_HOUR + minutes;
}

/** 자정 기준 분을 'HH:mm'으로 변환합니다. (하루를 넘어가면 24시간으로 접습니다) */
export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / MINUTES_PER_HOUR);
  const mins = normalized % MINUTES_PER_HOUR;

  return `${pad2(hours)}:${pad2(mins)}`;
}

/**
 * 취침~기상 사이 길이(분)를 계산합니다.
 * dayOffset은 취침일과 기상일 사이 일수이며, 같은 날 기상 시각이 취침보다 이르면 자정을 넘긴 것으로 봅니다.
 */
export function durationBetween(bedTime: string, wakeUpTime: string, dayOffset: number): number {
  const bed = timeToMinutes(bedTime);
  const wake = timeToMinutes(wakeUpTime) + Math.max(0, dayOffset) * MINUTES_PER_DAY;
  const diff = wake - bed;

  if (diff <= 0) return diff + MINUTES_PER_DAY;

  return diff;
}

/** 취침 시각과 길이(분)로 기상 시각을 계산합니다. */
export function wakeTimeFromDuration(bedTime: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(bedTime) + durationMinutes);
}

/** 분을 {hours, minutes} 튜플로 나눕니다. */
export function splitDuration(minutes: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.round(minutes));

  return { hours: Math.floor(safe / MINUTES_PER_HOUR), minutes: safe % MINUTES_PER_HOUR };
}

/** {hours, minutes}를 분으로 합칩니다. */
export function joinDuration(hours: number, minutes: number): number {
  return hours * MINUTES_PER_HOUR + minutes;
}

/** 길이 휠에서 고를 수 있는 시간 값(0~23)입니다. */
export const SLEEP_HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);

/** 길이 휠에서 고를 수 있는 분 값(0~59)입니다. */
export const SLEEP_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

/** 시각 선택 시트에서 고를 수 있는 'HH:mm' 값(10분 간격)입니다. */
export const SLEEP_TIME_OPTIONS = Array.from({ length: MINUTES_PER_DAY / 10 }, (_, index) =>
  minutesToTime(index * 10),
);

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}
