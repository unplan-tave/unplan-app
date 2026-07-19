export interface QuadrantPoint {
  id: string;
  x: number;
  y: number;
  count?: number;
}

export const CONDITION_QUADRANT = {
  view: 100,
  center: 50,
  gridInset: 5.94,
  gridSize: 88.32,
  markerSpan: 44.16,
  gridDivisions: 6,
  markerSize: 20,
  valueSize: 22,
} as const;

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
  return {
    left: `${CONDITION_QUADRANT.center + x * CONDITION_QUADRANT.markerSpan}%`,
    top: `${CONDITION_QUADRANT.center - y * CONDITION_QUADRANT.markerSpan}%`,
  };
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
    Math.min(
      1,
      ((location / size) * CONDITION_QUADRANT.view - CONDITION_QUADRANT.center) /
        CONDITION_QUADRANT.markerSpan,
    ),
  );
}
