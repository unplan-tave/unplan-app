/** 컨디션·수면 기록 내역(조회) 화면의 상태와 이벤트를 조합합니다. */
import { addDays, format, isAfter, parseISO, startOfDay } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { type QuadrantPoint } from '@/components/features/condition/condition-quadrant-plot';
import { type RecordHistoryTab } from '@/components/features/sleep/record-history-tabs';
import { type SleepDateItem } from '@/components/features/sleep/sleep-date-rail';
import { useDeleteConditionRecordMutation } from '@/domains/condition/api/mutations';
import {
  formatConditionRecordTime,
  toConditionHistoryAverage,
  toConditionHistoryMarkers,
} from '@/domains/condition/history';
import { useDailyMeasurementQuery } from '@/domains/measurement/api/queries';
import { useDeleteSleepRecordMutation } from '@/domains/sleep/api/mutations';
import { formatSleepTotalLabel } from '@/domains/sleep/format';

const RAIL_DAYS_BEFORE = 21;
const RAIL_DAYS_AFTER = 3;
const DATE_ID = 'yyyy-MM-dd';

/** 컨디션·수면 기록 내역을 선택 날짜 기준으로 보여줍니다. */
export function useSleepRecordScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [tab, setTab] = useState<RecordHistoryTab>(() =>
    params.tab === 'sleep' ? 'sleep' : 'bodyMind',
  );
  const [selectedDateId, setSelectedDateId] = useState(() => format(today, DATE_ID));
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const dailyMeasurementQuery = useDailyMeasurementQuery(selectedDateId);
  const deleteConditionMutation = useDeleteConditionRecordMutation();
  const deleteSleepMutation = useDeleteSleepRecordMutation();
  const dateItems = useMemo<SleepDateItem[]>(() => {
    const start = addDays(today, -RAIL_DAYS_BEFORE);

    return Array.from({ length: RAIL_DAYS_BEFORE + RAIL_DAYS_AFTER + 1 }, (_, index) => {
      const date = addDays(start, index);
      const id = format(date, DATE_ID);

      return {
        id,
        day: format(date, 'd'),
        weekday: format(date, 'EEE').toUpperCase(),
        selected: id === selectedDateId,
        disabled: isAfter(startOfDay(date), today),
        isToday: id === format(today, DATE_ID),
      };
    });
  }, [selectedDateId, today]);

  const conditionRecords = useMemo(
    () => dailyMeasurementQuery.data?.conditionRecords ?? [],
    [dailyMeasurementQuery.data?.conditionRecords],
  );
  const markers = useMemo(() => toConditionHistoryMarkers(conditionRecords), [conditionRecords]);
  const bodyMindAverage = useMemo(
    () => toConditionHistoryAverage(conditionRecords),
    [conditionRecords],
  );
  const bodyMindPoints = useMemo<QuadrantPoint[]>(
    () => markers.map((marker) => ({ ...marker, count: marker.records.length })),
    [markers],
  );
  const activeMarker = markers.find((marker) => marker.id === activeMarkerId) ?? null;
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId) ?? null;
  const selectedBodyMindRecord = selectedMarker?.records[0] ?? null;
  const monthLabel = useMemo(() => format(parseISO(selectedDateId), 'yyyy.MM'), [selectedDateId]);
  const records = dailyMeasurementQuery.data?.sleepRecords ?? [];
  const selectedSleepRecord = records.find((record) => record.id === selectedRecordId) ?? null;
  const totalMinutes = records.reduce((total, record) => total + record.durationMinutes, 0);
  const totalLabel = formatSleepTotalLabel(
    totalMinutes,
    records.some((record) => record.isContinuousSleep),
  );

  const clearMarkerState = useCallback(() => {
    setSelectedMarkerId(null);
    setActiveMarkerId(null);
  }, []);

  const selectDate = useCallback(
    (id: string) => {
      if (isAfter(parseISO(id), today)) return;

      setSelectedDateId(id);
      setSelectedRecordId(null);
      clearMarkerState();
    },
    [clearMarkerState, today],
  );

  const changeTab = useCallback(
    (next: RecordHistoryTab) => {
      setTab(next);
      setSelectedRecordId(null);
      clearMarkerState();
    },
    [clearMarkerState],
  );

  /** 단일 기록은 선택·수정하고, 겹친 기록은 시간 목록을 엽니다. */
  const pressBodyMindMarker = useCallback((point: QuadrantPoint) => {
    if ((point.count ?? 1) >= 2) {
      setSelectedMarkerId(null);
      setActiveMarkerId((current) => (current === point.id ? null : point.id));
      return;
    }

    setActiveMarkerId(null);
    setSelectedMarkerId((current) => (current === point.id ? null : point.id));
  }, []);

  const addBodyMindRecord = useCallback(() => {
    router.push('/energy/measure');
  }, []);

  const editSelectedBodyMind = useCallback(() => {
    if (selectedBodyMindRecord == null) return;

    router.push({ pathname: '/energy/measure', params: { id: String(selectedBodyMindRecord.id) } });
  }, [selectedBodyMindRecord]);

  const deleteSelectedBodyMind = useCallback(() => {
    if (selectedBodyMindRecord == null) return;

    deleteConditionMutation.mutate(selectedBodyMindRecord.id, {
      onSuccess: () => setSelectedMarkerId(null),
    });
  }, [deleteConditionMutation, selectedBodyMindRecord]);

  const selectRecord = useCallback((id: number) => {
    setSelectedRecordId((current) => (current === id ? null : id));
  }, []);

  const addRecord = useCallback(() => {
    router.push('/sleep/measure');
  }, []);

  const editSelectedSleep = useCallback(() => {
    if (selectedSleepRecord == null) return;

    router.push({ pathname: '/sleep/measure', params: { id: String(selectedSleepRecord.id) } });
  }, [selectedSleepRecord]);

  const deleteSelectedSleep = useCallback(() => {
    if (selectedSleepRecord == null) return;

    deleteSleepMutation.mutate(selectedSleepRecord.id, {
      onSuccess: () => setSelectedRecordId(null),
    });
  }, [deleteSleepMutation, selectedSleepRecord]);

  const goBack = useCallback(() => router.back(), []);

  return {
    tab,
    monthLabel,
    dateItems,
    totalLabel,
    records,
    selectedRecordId,
    hasSelectedSleepRecord: selectedSleepRecord != null,
    isDeletingSleep: deleteSleepMutation.isPending,
    bodyMind: {
      bodyPercent: bodyMindAverage.bodyPercent,
      mindPercent: bodyMindAverage.mindPercent,
      points: bodyMindPoints,
    },
    selectedMarkerId,
    activeMarkerId,
    selectedMarkerTime: formatConditionRecordTime(selectedBodyMindRecord?.dateTime ?? ''),
    hasSelectedMarker: selectedBodyMindRecord != null,
    isDeletingBodyMind: deleteConditionMutation.isPending,
    activeMarkerTimes: (activeMarker?.records ?? []).map((record) =>
      formatConditionRecordTime(record.dateTime),
    ),
    isLoading: dailyMeasurementQuery.isPending,
    isError: dailyMeasurementQuery.isError,
    changeTab,
    selectDate,
    selectRecord,
    addRecord,
    editSelectedSleep,
    deleteSelectedSleep,
    pressBodyMindMarker,
    addBodyMindRecord,
    editSelectedBodyMind,
    deleteSelectedBodyMind,
    clearMarkerState,
    goBack,
  };
}
