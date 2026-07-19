/** 수면 DTO를 domain model로 변환합니다. */
import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

import type { SleepDayRecord, SleepRecord, SleepRecordInput } from '../model';
import type {
  SleepCreate,
  SleepRecord as SleepRecordDto,
  SleepResponse,
  SleepUpdate,
} from '@/lib/api/model';

const SLEEP_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/** 수면 응답이 화면에서 사용할 수 없는 값을 포함할 때 발생합니다. */
export class SleepResponseValidationError extends Error {
  constructor(field: 'bedTime' | 'wakeUpTime') {
    super(`Invalid ${field} in sleep response`);
    this.name = 'SleepResponseValidationError';
  }
}

/** 서버 수면 응답을 화면에서 신뢰할 수 있는 domain model로 변환합니다. */
export function toSleepRecord(response?: SleepResponse): SleepRecord {
  return {
    id: response?.sleepId ?? 0,
    bedTime: toSleepTime(response?.bedTime, 'bedTime'),
    wakeUpTime: toSleepTime(response?.wakeUpTime, 'wakeUpTime'),
    durationMinutes: response?.durationMinutes ?? 0,
    totalDurationMinutes: response?.totalDurationMinutes ?? 0,
    isNap: response?.isNap ?? false,
    isAllNight: response?.isAllNight ?? false,
    isContinuousSleep: response?.isContinuousSleep ?? false,
    continuousSleepGroupId: response?.continuousSleepGroupId ?? null,
    comment: response?.sleepRecordComment ?? null,
    createdAt: response?.createdAt ?? null,
  };
}

/** GET /measurements의 날짜별 수면 DTO를 기록 카드 ViewModel으로 변환합니다. */
export function toSleepDayRecord(record: SleepRecordDto, selectedDate: string): SleepDayRecord {
  const bedTime = parseSleepDateTime(record.bed_time);
  const wakeUpTime = parseSleepDateTime(record.wake_up_time);

  return {
    id: record.sleep_id ?? 0,
    kind: record.isNap ? 'nap' : record.isAllNight ? 'allNight' : 'sleep',
    bedTime: bedTime == null ? '' : format(bedTime, 'HH:mm'),
    wakeUpTime: wakeUpTime == null ? '' : format(wakeUpTime, 'HH:mm'),
    bedDayOffset: dateOffset(selectedDate, bedTime),
    wakeDayOffset: dateOffset(selectedDate, wakeUpTime),
    durationMinutes: record.duration_minutes ?? 0,
    totalDurationMinutes: record.total_duration_minutes ?? record.duration_minutes ?? 0,
    isContinuousSleep: record.isContinuousSleep ?? false,
    comment: record.sleep_record_comment ?? '',
    originalBedTime: record.original_bed_time ?? null,
    originalWakeUpTime: record.original_wake_up_time ?? null,
  };
}

/** 수면 입력을 생성 DTO로 변환합니다. */
export function toSleepCreateRequest(input: SleepRecordInput): SleepCreate {
  return {
    bed_time: input.bedTime,
    wake_up_time: input.wakeUpTime,
    is_nap: input.isNap,
    is_all_night: input.isAllNight,
  };
}

/** 수면 입력을 수정 DTO로 변환합니다. */
export function toSleepUpdateRequest(input: SleepRecordInput): SleepUpdate {
  return toSleepCreateRequest(input);
}

function toSleepTime(value: unknown, field: 'bedTime' | 'wakeUpTime'): string {
  if (typeof value !== 'string') {
    throw new SleepResponseValidationError(field);
  }

  if (SLEEP_TIME_PATTERN.test(value)) return value;

  const dateTime = parseSleepDateTime(value);
  if (dateTime != null) return format(dateTime, 'HH:mm');

  throw new SleepResponseValidationError(field);
}

function parseSleepDateTime(value: string | undefined): Date | null {
  if (value == null) return null;

  const parsed = parseISO(value);

  return isValid(parsed) ? parsed : null;
}

/** 선택 일자보다 이전이면 양수, 이후이면 음수인 카드 포맷용 오프셋입니다. */
function dateOffset(selectedDate: string, dateTime: Date | null): number {
  if (dateTime == null) return 0;

  const selected = parseISO(selectedDate);
  if (!isValid(selected)) return 0;

  return -differenceInCalendarDays(dateTime, selected);
}
