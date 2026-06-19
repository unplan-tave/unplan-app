import { apiClient } from '@/lib/api/client';

import { type ApiResponse, type SocialLoginRequest, type SocialLoginResponse } from './model';

interface BackendSocialLoginResponse {
  access_token: string;
  refresh_token: string;
  is_new_user: boolean;
}

function isApiResponse<T>(value: T | ApiResponse<T>): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

function unwrapApiResponse<T>(value: T | ApiResponse<T>): T {
  return isApiResponse(value) ? value.data : value;
}

function getSocialAuthEndpoint(provider: SocialLoginRequest['provider']): string {
  return `/auth/${provider}`;
}

function getSocialAuthTokenKey(provider: SocialLoginRequest['provider']): string {
  if (provider === 'google') {
    return 'google_id_token';
  }

  return `${provider}_access_token`;
}

export async function submitSocialLogin({
  accessToken,
  deviceId,
  provider,
}: SocialLoginRequest): Promise<SocialLoginResponse> {
  const response = await apiClient.post<
    ApiResponse<BackendSocialLoginResponse> | BackendSocialLoginResponse
  >(getSocialAuthEndpoint(provider), {
    [getSocialAuthTokenKey(provider)]: accessToken,
    device_id: deviceId,
  });

  const data = unwrapApiResponse(response.data);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    isNewUser: data.is_new_user,
    user: null,
  };
}
