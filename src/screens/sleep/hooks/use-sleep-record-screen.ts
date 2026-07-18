/** 컨디션·수면 기록 내역(조회) 화면의 상태와 이벤트를 조합합니다. */
import { addDays, format, isAfter, parseISO, startOfDay } from 'date-fns';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { type QuadrantPoint } from '@/components/features/condition/condition-quadrant-plot';
import { type RecordHistoryTab } from '@/components/features/sleep/record-history-tabs';
import { type SleepDateItem } from '@/components/features/sleep/sleep-date-rail';
import { useDeleteConditionRecordMutation } from '@/domains/condition/api/mutations';
import { useDeleteSleepRecordMutation } from '@/domains/sleep/api/mutations';
import { formatSleepTotalLabel } from '@/domains/sleep/format';

import type { SleepDaySummary } from '@/domains/sleep/model';

interface BodyMindMarker {
  id: string;
  x: number;
  y: number;
  records: { conditionId: number; timeLabel: string }[];
}

/**
 * TODO(api): Body/Mind(에너지) 기록 조회 API가 아직 없어 대표 값으로 플롯을 구성합니다.
 * 겹친 마커는 count 배지로, 누르면 시간대 리스트로 표시합니다.
 */
const DEMO_BODY_MIND_MARKERS: BodyMindMarker[] = [
  { id: 'bm-1', x: 0.5, y: 0.33, records: [{ conditionId: 101, timeLabel: '09:41' }] },
  {
    id: 'bm-2',
    x: -0.33,
    y: -0.33,
    records: [
      { conditionId: 102, timeLabel: '13:20' },
      { conditionId: 103, timeLabel: '18:05' },
    ],
  },
];

const DEMO_BODY_MIND_SUMMARY = { bodyPercent: 70, mindPercent: 45 };

const RAIL_DAYS_BEFORE = 21;
const RAIL_DAYS_AFTER = 3;
const DATE_ID = 'yyyy-MM-dd';

/**
 * TODO(api): 하루치 수면 기록 리스트 조회 API가 아직 없어 대표 기록으로 화면을 구성합니다.
 * 실제 API 연동 시 selectedDateId로 조회하도록 교체합니다.
 */
const DEMO_SUMMARY: SleepDaySummary = {
  totalMinutes: 11 * 60,
  isContinuousSleep: false,
  records: [
    {
      id: 1,
      kind: 'sleep',
      bedTime: '23:11',
      wakeUpTime: '09:41',
      bedDayOffset: 1,
      wakeDayOffset: 0,
      durationMinutes: 10 * 60 + 30,
      totalDurationMinutes: 10 * 60 + 30,
      isContinuousSleep: false,
      comment: '제시간에 푹 잤어요',
    },
    {
      id: 2,
      kind: 'nap',
      bedTime: '14:00',
      wakeUpTime: '14:30',
      bedDayOffset: 0,
      wakeDayOffset: 0,
      durationMinutes: 30,
      totalDurationMinutes: 30,
      isContinuousSleep: false,
      comment: '가볍게 충전했어요',
    },
  ],
};

