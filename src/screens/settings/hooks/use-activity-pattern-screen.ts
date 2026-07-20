/** 활동 패턴 조회 화면의 서버 상태, 표시 값, 라우팅을 관리합니다. */
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import {
  formatActivityRangeLabel,
  toContiguousActivityRanges,
} from '@/domains/onboarding/activity-time-ranges';
import { useActivityPatternSettingsQuery } from '@/domains/onboarding/api/queries';

import type { TimeRange } from '@/domains/onboarding/model';

/** 시간 range 배열을 설정 목록에 표시할 문자열 목록으로 변환합니다. */
function formatRangesValue(ranges: TimeRange[]): string[] {
  const contiguousRanges = toContiguousActivityRanges(ranges);
  return contiguousRanges.length === 0 ? ['-'] : contiguousRanges.map(formatActivityRangeLabel);
}

/** 활동 패턴 화면이 사용할 표시 모델과 이벤트를 반환합니다. */
export function useActivityPatternScreen() {
  const router = useRouter();
  const settingsQuery = useActivityPatternSettingsQuery();
  const values = useMemo(() => {
    const settings = settingsQuery.data;
    if (!settings) return null;
    return {
      focus: formatRangesValue(settings.focusTimeRanges),
      sleepy: formatRangesValue(settings.sleepyTimeRanges),
      sleep: formatRangesValue(settings.sleepTimeRanges),
    };
  }, [settingsQuery.data]);
  /** 이전 화면으로 이동합니다. */
  const handleBack = useCallback(() => router.back(), [router]);
  /** 활동 패턴 편집 화면으로 이동합니다. */
  const handleEdit = useCallback(() => router.push('/settings/activity-pattern-edit'), [router]);
  return { values, handleBack, handleEdit };
}
