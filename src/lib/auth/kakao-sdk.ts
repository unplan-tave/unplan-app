import { initializeKakaoSDK } from '@react-native-kakao/core';

import { Config } from '@/constants/config';

let initializePromise: Promise<void> | null = null;

export class KakaoSDKConfigError extends Error {
  constructor() {
    super('Missing EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY.');
    this.name = 'KakaoSDKConfigError';
  }
}

export function initializeKakaoAuthSDK(): Promise<void> {
  if (!Config.kakaoNativeAppKey) {
    console.warn('Missing EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY. Kakao login is disabled.');
    return Promise.resolve();
  }

  initializePromise ??= initializeKakaoSDK(Config.kakaoNativeAppKey).catch((error: unknown) => {
    initializePromise = null;
    throw error;
  });

  return initializePromise;
}

export async function ensureKakaoAuthSDKInitialized(): Promise<void> {
  if (!Config.kakaoNativeAppKey) {
    throw new KakaoSDKConfigError();
  }

  await initializeKakaoAuthSDK();
}
