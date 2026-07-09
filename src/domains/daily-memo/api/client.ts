import { getMemos } from '@/lib/api/endpoints/daily-memo/daily-memo';

import { toDailyMemos } from './mapper';

import type { DailyMemo } from '../model';

export async function fetchDailyMemos(date: string): Promise<DailyMemo[]> {
  const response = await getMemos({ date });

  return toDailyMemos(response.data);
}
