import { initializeKakaoSDK } from '@react-native-kakao/core';

import { Config } from '@/constants/config';

let initializePromise: Promise<void> | null = null;

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
    throw new Error('Missing EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY.');
  }

  await initializeKakaoAuthSDK();
}
