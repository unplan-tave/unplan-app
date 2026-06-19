export const Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  kakaoNativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '',
} as const;
