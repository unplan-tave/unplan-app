/** 수면 기록 내역 표시용 순수 포맷 함수 모음입니다. */
import type { SleepDayRecord, SleepRecordKind } from './model';

const MINUTES_PER_HOUR = 60;

/** 종류별 카드 라벨입니다. */
export function sleepKindLabel(kind: SleepRecordKind): string {
  if (kind === 'nap') return '낮잠';
  if (kind === 'allNight') return '밤샘';

  return '수면';
}

/**
 * 카드 제목용 길이 표기입니다.
 * 0시간이면 '분'만 표시하고, 그 외에는 'H시간 M분'으로 표시합니다. (예: 30분 / 7시간 30분)
 */
export function formatSleepDuration(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / MINUTES_PER_HOUR);
  const mins = safeMinutes % MINUTES_PER_HOUR;

  if (hours === 0) return `${mins}분`;

  return `${hours}시간 ${mins}분`;
}

/** 합계·연속수면 전체값용 길이 표기입니다. 항상 'H시간 M분'을 표시합니다. (예: 24시간 0분) */
export function formatSleepDurationLong(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / MINUTES_PER_HOUR);
  const mins = safeMinutes % MINUTES_PER_HOUR;

  return `${hours}시간 ${mins}분`;
}

/** 선택 날짜 기준 상대 일자를 '전날 '·'2일 전 '·'다음날 ' 같은 접두사로 변환합니다. */
function dayOffsetPrefix(offset: number): string {
  if (offset === 0) return '';
  if (offset === 1) return '전날 ';
  if (offset === -1) return '다음날 ';
  if (offset > 1) return `${offset}일 전 `;

  return `${-offset}일 후 `;
}

/** 카드 상단 시간대 표기입니다. (예: 전날 23:00 – 07:00 / 전날 23:00 – 다음날 07:30) */
export function formatSleepTimeRange(record: SleepDayRecord): string {
  const start = `${dayOffsetPrefix(record.bedDayOffset)}${record.bedTime}`;
  const end = `${dayOffsetPrefix(record.wakeDayOffset)}${record.wakeUpTime}`;

  return `${start} – ${end}`;
}

/**
 * 카드 제목입니다. Figma 표기에 맞춰 1시간 미만도 '0시간 N분'으로 표시합니다.
 * 연속수면이면 '(전체 …)' 접미사를 붙입니다.
 * (예: 24시간 0분 (전체 32시간 30분))
 */
export function formatSleepCardTitle(record: SleepDayRecord): string {
  const duration = formatSleepDurationLong(record.durationMinutes);

  if (record.isContinuousSleep && record.totalDurationMinutes !== record.durationMinutes) {
    return `${duration} (전체 ${formatSleepDurationLong(record.totalDurationMinutes)})`;
  }

  return duration;
}

/** 연속수면은 각 날짜 카드에서도 원래의 수면 구간을 안내합니다. */
export function formatSleepCardComment(record: SleepDayRecord): string {
  if (!record.isContinuousSleep) return record.comment;

  const bedDate = formatSleepDate(record.originalBedTime);
  const wakeDate = formatSleepDate(record.originalWakeUpTime);

  if (bedDate == null || wakeDate == null) return record.comment;

  return `${bedDate}~${wakeDate}까지의 연속수면이에요`;
}

/** 헤더 합계 라벨입니다. (예: Sleep 8시간 50분 (연속수면)) */
export function formatSleepTotalLabel(totalMinutes: number, isContinuousSleep: boolean): string {
  const base = `Sleep ${formatSleepDurationLong(totalMinutes)}`;

  return isContinuousSleep ? `${base} (연속수면)` : base;
}

function formatSleepDate(value: string | null): string | null {
  if (value == null) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
