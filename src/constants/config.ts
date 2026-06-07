export const Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  kakaoNativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '',
} as const;
