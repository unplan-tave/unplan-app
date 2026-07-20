/**
 * schedule 도메인의 서버 API 경계입니다.
 * 일정 조회/검색/생성/수정/삭제를 감싸고 화면에는 Schedule 도메인 모델만 반환합니다.
 */
import {
  createSchedule,
  deleteSchedule,
  getDailyMessage,
  getPersonalTags,
  getScheduleDetail,
  getSchedulesByDate,
  getSchedulesByMonth,
  getSchedulesByWeek,
  searchSchedules as searchScheduleEndpoints,
  updateSchedule,
} from '@/lib/api/endpoints/schedule-crud/schedule-crud';
import { recommendTag } from '@/lib/api/endpoints/tag-controller/tag-controller';

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
  toScheduleSearchPage,
  toScheduleSearchParams,
  toScheduleUpdateRequest,
  toPersonalTagOptions,
  toTagRecommendation,
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
  ScheduleSearchPage,
  ScheduleStatus,
  ScheduleUpdateInput,
  PersonalTagOption,
  TagRecommendation,
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
  /** 기간 시작일. `startTime`과 조합해 `/schedule/search`에 ISO 일시로 전송됩니다. */
  startDate?: string;
  /** 기간 종료일. `endTime`과 조합해 `/schedule/search`에 ISO 일시로 전송됩니다. */
  endDate?: string;
  /** 기간 시작 시각(HH:mm). */
  startTime?: string;
  /** 기간 종료 시각(HH:mm). */
  endTime?: string;
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

/** 검색 필터에 맞는 일정 카드 한 페이지와 페이지 정보를 조회합니다. */
export async function searchSchedulesPage(
  input: SearchSchedulesInput,
): Promise<ScheduleSearchPage> {
  const response = await searchScheduleEndpoints(toScheduleSearchParams(input));

  return toScheduleSearchPage(response);
}

export async function fetchDailyMessage(input: GetDailyMessageInput): Promise<DailyMessage> {
  const response = await getDailyMessage({ date: normalizeDateForRequest(input.date) ?? '' });

  return toDailyMessage(response);
}

/** 서버에 저장된 개인 태그 목록을 조회합니다. */
export async function fetchPersonalTags(): Promise<PersonalTagOption[]> {
  return toPersonalTagOptions(await getPersonalTags());
}

/** 카드 제목으로 개인 태그 후보를 요청합니다. */
export async function fetchTagRecommendation(title: string): Promise<TagRecommendation | null> {
  const response = await recommendTag({ title });

  return toTagRecommendation(response.data);
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
