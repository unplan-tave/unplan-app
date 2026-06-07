import { apiClient } from '@/lib/api/client';

import { type ApiResponse, type SocialLoginRequest, type SocialLoginResponse } from './model';

function isApiResponse<T>(value: T | ApiResponse<T>): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

function unwrapApiResponse<T>(value: T | ApiResponse<T>): T {
  return isApiResponse(value) ? value.data : value;
}

function getSocialAuthEndpoint(provider: SocialLoginRequest['provider']): string {
  return `/auth/${provider}`;
}

export async function submitSocialLogin({
  provider,
  token,
}: SocialLoginRequest): Promise<SocialLoginResponse> {
  const response = await apiClient.post<ApiResponse<SocialLoginResponse> | SocialLoginResponse>(
    getSocialAuthEndpoint(provider),
    {
      accessToken: token,
    },
  );

  return unwrapApiResponse(response.data);
}
