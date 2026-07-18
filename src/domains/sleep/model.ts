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

/** 기록 내역 카드가 구분하는 수면 종류입니다. */
export type SleepRecordKind = 'sleep' | 'nap';

/**
 * 기록 내역(조회) 화면의 카드 한 장이 필요로 하는 값입니다.
 * bedTime/wakeUpTime은 'HH:mm', dayOffset은 선택한 날짜 기준 상대 일자입니다.
 * (bedDayOffset 1 = 전날, 2 = 2일 전 / wakeDayOffset -1 = 다음날)
 */
export interface SleepDayRecord {
  id: number;
  kind: SleepRecordKind;
  bedTime: string;
  wakeUpTime: string;
  bedDayOffset: number;
  wakeDayOffset: number;
  durationMinutes: number;
  /** 연속수면 그룹 전체 길이입니다. 연속수면이 아니면 durationMinutes와 같습니다. */
  totalDurationMinutes: number;
  isContinuousSleep: boolean;
  comment: string;
}

/** 선택한 날짜 하루치 수면 기록 묶음입니다. */
export interface SleepDaySummary {
  totalMinutes: number;
  isContinuousSleep: boolean;
  records: SleepDayRecord[];
}
