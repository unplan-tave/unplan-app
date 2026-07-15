/**
 * member query key factory입니다.
 * 프로필과 알림 설정 캐시를 별도 key로 관리해 설정 변경 시 필요한 캐시만 갱신합니다.
 */
export const memberQueryKeys = {
  all: ['member'] as const,
  profile: () => [...memberQueryKeys.all, 'profile'] as const,
  alarmSettings: () => [...memberQueryKeys.all, 'alarm-settings'] as const,
};
