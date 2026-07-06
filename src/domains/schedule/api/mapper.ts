import {
  RecurrenceRequestFreq,
  ScheduleCreateRequestConditionTag,
  ScheduleCreateRequestRemindSoundType,
  ScheduleCreateRequestRemindType,
  ScheduleDetailResponseConditionTag,
  ScheduleDetailResponseRemindSoundType,
  ScheduleDetailResponseRemindType,
  ScheduleDetailResponseStatus,
  ScheduleGetResponseConditionTag,
  ScheduleGetResponseStatus,
  ScheduleUpdateRequestConditionTag,
  ScheduleUpdateRequestRemindSoundType,
  ScheduleUpdateRequestRemindType,
  ScheduleUpdateRequestStatus,
} from '@/lib/api/model';

import { getMonthDayFromDate } from '../recurrence';

import type {
  ConditionTagId,
  DailyScheduleGroup,
  DailyScheduleSummary,
  MonthlyScheduleCount,
  ReminderSoundType,
  ReminderType,
  ScheduleCreateInput,
  ScheduleCreateResult,
  ScheduleDetail,
  ScheduleListItem,
  ScheduleMonthlyOverview,
  ScheduleStatus,
  ScheduleUpdateInput,
} from '../model';
import type { RecurrenceValue } from '../recurrence';
import type {
  DailyCount,
  DailySchedules,
  RecurrenceRequest,
  ScheduleCreateRequest,
  ScheduleCreateResponse,
  ScheduleDetailResponse,
  ScheduleGetResponse,
  ScheduleMonthlyResponse,
  ScheduleSummary,
  ScheduleUpdateRequest,
  ScheduleWeeklyResponse,
} from '@/lib/api/model';

const API_WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

const conditionTagToCreateDtoMap: Record<ConditionTagId, ScheduleCreateRequestConditionTag> = {
  urgent: ScheduleCreateRequestConditionTag.URGENT,
  core: ScheduleCreateRequestConditionTag.CORE_TASK,
  brain: ScheduleCreateRequestConditionTag.BRAIN_WORK,
  daily: ScheduleCreateRequestConditionTag.DAILY_TASK,
  labor: ScheduleCreateRequestConditionTag.SIMPLE_TASK,
  rest: ScheduleCreateRequestConditionTag.RECOVERY,
};

const conditionTagToUpdateDtoMap: Record<ConditionTagId, ScheduleUpdateRequestConditionTag> = {
  urgent: ScheduleUpdateRequestConditionTag.URGENT,
  core: ScheduleUpdateRequestConditionTag.CORE_TASK,
  brain: ScheduleUpdateRequestConditionTag.BRAIN_WORK,
  daily: ScheduleUpdateRequestConditionTag.DAILY_TASK,
  labor: ScheduleUpdateRequestConditionTag.SIMPLE_TASK,
  rest: ScheduleUpdateRequestConditionTag.RECOVERY,
};

const createReminderTypeMap: Record<ReminderType, ScheduleCreateRequestRemindType> = {
  before: ScheduleCreateRequestRemindType.BEFORE,
  after: ScheduleCreateRequestRemindType.AFTER,
};

const updateReminderTypeMap: Record<ReminderType, ScheduleUpdateRequestRemindType> = {
  before: ScheduleUpdateRequestRemindType.BEFORE,
  after: ScheduleUpdateRequestRemindType.AFTER,
};

const createReminderSoundTypeMap: Record<ReminderSoundType, ScheduleCreateRequestRemindSoundType> =
  {
    sound: ScheduleCreateRequestRemindSoundType.SOUND,
    vibrate: ScheduleCreateRequestRemindSoundType.VIBRATE,
  };

const updateReminderSoundTypeMap: Record<ReminderSoundType, ScheduleUpdateRequestRemindSoundType> =
  {
    sound: ScheduleUpdateRequestRemindSoundType.SOUND,
    vibrate: ScheduleUpdateRequestRemindSoundType.VIBRATE,
  };

const statusToUpdateDtoMap: Record<ScheduleStatus, ScheduleUpdateRequestStatus> = {
  todo: ScheduleUpdateRequestStatus.TODO,
  inProgress: ScheduleUpdateRequestStatus.IN_PROGRESS,
  done: ScheduleUpdateRequestStatus.DONE,
};

export function toScheduleListItems(response?: ScheduleGetResponse[]): ScheduleListItem[] {
  return (response ?? []).map(toScheduleListItem);
}

