export interface QuadrantPoint {
  id: string;
  x: number;
  y: number;
  count?: number;
}

export const CONDITION_QUADRANT = {
  view: 100,
  gridInset: 5.94,
  gridSize: 88.32,
  gridDivisions: 6,
  markerSize: 20,
  valueSize: 22,
} as const;

/** 클릭·마커·격자 축이 동일한 좌표계를 사용하도록 격자의 실제 중앙과 반폭을 계산합니다. */
const GRID_CENTER = CONDITION_QUADRANT.gridInset + CONDITION_QUADRANT.gridSize / 2;
const MARKER_SPAN = CONDITION_QUADRANT.gridSize / 2;
const SCORE_INTERVAL = 2 / CONDITION_QUADRANT.gridDivisions;

export const CONDITION_QUADRANT_GRID_LINES = Array.from(
  { length: CONDITION_QUADRANT.gridDivisions - 1 },
  (_, index) =>
    CONDITION_QUADRANT.gridInset +
    ((index + 1) * CONDITION_QUADRANT.gridSize) / CONDITION_QUADRANT.gridDivisions,
);

export function toConditionQuadrantPosition(
  x: number,
  y: number,
): {
  left: `${number}%`;
  top: `${number}%`;
} {
  const snappedX = snapConditionQuadrantValue(x);
  const snappedY = snapConditionQuadrantValue(y);

  return {
    left: `${GRID_CENTER + snappedX * MARKER_SPAN}%`,
    top: `${GRID_CENTER - snappedY * MARKER_SPAN}%`,
  };
}

/** Body/Mind의 0~6 점수에 대응하는 7개 격자 교차점으로 좌표를 고정합니다. */
export function snapConditionQuadrantValue(value: number): number {
  const clamped = Math.max(-1, Math.min(1, value));

  return Math.round((clamped + 1) / SCORE_INTERVAL) * SCORE_INTERVAL - 1;
}

export function toConditionHistoryListPosition(x: number, y: number) {
  return {
    ...(x <= 0
      ? { left: CONDITION_QUADRANT.markerSize / 2 }
      : { right: CONDITION_QUADRANT.markerSize / 2 }),
    ...(y >= 0
      ? { top: CONDITION_QUADRANT.markerSize / 2 }
      : { bottom: CONDITION_QUADRANT.markerSize / 2 }),
  };
}

export function toConditionQuadrantValue(location: number, size: number): number {
  return Math.max(
    -1,
    Math.min(1, ((location / size) * CONDITION_QUADRANT.view - GRID_CENTER) / MARKER_SPAN),
  );
}
