import { useCallback, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { toConditionMetricCards } from '@/domains/condition/metric';
import { type ConditionPeriodMode } from '@/domains/condition/model';
import {
  getConditionPeriodLabel,
  getNextConditionPeriodMode,
  isConditionDateSelectable,
} from '@/domains/condition/period';
import { useMeasurementAveragesQuery } from '@/domains/measurement/api/queries';
import { toConditionSummaryFromAverage } from '@/domains/measurement/model';
import { getMeasurementMonthRange, getMeasurementWeekRange } from '@/domains/measurement/period';
import { useDailyMessageQuery } from '@/domains/schedule/api/queries';
import { useConditionCalendar } from '@/hooks/use-condition-calendar';
import { addDays, formatDateValue, getWeekStart } from '@/lib/utils/date';

const WEEK_LENGTH = 7;

/** 컨디션 탭의 기간/그래프 모드/캘린더 상태. */
export function useConditionView() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [periodMode, setPeriodMode] = useState<ConditionPeriodMode>('daily');

  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  // 데일리/위클리/먼슬리 모두 /measurements/averages를 사용합니다. (데일리는 from=to=선택 날짜, groupBy DAY)
  const averageInput = useMemo(() => {
    if (periodMode === 'weekly') {
      const { from, to } = getMeasurementWeekRange(selectedDate);

      return { from, to, type: 'ALL' as const, groupBy: 'WEEK' as const };
    }

    if (periodMode === 'monthly') {
      const { from, to } = getMeasurementMonthRange(selectedDate);

      return { from, to, type: 'ALL' as const, groupBy: 'MONTH' as const };
    }

    return {
      from: selectedDateValue,
      to: selectedDateValue,
      type: 'ALL' as const,
      groupBy: 'DAY' as const,
    };
  }, [periodMode, selectedDate, selectedDateValue]);
  const measurementAveragesQuery = useMeasurementAveragesQuery(averageInput);
  const dailyMessageQuery = useDailyMessageQuery(selectedDateValue);
  const conditionSummary = useMemo(
    () => toConditionSummaryFromAverage(measurementAveragesQuery.data?.items[0]),
    [measurementAveragesQuery.data?.items],
  );
  const conditionScore = measurementAveragesQuery.data?.items[0]?.finalConditionScore ?? null;
  const metrics = useMemo(() => toConditionMetricCards(conditionSummary), [conditionSummary]);
  const message = dailyMessageQuery.data?.message?.trim() ?? '';
  const dateLabel = useMemo(
    () => getConditionPeriodLabel(selectedDate, periodMode),
    [periodMode, selectedDate],
  );

  const cyclePeriodMode = useCallback(() => {
    setPeriodMode(getNextConditionPeriodMode);
  }, []);

  const handleCalendarDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      // 주차 달력의 날짜 선택은 해당 일자의 데일리 뷰로 진입합니다.
      if (periodMode === 'weekly') {
        setPeriodMode('daily');
      }
    },
    [periodMode],
  );
  const calendar = useConditionCalendar({
    selectedDate,
    periodMode,
    onSelectDate: handleCalendarDateSelect,
  });

  const movePeriod = useCallback(
    (direction: 'previous' | 'next') => {
      if (periodMode === 'daily') {
        if (direction === 'next') {
          return;
        }

        setSelectedDate((currentDate) => addDays(currentDate, -1));
        return;
      }

      if (periodMode === 'weekly') {
        const currentWeekStart = getWeekStart(selectedDate);
        const nextDate = addDays(
          currentWeekStart,
          direction === 'previous' ? -WEEK_LENGTH : WEEK_LENGTH,
        );

        if (!isConditionDateSelectable(nextDate)) {
          return;
        }

        setSelectedDate(nextDate);
        return;
      }

      if (periodMode !== 'monthly') {
        return;
      }

      const nextDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + (direction === 'previous' ? -1 : 1),
        1,
      );
      const currentDate = new Date();

      if (
        nextDate.getFullYear() > currentDate.getFullYear() ||
        (nextDate.getFullYear() === currentDate.getFullYear() &&
          nextDate.getMonth() > currentDate.getMonth())
      ) {
        return;
      }

      setSelectedDate(nextDate);
    },
    [periodMode, selectedDate],
  );

  const periodSwipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(true)
        .activeOffsetX([-20, 20])
        .failOffsetY([-20, 20])
        .onEnd((event) => {
          if (event.translationX <= -40) {
            runOnJS(movePeriod)('next');
          }
          if (event.translationX >= 40) {
            runOnJS(movePeriod)('previous');
          }
        }),
    [movePeriod],
  );

  return {
    selectedDate,
    selectedDateValue,
    periodMode,
    conditionSummary,
    conditionScore,
    metrics,
    message,
    dateLabel,
    calendar: calendar.calendar,
    cyclePeriodMode,
    periodSwipeGesture,
    openCalendar: calendar.openCalendar,
    closeCalendar: calendar.closeCalendar,
    moveCalendarMonth: calendar.moveCalendarMonth,
    selectDate: calendar.selectCalendarDate,
  };
}
