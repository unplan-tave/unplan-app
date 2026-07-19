/** 오늘 날짜의 컨디션 점수를 반환합니다. (배경 등 화면 공통 표현에 사용) */
import { useMemo } from 'react';

import { useMeasurementAveragesQuery } from '@/domains/measurement/api/queries';
import { toConditionSummaryFromAverage } from '@/domains/measurement/model';
import { formatDateValue } from '@/lib/utils/date';

export function useTodayConditionScore(): number {
  const averageInput = useMemo(() => {
    const todayValue = formatDateValue(new Date());

    return { from: todayValue, to: todayValue, type: 'ALL' as const, groupBy: 'DAY' as const };
  }, []);
  const averagesQuery = useMeasurementAveragesQuery(averageInput);

  return toConditionSummaryFromAverage(averagesQuery.data?.items[0]).finalScore;
}
