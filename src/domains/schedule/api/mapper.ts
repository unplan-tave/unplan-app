/**
 * schedule API DTO와 앱 내부 schedule 모델 사이의 변환을 담당합니다.
 * condition tag enum, recurrence, reminder, personal tag 필드 차이는 이 경계에서 흡수합니다.
 */
import {
  RecurrenceRequestFreq,
  SearchSchedulesConditionTagsItem,
  SearchSchedulesStatusItem,
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

import { getMonthDayFromDate, getWeekdayFromDate } from '../recurrence';
import { normalizeTimeToMinute } from '../time';

import type {
  ConditionTagId,
  DailyScheduleGroup,
  DailyMessage,
  DailyScheduleSummary,
  MonthlyScheduleCount,
  ReminderSoundType,
  ReminderType,
  ScheduleCreateInput,
  ScheduleCreateResult,
  ScheduleDetail,
  ScheduleListItem,
  ScheduleMonthlyOverview,
  ScheduleSearchPage,
  ScheduleStatus,
  ScheduleUpdateInput,
} from '../model';
import type { RecurrenceValue } from '../recurrence';
import type {
  DailyCount,
  ApiResponseDailyMessageResponseDto,
  ApiResponsePageResponseScheduleSearchResponse,
  DailySchedules,
  RecurrenceRequest,
  ScheduleCreateRequest,
  ScheduleCreateResponse,
  ScheduleDetailResponse,
  ScheduleGetResponse,
  ScheduleMonthlyResponse,
  ScheduleSearchResponse,
  ScheduleSummary,
  ScheduleUpdateRequest,
  ScheduleWeeklyResponse,
  SearchSchedulesParams,
  PersonalTagResponse,
  TagRecommendationResponseDto,
} from '@/lib/api/model';

const API_WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

/** 서버 개인 태그를 화면에서 쓰는 태그 option으로 변환합니다. */
export function toPersonalTagOptions(response?: PersonalTagResponse[]) {
  return (response ?? []).flatMap((tag) => {
    if (tag.personal_tag_id == null || !tag.name?.trim()) return [];

    return [{ id: String(tag.personal_tag_id), label: tag.name, createdAt: '' }];
  });
}

/** 서버 태그 추천 응답을 빈 값 없는 domain model로 변환합니다. */
export function toTagRecommendation(response?: TagRecommendationResponseDto | null) {
  const label = response?.recommended_tag?.trim() ?? '';

  return label ? { label } : null;
}

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
    startTime: normalizeTimeToMinute(response.start_time ?? ''),
    endTime: normalizeTimeToMinute(response.end_time ?? ''),
    estimatedMinutes: response.estimated_time ?? null,
    isQueue: response.is_queue ?? false,
    status: toScheduleStatus(response.status),
    conditionTagId: toConditionTagId(response.condition_tag),
    personalTags: getPersonalTagsFromResponse(response),
  };
}

export function toScheduleSearchListItems(
  response?: ApiResponsePageResponseScheduleSearchResponse,
): ScheduleListItem[] {
  return (response?.data?.data ?? []).map(toScheduleSearchListItem);
}

/** 생성 DTO의 페이지 메타데이터를 화면에서 안전하게 쓸 수 있는 모델로 변환합니다. */
export function toScheduleSearchPage(
  response?: ApiResponsePageResponseScheduleSearchResponse,
): ScheduleSearchPage {
  const pagination = response?.data?.pagination;

  return {
    schedules: toScheduleSearchListItems(response),
    page: pagination?.page ?? 0,
    totalElements: pagination?.total_elements ?? 0,
    totalPages: pagination?.total_pages ?? 0,
    hasNext: pagination?.has_next ?? false,
  };
}

function toScheduleSearchListItem(response: ScheduleSearchResponse): ScheduleListItem {
  const isQueue = response.start_time == null && response.end_time == null;

  return {
    id: response.schedule_id ?? 0,
    title: response.title ?? '',
    date: normalizeDateForView(response.date),
    startTime: normalizeTimeToMinute(response.start_time ?? ''),
    endTime: normalizeTimeToMinute(response.end_time ?? ''),
    estimatedMinutes: response.estimated_time ?? null,
    isQueue,
    status: toScheduleStatus(response.status),
    conditionTagId: toConditionTagId(response.condition_tag),
    personalTags: response.personal_tags ?? [],
  };
}

