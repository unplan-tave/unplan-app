import { CONDITION_CALENDAR_DAYS_PER_WEEK } from '@/constants/condition-ui';

import { type ConditionCalendarDay } from './period';

/** 월력의 날짜 목록에 앞뒤 빈 칸을 채워 7일 단위 행으로 변환합니다. */
export function toConditionCalendarWeeks(days: ConditionCalendarDay[]) {
  const firstDay = days[0];
  const leadingEmptyCells = Array.from({ length: firstDay?.date.getDay() ?? 0 }, () => null);
  const calendarCells = [...leadingEmptyCells, ...days];
  const trailingEmptyCellCount =
    (CONDITION_CALENDAR_DAYS_PER_WEEK - (calendarCells.length % CONDITION_CALENDAR_DAYS_PER_WEEK)) %
    CONDITION_CALENDAR_DAYS_PER_WEEK;
  const cells = [...calendarCells, ...Array.from({ length: trailingEmptyCellCount }, () => null)];

  return Array.from(
    { length: Math.ceil(cells.length / CONDITION_CALENDAR_DAYS_PER_WEEK) },
    (_, index) =>
      cells.slice(
        index * CONDITION_CALENDAR_DAYS_PER_WEEK,
        (index + 1) * CONDITION_CALENDAR_DAYS_PER_WEEK,
      ),
  );
}
