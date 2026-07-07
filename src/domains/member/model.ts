export interface MemberProfile {
  name: string;
  nickname: string;
  email: string;
  hasCompletedOnboarding: boolean;
}

export interface MemberProfileUpdateInput {
  name?: string;
  nickname?: string;
  email?: string;
}

export interface AlarmSettings {
  scheduleEndAlarmOn: boolean;
  conditionRecordAlarmOn: boolean;
  recommendAlarmOn: boolean;
}

export const DEFAULT_ALARM_SETTINGS: AlarmSettings = {
  scheduleEndAlarmOn: false,
  conditionRecordAlarmOn: false,
  recommendAlarmOn: false,
};
