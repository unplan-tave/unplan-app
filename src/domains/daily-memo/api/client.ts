/**
 * daily-memo 도메인의 서버 API 경계입니다.
 * 홈 화면은 generated memo endpoint를 직접 호출하지 않고, 날짜별 조회/생성/삭제 함수를 통해 접근합니다.
 */
import { createMemo, deleteMemos, getMemos } from '@/lib/api/endpoints/daily-memo/daily-memo';

import { toDailyMemo, toDailyMemos } from './mapper';

import type { CreateDailyMemoInput, DailyMemo } from '../model';

export async function fetchDailyMemos(date: string): Promise<DailyMemo[]> {
  const response = await getMemos({ date });

  return toDailyMemos(response.data);
}

export async function submitDailyMemo(input: CreateDailyMemoInput): Promise<DailyMemo> {
  const response = await createMemo(input);
  const memo = response.data ? toDailyMemo(response.data) : null;

  if (memo == null) {
    throw new Error('Created daily memo response is missing an id.');
  }

  return memo;
}

export async function submitDailyMemoDelete(id: number): Promise<void> {
  await deleteMemos({ ids: [id] });
}
