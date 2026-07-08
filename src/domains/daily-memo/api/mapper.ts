import type { DailyMemo } from '../model';
import type { MemoResponse } from '@/lib/api/model';

export function toDailyMemos(response?: MemoResponse[]): DailyMemo[] {
  return (response ?? []).map((memo) => ({
    id: memo.daily_memo_id ?? 0,
    content: memo.content ?? '',
  }));
}
