import {
  googleLogin,
  kakaoLogin,
  logout,
  reissue,
  withdraw,
} from '@/lib/api/endpoints/auth-controller/auth-controller';
import { tokenStorage } from '@/lib/auth/token-storage';

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

  if (provider === 'google') {
    const response = await googleLogin({
      google_id_token: accessToken,
      device_id: deviceId,
    });

    return toAuthSession(response);
  }

  throw new Error(`Unsupported social provider: ${provider satisfies never}`);
}

export async function reissueAuthSession({ deviceId }: AuthDeviceRequest): Promise<AuthSession> {
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error('Missing refresh token.');
  }

  const response = await reissue(
    { device_id: deviceId },
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  return toReissuedAuthSession(response);
}

export async function submitLogout({ deviceId }: AuthDeviceRequest): Promise<void> {
  await logout({ device_id: deviceId });
}

export async function submitWithdraw(): Promise<void> {
  await withdraw();
}
