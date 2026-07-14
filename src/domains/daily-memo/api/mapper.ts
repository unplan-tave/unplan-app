import type { DailyMemo } from '../model';
import type { MemoResponse } from '@/lib/api/model';

export function toDailyMemo(response: MemoResponse): DailyMemo | null {
  if (response.daily_memo_id == null) {
    return null;
  }

  return {
    id: response.daily_memo_id,
    content: response.content ?? '',
  };
}

export function toDailyMemos(response?: MemoResponse[]): DailyMemo[] {
  return (response ?? []).map(toDailyMemo).filter((memo): memo is DailyMemo => memo != null);
}
