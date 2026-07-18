/** 수면 측정(기록 추가·수정) 화면의 폼 상태와 저장 로직을 조합합니다. */
import { addDays, format, isAfter, parseISO, startOfDay, startOfWeek } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { type SleepWeekDay } from '@/components/features/sleep/sleep-week-picker';
import {
  useCreateSleepRecordMutation,
  useUpdateSleepRecordMutation,
} from '@/domains/sleep/api/mutations';
import { useSleepRecordQuery } from '@/domains/sleep/api/queries';
import { durationBetween, timeToMinutes, wakeTimeFromDuration } from '@/domains/sleep/measure';

const DATE_ID = 'yyyy-MM-dd';
const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_BED_TIME = '23:00';
const DEFAULT_DURATION = 8 * 60;

type TimeField = 'bed' | 'wake';

export function useSleepMeasureScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const sleepId = params.id != null ? Number(params.id) : null;
  const isEditMode = sleepId != null && !Number.isNaN(sleepId);

  const today = useMemo(() => startOfDay(new Date()), []);
  const [startDateId, setStartDateId] = useState(() => format(addDays(today, -1), DATE_ID));
  const [bedTime, setBedTime] = useState(DEFAULT_BED_TIME);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION);
  const [isNap, setIsNap] = useState(false);
  const [isAllNight, setIsAllNight] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState<TimeField | null>(null);
  const [conflictVisible, setConflictVisible] = useState(false);

  const recordQuery = useSleepRecordQuery(isEditMode ? sleepId : null);
  const createMutation = useCreateSleepRecordMutation();
  const updateMutation = useUpdateSleepRecordMutation();

  // 수정 모드: 기록된 정보대로 폼을 채웁니다.
  const loadedRecord = recordQuery.data;
  useEffect(() => {
    if (!isEditMode || loadedRecord == null) return;

    const crossesDay =
      timeToMinutes(loadedRecord.wakeUpTime) <= timeToMinutes(loadedRecord.bedTime);
    setBedTime(loadedRecord.bedTime);
    setDurationMinutes(
      durationBetween(loadedRecord.bedTime, loadedRecord.wakeUpTime, crossesDay ? 1 : 0),
    );
    setIsNap(loadedRecord.isNap);
    setIsAllNight(loadedRecord.isAllNight);
  }, [isEditMode, loadedRecord]);

  const wakeUpTime = useMemo(
    () => wakeTimeFromDuration(bedTime, durationMinutes),
    [bedTime, durationMinutes],
  );
  const wakeDayOffset = Math.floor((timeToMinutes(bedTime) + durationMinutes) / MINUTES_PER_DAY);
  const endDateId = useMemo(
    () => format(addDays(parseISO(startDateId), wakeDayOffset), DATE_ID),
    [startDateId, wakeDayOffset],
  );

  const monthLabel = useMemo(() => format(parseISO(startDateId), 'yyyy.MM'), [startDateId]);

  const weekDays = useMemo<SleepWeekDay[]>(() => {
    const weekStart = startOfWeek(parseISO(startDateId), { weekStartsOn: 0 });

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const id = format(date, DATE_ID);

      return {
        id,
        day: format(date, 'd'),
        weekday: format(date, 'EEE').toUpperCase(),
        inRange: id >= startDateId && id <= endDateId,
        isStart: id === startDateId,
        isEnd: id === endDateId,
        disabled: isAfter(startOfDay(date), today),
      };
    });
  }, [startDateId, endDateId, today]);

  const selectDate = useCallback((id: string) => setStartDateId(id), []);

  const changeDuration = useCallback((next: number) => {
    setDurationMinutes(Math.max(0, next));
  }, []);

  const openTimeField = useCallback((field: TimeField) => setActiveTimeField(field), []);
  const closeTimeField = useCallback(() => setActiveTimeField(null), []);

  const selectTime = useCallback(
    (time: string) => {
      if (activeTimeField === 'bed') {
        setBedTime(time);
      } else if (activeTimeField === 'wake') {
        const diff = timeToMinutes(time) - timeToMinutes(bedTime);
        setDurationMinutes(diff <= 0 ? diff + MINUTES_PER_DAY : diff);
      }
      setActiveTimeField(null);
    },
    [activeTimeField, bedTime],
  );

  const toggleNap = useCallback(() => {
    setIsNap((value) => !value);
    setIsAllNight(false);
  }, []);

  const toggleAllNight = useCallback(() => {
    setIsAllNight((value) => !value);
    setIsNap(false);
  }, []);

  const submit = useCallback(() => {
    const input = { bedTime, wakeUpTime, isNap, isAllNight };
    const onSuccess = () => router.back();
    // TODO(api): 409(에너지 기록 충돌) 신호가 생기면 그때만 충돌 시트를 띄우도록 좁힙니다.
    const onError = () => setConflictVisible(true);

    if (isEditMode) {
      updateMutation.mutate({ sleepId, input }, { onSuccess, onError });
    } else {
      createMutation.mutate(input, { onSuccess, onError });
    }
  }, [bedTime, createMutation, isAllNight, isEditMode, isNap, sleepId, updateMutation, wakeUpTime]);

  const overwriteConflict = useCallback(() => {
    // TODO(api): 겹치는 에너지 기록 삭제 후 저장하는 force 옵션이 생기면 연결합니다.
    setConflictVisible(false);
    router.back();
  }, []);

  const closeConflict = useCallback(() => setConflictVisible(false), []);
  const cancel = useCallback(() => router.back(), []);

  return {
    title: '얼마나 잠들었나요?',
    subtitle: '수면 패턴을 통해 컨디션값을 보정해요',
    monthLabel,
    weekDays,
    bedTime,
    wakeUpTime,
    durationMinutes,
    isNap,
    isAllNight,
    activeTimeField,
    timeOptionValue: activeTimeField === 'wake' ? wakeUpTime : bedTime,
    conflictVisible,
    isSaving: createMutation.isPending || updateMutation.isPending,
    selectDate,
    changeDuration,
    openTimeField,
    closeTimeField,
    selectTime,
    toggleNap,
    toggleAllNight,
    submit,
    overwriteConflict,
    closeConflict,
    cancel,
  };
}
