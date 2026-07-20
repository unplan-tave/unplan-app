import { useMemo } from 'react';

import { useScheduleRecommendationsQuery } from '@/domains/ai-recommendation/api/queries';
import { isUpcomingScheduleRecommendation } from '@/domains/ai-recommendation/model';
import { useDailyMemosQuery } from '@/domains/daily-memo/api/queries';
import { useMeasurementAveragesQuery } from '@/domains/measurement/api/queries';
import { toConditionSummaryFromAverage } from '@/domains/measurement/model';
import { getMeasurementMonthRange, getMeasurementWeekRange } from '@/domains/measurement/period';
import {
  useDailyMessageQuery,
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
  isWithinFutureDays,
  buildHomeCalendarDays,
  type HomeViewMode,
} from '../home-calendar';

import type { PersonalTagOption } from '@/domains/schedule/model';

const HOME_RECOMMENDATION_FUTURE_DAYS = 7;

/** 홈 화면의 캘린더·컨디션·일정 서버 데이터를 조회해 화면 모델로 조합합니다. */
export function useHomePageData({
  now,
  personalTags,
  selectedDate,
  viewMode,
}: {
  now: Date;
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
  // 데일리/위클리/먼슬리 모두 /measurements/averages를 사용합니다. (데일리는 from=to=선택 날짜, groupBy DAY)
  const averageInput = useMemo(() => {
    if (viewMode === 'weekly') {
      const { from, to } = getMeasurementWeekRange(selectedDate);

      return { from, to, type: 'ALL' as const, groupBy: 'WEEK' as const };
    }

    if (viewMode === 'monthly') {
      const { from, to } = getMeasurementMonthRange(selectedDate);

      return { from, to, type: 'ALL' as const, groupBy: 'MONTH' as const };
    }

    return {
      from: selectedDateValue,
      to: selectedDateValue,
      type: 'ALL' as const,
      groupBy: 'DAY' as const,
    };
  }, [selectedDate, selectedDateValue, viewMode]);
  const dailyMessageQuery = useDailyMessageQuery(selectedDateValue, {
    enabled: viewMode === 'daily',
  });
  const dailyMemosQuery = useDailyMemosQuery(selectedDateValue);
  const measurementAveragesQuery = useMeasurementAveragesQuery(averageInput);
  const canShowRecommendations =
    viewMode === 'daily' &&
    !isPastDate(selectedDate) &&
    isWithinFutureDays(selectedDate, HOME_RECOMMENDATION_FUTURE_DAYS);
  const scheduleRecommendationsQuery = useScheduleRecommendationsQuery(selectedDateValue, {
    enabled: canShowRecommendations,
  });

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
  const recommendations = useMemo(
    () =>
      (scheduleRecommendationsQuery.data ?? []).filter((recommendation) =>
        isUpcomingScheduleRecommendation(recommendation, now),
      ),
    [now, scheduleRecommendationsQuery.data],
  );
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
  const conditionSummary = useMemo(
    () => toConditionSummaryFromAverage(measurementAveragesQuery.data?.items[0]),
    [measurementAveragesQuery.data?.items],
  );
  const conditionScore = measurementAveragesQuery.data?.items[0]?.finalConditionScore ?? null;

  return {
    calendarDays,
    cards,
    timelineCards,
    recommendations,
    conditionSummary,
    conditionScore,
    dailyMessage: viewMode === 'daily' ? dailyMessageQuery.data : undefined,
    dailyMemos: dailyMemosQuery.data ?? [],
    dailyMemosQuery,
    scheduleRecommendationsQuery,
    isLoading:
      measurementAveragesQuery.isLoading ||
      (viewMode === 'daily' && schedulesByDateQuery.isLoading) ||
      (viewMode === 'weekly' && schedulesByWeekQuery.isLoading) ||
      (viewMode === 'monthly' && schedulesByMonthQuery.isLoading),
    isError:
      measurementAveragesQuery.isError ||
      (viewMode === 'daily' && schedulesByDateQuery.isError) ||
      (viewMode === 'weekly' && schedulesByWeekQuery.isError) ||
      (viewMode === 'monthly' && schedulesByMonthQuery.isError),
  };
}
