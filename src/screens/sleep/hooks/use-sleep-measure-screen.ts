/** 수면 측정(기록 추가·수정) 화면의 날짜·시간·수면시간 상태를 조합합니다. */
import {
  addDays,
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isAfter,
  parseISO,
  startOfDay,
  subDays,
  subMinutes,
} from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { type SleepWeekDay } from '@/components/features/sleep/sleep-week-picker';
import {
  useCreateSleepRecordMutation,
  useUpdateSleepRecordMutation,
} from '@/domains/sleep/api/mutations';
import { useSleepRecordQuery } from '@/domains/sleep/api/queries';
import { timeToMinutes } from '@/domains/sleep/measure';
import { isSleepConditionOverlapError } from '@/lib/api/error';

const DATE_ID = 'yyyy-MM-dd';
const MINUTES_PER_DAY = 24 * 60;
const MAX_DURATION_MINUTES = 99 * 60 + 59;

/** 수면 측정 화면의 폼 상태와 저장 로직을 조합합니다. */
export function useSleepMeasureScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const sleepId = params.id != null ? Number(params.id) : null;
  const isEditMode = sleepId != null && !Number.isNaN(sleepId);
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfDay(now), [now]);
  const [bedDateId, setBedDateId] = useState(() => format(subDays(today, 1), DATE_ID));
  const [wakeDateId, setWakeDateId] = useState(() => format(today, DATE_ID));
  const [weekStartDateId, setWeekStartDateId] = useState(() => format(subDays(today, 6), DATE_ID));
  const [bedTime, setBedTime] = useState<string | null>(null);
  const [wakeUpTime, setWakeUpTime] = useState<string | null>(null);
  const [isNap, setIsNap] = useState(false);
  const [isAllNight, setIsAllNight] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [isNapTooltipVisible, setIsNapTooltipVisible] = useState(false);
  const [isAllNightTooltipVisible, setIsAllNightTooltipVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isSaveErrorVisible, setIsSaveErrorVisible] = useState(false);
  const [isConditionConflictVisible, setIsConditionConflictVisible] = useState(false);

  const recordQuery = useSleepRecordQuery(isEditMode ? sleepId : null);
  const createMutation = useCreateSleepRecordMutation();
  const updateMutation = useUpdateSleepRecordMutation();
  const isRecordLoading = isEditMode && recordQuery.isPending;
  const isRecordLoadError = isEditMode && recordQuery.isError;
  const loadedRecord = recordQuery.data;

  useEffect(() => {
    if (!isEditMode || loadedRecord == null) return;

    const crossesDay =
      timeToMinutes(loadedRecord.wakeUpTime) <= timeToMinutes(loadedRecord.bedTime);
    setBedTime(loadedRecord.bedTime);
    setWakeUpTime(loadedRecord.wakeUpTime);
    setBedDateId(format(crossesDay ? subDays(today, 1) : today, DATE_ID));
    setWakeDateId(format(today, DATE_ID));
    setIsNap(loadedRecord.isNap);
    setIsAllNight(loadedRecord.isAllNight);
  }, [isEditMode, loadedRecord, today]);

  const monthLabel = useMemo(() => format(parseISO(weekStartDateId), 'yyyy.MM'), [weekStartDateId]);
  const wakeDateTime = useMemo(
    () => (wakeUpTime == null ? null : toDateTime(wakeDateId, wakeUpTime)),
    [wakeDateId, wakeUpTime],
  );
  const bedDateTime = useMemo(
    () => (bedTime == null ? null : toDateTime(bedDateId, bedTime)),
    [bedDateId, bedTime],
  );
  const computedDuration = useMemo(
    () =>
      bedDateTime == null || wakeDateTime == null
        ? null
        : differenceInMinutes(wakeDateTime, bedDateTime),
    [bedDateTime, wakeDateTime],
  );
  const durationLimitMinutes = useMemo(
    () => durationLimitForDateRange(bedDateId, wakeDateId),
    [bedDateId, wakeDateId],
  );
  const durationIsValid =
    computedDuration != null && computedDuration > 0 && computedDuration <= durationLimitMinutes;
  const canSubmit =
    !isRecordLoading &&
    !isRecordLoadError &&
    !createMutation.isPending &&
    !updateMutation.isPending &&
    validationMessage == null &&
    (isAllNight || (bedTime != null && wakeUpTime != null && durationIsValid));

  const weekDays = useMemo<SleepWeekDay[]>(() => {
    const weekStart = parseISO(weekStartDateId);

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const id = format(date, DATE_ID);
      const dateIsAfterToday = isAfter(startOfDay(date), today);
      return {
        id,
        day: format(date, 'd'),
        weekday: format(date, 'EEE').toUpperCase(),
        inRange: id >= bedDateId && id <= wakeDateId,
        isStart: id === bedDateId,
        isEnd: id === wakeDateId,
        disabled: dateIsAfterToday,
      };
    });
  }, [bedDateId, today, wakeDateId, weekStartDateId]);

  const shiftDateRange = useCallback(
    (direction: 'previous' | 'next') => {
      const lastAvailableWeekStart = subDays(today, 6);

      setWeekStartDateId((current) => {
        const next = addDays(parseISO(current), direction === 'previous' ? -1 : 1);
        const nextWeekStart = isAfter(next, lastAvailableWeekStart) ? lastAvailableWeekStart : next;

        return format(nextWeekStart, DATE_ID);
      });
    },
    [today],
  );

  const validateManualInputs = useCallback(
    (
      nextBedDateId: string,
      nextWakeDateId: string,
      nextBedTime: string | null,
      nextWakeTime: string | null,
    ) => {
      if (nextBedTime == null || nextWakeTime == null) {
        setValidationMessage(null);
        return;
      }

      const nextDuration = differenceInMinutes(
        toDateTime(nextWakeDateId, nextWakeTime),
        toDateTime(nextBedDateId, nextBedTime),
      );

      const nextLimit = durationLimitForDateRange(nextBedDateId, nextWakeDateId);

      if (nextDuration <= 0 || nextDuration > nextLimit) {
        setValidationMessage('취침 날짜/시각을 확인해 주세요!');
      } else {
        setValidationMessage(null);
      }
    },
    [],
  );

  const selectDate = useCallback(
    (id: string) => {
      if (!isSelectingEndDate) {
        setBedDateId(id);
        setIsSelectingEndDate(true);
        if (isAllNight) {
          setValidationMessage(null);
          return;
        }
        validateManualInputs(id, wakeDateId, bedTime, wakeUpTime);
        return;
      }

      if (differenceInCalendarDays(parseISO(id), parseISO(bedDateId)) < 0) {
        setBedDateId(id);
        setIsSelectingEndDate(false);
        if (isAllNight) {
          setValidationMessage(null);
          return;
        }
        validateManualInputs(id, wakeDateId, bedTime, wakeUpTime);
        return;
      }

      setWakeDateId(id);
      setIsSelectingEndDate(false);
      if (isAllNight) {
        setValidationMessage(null);
        return;
      }
      validateManualInputs(bedDateId, id, bedTime, wakeUpTime);
    },
    [
      bedDateId,
      bedTime,
      isAllNight,
      isSelectingEndDate,
      validateManualInputs,
      wakeDateId,
      wakeUpTime,
    ],
  );

  const changeBedTime = useCallback(
    (time: string | null) => {
      setBedTime(time);
      validateManualInputs(bedDateId, wakeDateId, time, wakeUpTime);
    },
    [bedDateId, validateManualInputs, wakeDateId, wakeUpTime],
  );

  const changeWakeTime = useCallback(
    (time: string | null) => {
      setWakeUpTime(time);
      validateManualInputs(bedDateId, wakeDateId, bedTime, time);
    },
    [bedDateId, bedTime, validateManualInputs, wakeDateId],
  );

  const changeDuration = useCallback(
    (nextDurationMinutes: number | null) => {
      if (nextDurationMinutes == null || wakeUpTime == null) {
        if (nextDurationMinutes != null) {
          setValidationMessage('기상 시각을 먼저 입력해 주세요.');
        }
        return;
      }

      const durationMinutes = Math.max(1, Math.min(MAX_DURATION_MINUTES, nextDurationMinutes));
      const nextBedDateTime = subMinutes(toDateTime(wakeDateId, wakeUpTime), durationMinutes);
      const nextBedDateId = format(nextBedDateTime, DATE_ID);
      const nextBedTime = format(nextBedDateTime, 'HH:mm');

      setBedDateId(nextBedDateId);
      setBedTime(nextBedTime);
      setIsAllNight(false);
      setIsAllNightTooltipVisible(false);
      validateManualInputs(nextBedDateId, wakeDateId, nextBedTime, wakeUpTime);
    },
    [validateManualInputs, wakeDateId, wakeUpTime],
  );

  const toggleNap = useCallback(() => {
    setIsNap((value) => !value);
    setIsAllNight(false);
    setIsAllNightTooltipVisible(false);
    setIsNapTooltipVisible(false);
  }, []);

  const toggleAllNight = useCallback(() => {
    setIsAllNight((value) => {
      const next = !value;

      if (next) {
        setIsNap(false);
        setIsAllNightTooltipVisible(true);
        setValidationMessage(null);
      } else {
        setIsAllNightTooltipVisible(false);
      }

      return next;
    });
  }, []);

  const submit = useCallback(() => {
    if (
      isRecordLoading ||
      isRecordLoadError ||
      createMutation.isPending ||
      updateMutation.isPending
    ) {
      return;
    }

    if (!isAllNight) {
      if (bedTime == null || wakeUpTime == null) {
        setValidationMessage('취침 시각과 기상 시각을 입력해 주세요.');
        return;
      }

      if (!durationIsValid) {
        setValidationMessage('취침 날짜와 시각을 확인해 주세요.');
        return;
      }
    }

    const input = isAllNight
      ? {
          bedTime: toApiDateTime(bedDateId, '00:00'),
          wakeUpTime: toApiDateTime(wakeDateId, '00:00'),
          isNap: false,
          isAllNight: true,
        }
      : {
          bedTime: toApiDateTime(bedDateId, bedTime ?? '00:00'),
          wakeUpTime: toApiDateTime(wakeDateId, wakeUpTime ?? '00:00'),
          isNap,
          isAllNight: false,
        };
    const onSuccess = () => router.back();
    const onError = (error: Error) => {
      if (isSleepConditionOverlapError(error)) {
        setIsConditionConflictVisible(true);
        return;
      }

      setIsSaveErrorVisible(true);
    };

    setIsSaveErrorVisible(false);
    setIsConditionConflictVisible(false);

    if (isEditMode) {
      updateMutation.mutate({ sleepId, input }, { onSuccess, onError });
    } else {
      createMutation.mutate(input, { onSuccess, onError });
    }
  }, [
    bedTime,
    bedDateId,
    createMutation,
    durationIsValid,
    isAllNight,
    isEditMode,
    isNap,
    isRecordLoadError,
    isRecordLoading,
    sleepId,
    updateMutation,
    wakeUpTime,
    wakeDateId,
  ]);

  const cancel = useCallback(() => router.back(), []);
  const retryRecordLoad = useCallback(() => void recordQuery.refetch(), [recordQuery]);
  const closeConditionConflict = useCallback(() => setIsConditionConflictVisible(false), []);
  const openConditionRecords = useCallback(() => {
    setIsConditionConflictVisible(false);
    router.push('/sleep/record');
  }, []);

  return {
    title: '얼마나 잠들었나요?',
    subtitle: '수면 패턴을 통해 컨디션값을 보정해요',
    monthLabel,
    weekDays,
    shiftDateRange,
    bedTime,
    wakeUpTime,
    durationMinutes: isAllNight ? 0 : computedDuration,
    isNap,
    isAllNight,
    isNapTooltipVisible,
    isAllNightTooltipVisible,
    validationMessage,
    isSaveErrorVisible,
    isConditionConflictVisible,
    isRecordLoading,
    isRecordLoadError,
    isSaving: createMutation.isPending || updateMutation.isPending,
    canSubmit,
    selectDate,
    changeDuration,
    changeBedTime,
    changeWakeTime,
    toggleNap,
    toggleAllNight,
    dismissNapTooltip: () => setIsNapTooltipVisible(false),
    dismissAllNightTooltip: () => setIsAllNightTooltipVisible(false),
    dismissValidationMessage: () => setValidationMessage(null),
    submit,
    cancel,
    retryRecordLoad,
    closeConditionConflict,
    openConditionRecords,
  };
}

function toDateTime(dateId: string, time: string): Date {
  return parseISO(`${dateId}T${time}:00`);
}

/** 서버 수면 API는 날짜를 포함한 local datetime 문자열을 받습니다. */
function toApiDateTime(dateId: string, time: string): string {
  return `${dateId}T${time}`;
}

/** 같은 날짜는 최대 24시간, 날짜 경계를 하나 더 지날 때마다 24시간을 추가로 허용합니다. */
function durationLimitForDateRange(bedDateId: string, wakeDateId: string): number {
  const dateDistance = differenceInCalendarDays(parseISO(wakeDateId), parseISO(bedDateId));

  return Math.max(1, dateDistance + 1) * MINUTES_PER_DAY;
}
