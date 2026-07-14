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
