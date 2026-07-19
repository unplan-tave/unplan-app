/** 컨디션 기록 내역 화면의 마커·일 평균 계산입니다. */
import { scoreToNormalized } from './energy';

import type { ConditionRecordEntry } from './model';

export interface ConditionHistoryMarker {
  id: string;
  x: number;
  y: number;
  records: ConditionRecordEntry[];
}

/** 같은 Body/Mind 점수를 가진 기록을 하나의 마커로 합칩니다. */
export function toConditionHistoryMarkers(
  records: ConditionRecordEntry[],
): ConditionHistoryMarker[] {
  const markers = new Map<string, ConditionHistoryMarker>();

  records.forEach((record) => {
    const key = `${record.bodyScore}:${record.mindScore}`;
    const existing = markers.get(key);

    if (existing != null) {
      existing.records.push(record);
      return;
    }

    markers.set(key, {
      id: key,
      x: scoreToNormalized(record.mindScore),
      y: scoreToNormalized(record.bodyScore),
      records: [record],
    });
  });

  return [...markers.values()].map((marker) => ({
    ...marker,
    records: [...marker.records].sort((first, second) =>
      first.dateTime.localeCompare(second.dateTime),
    ),
  }));
}

/** 해당 날짜에 남긴 Body/Mind 기록의 산술 평균입니다. */
export function toConditionHistoryAverage(records: ConditionRecordEntry[]): {
  bodyPercent: number;
  mindPercent: number;
} {
  if (records.length === 0) {
    return { bodyPercent: 0, mindPercent: 0 };
  }

  const totals = records.reduce(
    (result, record) => ({
      bodyPercent: result.bodyPercent + record.bodyScorePercent,
      mindPercent: result.mindPercent + record.mindScorePercent,
    }),
    { bodyPercent: 0, mindPercent: 0 },
  );

  return {
    bodyPercent: Math.round(totals.bodyPercent / records.length),
    mindPercent: Math.round(totals.mindPercent / records.length),
  };
}

/** ISO 날짜 문자열에서 기록 화면에 표시할 시각을 뽑습니다. */
export function formatConditionRecordTime(dateTime: string): string {
  const time = dateTime.split('T')[1];

  return time?.slice(0, 5) ?? '';
}
