import { googleLogin, kakaoLogin } from '@/lib/api/endpoints/auth-controller/auth-controller';

import type { AuthSession, SocialLoginRequest } from './model';

type SocialLoginApiResponse = Awaited<ReturnType<typeof kakaoLogin>>;

function toAuthSession(response: SocialLoginApiResponse): AuthSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    isNewUser: response.isNewUser,
  };
}

export async function submitSocialLogin({
  accessToken,
  deviceId,
  provider,
}: SocialLoginRequest): Promise<AuthSession> {
  if (provider === 'kakao') {
    const response = await kakaoLogin({
      kakaoAccessToken: accessToken,
      deviceId,
    });

    return toAuthSession(response);
  }

  const response = await googleLogin({
    googleIdToken: accessToken,
    deviceId,
  });

  return toAuthSession(response);
}
