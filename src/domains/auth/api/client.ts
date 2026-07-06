import {
  googleLogin,
  kakaoLogin,
  logout,
  reissue,
} from '@/lib/api/endpoints/auth-controller/auth-controller';

import { toAuthSession, toReissuedAuthSession } from './mapper';

import type { AuthDeviceRequest, AuthSession, SocialLoginRequest } from '../model';

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

export async function reissueAuthSession({ deviceId }: AuthDeviceRequest): Promise<AuthSession> {
  const response = await reissue({ device_id: deviceId });

  return toReissuedAuthSession(response);
}

export async function submitLogout({ deviceId }: AuthDeviceRequest): Promise<void> {
  await logout({ device_id: deviceId });
}
