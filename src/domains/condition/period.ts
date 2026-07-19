/**
 * condition 화면의 기간 전환과 캘린더 날짜 계산을 담당하는 순수 로직입니다.
 * 선택 가능 날짜, 캘린더 title, daily/weekly/monthly 모드 전환 규칙을 화면 밖에 둡니다.
 */
import { addDays, formatCalendarDateLabel, getWeekStart, isSameDate } from '@/lib/utils/date';

import { type ConditionPeriodMode } from './model';

const WEEK_LENGTH = 7;

/** 컨디션 탭 캘린더 한 칸. `components/ui/Calendar`의 `CalendarDay`로 그대로 넘길 수 있습니다. */
export interface ConditionCalendarDay {
  date: Date;
  disabled: boolean;
  isToday: boolean;
  inCurrentMonth: boolean;
}

export type ConditionCalendarSelectionPosition = 'single' | 'start' | 'middle' | 'end' | null;

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

/** 보기 단위에 따라 달력에서 선택 범위의 위치를 계산합니다. */
export function getConditionCalendarSelectionPosition(
  date: Date,
  selectedDate: Date,
  mode: ConditionPeriodMode,
): ConditionCalendarSelectionPosition {
  if (mode === 'daily') {
    return isSameDate(date, selectedDate) ? 'single' : null;
  }

  if (mode === 'weekly') {
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = addDays(weekStart, WEEK_LENGTH - 1);

    if (date < weekStart || date > weekEnd) {
      return null;
    }

    if (isSameDate(date, weekStart)) {
      return 'start';
    }

    return isSameDate(date, weekEnd) ? 'end' : 'middle';
  }

  if (
    date.getFullYear() !== selectedDate.getFullYear() ||
    date.getMonth() !== selectedDate.getMonth()
  ) {
    return null;
  }

  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  if (date.getDate() === 1) {
    return 'start';
  }

  return isSameDate(date, monthEnd) ? 'end' : 'middle';
}

/**
 * 컨디션 캘린더 모달 날짜 목록.
 * 기본은 해당 월만 표시하되, 주간 뷰의 선택 주가 다음 달을 넘으면 토요일까지 함께 보여 줍니다.
 */
export function buildConditionCalendarDays(
  selectedDate: Date,
  mode: ConditionPeriodMode,
  today = new Date(),
): ConditionCalendarDay[] {
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const selectedWeekEnd = addDays(getWeekStart(selectedDate), WEEK_LENGTH - 1);
  const endDate =
    mode === 'weekly' && selectedWeekEnd.getMonth() !== selectedDate.getMonth()
      ? selectedWeekEnd
      : monthEnd;
  const dayCount = Math.round((endDate.getTime() - monthStart.getTime()) / 86_400_000) + 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(monthStart, index);

    return {
      date,
      disabled: !isConditionDateSelectable(date, today),
      isToday: isSameDate(date, today),
      inCurrentMonth: date.getMonth() === selectedDate.getMonth(),
    };
  });
}

/** 선택 날짜와 보기 단위에 맞는 컨디션 헤더 라벨입니다. */
export function getConditionPeriodLabel(
  date: Date,
  mode: ConditionPeriodMode,
): { year: string; date: string } {
  if (mode === 'daily') {
    return formatCalendarDateLabel(date);
  }

  if (mode === 'monthly') {
    return {
      year: `${date.getFullYear()}년`,
      date: `${date.getMonth() + 1}월`,
    };
  }

  const weekStart = getWeekStart(date);
  const weekEnd = addDays(weekStart, WEEK_LENGTH - 1);
  const startLabel = formatMonthWeekLabel(weekStart);

  return {
    year: `${weekStart.getFullYear()}년`,
    date:
      weekStart.getMonth() === weekEnd.getMonth()
        ? startLabel
        : `${startLabel} ~ ${formatMonthWeekLabel(weekEnd)}`,
  };
}

/** 일요일 시작 주차를 `7월 둘째주` 형태로 표시합니다. */
function formatMonthWeekLabel(date: Date): string {
  const firstWeekStart = getWeekStart(new Date(date.getFullYear(), date.getMonth(), 1));
  const weekIndex = Math.round(
    (getWeekStart(date).getTime() - firstWeekStart.getTime()) / 86_400_000 / WEEK_LENGTH,
  );
  const weekLabel = ['첫째', '둘째', '셋째', '넷째', '다섯째'][weekIndex] ?? `${weekIndex + 1}째`;

  return `${date.getMonth() + 1}월 ${weekLabel}주`;
}

/** 캘린더 모달 제목. 예: `2026년 05월` */
export function getConditionCalendarTitle(date: Date): string {
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월`;
}
