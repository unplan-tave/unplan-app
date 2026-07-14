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
