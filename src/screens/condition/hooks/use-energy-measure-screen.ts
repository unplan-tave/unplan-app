/** 에너지(Body/Mind) 측정 = 컨디션 기록 추가·수정 화면의 상태와 저장 로직입니다. */
import { format, parse } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSaveConditionRecordMutation } from '@/domains/condition/api/mutations';
import { useConditionRecordQuery } from '@/domains/condition/api/queries';
import { normalizedToScore, scoreToNormalized } from '@/domains/condition/energy';

const DATE_ID = 'yyyy-MM-dd';
const DATE_LABEL = 'yyyy.MM.dd';
const DAY_OPTIONS = 30;

type PickerField = 'date' | 'time';

const TIME_OPTIONS = Array.from({ length: (24 * 60) / 10 }, (_, index) => {
  const minutes = index * 10;

  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
});

export function useEnergyMeasureScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const conditionId = params.id != null ? Number(params.id) : null;
  const isEditMode = conditionId != null && !Number.isNaN(conditionId);

  const now = useMemo(() => new Date(), []);
  const [bodyScore, setBodyScore] = useState(3);
  const [mindScore, setMindScore] = useState(3);
  const [hasValue, setHasValue] = useState(false);
  const [dateId, setDateId] = useState(() => format(now, DATE_ID));
  const [time, setTime] = useState(() => format(now, 'HH:mm'));
  const [activeField, setActiveField] = useState<PickerField | null>(null);

  const recordQuery = useConditionRecordQuery(isEditMode ? conditionId : null);
  const saveMutation = useSaveConditionRecordMutation({ onSuccess: () => router.back() });

  const loadedRecord = recordQuery.data;
  useEffect(() => {
    if (!isEditMode || loadedRecord == null) return;

    setBodyScore(loadedRecord.bodyScore);
    setMindScore(loadedRecord.mindScore);
    setHasValue(true);
    if (loadedRecord.dateTime) {
      const [datePart, timePart] = loadedRecord.dateTime.split('T');
      if (datePart) setDateId(datePart);
      if (timePart) setTime(timePart.slice(0, 5));
    }
  }, [isEditMode, loadedRecord]);

  const value = hasValue
    ? { x: scoreToNormalized(mindScore), y: scoreToNormalized(bodyScore) }
    : null;

  const dateOptions = useMemo(() => {
    return Array.from({ length: DAY_OPTIONS }, (_, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - index);

      return format(date, DATE_LABEL);
    });
  }, [now]);

  const dateLabel = format(parse(dateId, DATE_ID, now), DATE_LABEL);

  const selectPoint = useCallback((x: number, y: number) => {
    setMindScore(normalizedToScore(x));
    setBodyScore(normalizedToScore(y));
    setHasValue(true);
  }, []);

  const openDateField = useCallback(() => setActiveField('date'), []);
  const openTimeField = useCallback(() => setActiveField('time'), []);
  const closeField = useCallback(() => setActiveField(null), []);

  const selectOption = useCallback((option: string) => {
    setActiveField((field) => {
      if (field === 'date') {
        setDateId(format(parse(option, DATE_LABEL, new Date()), DATE_ID));
      } else if (field === 'time') {
        setTime(option);
      }

      return null;
    });
  }, []);

  const submit = useCallback(() => {
    if (!hasValue) return;

    saveMutation.mutate({
      id: isEditMode ? conditionId : undefined,
      bodyScore,
      mindScore,
      dateTime: `${dateId}T${time}:00`,
    });
  }, [bodyScore, conditionId, dateId, hasValue, isEditMode, mindScore, saveMutation, time]);

  const cancel = useCallback(() => router.back(), []);

  return {
    title: '상태가 어떠신가요?',
    subtitle: '현재 쓸 수 있는 에너지에 맞게 일정을 추천해드려요',
    value,
    dateLabel,
    timeLabel: time,
    activeField,
    fieldOptions: activeField === 'date' ? dateOptions : TIME_OPTIONS,
    fieldValue: activeField === 'date' ? dateLabel : time,
    canSubmit: hasValue && !saveMutation.isPending,
    isSaving: saveMutation.isPending,
    selectPoint,
    openDateField,
    openTimeField,
    closeField,
    selectOption,
    submit,
    cancel,
  };
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}
