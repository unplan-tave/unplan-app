import { useMemo } from 'react';

import { useDailyMemosQuery } from '@/domains/daily-memo/api/queries';
import {
  useDailyMeasurementQuery,
  useMeasurementAveragesQuery,
} from '@/domains/measurement/api/queries';
import {
  toConditionSummaryFromAverage,
  toConditionSummaryFromDaily,
} from '@/domains/measurement/model';
import { getMeasurementMonthRange, getMeasurementWeekRange } from '@/domains/measurement/period';
import {
  useSchedulesByDateQuery,
  useSchedulesByMonthQuery,
  useSchedulesByWeekQuery,
} from '@/domains/schedule/api/queries';
import { toCardItemsFromScheduleList } from '@/domains/schedule/card-mapper';

import {
  formatDateValue,
  getMonthDateValues,
  getWeekDateValues,
  isPastDate,
  isSameDate,
  isWithinFutureDays,
  toHomeCalendarDate,
  type HomeCalendarDay,
  type HomeViewMode,
} from '../home-calendar';

import type { RecommendationItem } from '@/components/features/home/home-add-bottom-sheet';
import type {
  DailyScheduleGroup,
  MonthlyScheduleCount,
  PersonalTagOption,
} from '@/domains/schedule/model';

const HOME_RECOMMENDATION_FUTURE_DAYS = 7;

export function useHomePageData({
  personalTags,
  selectedDate,
  viewMode,
}: {
  personalTags: PersonalTagOption[];
  selectedDate: Date;
  viewMode: HomeViewMode;
}) {
  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  const selectedMonthValue = useMemo(
    () => `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`,
    [selectedDate],
  );
  const visibleDateValues = useMemo(() => {
    if (viewMode === 'daily') {
      return [];
    }

    return viewMode === 'weekly'
      ? getWeekDateValues(selectedDate)
      : getMonthDateValues(selectedDate);
  }, [selectedDate, viewMode]);
  const schedulesByDateQuery = useSchedulesByDateQuery(selectedDateValue, {
    enabled: viewMode === 'daily',
  });
  const schedulesByWeekQuery = useSchedulesByWeekQuery(selectedDateValue, {
    enabled: viewMode === 'weekly',
  });
  const schedulesByMonthQuery = useSchedulesByMonthQuery(selectedMonthValue, {
    enabled: viewMode === 'monthly',
  });
  const averageInput = useMemo(() => {
    if (viewMode === 'weekly') {
      const { from, to } = getMeasurementWeekRange(selectedDate);

      return { from, to, type: 'ALL' as const, groupBy: 'WEEK' as const };
    }

    if (viewMode === 'monthly') {
      const { from, to } = getMeasurementMonthRange(selectedDate);

      return { from, to, type: 'ALL' as const, groupBy: 'MONTH' as const };
    }

    return null;
  }, [selectedDate, viewMode]);
  const dailyMeasurementQuery = useDailyMeasurementQuery(selectedDateValue, {
    enabled: viewMode === 'daily',
  });
  const dailyMemosQuery = useDailyMemosQuery(selectedDateValue);
  const measurementAveragesQuery = useMeasurementAveragesQuery(averageInput, {
    enabled: viewMode !== 'daily',
  });
  const canShowRecommendations =
    viewMode === 'daily' &&
    !isPastDate(selectedDate) &&
    isWithinFutureDays(selectedDate, HOME_RECOMMENDATION_FUTURE_DAYS);

  const cards = useMemo(
    () => toCardItemsFromScheduleList(schedulesByDateQuery.data ?? [], personalTags),
    [personalTags, schedulesByDateQuery.data],
  );
  const timelineCards = useMemo(
    () =>
      cards
        .filter((card) => card.cardType === 'pin')
        .sort((first, second) => first.timeStart.localeCompare(second.timeStart)),
    [cards],
  );
  const recommendations = useMemo<RecommendationItem[]>(() => {
    // TODO: Home recommendation needs a dedicated ai-recommendation endpoint.
    // Do not reuse /schedule/search here; that endpoint is owned by the card list search flow.
    if (!canShowRecommendations) {
      return [];
    }

    return [];
  }, [canShowRecommendations]);
  const calendarDays = useMemo(
    () =>
      buildHomeCalendarDays({
        dateValues: visibleDateValues,
        monthSchedules: schedulesByMonthQuery.data?.schedules ?? [],
        selectedDate,
        viewMode,
        weekSchedules: schedulesByWeekQuery.data ?? [],
      }),
    [
      schedulesByMonthQuery.data?.schedules,
      schedulesByWeekQuery.data,
      selectedDate,
      viewMode,
      visibleDateValues,
    ],
  );
  const conditionSummary = useMemo(() => {
    if (viewMode === 'daily') {
      return toConditionSummaryFromDaily(dailyMeasurementQuery.data);
    }

    return toConditionSummaryFromAverage(measurementAveragesQuery.data?.items[0]);
  }, [dailyMeasurementQuery.data, measurementAveragesQuery.data?.items, viewMode]);

  return {
    calendarDays,
    cards,
    timelineCards,
    recommendations,
    conditionSummary,
    dailyMemos: dailyMemosQuery.data ?? [],
    dailyMemosQuery,
    isLoading:
      (viewMode === 'daily' && schedulesByDateQuery.isLoading) ||
      (viewMode === 'daily' && dailyMeasurementQuery.isLoading) ||
      (viewMode !== 'daily' && measurementAveragesQuery.isLoading) ||
      (viewMode === 'weekly' && schedulesByWeekQuery.isLoading) ||
      (viewMode === 'monthly' && schedulesByMonthQuery.isLoading),
    isError:
      (viewMode === 'daily' && schedulesByDateQuery.isError) ||
      (viewMode === 'daily' && dailyMeasurementQuery.isError) ||
      (viewMode !== 'daily' && measurementAveragesQuery.isError) ||
      (viewMode === 'weekly' && schedulesByWeekQuery.isError) ||
      (viewMode === 'monthly' && schedulesByMonthQuery.isError),
  };
}

function buildHomeCalendarDays({
  dateValues,
  monthSchedules,
  selectedDate,
  viewMode,
  weekSchedules,
}: {
  dateValues: string[];
  monthSchedules: MonthlyScheduleCount[];
  selectedDate: Date;
  viewMode: HomeViewMode;
  weekSchedules: DailyScheduleGroup[];
}): HomeCalendarDay[] {
  const today = new Date();
  const weekScheduleMap = new Map(weekSchedules.map((group) => [group.date, group.schedules]));
  const monthScheduleMap = new Map(monthSchedules.map((item) => [item.date, item.count]));

  return dateValues.map((dateValue) => {
    const date = toHomeCalendarDate(dateValue);
    const weekSchedulesForDate = weekScheduleMap.get(dateValue) ?? [];
    const monthScheduleCount = monthScheduleMap.get(dateValue) ?? 0;

    return {
      date,
      dateValue,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === selectedDate.getMonth(),
      isToday: isSameDate(date, today),
      isSelected: isSameDate(date, selectedDate),
      hasMemo: false,
      scheduleCount: viewMode === 'weekly' ? weekSchedulesForDate.length : monthScheduleCount,
      previewTitles: weekSchedulesForDate.map((schedule) => schedule.title),
    };
  });
}
