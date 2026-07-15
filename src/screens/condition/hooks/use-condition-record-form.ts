import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSaveConditionRecordMutation } from '@/domains/condition/api/mutations';
import { formatCalendarDateLabel, formatDateValue, padNumber } from '@/lib/utils/date';

import type { ConditionRecordEntry } from '@/domains/condition/model';

const DEFAULT_SCORE = 3;

export function useConditionRecordForm(selectedDate: Date, record?: ConditionRecordEntry) {
  const [visible, setVisible] = useState(false);
  const [bodyScore, setBodyScore] = useState(DEFAULT_SCORE);
  const [mindScore, setMindScore] = useState(DEFAULT_SCORE);
  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  const dateLabel = useMemo(() => {
    const label = formatCalendarDateLabel(selectedDate);

    return `${label.year}.${label.date}`;
  }, [selectedDate]);
  const saveMutation = useSaveConditionRecordMutation({
    onSuccess: () => {
      setVisible(false);
    },
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    setBodyScore(record?.bodyScore ?? DEFAULT_SCORE);
    setMindScore(record?.mindScore ?? DEFAULT_SCORE);
  }, [record?.bodyScore, record?.mindScore, visible]);

  const open = useCallback(() => {
    setBodyScore(record?.bodyScore ?? DEFAULT_SCORE);
    setMindScore(record?.mindScore ?? DEFAULT_SCORE);
    setVisible(true);
  }, [record?.bodyScore, record?.mindScore]);

  const close = useCallback(() => {
    if (saveMutation.isPending) {
      return;
    }

    setVisible(false);
  }, [saveMutation.isPending]);

  const save = useCallback(() => {
    saveMutation.mutate({
      id: record?.id,
      bodyScore,
      mindScore,
      dateTime:
        record?.dateTime && record.dateTime.length > 0
          ? record.dateTime
          : toDateTime(selectedDateValue),
    });
  }, [bodyScore, mindScore, record?.dateTime, record?.id, saveMutation, selectedDateValue]);

  return {
    visible,
    mode: record == null ? ('create' as const) : ('update' as const),
    dateLabel,
    bodyScore,
    mindScore,
    saving: saveMutation.isPending,
    setBodyScore,
    setMindScore,
    open,
    close,
    save,
  };
}

function toDateTime(dateValue: string): string {
  const now = new Date();

  return `${dateValue}T${padNumber(now.getHours())}:${padNumber(now.getMinutes())}:00`;
}
