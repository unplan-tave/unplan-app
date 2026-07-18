/** 에너지(Body/Mind) 기록의 점수↔사분면 좌표 변환 순수 로직입니다. */

/** 서버 body/mind 원점수 범위입니다. 3이 중앙(원점)입니다. */
export const ENERGY_SCORE_MIN = 0;
export const ENERGY_SCORE_MAX = 6;
const ENERGY_SCORE_CENTER = 3;
const HALF_RANGE = ENERGY_SCORE_MAX - ENERGY_SCORE_CENTER;

/** 원점수(0~6)를 정규화 좌표(-1~1)로 바꿉니다. */
export function scoreToNormalized(score: number): number {
  return (clampScore(score) - ENERGY_SCORE_CENTER) / HALF_RANGE;
}

/** 정규화 좌표(-1~1)를 가장 가까운 원점수(0~6)로 스냅합니다. */
export function normalizedToScore(normalized: number): number {
  const clamped = Math.max(-1, Math.min(1, normalized));

  return clampScore(Math.round(clamped * HALF_RANGE + ENERGY_SCORE_CENTER));
}

/** percent(0~100)를 정규화 좌표(-1~1)로 바꿉니다. (50%가 중앙) */
export function percentToNormalized(percent: number): number {
  return (Math.max(0, Math.min(100, percent)) - 50) / 50;
}

/** 원점수(0~6)를 percent(0~100)로 바꿉니다. */
export function scoreToPercent(score: number): number {
  return Math.round((clampScore(score) / ENERGY_SCORE_MAX) * 100);
}

function clampScore(score: number): number {
  return Math.max(ENERGY_SCORE_MIN, Math.min(ENERGY_SCORE_MAX, Math.round(score)));
}
