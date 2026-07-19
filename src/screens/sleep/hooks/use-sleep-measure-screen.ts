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

const DATE_ID = 'yyyy-MM-dd';
const MINUTES_PER_DAY = 24 * 60;
const MAX_DURATION_MINUTES = 99 * 60 + 59;
const NAP_THRESHOLD_MINUTES = 3 * 60;

/** 수면 측정 화면의 폼 상태와 저장 로직을 조합합니다. */
export function useSleepMeasureScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const sleepId = params.id != null ? Number(params.id) : null;
  const isEditMode = sleepId != null && !Number.isNaN(sleepId);
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfDay(now), [now]);
  const initialWakeTime = useMemo(() => format(now, 'HH:mm'), [now]);
  const [bedDateId, setBedDateId] = useState(() => format(subDays(today, 1), DATE_ID));
  const [wakeDateId, setWakeDateId] = useState(() => format(today, DATE_ID));
  const [bedTime, setBedTime] = useState<string | null>(null);
  const [wakeUpTime, setWakeUpTime] = useState<string | null>(initialWakeTime);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [isNap, setIsNap] = useState(false);
  const [isAllNight, setIsAllNight] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [isNapTooltipVisible, setIsNapTooltipVisible] = useState(false);
  const [isAllNightTooltipVisible, setIsAllNightTooltipVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isSaveErrorVisible, setIsSaveErrorVisible] = useState(false);

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
    setDurationMinutes(
      differenceInMinutes(
        toDateTime(format(today, DATE_ID), loadedRecord.wakeUpTime),
        toDateTime(format(crossesDay ? subDays(today, 1) : today, DATE_ID), loadedRecord.bedTime),
      ),
    );
    setIsNap(loadedRecord.isNap);
    setIsAllNight(loadedRecord.isAllNight);
  }, [isEditMode, loadedRecord, today]);

  const monthLabel = useMemo(() => format(parseISO(wakeDateId), 'yyyy.MM'), [wakeDateId]);
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
    durationMinutes != null &&
    durationMinutes > 0 &&
    computedDuration != null &&
    computedDuration > 0 &&
    durationMinutes <= durationLimitMinutes &&
    durationMinutes === computedDuration;
  const canSubmit =
    !isRecordLoading &&
    !isRecordLoadError &&
    !createMutation.isPending &&
    !updateMutation.isPending &&
    validationMessage == null &&
    bedTime != null &&
    wakeUpTime != null &&
    (isAllNight || durationIsValid);

  const weekDays = useMemo<SleepWeekDay[]>(() => {
    // Figma의 날짜 레일처럼 기상일을 마지막 칸에 두어 기본 어제~오늘 범위를 항상 보여줍니다.
    const weekStart = subDays(parseISO(wakeDateId), 6);

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const id = format(date, DATE_ID);
      const dateIsAfterToday = isAfter(startOfDay(date), today);
      const isAfterEnd =
        !isSelectingEndDate && differenceInCalendarDays(parseISO(wakeDateId), date) < 0;

      return {
        id,
        day: format(date, 'd'),
        weekday: format(date, 'EEE').toUpperCase(),
        inRange: id >= bedDateId && id <= wakeDateId,
        isStart: id === bedDateId,
        isEnd: id === wakeDateId,
        disabled: dateIsAfterToday || isAfterEnd,
      };
    });
  }, [bedDateId, isSelectingEndDate, today, wakeDateId]);

  const validateManualInputs = useCallback(
    (
      nextBedDateId: string,
      nextWakeDateId: string,
      nextBedTime: string | null,
      nextWakeTime: string | null,
      nextDurationMinutes: number | null,
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
      } else if (nextDurationMinutes == null || nextDuration === nextDurationMinutes) {
        setValidationMessage(null);
      } else {
        setValidationMessage('취침 날짜/시각을 확인해 주세요!');
      }
    },
    [],
  );

  const selectDate = useCallback(
    (id: string) => {
      if (isAllNight) return;

      if (!isSelectingEndDate) {
        setBedDateId(id);
        setIsSelectingEndDate(true);
        validateManualInputs(id, wakeDateId, bedTime, wakeUpTime, durationMinutes);
        return;
      }

      if (differenceInCalendarDays(parseISO(id), parseISO(bedDateId)) < 0) {
        setBedDateId(id);
        setIsSelectingEndDate(false);
        validateManualInputs(id, wakeDateId, bedTime, wakeUpTime, durationMinutes);
        return;
      }

      setWakeDateId(id);
      setIsSelectingEndDate(false);
      validateManualInputs(bedDateId, id, bedTime, wakeUpTime, durationMinutes);
    },
    [
      bedDateId,
      bedTime,
      isAllNight,
      isSelectingEndDate,
      durationMinutes,
      validateManualInputs,
      wakeDateId,
      wakeUpTime,
    ],
  );

  const changeBedTime = useCallback(
    (time: string | null) => {
      setBedTime(time);
      const nextDurationMinutes = durationFromDateTimes(bedDateId, wakeDateId, time, wakeUpTime);

      setDurationMinutes(nextDurationMinutes);
      validateManualInputs(bedDateId, wakeDateId, time, wakeUpTime, nextDurationMinutes);
    },
    [bedDateId, validateManualInputs, wakeDateId, wakeUpTime],
  );

  const changeWakeTime = useCallback(
    (time: string | null) => {
      setWakeUpTime(time);
      const nextDurationMinutes = durationFromDateTimes(bedDateId, wakeDateId, bedTime, time);

      setDurationMinutes(nextDurationMinutes);
      validateManualInputs(bedDateId, wakeDateId, bedTime, time, nextDurationMinutes);
    },
    [bedDateId, bedTime, validateManualInputs, wakeDateId],
  );

  const changeDuration = useCallback(
    (nextDuration: number | null) => {
      if (nextDuration == null) {
        setDurationMinutes(null);
        setValidationMessage(null);
        return;
      }

      const safeDuration = Math.max(0, Math.min(MAX_DURATION_MINUTES, nextDuration));

      if (safeDuration === 0) {
        setDurationMinutes(0);
        setIsAllNight(true);
        setIsNap(false);
        setIsAllNightTooltipVisible(true);
        setValidationMessage(null);
        return;
      }

      setDurationMinutes(safeDuration);
      setIsAllNight(false);
      setIsAllNightTooltipVisible(false);
      validateManualInputs(bedDateId, wakeDateId, bedTime, wakeUpTime, safeDuration);

      if (safeDuration < NAP_THRESHOLD_MINUTES) {
        setIsNap(true);
        setIsNapTooltipVisible(true);
      } else {
        setIsNap(false);
        setIsNapTooltipVisible(false);
      }
    },
    [bedDateId, bedTime, validateManualInputs, wakeDateId, wakeUpTime],
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
        setDurationMinutes(0);
        setIsNap(false);
        setIsAllNightTooltipVisible(true);
        setValidationMessage(null);
      } else {
        setDurationMinutes(null);
        setIsAllNightTooltipVisible(false);
      }

      return next;
    });
  }, []);

  const submit = useCallback(() => {
    if (!canSubmit || bedTime == null || wakeUpTime == null) return;

    const input = {
      bedTime: toApiDateTime(bedDateId, bedTime),
      wakeUpTime: toApiDateTime(wakeDateId, wakeUpTime),
      isNap,
      isAllNight,
    };
    const onSuccess = () => router.back();
    const onError = () => setIsSaveErrorVisible(true);

    setIsSaveErrorVisible(false);

    if (isEditMode) {
      updateMutation.mutate({ sleepId, input }, { onSuccess, onError });
    } else {
      createMutation.mutate(input, { onSuccess, onError });
    }
  }, [
    bedTime,
    bedDateId,
    canSubmit,
    createMutation,
    isAllNight,
    isEditMode,
    isNap,
    sleepId,
    updateMutation,
    wakeUpTime,
    wakeDateId,
  ]);

  const cancel = useCallback(() => router.back(), []);
  const retryRecordLoad = useCallback(() => void recordQuery.refetch(), [recordQuery]);

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
    isNapTooltipVisible,
    isAllNightTooltipVisible,
    validationMessage,
    isSaveErrorVisible,
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

/** 완성된 취침·기상 시각에서만 화면에 표시할 수면시간을 계산합니다. */
function durationFromDateTimes(
  bedDateId: string,
  wakeDateId: string,
  bedTime: string | null,
  wakeUpTime: string | null,
): number | null {
  if (bedTime == null || wakeUpTime == null) return null;

  const duration = differenceInMinutes(
    toDateTime(wakeDateId, wakeUpTime),
    toDateTime(bedDateId, bedTime),
  );
  const limit = durationLimitForDateRange(bedDateId, wakeDateId);

  return duration > 0 && duration <= limit ? duration : null;
}
