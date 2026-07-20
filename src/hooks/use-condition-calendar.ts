import { useCallback, useMemo, useState } from 'react';

import {
  buildConditionCalendarDays,
  getConditionCalendarTitle,
  isConditionDateSelectable,
} from '@/domains/condition/period';

import type { ConditionPeriodMode } from '@/domains/condition/model';

interface UseConditionCalendarOptions {
  selectedDate: Date;
  periodMode: ConditionPeriodMode;
  onSelectDate: (date: Date) => void;
}

/** 홈과 컨디션 화면이 공유하는 컨디션 기간 선택 월력의 상태와 이동 로직입니다. */
export function useConditionCalendar({
  selectedDate,
  periodMode,
  onSelectDate,
}: UseConditionCalendarOptions) {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const days = useMemo(
    () => buildConditionCalendarDays(calendarMonth, periodMode),
    [calendarMonth, periodMode],
  );
  const title = useMemo(() => getConditionCalendarTitle(calendarMonth), [calendarMonth]);
  const canGoNext =
    calendarMonth.getFullYear() < new Date().getFullYear() ||
    calendarMonth.getMonth() < new Date().getMonth();

  const openCalendar = useCallback(() => {
    setCalendarMonth(selectedDate);
    setIsCalendarVisible(true);
  }, [selectedDate]);
  const closeCalendar = useCallback(() => setIsCalendarVisible(false), []);
  const moveCalendarMonth = useCallback((direction: 'previous' | 'next') => {
    setCalendarMonth((previous) => {
      const next = new Date(
        previous.getFullYear(),
        previous.getMonth() + (direction === 'previous' ? -1 : 1),
        1,
      );
      const currentMonth = new Date();

      if (
        next.getFullYear() > currentMonth.getFullYear() ||
        (next.getFullYear() === currentMonth.getFullYear() &&
          next.getMonth() > currentMonth.getMonth())
      ) {
        return previous;
      }

      return next;
    });
  }, []);
  const selectCalendarDate = useCallback(
    (date: Date) => {
      if (!isConditionDateSelectable(date)) return;

      onSelectDate(date);
      setIsCalendarVisible(false);
    },
    [onSelectDate],
  );

  return {
    calendar: {
      visible: isCalendarVisible,
      title,
      days,
      canGoNext,
    },
    openCalendar,
    closeCalendar,
    moveCalendarMonth,
    selectCalendarDate,
  };
}
