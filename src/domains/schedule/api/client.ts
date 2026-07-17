/**
 * schedule 도메인의 서버 API 경계입니다.
 * 일정 조회/검색/생성/수정/삭제를 감싸고 화면에는 Schedule 도메인 모델만 반환합니다.
 */
import {
  createSchedule,
  deleteSchedule,
  getDailyMessage,
  getScheduleDetail,
  getSchedulesByDate,
  getSchedulesByMonth,
  getSchedulesByWeek,
  searchSchedules as searchScheduleEndpoints,
  updateSchedule,
} from '@/lib/api/endpoints/schedule-crud/schedule-crud';

import {
  normalizeDateForRequest,
  toDailyMessage,
  toDailyScheduleGroups,
  toScheduleCreateRequest,
  toScheduleCreateResult,
  toScheduleDetail,
  toScheduleListItems,
  toScheduleMonthlyOverview,
  toScheduleSearchListItems,
  toScheduleSearchParams,
  toScheduleUpdateRequest,
} from './mapper';

import type {
  DailyScheduleGroup,
  DailyMessage,
  ConditionTagId,
  ScheduleCreateInput,
  ScheduleCreateResult,
  ScheduleDetail,
  ScheduleListItem,
  ScheduleMonthlyOverview,
  ScheduleStatus,
  ScheduleUpdateInput,
} from '../model';

export interface GetSchedulesByDateInput {
  date: string;
}

export interface GetSchedulesByWeekInput {
  date: string;
}

export interface GetSchedulesByMonthInput {
  month: string;
}

export interface SearchSchedulesInput {
  keyword?: string;
  isQueue?: boolean;
  status?: ScheduleStatus[];
  conditionTagIds?: ConditionTagId[];
  personalTags?: string[];
  page?: number;
}

export interface GetDailyMessageInput {
  date: string;
}

export async function fetchSchedulesByDate(
  input: GetSchedulesByDateInput,
): Promise<ScheduleListItem[]> {
  const response = await getSchedulesByDate({ date: normalizeDateForRequest(input.date) ?? '' });

  return toScheduleListItems(response);
}

export async function fetchScheduleDetail(scheduleId: number): Promise<ScheduleDetail> {
  const response = await getScheduleDetail(scheduleId);

  return toScheduleDetail(response);
}

export async function fetchSchedulesByWeek(
  input: GetSchedulesByWeekInput,
): Promise<DailyScheduleGroup[]> {
  const response = await getSchedulesByWeek({ date: normalizeDateForRequest(input.date) ?? '' });

  return toDailyScheduleGroups(response);
}

export async function fetchSchedulesByMonth(
  input: GetSchedulesByMonthInput,
): Promise<ScheduleMonthlyOverview> {
  const response = await getSchedulesByMonth({
    month: normalizeDateForRequest(input.month) ?? '',
  });

  return toScheduleMonthlyOverview(response);
}

export async function searchSchedules(input: SearchSchedulesInput): Promise<ScheduleListItem[]> {
  const response = await searchScheduleEndpoints(toScheduleSearchParams(input));

  return toScheduleSearchListItems(response);
}

export async function fetchDailyMessage(input: GetDailyMessageInput): Promise<DailyMessage> {
  const response = await getDailyMessage({ date: normalizeDateForRequest(input.date) ?? '' });

  return toDailyMessage(response);
}

export async function submitScheduleCreate(
  input: ScheduleCreateInput,
): Promise<ScheduleCreateResult> {
  const response = await createSchedule(toScheduleCreateRequest(input));

  return toScheduleCreateResult(response);
}

export async function submitScheduleUpdate(
  scheduleId: number,
  input: ScheduleUpdateInput,
): Promise<ScheduleDetail> {
  const response = await updateSchedule(scheduleId, toScheduleUpdateRequest(input));

  return toScheduleDetail(response);
}

export async function submitScheduleDelete(scheduleId: number): Promise<void> {
  await deleteSchedule(scheduleId);
}
