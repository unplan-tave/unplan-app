import { useCallback, useMemo, useState } from 'react';

import { toConditionMetricCards } from '@/domains/condition/metric';
import { type ConditionPeriodMode } from '@/domains/condition/model';
import {
  buildConditionCalendarDays,
  getConditionCalendarTitle,
  getNextConditionPeriodMode,
  isConditionDateSelectable,
} from '@/domains/condition/period';
import { useMeasurementAveragesQuery } from '@/domains/measurement/api/queries';
import { toConditionSummaryFromAverage } from '@/domains/measurement/model';
import { getMeasurementMonthRange, getMeasurementWeekRange } from '@/domains/measurement/period';
import { formatCalendarDateLabel, formatDateValue } from '@/lib/utils/date';

/** 컨디션 탭의 기간/그래프 모드/캘린더 상태. */
export function useConditionView() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [periodMode, setPeriodMode] = useState<ConditionPeriodMode>('daily');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

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
  const conditionSummary = useMemo(
    () => toConditionSummaryFromAverage(measurementAveragesQuery.data?.items[0]),
    [measurementAveragesQuery.data?.items],
  );
  const conditionScore = measurementAveragesQuery.data?.items[0]?.finalConditionScore ?? null;
  const metrics = useMemo(() => toConditionMetricCards(conditionSummary), [conditionSummary]);
  const dateLabel = useMemo(() => formatCalendarDateLabel(selectedDate), [selectedDate]);
  const calendarDays = useMemo(
    () => buildConditionCalendarDays(selectedDate, periodMode),
    [periodMode, selectedDate],
  );
  const calendarTitle = useMemo(() => getConditionCalendarTitle(selectedDate), [selectedDate]);

  const cyclePeriodMode = useCallback(() => {
    setPeriodMode(getNextConditionPeriodMode);
  }, []);

  const openCalendar = useCallback(() => {
    setIsCalendarVisible(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setIsCalendarVisible(false);
  }, []);

  const selectDate = useCallback((date: Date) => {
    if (!isConditionDateSelectable(date)) {
      return;
    }

    setSelectedDate(date);
    setIsCalendarVisible(false);
  }, []);

  return {
    selectedDate,
    selectedDateValue,
    periodMode,
    conditionSummary,
    conditionScore,
    metrics,
    dateLabel,
    calendar: {
      visible: isCalendarVisible,
      title: calendarTitle,
      days: calendarDays,
    },
    cyclePeriodMode,
    openCalendar,
    closeCalendar,
    selectDate,
  };
}
