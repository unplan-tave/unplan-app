import { Config } from '@/constants/config';

import type * as GoogleSDK from '@react-native-google-signin/google-signin';

let isConfigured = false;

export class GoogleSDKConfigError extends Error {
  constructor() {
    super('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.');
    this.name = 'GoogleSDKConfigError';
  }
}

export function configureGoogleAuthSDK(): void {
  if (!Config.googleWebClientId) {
    console.warn('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Google login is disabled.');
    return;
  }

  if (isConfigured) {
    return;
  }

  const { GoogleSignin } = require('@react-native-google-signin/google-signin') as typeof GoogleSDK;
  GoogleSignin.configure({
    webClientId: Config.googleWebClientId,
    iosClientId: Config.googleIosClientId || undefined,
    offlineAccess: false,
    scopes: ['email', 'profile'],
  });
  isConfigured = true;
}

export function ensureGoogleAuthSDKConfigured(): void {
  if (!Config.googleWebClientId) {
    throw new GoogleSDKConfigError();
  }

  configureGoogleAuthSDK();
}
