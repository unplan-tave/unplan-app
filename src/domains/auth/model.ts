export type SocialProvider = 'kakao' | 'google';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string | null;
  isNewUser?: boolean;
}

export interface SocialLoginRequest {
  provider: SocialProvider;
  accessToken: string;
  deviceId: string;
}
