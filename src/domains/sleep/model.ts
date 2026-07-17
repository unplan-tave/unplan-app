/** 수면 기록 API가 화면과 공유하는 domain model입니다. */
export interface SleepRecord {
  id: number;
  bedTime: string;
  wakeUpTime: string;
  durationMinutes: number;
  totalDurationMinutes: number;
  isNap: boolean;
  isAllNight: boolean;
  isContinuousSleep: boolean;
  continuousSleepGroupId: string | null;
  comment: string | null;
  createdAt: string | null;
}

export interface SleepRecordInput {
  bedTime: string;
  wakeUpTime: string;
  isNap: boolean;
  isAllNight: boolean;
}
