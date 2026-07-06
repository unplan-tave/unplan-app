import {
  createSchedule,
  deleteSchedule,
  getScheduleDetail,
  getSchedulesByDate,
  getSchedulesByMonth,
  getSchedulesByWeek,
  updateSchedule,
} from '@/lib/api/endpoints/schedule-crud/schedule-crud';

import {
  toDailyScheduleGroups,
  toScheduleCreateRequest,
  toScheduleCreateResult,
  toScheduleDetail,
  toScheduleListItems,
  toScheduleMonthlyOverview,
  toScheduleUpdateRequest,
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

export async function fetchSchedulesByDate(
  input: GetSchedulesByDateInput,
): Promise<ScheduleListItem[]> {
  const response = await getSchedulesByDate({ date: input.date });

  return toScheduleListItems(response);
}

export async function fetchScheduleDetail(scheduleId: number): Promise<ScheduleDetail> {
  const response = await getScheduleDetail(scheduleId);

  return toScheduleDetail(response);
}

export async function fetchSchedulesByWeek(
  input: GetSchedulesByWeekInput,
): Promise<DailyScheduleGroup[]> {
  const response = await getSchedulesByWeek({ date: input.date });

  return toDailyScheduleGroups(response);
}

export async function fetchSchedulesByMonth(
  input: GetSchedulesByMonthInput,
): Promise<ScheduleMonthlyOverview> {
  const response = await getSchedulesByMonth({ month: input.month });

  return toScheduleMonthlyOverview(response);
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
