/** 수면 DTO를 domain model로 변환합니다. */
import type { SleepRecord, SleepRecordInput } from '../model';
import type { SleepCreate, SleepResponse, SleepUpdate } from '@/lib/api/model';

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
  if (typeof value !== 'string' || !SLEEP_TIME_PATTERN.test(value)) {
    throw new SleepResponseValidationError(field);
  }

  return value;
}
