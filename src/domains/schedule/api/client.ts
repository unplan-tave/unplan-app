/**
 * schedule 도메인의 서버 API 경계입니다.
 * 일정 조회/검색/생성/수정/삭제를 감싸고 화면에는 Schedule 도메인 모델만 반환합니다.
 */
import {
  createSchedule,
  deleteSchedule,
  getScheduleDetail,
  getSchedulesByDate,
  getSchedulesByMonth,
  getSchedulesByWeek,
  updateSchedule,
} from '@/lib/api/endpoints/schedule-crud/schedule-crud';
import { apiMutator } from '@/lib/api/mutator/orval-mutator';

import {
  normalizeDateForRequest,
  toDailyScheduleGroups,
  toScheduleCreateRequest,
  toScheduleCreateResult,
  toScheduleDetail,
  toScheduleListItems,
  toScheduleMonthlyOverview,
  toScheduleSearchListItems,
  toScheduleUpdateRequest,
  type ScheduleSearchResponse,
} from './mapper';

import type {
  DailyScheduleGroup,
  ScheduleCreateInput,
  ScheduleCreateResult,
  ScheduleDetail,
  ScheduleListItem,
  ScheduleMonthlyOverview,
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
  status?: string;
  conditionTags?: string[];
  personalTags?: string[];
  sortBy: string;
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
  const response = await apiMutator<ScheduleSearchResponse>({
    url: '/schedule/search',
    method: 'GET',
    params: toScheduleSearchParams(input),
  });

  return toScheduleSearchListItems(response);
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

function toScheduleSearchParams(input: SearchSchedulesInput) {
  return {
    keyword: normalizeOptionalParam(input.keyword),
    isQueue: input.isQueue,
    status: input.status,
    conditionTags: input.conditionTags?.length ? input.conditionTags : undefined,
    personalTags: input.personalTags?.length ? input.personalTags : undefined,
    sortBy: input.sortBy,
  };
}

function normalizeOptionalParam(value: string | undefined) {
  const normalized = value?.trim();

  return normalized == null || normalized.length === 0 ? undefined : normalized;
}
