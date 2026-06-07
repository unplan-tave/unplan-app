export const API_TIMEOUT = 10_000; // 10 seconds

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  DEVICE_ID: 'device_id',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
} as const;

export const APP_ENV = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

// ─── Design System ────────────────────────────────────────
export { colors } from './colors';
export { typography, fontFamilyWeight } from './typography';
export { spacing, radius } from './spacing';
export type { Colors, TypographyVariant, Spacing, Radius } from './theme';
