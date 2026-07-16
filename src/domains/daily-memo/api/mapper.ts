/**
 * daily-memo API DTO를 홈 화면에서 쓰는 메모 모델로 변환합니다.
 * optional 필드와 서버 필드명 차이를 이 파일에서 흡수합니다.
 */
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
