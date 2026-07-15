/**
 * member 도메인의 화면 모델입니다.
 * 프로필, 닉네임 수정 입력, 알림 설정의 기본값과 필드 이름을 앱 기준으로 정의합니다.
 */
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
