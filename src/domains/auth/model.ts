/**
 * auth 도메인의 앱 내부 모델입니다.
 * 서버 DTO와 외부 SDK 응답을 그대로 퍼뜨리지 않고 세션/기기 요청/로그인 provider 타입을 고정합니다.
 */
export type SocialProvider = 'kakao' | 'google';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string | null;
  isNewUser?: boolean;
  hasCompletedOnboarding?: boolean;
}

export interface SocialLoginRequest {
  provider: SocialProvider;
  accessToken: string;
  deviceId: string;
}

export interface AuthDeviceRequest {
  deviceId: string;
}
