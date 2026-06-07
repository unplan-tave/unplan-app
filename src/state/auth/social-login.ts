import {
  isKakaoTalkLoginAvailable,
  login as kakaoLogin,
  type KakaoLoginToken,
} from '@react-native-kakao/user';
import { isAxiosError } from 'axios';

import { ensureKakaoAuthSDKInitialized, KakaoSDKConfigError } from '@/lib/auth/kakao-sdk';
import { getDeviceId } from '@/lib/device/device-id';

import { submitSocialLogin } from './api';
import { type AuthSession } from './model';
import { useAuthStore } from './use-auth-store';

export type SocialLoginErrorType = 'cancelled' | 'network' | 'sdk' | 'config' | 'unknown';

export class SocialLoginError extends Error {
  type: SocialLoginErrorType;

  constructor(type: SocialLoginErrorType, message: string) {
    super(message);
    this.name = 'SocialLoginError';
    this.type = type;
  }
}

interface NativeModuleError {
  code?: string;
  message?: string;
  nativeErrorMessage?: string;
  isClientFailed?: boolean;
  isAuthFailed?: boolean;
  isApiFailed?: boolean;
  isPackageError?: boolean;
}

function getNativeModuleError(error: unknown): NativeModuleError {
  if (typeof error !== 'object' || error === null) {
    return {};
  }

  return error as NativeModuleError;
}

function isKakaoLoginCancelled(error: unknown): boolean {
  const nativeError = getNativeModuleError(error);
  const code = nativeError.code?.toLowerCase() ?? '';
  const message =
    `${nativeError.message ?? ''} ${nativeError.nativeErrorMessage ?? ''}`.toLowerCase();

  return code.includes('cancel') || message.includes('cancel');
}

function shouldFallbackToKakaoAccount(error: unknown): boolean {
  const nativeError = getNativeModuleError(error);
  const code = nativeError.code ?? '';
  const message =
    `${nativeError.message ?? ''} ${nativeError.nativeErrorMessage ?? ''}`.toLowerCase();

  return code === 'Package-KakaoAppNotAvailable' || message.includes('not available');
}

function toSocialLoginError(error: unknown): SocialLoginError {
  if (error instanceof SocialLoginError) {
    return error;
  }

  if (isKakaoLoginCancelled(error)) {
    return new SocialLoginError('cancelled', '카카오 로그인이 취소되었습니다.');
  }

  if (isAxiosError(error)) {
    return new SocialLoginError('network', '로그인 서버와 통신하지 못했습니다.');
  }

  const nativeError = getNativeModuleError(error);

  if (nativeError.isClientFailed || nativeError.isAuthFailed || nativeError.isApiFailed) {
    return new SocialLoginError('sdk', '카카오 로그인 처리 중 오류가 발생했습니다.');
  }

  if (error instanceof KakaoSDKConfigError) {
    return new SocialLoginError('config', '카카오 앱 키 설정이 필요합니다.');
  }

  return new SocialLoginError('unknown', '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
}

async function requestKakaoAccessToken(): Promise<KakaoLoginToken> {
  await ensureKakaoAuthSDKInitialized();

  const isTalkLoginAvailable = await isKakaoTalkLoginAvailable().catch(() => false);

  if (!isTalkLoginAvailable) {
    return kakaoLogin({ useKakaoAccountLogin: true });
  }

  try {
    return await kakaoLogin();
  } catch (error) {
    if (isKakaoLoginCancelled(error) || !shouldFallbackToKakaoAccount(error)) {
      throw error;
    }

    return kakaoLogin({ useKakaoAccountLogin: true });
  }
}

export async function loginWithKakao(): Promise<AuthSession> {
  try {
    const kakaoToken = await requestKakaoAccessToken();
    const deviceId = await getDeviceId();
    const session = await submitSocialLogin({
      accessToken: kakaoToken.accessToken,
      deviceId,
      provider: 'kakao',
    });

    await useAuthStore.getState().setSession(session);

    return session;
  } catch (error) {
    throw toSocialLoginError(error);
  }
}

export function getSocialLoginErrorMessage(error: unknown): string {
  return toSocialLoginError(error).message;
}
