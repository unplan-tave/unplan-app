/**
 * auth 도메인의 서버 API 경계입니다.
 * 소셜 로그인, 토큰 재발급, 로그아웃, 탈퇴 호출을 감싸고
 * token storage와 화면이 사용할 세션 모델로 변환합니다.
 */
import {
  googleLogin,
  kakaoLogin,
  logout,
  reissue,
  withdraw,
} from '@/lib/api/endpoints/auth-controller/auth-controller';
import { getAccessToken } from '@/lib/api/endpoints/test-controller/test-controller';
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

/** 개발·검증 환경에서 특정 member의 소셜 로그인 세션을 발급합니다. */
export async function requestDevelopmentAccessToken(memberId: number): Promise<AuthSession> {
  const response = await getAccessToken({ memberId });

  return toAuthSession(response);
}