export function toScheduleSearchParams(input: {
  keyword?: string;
  isQueue?: boolean;
  status?: ScheduleStatus[];
  conditionTagIds?: ConditionTagId[];
  personalTags?: string[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
}): SearchSchedulesParams {
  return {
    keyword: normalizeOptionalParam(input.keyword),
    isQueue: input.isQueue,
    status: toOptionalArray(input.status?.map(toSearchScheduleStatus)),
    conditionTags: toOptionalArray(input.conditionTagIds?.map(toSearchConditionTag)),
    personalTags: toOptionalArray(
      input.personalTags?.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
    ),
    startDate: toSearchDateTime(input.startDate, input.startTime),
    endDate: toSearchDateTime(input.endDate, input.endTime),
    page: input.page,
  };
}

function toSearchDateTime(date?: string, time?: string) {
  const normalizedDate = normalizeDateForRequest(date);

  if (!normalizedDate) return undefined;

  return `${normalizedDate}T${normalizeSearchTime(time)}`;
}

function normalizeSearchTime(time?: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time ?? '') ? time : '00:00';
}

export function toDailyMessage(response?: ApiResponseDailyMessageResponseDto): DailyMessage {
  const message = response?.data;

  return {
    date: normalizeDateForView(message?.date),
    conditionTagId: toConditionTagId(message?.condition),
    message: message?.message ?? '',
    isEnergyRecorded: message?.is_energy_recorded ?? false,
    isSleepRecorded: message?.is_sleep_recorded ?? false,
  };
}

export function toScheduleDetail(response: ScheduleDetailResponse): ScheduleDetail {
  return {
    id: response.schedule_id ?? 0,
    title: response.title ?? '',
    date: normalizeDateForView(response.date),
    startTime: normalizeTimeToMinute(response.start_time ?? ''),
    endTime: normalizeTimeToMinute(response.end_time ?? ''),
    estimatedMinutes: response.estimated_time ?? null,
    isQueue: response.is_queue ?? false,
    status: toScheduleStatus(response.status),
    conditionTagId: toConditionTagId(response.condition_tag),
    personalTags: getPersonalTagsFromResponse(response),
    memo: response.memo ?? '',
    location: response.location ?? '',
    locationDetail: getLocationDetailFromResponse(response),
    isReminderEnabled: response.is_remind_on ?? false,
    reminderMinutes: response.remind_minutes ?? null,
    reminderType: toReminderType(response.remind_type),
    reminderSoundType: toReminderSoundType(response.remind_sound_type),
    isRecurring: response.is_recurring ?? response.recurrence != null,
    recurrence: toRecurrenceValue(response.recurrence, response.date),
    isConflict: response.is_conflict ?? false,
  };
}

function getLocationDetailFromResponse(response: unknown): string {
  if (typeof response !== 'object' || response == null) {
    return '';
  }

  const value = response as { locationDetail?: unknown; location_detail?: unknown };

  if (typeof value.locationDetail === 'string') return value.locationDetail;
  if (typeof value.location_detail === 'string') return value.location_detail;

  return '';
}

function toRecurrenceValue(
  recurrence: ScheduleDetailResponse['recurrence'],
  scheduleDate: string | undefined,
): RecurrenceValue | null {
  if (recurrence?.freq == null) return null;

  const freq = recurrence.freq;
  const interval = recurrence.interval != null && recurrence.interval > 0 ? recurrence.interval : 1;
  const byDay = toRecurrenceWeekdays(recurrence.by_day, scheduleDate);
  const until = recurrence.until ?? '';
  const occurrenceCount = recurrence.count ?? 10;

  return {
    preset: toRecurrencePreset(freq, interval, byDay),
    freq,
    interval,
    byDay,
    endType: recurrence.count != null ? 'count' : until ? 'until' : 'never',
    occurrenceCount,
    until,
  };
}

function toRecurrencePreset(
  freq: RecurrenceValue['freq'],
  interval: number,
  byDay: number[],
): RecurrenceValue['preset'] {
  if (interval !== 1 || (freq === 'WEEKLY' && byDay.length > 1)) return 'custom';

  switch (freq) {
    case 'DAILY':
      return 'daily';
    case 'WEEKLY':
      return 'weekly';
    case 'MONTHLY':
      return 'monthly';
    case 'YEARLY':
      return 'yearly';
  }
}

