import { googleLogin, kakaoLogin } from '@/lib/api/endpoints/auth-controller/auth-controller';

import type { AuthSession, SocialLoginRequest } from './model';

type SocialLoginApiResponse = Awaited<ReturnType<typeof kakaoLogin>>;

function toAuthSession(response: SocialLoginApiResponse): AuthSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    isNewUser: response.is_new_user,
  };
}

export async function submitSocialLogin({
  accessToken,
  deviceId,
  provider,
}: SocialLoginRequest): Promise<AuthSession> {
  if (provider === 'kakao') {
    const response = await kakaoLogin({
      kakao_access_token: accessToken,
      device_id: deviceId,
    });

    return toAuthSession(response);
  }

  const response = await googleLogin({
    google_id_token: accessToken,
    device_id: deviceId,
  });

  return toAuthSession(response);
}
