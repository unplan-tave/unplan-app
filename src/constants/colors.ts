/**
 * Unplan Design System — Color Tokens
 * Figma: Design System & Component 페이지 기준
 */

export const colors = {
  // ─── Brand ─────────────────────────────────────────────
  primary: '#248DFE', // Main
  secondary: '#F15E5E', // Sub

  // ─── Condition (태그 dot 색상) ───────────────────────────
  condition: {
    brain: '#F89F3A', // 두뇌 활동
    labor: '#47B399', // 단순 노동
    daily: '#D288DD', // 일상 작업
    urgent: '#E56666', // 긴급 처리
    rest: '#6C5DA1', // 기력 회복
    core: '#4275DD', // 핵심 작업
  },

  // ─── Gradient ───────────────────────────────────────────
  gradient: {
    blue: '#4275DD',
    sky: '#4A9CDD',
    green: '#47B399',
    purple: '#D288DD',
    deepPurple: '#6C5DA1',
  },

  // ─── Grayscale ──────────────────────────────────────────
  gray: {
    white: '#FFFFFF',
    50: '#F9FAFB',
    200: '#D9DFE5',
    300: '#B9C1C9',
    400: '#99A1A9',
    500: '#777F88',
    600: '#565E66',
    700: '#363E46',
    800: '#1A2026',
    900: '#040506',
  },

  alpha: {
    white10: 'rgba(255,255,255,0.1)',
    white20: 'rgba(255,255,255,0.2)',
    white50: 'rgba(255,255,255,0.5)',
    white70: 'rgba(255,255,255,0.7)',
    white80: 'rgba(255,255,255,0.8)',
    white88: 'rgba(255,255,255,0.88)',
    black05: 'rgba(0,0,0,0.05)',
    black12: 'rgba(0,0,0,0.12)',
    black35: 'rgba(0,0,0,0.35)',
    primary20: 'rgba(36,141,254,0.2)',
    gray70050: 'rgba(54,62,70,0.5)',
  },

  shadow: {
    blueGray: 'rgb(60,94,103)',
  },

  // ─── Semantic ───────────────────────────────────────────
  background: '#FFFFFF',
  appIconBackground: '#EAF4FF',
  surface: '#F9FAFB',
  onboardingBackground: '#F9FAFB',
  border: '#D9DFE5',

  text: {
    primary: '#1A2026', // gray.800
    secondary: '#777F88', // gray.500
    tertiary: '#B9C1C9', // gray.300
    disabled: '#D9DFE5', // gray.200
    inverse: '#FFFFFF',
  },
} as const;

export type Colors = typeof colors;