export function useSleepRecordScreen() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [tab, setTab] = useState<RecordHistoryTab>('sleep');
  const [selectedDateId, setSelectedDateId] = useState(() => format(today, DATE_ID));
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [isBodyMindEditing, setIsBodyMindEditing] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const deleteMutation = useDeleteSleepRecordMutation();
  const deleteConditionMutation = useDeleteConditionRecordMutation();

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

  const monthLabel = useMemo(() => format(parseISO(selectedDateId), 'yyyy.MM'), [selectedDateId]);

  const summary = DEMO_SUMMARY;
  const totalLabel = formatSleepTotalLabel(summary.totalMinutes, summary.isContinuousSleep);

  const bodyMindPoints = useMemo<QuadrantPoint[]>(
    () =>
      DEMO_BODY_MIND_MARKERS.map((marker) => ({
        id: marker.id,
        x: marker.x,
        y: marker.y,
        count: marker.records.length,
      })),
    [],
  );

  const activeMarker =
    DEMO_BODY_MIND_MARKERS.find((marker) => marker.id === activeMarkerId) ?? null;
  const selectedMarker =
    DEMO_BODY_MIND_MARKERS.find((marker) => marker.id === selectedMarkerId) ?? null;

  const clearMarkerState = useCallback(() => {
    setSelectedMarkerId(null);
    setActiveMarkerId(null);
  }, []);

  const selectDate = useCallback(
    (id: string) => {
      setSelectedDateId(id);
      setSelectedRecordId(null);
      clearMarkerState();
    },
    [clearMarkerState],
  );

  const changeTab = useCallback(
    (next: RecordHistoryTab) => {
      setTab(next);
      setSelectedRecordId(null);
      setIsBodyMindEditing(false);
      clearMarkerState();
    },
    [clearMarkerState],
  );

  const toggleBodyMindEdit = useCallback(() => {
    setIsBodyMindEditing((value) => !value);
    clearMarkerState();
  }, [clearMarkerState]);

  const addBodyMindRecord = useCallback(() => {
    router.push('/energy/measure');
  }, []);

  /** 편집 모드에선 마커를 선택하고, 조회 모드에선 겹친 마커의 시간대 리스트를 엽니다. */
  const pressBodyMindMarker = useCallback(
    (point: QuadrantPoint) => {
      if (isBodyMindEditing) {
        setSelectedMarkerId((current) => (current === point.id ? null : point.id));

        return;
      }

      const marker = DEMO_BODY_MIND_MARKERS.find((item) => item.id === point.id);
      if (marker != null && marker.records.length >= 2) {
        setActiveMarkerId((current) => (current === point.id ? null : point.id));
      }
    },
    [isBodyMindEditing],
  );

  const editSelectedBodyMind = useCallback(() => {
    const conditionId = selectedMarker?.records[0]?.conditionId;
    if (conditionId == null) return;

    router.push({ pathname: '/energy/measure', params: { id: String(conditionId) } });
  }, [selectedMarker]);

  const deleteSelectedBodyMind = useCallback(() => {
    const conditionId = selectedMarker?.records[0]?.conditionId;
    if (conditionId == null) return;

    // TODO(api): 겹친 마커의 개별 기록 선택 삭제는 리스트 조회 API 연동 후 확장합니다.
    deleteConditionMutation.mutate(conditionId, { onSuccess: () => setSelectedMarkerId(null) });
  }, [deleteConditionMutation, selectedMarker]);

  const editMarkerRecord = useCallback((conditionId: number) => {
    setActiveMarkerId(null);
    router.push({ pathname: '/energy/measure', params: { id: String(conditionId) } });
  }, []);

  const closeMarkerSheet = useCallback(() => setActiveMarkerId(null), []);

  const selectRecord = useCallback((id: number) => {
    setSelectedRecordId((current) => (current === id ? null : id));
  }, []);

  const addRecord = useCallback(() => {
    router.push('/sleep/measure');
  }, []);

  const editSelectedRecord = useCallback(() => {
    if (selectedRecordId == null) return;

    router.push({ pathname: '/sleep/measure', params: { id: String(selectedRecordId) } });
  }, [selectedRecordId]);

  const deleteSelectedRecord = useCallback(() => {
    if (selectedRecordId == null) return;

    deleteMutation.mutate(selectedRecordId, { onSuccess: () => setSelectedRecordId(null) });
  }, [deleteMutation, selectedRecordId]);

  const goBack = useCallback(() => router.back(), []);

  return {
    tab,
    monthLabel,
    dateItems,
    totalLabel,
    records: summary.records,
    selectedRecordId,
    isDeleting: deleteMutation.isPending,
    bodyMind: {
      bodyPercent: DEMO_BODY_MIND_SUMMARY.bodyPercent,
      mindPercent: DEMO_BODY_MIND_SUMMARY.mindPercent,
      points: bodyMindPoints,
    },
    isBodyMindEditing,
    selectedMarkerId,
    activeMarkerId,
    hasSelectedMarker: selectedMarker != null,
    isDeletingBodyMind: deleteConditionMutation.isPending,
    markerSheet: {
      visible: activeMarker != null,
      title: '기록된 시간대',
      items: [...(activeMarker?.records ?? [])]
        .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
        .map((record) => ({
          label: record.timeLabel,
          onPress: () => editMarkerRecord(record.conditionId),
        })),
    },
    changeTab,
    selectDate,
    selectRecord,
    addRecord,
    editSelectedRecord,
    deleteSelectedRecord,
    toggleBodyMindEdit,
    pressBodyMindMarker,
    addBodyMindRecord,
    editSelectedBodyMind,
    deleteSelectedBodyMind,
    closeMarkerSheet,
    goBack,
  };
}
