import { useCallback, useMemo, useState } from 'react';

import { toConditionMetricCards } from '@/domains/condition/metric';
import { type ConditionGraphMode, type ConditionPeriodMode } from '@/domains/condition/model';
import {
  buildConditionCalendarDays,
  getConditionCalendarTitle,
  getNextConditionPeriodMode,
  isConditionDateSelectable,
} from '@/domains/condition/period';
import { toConditionSummaryFromDaily } from '@/domains/measurement/model';
import { formatCalendarDateLabel } from '@/lib/utils/date';

/**
 * 컨디션 탭의 기간/그래프 모드/캘린더 상태.
 *
 * TODO(condition-api): 컨디션 요약 값은 measurement API 연동 시
 * `useDailyMeasurementQuery`/`useMeasurementAveragesQuery` 결과로 교체합니다.
 * 지금은 기록이 없는 상태(0%)의 요약을 그대로 사용합니다.
 */
export function useConditionView() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [periodMode, setPeriodMode] = useState<ConditionPeriodMode>('daily');
  const [graphMode, setGraphMode] = useState<ConditionGraphMode>('average');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const conditionSummary = useMemo(() => toConditionSummaryFromDaily(), []);
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
    periodMode,
    graphMode,
    conditionSummary,
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
