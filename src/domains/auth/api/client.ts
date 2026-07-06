import { googleLogin, kakaoLogin } from '@/lib/api/endpoints/auth-controller/auth-controller';

import { toAuthSession } from './mapper';

import type { AuthSession, SocialLoginRequest } from '../model';

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
