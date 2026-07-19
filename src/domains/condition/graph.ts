/**
 * 컨디션 blob 그래프의 좌표/경로 계산 순수 로직입니다.
 * React/JSX/StyleSheet 없이 값(0~100) → 축 통과 지점 → SVG path 문자열만 다룹니다.
 *
 * Body/Mind/Sleep 값은 "점"으로 표시하지 않고, 각 축 위의 통과 지점(anchor)을
 * 결정하는 데만 사용합니다. 최종 곡선은 이 anchor들을 지나며 x축과 y축을 통과합니다.
 */

export interface GraphPoint {
  x: number;
  y: number;
}

export interface ConditionGraphValues {
  body: number;
  mind: number;
  sleep: number;
}

export interface ConditionAxisAnchors {
  /** y축 위쪽(Body) 통과 지점 */
  body: GraphPoint;
  /** y축 아래쪽(Mind) 통과 지점 */
  mind: GraphPoint;
  /** x축 오른쪽(Sleep) 통과 지점 */
  sleep: GraphPoint;
  /** 닫힌 곡선과 x축 왼쪽 통과를 보장하는 control anchor. 데이터 점이 아닙니다. */
  left: GraphPoint;
}

/**
 * 그래프 좌표계(Figma 3474:34787 기준, 305×230).
 * 원점(축 교차점)을 프레임 중앙보다 왼쪽에 둬 blob이 오른쪽(1·4사분면)에 집중되게 합니다.
 */
export const CONDITION_GRAPH_GEOMETRY = {
  width: 305,
  height: 230,
  origin: { x: 68, y: 108 },
  /** 각 축의 100% 값에 대응하는 최대 길이(px). */
  axisLength: {
    body: 82, // 위(y축 위쪽)
    mind: 96, // 아래(y축 아래쪽)
    sleep: 192, // 오른쪽(x축 오른쪽)
  },
  /** 왼쪽 control anchor의 최대 길이. sleep보다 작게 제한해 오른쪽 집중을 유지합니다. */
  leftControlMax: 60,
  /** 값이 0이어도 shape가 사라지지 않도록 하는 최소 반경. */
  minRadius: 12,
} as const;

/** 값을 0~100 범위로 정규화합니다. NaN/Infinity는 0으로 처리합니다. */
export function clampGraphValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

/** Body/Mind/Sleep 값을 각 축 위의 통과 지점으로 변환합니다. */
export function toConditionAxisAnchors(values: ConditionGraphValues): ConditionAxisAnchors {
  const { origin, axisLength, leftControlMax, minRadius } = CONDITION_GRAPH_GEOMETRY;
  const bodyRadius = toAxisRadius(values.body, axisLength.body, minRadius);
  const mindRadius = toAxisRadius(values.mind, axisLength.mind, minRadius);
  const sleepRadius = toAxisRadius(values.sleep, axisLength.sleep, minRadius);
  const leftRadius = toLeftControlRadius(bodyRadius, mindRadius, leftControlMax, minRadius);

  return {
    body: { x: origin.x, y: origin.y - bodyRadius },
    mind: { x: origin.x, y: origin.y + mindRadius },
    sleep: { x: origin.x + sleepRadius, y: origin.y },
    left: { x: origin.x - leftRadius, y: origin.y },
  };
}

/**
 * anchor들을 닫힌 곡선으로 이어 x축·y축을 지나는 blob path를 만듭니다.
 * 순서는 시계 방향(Body 위 → Sleep 오른쪽 → Mind 아래 → left 왼쪽)입니다.
 */
export function toAxisCrossingBlobPath(anchors: ConditionAxisAnchors): string {
  return toClosedCatmullRomPath([anchors.body, anchors.sleep, anchors.mind, anchors.left]);
}

function toAxisRadius(value: number, axisLength: number, minRadius: number): number {
  return Math.max(minRadius, (clampGraphValue(value) / 100) * axisLength);
}

/**
 * 왼쪽 control anchor는 데이터가 아니라 body/mind 세로 반경의 평균에서 파생됩니다.
 * shape를 자연스럽게 닫으면서도 오른쪽(sleep)보다 작게 유지합니다.
 */
function toLeftControlRadius(
  bodyRadius: number,
  mindRadius: number,
  leftControlMax: number,
  minRadius: number,
): number {
  const derived = ((bodyRadius + mindRadius) / 2) * 0.6;

  return Math.max(minRadius, Math.min(leftControlMax, derived));
}

/** 닫힌 Catmull-Rom 스플라인을 3차 베지어 path로 변환합니다. */
function toClosedCatmullRomPath(points: GraphPoint[]): string {
  const count = points.length;
  const segments = points.map((point, index) => {
    const previous = points[(index - 1 + count) % count];
    const next = points[(index + 1) % count];
    const afterNext = points[(index + 2) % count];
    const control1 = {
      x: point.x + (next.x - previous.x) / 6,
      y: point.y + (next.y - previous.y) / 6,
    };
    const control2 = {
      x: next.x - (afterNext.x - point.x) / 6,
      y: next.y - (afterNext.y - point.y) / 6,
    };

    return `C ${round(control1.x)} ${round(control1.y)} ${round(control2.x)} ${round(control2.y)} ${round(next.x)} ${round(next.y)}`;
  });
  const [start] = points;

  return `M ${round(start.x)} ${round(start.y)} ${segments.join(' ')} Z`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
