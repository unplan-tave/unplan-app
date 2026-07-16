import { useCallback, useMemo, useState } from 'react';

import { toConditionMetricCards } from '@/domains/condition/metric';
import { type ConditionGraphMode, type ConditionPeriodMode } from '@/domains/condition/model';
import {
  buildConditionCalendarDays,
  getConditionCalendarTitle,
  getNextConditionPeriodMode,
  isConditionDateSelectable,
} from '@/domains/condition/period';
import { useDailyMeasurementQuery } from '@/domains/measurement/api/queries';
import { toConditionSummaryFromDaily } from '@/domains/measurement/model';
import { formatCalendarDateLabel, formatDateValue } from '@/lib/utils/date';

/** 컨디션 탭의 기간/그래프 모드/캘린더 상태. */
export function useConditionView() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [periodMode, setPeriodMode] = useState<ConditionPeriodMode>('daily');
  const [graphMode, setGraphMode] = useState<ConditionGraphMode>('average');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  const dailyMeasurementQuery = useDailyMeasurementQuery(selectedDateValue);
  const conditionSummary = useMemo(
    () => toConditionSummaryFromDaily(dailyMeasurementQuery.data),
    [dailyMeasurementQuery.data],
  );
  const conditionRecord = dailyMeasurementQuery.data?.conditionRecords?.[0];
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
    graphMode,
    conditionSummary,
    conditionRecord,
    metrics,
    dateLabel,
    calendar: {
      visible: isCalendarVisible,
      title: calendarTitle,
      days: calendarDays,
    },
    setGraphMode,
    cyclePeriodMode,
    openCalendar,
    closeCalendar,
    selectDate,
  };
}
