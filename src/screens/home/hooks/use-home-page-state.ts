import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useConditionCalendar } from '@/hooks/use-condition-calendar';
import { addDays, getWeekStart } from '@/lib/utils/date';

import {
  formatDateValue,
  getHomeDateLabel,
  getNextHomeViewMode,
  getZoomedHomeViewMode,
  type HomeViewMode,
} from '../home-calendar';

/** 홈 화면의 날짜·보기 모드·현재 시각·제스처·캘린더 상태를 소유합니다. */
export function useHomePageState() {
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<HomeViewMode>('daily');

  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  const todayValue = useMemo(() => formatDateValue(now), [now]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(intervalId);
  }, []);

  /** pinch 방향에 맞춰 홈 보기 단위를 변경합니다. */
  const changeViewModeByZoom = useCallback(
    (direction: 'in' | 'out') =>
      setViewMode((previous) => getZoomedHomeViewMode(previous, direction)),
    [],
  );
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch().onEnd((event) => {
        if (event.scale < 0.92) runOnJS(changeViewModeByZoom)('out');
        if (event.scale > 1.08) runOnJS(changeViewModeByZoom)('in');
      }),
    [changeViewModeByZoom],
  );
  /** 보기 단위에 따라 선택 날짜를 이전·다음 기간으로 이동합니다. */
  const movePeriod = useCallback(
    (direction: 'previous' | 'next') => {
      const amount = direction === 'previous' ? -1 : 1;

      setSelectedDate((previous) => {
        if (viewMode === 'daily') return addDays(previous, amount);
        if (viewMode === 'weekly') return addDays(getWeekStart(previous), amount * 7);

        return new Date(previous.getFullYear(), previous.getMonth() + amount, 1);
      });
    },
    [viewMode],
  );
  const periodSwipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-20, 20])
        .onEnd((event) => {
          if (event.translationX <= -40) runOnJS(movePeriod)('next');
          if (event.translationX >= 40) runOnJS(movePeriod)('previous');
        }),
    [movePeriod],
  );
  const homeGesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, periodSwipeGesture),
    [periodSwipeGesture, pinchGesture],
  );

  /** 캘린더 선택 날짜를 바꿉니다. */
  const handleSelectDate = useCallback((date: Date) => setSelectedDate(date), []);
  const handleCalendarDateSelect = useCallback((date: Date) => setSelectedDate(date), []);
  const calendar = useConditionCalendar({
    selectedDate,
    periodMode: 'daily',
    onSelectDate: handleCalendarDateSelect,
  });
  /** 일·주·월 보기를 순환합니다. */
  const handleCycleViewMode = useCallback(
    () => setViewMode((previous) => getNextHomeViewMode(previous)),
    [],
  );

  return {
    now,
    selectedDate,
    selectedDateValue,
    todayValue,
    viewMode,
    homeDate: getHomeDateLabel(selectedDate),
    homeGesture,
    calendar,
    handleSelectDate,
    handleCycleViewMode,
  };
}
