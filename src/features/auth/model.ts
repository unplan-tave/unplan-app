export interface User {
  id: string;
  email?: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type SocialProvider = 'kakao' | 'google' | 'apple';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string | null;
  isNewUser?: boolean;
  user?: User | null;
}

export interface SocialLoginRequest {
  provider: SocialProvider;
  accessToken: string;
  deviceId: string;
}

export interface SocialLoginResponse extends AuthSession {}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
