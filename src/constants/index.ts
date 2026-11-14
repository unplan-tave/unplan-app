import { Config } from './config';

const prefix = Config.isDemo ? 'chatbot_demo_' : '';

export const STORAGE_KEYS = {
  AUTH_TOKEN: `${prefix}auth_token`,
  DEVICE_ID: `${prefix}device_id`,
  REFRESH_TOKEN: `${prefix}refresh_token`,
  USER_PREFERENCES: `${prefix}user_preferences`,
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
