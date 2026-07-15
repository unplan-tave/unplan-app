/**
 * daily-memo 도메인의 화면 모델과 입력 제한입니다.
 * 홈 화면과 메모 bottom sheet가 공유하는 메모 식별자, 날짜, 내용 필드를 정의합니다.
 */
export const DAILY_MEMO_MAX_COUNT = 5;
export const DAILY_MEMO_MAX_LENGTH = 20;

export interface DailyMemo {
  id: number;
  content: string;
}

export interface CreateDailyMemoInput {
  date: string;
  content: string;
}