export function toScheduleListItem(response: ScheduleGetResponse): ScheduleListItem {
  return {
    id: response.schedule_id ?? 0,
    title: response.title ?? '',
    date: normalizeDateForView(response.date),
    startTime: response.start_time ?? '',
    endTime: response.end_time ?? '',
    estimatedMinutes: response.estimated_time ?? null,
    isQueue: response.is_queue ?? false,
    status: toScheduleStatus(response.status),
    conditionTagId: toConditionTagId(response.condition_tag),
  };
}

export function toScheduleDetail(response: ScheduleDetailResponse): ScheduleDetail {
  return {
    id: response.schedule_id ?? 0,
    title: response.title ?? '',
    date: normalizeDateForView(response.date),
    startTime: response.start_time ?? '',
    endTime: response.end_time ?? '',
    estimatedMinutes: response.estimated_time ?? null,
    isQueue: response.is_queue ?? false,
    status: toScheduleStatus(response.status),
    conditionTagId: toConditionTagId(response.condition_tag),
    memo: response.memo ?? '',
    location: response.location ?? '',
    latitude: response.latitude ?? null,
    longitude: response.longitude ?? null,
    isReminderEnabled: response.is_remind_on ?? false,
    reminderMinutes: response.remind_minutes ?? null,
    reminderType: toReminderType(response.remind_type),
    reminderSoundType: toReminderSoundType(response.remind_sound_type),
    isRecurring: response.is_recurring ?? false,
    isConflict: response.is_conflict ?? false,
  };
}

export function toScheduleCreateResult(response: ScheduleCreateResponse): ScheduleCreateResult {
  return {
    id: response.schedule_id ?? 0,
    title: response.title ?? '',
    date: normalizeDateForView(response.date),
    startTime: response.start_time ?? '',
    endTime: response.end_time ?? '',
    estimatedMinutes: response.estimated_time ?? null,
    isQueue: response.is_queue ?? false,
  };
}

export function toDailyScheduleGroups(response?: ScheduleWeeklyResponse): DailyScheduleGroup[] {
  return (response?.weekly_schedules ?? []).map(toDailyScheduleGroup);
}

export function toScheduleMonthlyOverview(
  response?: ScheduleMonthlyResponse,
): ScheduleMonthlyOverview {
  return {
    yearMonth: response?.year_month ?? '',
    schedules: (response?.schedules ?? []).map(toMonthlyScheduleCount),
  };
}

export function toScheduleCreateRequest(input: ScheduleCreateInput): ScheduleCreateRequest {
  return {
    title: input.title,
    condition_tag: conditionTagToCreateDtoMap[input.conditionTagId],
    personal_tags: input.personalTags,
    date: normalizeDateForRequest(input.date),
    start_time: input.startTime,
    end_time: input.endTime,
    estimated_time: input.estimatedMinutes,
    latitude: input.latitude,
    longitude: input.longitude,
    memo: input.memo,
    is_remind_on: input.isReminderEnabled ?? false,
    remind_minutes: input.reminderMinutes,
    remind_type: input.reminderType == null ? undefined : createReminderTypeMap[input.reminderType],
    remind_sound_type:
      input.reminderSoundType == null
        ? undefined
        : createReminderSoundTypeMap[input.reminderSoundType],
    recurrence:
      input.recurrence == null || input.date == null
        ? undefined
        : toRecurrenceRequest(input.recurrence, input.date),
  };
}

export function toScheduleUpdateRequest(input: ScheduleUpdateInput): ScheduleUpdateRequest {
  return {
    title: input.title,
    condition_tag:
      input.conditionTagId == null ? undefined : conditionTagToUpdateDtoMap[input.conditionTagId],
    date: normalizeDateForRequest(input.date),
    start_time: input.startTime,
    end_time: input.endTime,
    estimated_time: input.estimatedMinutes,
    memo: input.memo,
    status: input.status == null ? undefined : statusToUpdateDtoMap[input.status],
    is_remind_on: input.isReminderEnabled,
    remind_minutes: input.reminderMinutes,
    remind_type: input.reminderType == null ? undefined : updateReminderTypeMap[input.reminderType],
    remind_sound_type:
      input.reminderSoundType == null
        ? undefined
        : updateReminderSoundTypeMap[input.reminderSoundType],
  };
}

function toDailyScheduleGroup(response: DailySchedules): DailyScheduleGroup {
  return {
    date: normalizeDateForView(response.date),
    schedules: (response.schedules ?? []).map(toDailyScheduleSummary),
  };
}

function toDailyScheduleSummary(response: ScheduleSummary): DailyScheduleSummary {
  return {
    id: response.schedule_id ?? 0,
    title: response.title ?? '',
  };
}

function toMonthlyScheduleCount(response: DailyCount): MonthlyScheduleCount {
  return {
    date: normalizeDateForView(response.date),
    count: response.count ?? 0,
  };
}

