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
