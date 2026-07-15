/**
 * condition 화면의 기간 전환과 캘린더 날짜 계산을 담당하는 순수 로직입니다.
 * 선택 가능 날짜, 캘린더 title, daily/weekly/monthly 모드 전환 규칙을 화면 밖에 둡니다.
 */
import { addDays, getWeekStart, isSameDate } from '@/lib/utils/date';

import { type ConditionPeriodMode } from './model';

const WEEK_LENGTH = 7;
const MONTH_GRID_LENGTH = 42;

/** 컨디션 탭 캘린더 한 칸. `components/ui/Calendar`의 `CalendarDay`로 그대로 넘길 수 있습니다. */
export interface ConditionCalendarDay {
  date: Date;
  disabled: boolean;
  isToday: boolean;
  inCurrentMonth: boolean;
}

/** 헤더의 view mode 버튼을 누를 때마다 daily → weekly → monthly → daily 순으로 순환합니다. */
export function getNextConditionPeriodMode(mode: ConditionPeriodMode): ConditionPeriodMode {
  switch (mode) {
    case 'daily':
      return 'weekly';
    case 'weekly':
      return 'monthly';
    case 'monthly':
      return 'daily';
  }
}

/**
 * 캘린더에서 고를 수 있는 날짜.
 * Figma: 현재 주차 안의 미래 날짜는 선택 가능하고, 다음 주차부터는 비활성화합니다.
 */
export function isConditionDateSelectable(date: Date, today = new Date()): boolean {
  return getWeekStart(date).getTime() <= getWeekStart(today).getTime();
}

/** 컨디션 캘린더 모달에 뿌릴 날짜 목록. weekly는 한 주, monthly/daily는 6주 그리드입니다. */
export function buildConditionCalendarDays(
  selectedDate: Date,
  mode: ConditionPeriodMode,
  today = new Date(),
): ConditionCalendarDay[] {
  const isWeekly = mode === 'weekly';
  const gridStart = isWeekly
    ? getWeekStart(selectedDate)
    : getWeekStart(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const length = isWeekly ? WEEK_LENGTH : MONTH_GRID_LENGTH;

  return Array.from({ length }, (_, index) => {
    const date = addDays(gridStart, index);

    return {
      date,
      disabled: !isConditionDateSelectable(date, today),
      isToday: isSameDate(date, today),
      inCurrentMonth: date.getMonth() === selectedDate.getMonth(),
    };
  });
}

/** 캘린더 모달 제목. 예: `2026년 05월` */
export function getConditionCalendarTitle(date: Date): string {
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월`;
}
