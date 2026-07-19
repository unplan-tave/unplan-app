import { type DimensionValue, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { useConditionQuadrantInteraction } from '@/hooks/use-condition-quadrant-interaction';

import type { QuadrantPoint } from '@/domains/condition/quadrant';

export type { QuadrantPoint } from '@/domains/condition/quadrant';

interface ConditionQuadrantPlotProps {
  points?: QuadrantPoint[];
  /** 입력 모드에서 선택한 점입니다. */
  value?: { x: number; y: number } | null;
  /** 활성화(선택)된 마커 id입니다. */
  activeMarkerId?: string | null;
  /** 입력 모드: 사분면을 눌러 점을 찍습니다. (정규화 좌표를 그대로 넘김) */
  onSelect?: (x: number, y: number) => void;
  /** 조회 모드: 마커를 눌렀을 때 호출됩니다. */
  onMarkerPress?: (point: QuadrantPoint) => void;
  /** 활성 단일 마커 아래에 표시할 기록 시각입니다. */
  activeMarkerTime?: string | null;
  /** 겹친 활성 마커 옆에 표시할 오름차순 기록 시각입니다. */
  activeMarkerTimes?: string[];
  /** 마커·목록 밖을 눌렀을 때 선택을 해제합니다. */
  onBackgroundPress?: () => void;
  /** 기록이 없을 때 중앙 원점 마커를 보여줍니다. */
  showOrigin?: boolean;
}

const VIEW = 100;
const CENTER = VIEW / 2;
const GRID_INSET = 5.94;
const GRID_SIZE = 88.32;
const MARKER_SPAN = GRID_SIZE / 2;
const GRID_DIVISIONS = 6;
const FIGMA_TO_VIEW_SCALE = VIEW / 313.515;
const HORIZONTAL_AXIS = {
  x: 68.2575,
  y: 153.078,
  path: 'M0.146447 3.32843C-0.0488155 3.52369 -0.0488155 3.84027 0.146447 4.03553L3.32843 7.21751C3.52369 7.41278 3.84027 7.41278 4.03553 7.21751C4.2308 7.02225 4.2308 6.70567 4.03553 6.51041L1.20711 3.68198L4.03553 0.853554C4.2308 0.658291 4.2308 0.341709 4.03553 0.146447C3.84027 -0.0488155 3.52369 -0.0488155 3.32843 0.146447L0.146447 3.32843ZM177.857 4.03553C178.053 3.84027 178.053 3.52369 177.857 3.32843L174.675 0.146447C174.48 -0.0488155 174.164 -0.0488155 173.968 0.146447C173.773 0.341709 173.773 0.658291 173.968 0.853554L176.797 3.68198L173.968 6.51041C173.773 6.70567 173.773 7.02225 173.968 7.21751C174.164 7.41278 174.48 7.41278 174.675 7.21751L177.857 4.03553ZM0.5 3.68198V4.18198H177.504V3.68198V3.18198H0.5V3.68198Z',
} as const;
const VERTICAL_AXIS = {
  x: 157.9325,
  y: 56.59,
  path: 'M0.146447 3.32843C-0.0488155 3.52369 -0.0488155 3.84027 0.146447 4.03553L3.32843 7.21751C3.52369 7.41278 3.84027 7.41278 4.03553 7.21751C4.2308 7.02225 4.2308 6.70567 4.03553 6.51041L1.20711 3.68198L4.03553 0.853554C4.2308 0.658291 4.2308 0.341709 4.03553 0.146447C3.84027 -0.0488155 3.52369 -0.0488155 3.32843 0.146447L0.146447 3.32843ZM201.91 4.03553C202.105 3.84027 202.105 3.52369 201.91 3.32843L198.728 0.146447C198.533 -0.0488155 198.216 -0.0488155 198.021 0.146447C197.826 0.341709 197.826 0.658291 198.021 0.853554L200.85 3.68198L198.021 6.51041C197.826 6.70567 197.826 7.02225 198.021 7.21751C198.216 7.41278 198.533 7.41278 198.728 7.21751L201.91 4.03553ZM0.5 3.68198V4.18198H201.557V3.68198V3.18198H0.5V3.68198Z',
} as const;

const GRID_LINES = Array.from(
  { length: GRID_DIVISIONS - 1 },
  (_, index) => GRID_INSET + ((index + 1) * GRID_SIZE) / GRID_DIVISIONS,
);

/** Body(세로)·Mind(가로) 2축 사분면에 컨디션 기록을 찍는 플롯입니다. */
export function ConditionQuadrantPlot({
  points = [],
  value = null,
  activeMarkerId = null,
  onSelect,
  onMarkerPress,
  activeMarkerTime = null,
  activeMarkerTimes = [],
  onBackgroundPress,
  showOrigin = true,
}: ConditionQuadrantPlotProps) {
  const interaction = useConditionQuadrantInteraction(onSelect);

  return (
    <View style={styles.container} onLayout={interaction.onLayout}>
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${VIEW} ${VIEW}`}>
        <Defs>
          <RadialGradient id="conditionQuadrantBackground" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.conditionGraph.center} stopOpacity={0.8} />
            <Stop offset="0.125" stopColor={colors.conditionGraph.inner} stopOpacity={0.825} />
            <Stop offset="0.25" stopColor={colors.conditionGraph.middle} stopOpacity={0.85} />
            <Stop offset="0.5" stopColor={colors.conditionGraph.outer} stopOpacity={0.9} />
            <Stop offset="0.75" stopColor={colors.conditionGraph.edge} stopOpacity={0.95} />
            <Stop offset="1" stopColor={colors.gray.white} stopOpacity={1} />
          </RadialGradient>
        </Defs>

        <Rect
          x={0}
          y={0}
          width={VIEW}
          height={VIEW}
          rx={5.1}
          fill="url(#conditionQuadrantBackground)"
          opacity={0.5}
        />
        <Rect
          x={0}
          y={0}
          width={VIEW}
          height={VIEW}
          rx={5.1}
          fill="none"
          stroke={colors.gray.white}
          strokeWidth={0.6}
        />
        <Rect
          x={GRID_INSET}
          y={GRID_INSET}
          width={GRID_SIZE}
          height={GRID_SIZE}
          fill="none"
          stroke={colors.gray[300]}
          strokeWidth={0.6}
        />

        {GRID_LINES.map((offset) => (
          <G key={`grid-${offset}`}>
            <Line
              x1={offset}
              y1={GRID_INSET}
              x2={offset}
              y2={GRID_INSET + GRID_SIZE}
              stroke={colors.gray[300]}
              strokeWidth={0.5}
              opacity={0.2}
            />
            <Line
              x1={GRID_INSET}
              y1={offset}
              x2={GRID_INSET + GRID_SIZE}
              y2={offset}
              stroke={colors.gray[300]}
              strokeWidth={0.5}
              opacity={0.2}
            />
          </G>
        ))}

        <Path
          d={HORIZONTAL_AXIS.path}
          fill={colors.gray[400]}
          transform={`translate(${HORIZONTAL_AXIS.x * FIGMA_TO_VIEW_SCALE} ${
            HORIZONTAL_AXIS.y * FIGMA_TO_VIEW_SCALE
          }) scale(${FIGMA_TO_VIEW_SCALE})`}
        />
        <G
          transform={`translate(${VERTICAL_AXIS.x * FIGMA_TO_VIEW_SCALE} ${
            VERTICAL_AXIS.y * FIGMA_TO_VIEW_SCALE
          }) rotate(90) scale(${FIGMA_TO_VIEW_SCALE})`}
        >
          <Path d={VERTICAL_AXIS.path} fill={colors.gray[400]} />
        </G>
      </Svg>

      {onSelect ? (
        <Pressable
          accessibilityLabel="에너지 상태 선택"
          accessibilityRole="adjustable"
          style={StyleSheet.absoluteFill}
          onPress={interaction.onPress}
        />
      ) : null}
      {onSelect == null && onBackgroundPress != null ? (
        <Pressable
          accessibilityLabel="선택한 컨디션 기록 닫기"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onBackgroundPress}
        />
      ) : null}

      <Typography
        variant="bodyS"
        color={colors.primary}
        pointerEvents="none"
        style={[styles.label, styles.top]}
      >
        Body
      </Typography>
      <Typography
        variant="bodyS"
        color={colors.secondary}
        pointerEvents="none"
        style={[styles.label, styles.bottom]}
      >
        Body
      </Typography>
      <Typography
        variant="bodyS"
        color={colors.secondary}
        pointerEvents="none"
        style={[styles.label, styles.left]}
      >
        Mind
      </Typography>
      <Typography
        variant="bodyS"
        color={colors.primary}
        pointerEvents="none"
        style={[styles.label, styles.right]}
      >
        Mind
      </Typography>

      {showOrigin && value == null && points.length === 0 ? (
        <View style={[styles.dot, positionStyle(0, 0)]} pointerEvents="none" />
      ) : null}

      {points.map((point) => {
        const badge = point.count != null && point.count >= 2;
        const active = point.id === activeMarkerId;
        const content = badge ? (
          <Typography variant="caption" align="center" color={colors.gray.white}>
            {point.count}
          </Typography>
        ) : null;

        if (onMarkerPress) {
          return (
            <View key={point.id} style={[styles.markerAnchor, positionStyle(point.x, point.y)]}>
              <Pressable
                accessibilityLabel="Body Mind 기록"
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                hitSlop={8}
                style={[styles.marker, badge && styles.markerBadge, active && styles.markerActive]}
                onPress={() => onMarkerPress(point)}
              >
                {content}
              </Pressable>
              {active && !badge && activeMarkerTime != null ? (
                <Typography variant="caption" align="center" color={colors.secondary}>
                  {activeMarkerTime}
                </Typography>
              ) : null}
              {active && badge && activeMarkerTimes.length > 0 ? (
                <View style={[styles.historyList, historyListPosition(point.x, point.y)]}>
                  {activeMarkerTimes.map((time, index) => (
                    <View key={`${time}-${index}`}>
                      {index > 0 ? <View style={styles.historyDivider} /> : null}
                      <Typography variant="caption" align="center" color={colors.gray[700]}>
                        {time}
                      </Typography>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        }

        return (
          <View
            key={point.id}
            pointerEvents="none"
            style={[styles.marker, badge && styles.markerBadge, positionStyle(point.x, point.y)]}
          >
            {content}
          </View>
        );
      })}

      {value != null ? (
        <View style={[styles.valueDot, positionStyle(value.x, value.y)]} pointerEvents="none" />
      ) : null}
    </View>
  );
}

function positionStyle(x: number, y: number): { left: DimensionValue; top: DimensionValue } {
  return {
    left: `${CENTER + x * MARKER_SPAN}%`,
    top: `${CENTER - y * MARKER_SPAN}%`,
  };
}

function historyListPosition(
  x: number,
  y: number,
): {
  left?: DimensionValue;
  right?: DimensionValue;
  top?: DimensionValue;
  bottom?: DimensionValue;
} {
  return {
    ...(x <= 0 ? { left: MARKER_SIZE / 2 } : { right: MARKER_SIZE / 2 }),
    ...(y >= 0 ? { top: MARKER_SIZE / 2 } : { bottom: MARKER_SIZE / 2 }),
  };
}

const MARKER_SIZE = 20;
const VALUE_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray.white,
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
  },
  top: {
    top: '8%',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  bottom: {
    bottom: '8%',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  left: {
    left: '6%',
    top: '46%',
  },
  right: {
    right: '6%',
    top: '46%',
  },
  dot: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    marginLeft: -MARKER_SIZE / 2,
    marginTop: -MARKER_SIZE / 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    marginLeft: -MARKER_SIZE / 2,
    marginTop: -MARKER_SIZE / 2,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[400],
  },
  markerBadge: {
    width: MARKER_SIZE + 4,
    height: MARKER_SIZE + 4,
    marginLeft: -(MARKER_SIZE + 4) / 2,
    marginTop: -(MARKER_SIZE + 4) / 2,
  },
  markerActive: {
    backgroundColor: colors.primary,
  },
  markerAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -MARKER_SIZE / 2,
    marginTop: -MARKER_SIZE / 2,
  },
  historyList: {
    position: 'absolute',
    zIndex: 1,
    minWidth: 60,
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white70,
  },
  historyDivider: {
    height: 1,
    marginVertical: spacing[1],
    backgroundColor: colors.gray[300],
  },
  valueDot: {
    position: 'absolute',
    width: VALUE_SIZE,
    height: VALUE_SIZE,
    marginLeft: -VALUE_SIZE / 2,
    marginTop: -VALUE_SIZE / 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