function toRecurrenceWeekdays(
  byDay: string | undefined,
  scheduleDate: string | undefined,
): number[] {
  if (!byDay) return scheduleDate ? [getWeekdayFromDate(scheduleDate)] : [];

  const weekdayCodes: Record<string, number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
  };

  return [
    ...new Set(
      byDay.split(',').flatMap((value) => {
        const code = value.trim().replace(/^\d+/, '');
        const weekday = weekdayCodes[code];

        return weekday == null ? [] : [weekday];
      }),
    ),
  ];
}

function getPersonalTagsFromResponse(response: unknown): string[] {
  if (typeof response !== 'object' || response == null) {
    return [];
  }

  const value =
    'personal_tags' in response
      ? response.personal_tags
      : 'personalTags' in response
        ? response.personalTags
        : undefined;

  return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string') : [];
}

export function toScheduleCreateResult(response: ScheduleCreateResponse): ScheduleCreateResult {
  const detail = toScheduleDetail(response as ScheduleDetailResponse);

  return {
    id: detail.id,
    title: detail.title,
    date: detail.date,
    startTime: detail.startTime,
    endTime: detail.endTime,
    estimatedMinutes: detail.estimatedMinutes,
    isQueue: detail.isQueue,
    location: detail.location,
    locationDetail: detail.locationDetail,
    isRecurring: detail.isRecurring,
    recurrence: detail.recurrence,
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
    location: input.location,
    location_detail: input.locationDetail,
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
    personal_tags: input.personalTags,
    date: normalizeDateForRequest(input.date),
    start_time: input.startTime,
    end_time: input.endTime,
    estimated_time: input.estimatedMinutes,
    location: input.location,
    location_detail: input.locationDetail,
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
  conditionTag?: ScheduleGetResponseConditionTag | ScheduleDetailResponseConditionTag | string,
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
  status?: ScheduleGetResponseStatus | ScheduleDetailResponseStatus | string,
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

function toSearchScheduleStatus(status: ScheduleStatus): SearchSchedulesStatusItem {
  switch (status) {
    case 'done':
      return SearchSchedulesStatusItem.DONE;
    case 'inProgress':
      return SearchSchedulesStatusItem.IN_PROGRESS;
    case 'todo':
      return SearchSchedulesStatusItem.TODO;
  }
}

function toSearchConditionTag(tagId: ConditionTagId): SearchSchedulesConditionTagsItem {
  switch (tagId) {
    case 'urgent':
      return SearchSchedulesConditionTagsItem.URGENT;
    case 'core':
      return SearchSchedulesConditionTagsItem.CORE_TASK;
    case 'brain':
      return SearchSchedulesConditionTagsItem.BRAIN_WORK;
    case 'labor':
      return SearchSchedulesConditionTagsItem.SIMPLE_TASK;
    case 'rest':
      return SearchSchedulesConditionTagsItem.RECOVERY;
    case 'daily':
      return SearchSchedulesConditionTagsItem.DAILY_TASK;
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
    until: value.endType === 'until' ? normalizeDateForRequest(value.until) : undefined,
    count: value.endType === 'count' ? value.occurrenceCount : undefined,
  };

  if (value.freq === 'WEEKLY' && value.byDay.length > 0) {
    request.by_day = value.byDay.map((day) => API_WEEKDAY_CODES[day]).join(',');
  }

  if (value.freq === 'MONTHLY') {
    request.by_month_day = String(getMonthDayFromDate(scheduleDate));
  }

  return request;
}

function normalizeDateForView(value?: string) {
  return value?.replace(/-/g, '.') ?? '';
}

function normalizeDateForRequest(value?: string) {
  return value?.replace(/\./g, '-');
}

function toOptionalArray<T>(values?: T[]) {
  return values != null && values.length > 0 ? values : undefined;
}

function normalizeOptionalParam(value: string | undefined) {
  const normalized = value?.trim();

  return normalized == null || normalized.length === 0 ? undefined : normalized;
}

export { normalizeDateForRequest };
