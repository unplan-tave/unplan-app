/** 수면 DTO를 domain model로 변환합니다. */
import type { SleepRecord, SleepRecordInput } from '../model';
import type { SleepCreate, SleepResponse, SleepUpdate } from '@/lib/api/model';

/** 서버 수면 응답의 optional 값을 안전한 domain model로 정규화합니다. */
export function toSleepRecord(response?: SleepResponse): SleepRecord {
  return {
    id: response?.sleepId ?? 0,
    bedTime: response?.bedTime ?? '',
    wakeUpTime: response?.wakeUpTime ?? '',
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
