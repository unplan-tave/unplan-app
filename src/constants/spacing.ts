/**
 * Unplan Design System — Spacing Tokens
 * 4pt 그리드 기반 스케일
 */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  xs: 3, // Tag
  sm: 5, // Card 내부
  md: 10, // Card
  lg: 16,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