function toConditionTagId(
  conditionTag?: ScheduleGetResponseConditionTag | ScheduleDetailResponseConditionTag,
): ConditionTagId {
  switch (conditionTag) {
    case ScheduleGetResponseConditionTag.URGENT:
    case ScheduleDetailResponseConditionTag.URGENT:
      return 'urgent';
    case ScheduleGetResponseConditionTag.CORE_TASK:
    case ScheduleDetailResponseConditionTag.CORE_TASK:
      return 'core';
    case ScheduleGetResponseConditionTag.BRAIN_WORK:
    case ScheduleDetailResponseConditionTag.BRAIN_WORK:
      return 'brain';
    case ScheduleGetResponseConditionTag.SIMPLE_TASK:
    case ScheduleDetailResponseConditionTag.SIMPLE_TASK:
      return 'labor';
    case ScheduleGetResponseConditionTag.RECOVERY:
    case ScheduleDetailResponseConditionTag.RECOVERY:
      return 'rest';
    case ScheduleGetResponseConditionTag.DAILY_TASK:
    case ScheduleDetailResponseConditionTag.DAILY_TASK:
    default:
      return 'daily';
  }
}

function toScheduleStatus(
  status?: ScheduleGetResponseStatus | ScheduleDetailResponseStatus,
): ScheduleStatus {
  switch (status) {
    case ScheduleGetResponseStatus.DONE:
    case ScheduleDetailResponseStatus.DONE:
      return 'done';
    case ScheduleGetResponseStatus.IN_PROGRESS:
    case ScheduleDetailResponseStatus.IN_PROGRESS:
      return 'inProgress';
    case ScheduleGetResponseStatus.TODO:
    case ScheduleDetailResponseStatus.TODO:
    default:
      return 'todo';
  }
}

function toReminderType(type?: ScheduleDetailResponseRemindType): ReminderType | null {
  switch (type) {
    case ScheduleDetailResponseRemindType.AFTER:
      return 'after';
    case ScheduleDetailResponseRemindType.BEFORE:
      return 'before';
    default:
      return null;
  }
}

function toReminderSoundType(
  type?: ScheduleDetailResponseRemindSoundType,
): ReminderSoundType | null {
  switch (type) {
    case ScheduleDetailResponseRemindSoundType.VIBRATE:
      return 'vibrate';
    case ScheduleDetailResponseRemindSoundType.SOUND:
      return 'sound';
    default:
      return null;
  }
}

function toRecurrenceRequest(value: RecurrenceValue, scheduleDate: string): RecurrenceRequest {
  const request: RecurrenceRequest = {
    freq: RecurrenceRequestFreq[value.freq],
    interval: value.interval,
    until:
      value.endType === 'until'
        ? normalizeDateForRequest(value.until)
        : value.endType === 'count'
          ? normalizeDateForRequest(estimateUntilByCount(value, scheduleDate))
          : '2099-12-31',
  };

  if (value.freq === 'WEEKLY' && value.byDay.length > 0) {
    request.by_day = value.byDay.map((day) => API_WEEKDAY_CODES[day]).join(',');
  }

  if (value.freq === 'MONTHLY') {
    request.by_month_day = String(getMonthDayFromDate(scheduleDate));
  }

  return request;
}

function estimateUntilByCount(value: RecurrenceValue, scheduleDate: string) {
  const startDate = parseDateValue(scheduleDate) ?? new Date();
  const occurrences = Math.max(value.occurrenceCount - 1, 0);
  const nextDate = new Date(startDate);

  switch (value.freq) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + occurrences * value.interval);
      break;
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + occurrences * value.interval * 7);
      break;
    case 'MONTHLY':
      addMonthsClamped(nextDate, occurrences * value.interval);
      break;
    case 'YEARLY':
      addYearsClamped(nextDate, occurrences * value.interval);
      break;
  }

  return formatDateValue(nextDate);
}

function addMonthsClamped(date: Date, months: number) {
  const originalDay = date.getDate();
  const targetMonthIndex = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  date.setFullYear(targetYear, targetMonth, Math.min(originalDay, lastDayOfTargetMonth));
}

function addYearsClamped(date: Date, years: number) {
  const originalDay = date.getDate();
  const targetYear = date.getFullYear() + years;
  const targetMonth = date.getMonth();
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  date.setFullYear(targetYear, targetMonth, Math.min(originalDay, lastDayOfTargetMonth));
}

function parseDateValue(dateValue: string) {
  const [year, month, day] = dateValue.replace(/-/g, '.').split('.').map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function normalizeDateForView(value?: string) {
  return value?.replace(/-/g, '.') ?? '';
}

function normalizeDateForRequest(value?: string) {
  return value?.replace(/\./g, '-');
}

export { normalizeDateForRequest };
