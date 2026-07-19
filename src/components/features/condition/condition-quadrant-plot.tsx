import { useState } from 'react';
import {
  type DimensionValue,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Defs, G, Line, Marker, Path, Rect } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

/** 정규화 좌표(-1~1). x는 오른쪽(+)이 높은 Mind, y는 위(+)가 높은 Body입니다. */
export interface QuadrantPoint {
  id: string;
  x: number;
  y: number;
  /** 같은 자리에 겹친 기록 수. 2 이상이면 배지로 표시합니다. */
  count?: number;
}

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
  /** 기록이 없을 때 중앙 원점 마커를 보여줍니다. */
  showOrigin?: boolean;
}

const VIEW = 100;
const CENTER = VIEW / 2;
const AXIS_EXTENT = 40;
const MARKER_SPAN = 44;
const GRID_DIVISIONS = 6;

const GRID_LINES = Array.from(
  { length: GRID_DIVISIONS - 1 },
  (_, index) => ((index + 1) * VIEW) / GRID_DIVISIONS,
);

/** Body(세로)·Mind(가로) 2축 사분면에 컨디션 기록을 찍는 플롯입니다. */
export function ConditionQuadrantPlot({
  points = [],
  value = null,
  activeMarkerId = null,
  onSelect,
  onMarkerPress,
  showOrigin = true,
}: ConditionQuadrantPlotProps) {
  const [size, setSize] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => setSize(event.nativeEvent.layout.width);

  const handleSelectPress = (event: GestureResponderEvent) => {
    if (onSelect == null || size === 0) return;

    const { locationX, locationY } = event.nativeEvent;
    const x = clampUnit((((locationX / size) * VIEW - CENTER) / MARKER_SPAN) * 1);
    const y = clampUnit(-(((locationY / size) * VIEW - CENTER) / MARKER_SPAN));
    onSelect(x, y);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${VIEW} ${VIEW}`}>
        <Defs>
          <Marker id="axisArrow" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto">
            <Path
              d="M0.5 0.5 L4.5 3 L0.5 5.5"
              fill="none"
              stroke={colors.gray[300]}
              strokeWidth={0.8}
            />
          </Marker>
        </Defs>

        <Rect
          x={4}
          y={4}
          width={VIEW - 8}
          height={VIEW - 8}
          rx={4}
          fill="none"
          stroke={colors.gray[200]}
          strokeWidth={0.6}
        />

        {GRID_LINES.map((offset) => (
          <G key={`grid-${offset}`}>
            <Line
              x1={offset}
              y1={4}
              x2={offset}
              y2={VIEW - 4}
              stroke={colors.gray[200]}
              strokeWidth={0.5}
              opacity={0.6}
            />
            <Line
              x1={4}
              y1={offset}
              x2={VIEW - 4}
              y2={offset}
              stroke={colors.gray[200]}
              strokeWidth={0.5}
              opacity={0.6}
            />
          </G>
        ))}

        <Line
          x1={CENTER}
          y1={CENTER - AXIS_EXTENT}
          x2={CENTER}
          y2={CENTER + AXIS_EXTENT}
          stroke={colors.gray[300]}
          strokeWidth={0.8}
          markerStart="url(#axisArrow)"
          markerEnd="url(#axisArrow)"
        />
        <Line
          x1={CENTER - AXIS_EXTENT}
          y1={CENTER}
          x2={CENTER + AXIS_EXTENT}
          y2={CENTER}
          stroke={colors.gray[300]}
          strokeWidth={0.8}
          markerStart="url(#axisArrow)"
          markerEnd="url(#axisArrow)"
        />
      </Svg>

      {onSelect ? (
        <Pressable
          accessibilityLabel="에너지 상태 선택"
          accessibilityRole="adjustable"
          style={StyleSheet.absoluteFill}
          onPress={handleSelectPress}
        />
      ) : null}

      <Typography
        variant="bodyM"
        color={colors.primary}
        pointerEvents="none"
        style={[styles.label, styles.top]}
      >
        Body
      </Typography>
      <Typography
        variant="bodyM"
        color={colors.secondary}
        pointerEvents="none"
        style={[styles.label, styles.bottom]}
      >
        Body
      </Typography>
      <Typography
        variant="bodyM"
        color={colors.secondary}
        pointerEvents="none"
        style={[styles.label, styles.left]}
      >
        Mind
      </Typography>
      <Typography
        variant="bodyM"
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
        const content = (
          <>
            {badge ? (
              <Typography variant="caption" align="center" color={colors.gray.white}>
                {point.count}
              </Typography>
            ) : null}
          </>
        );

        if (onMarkerPress) {
          return (
            <Pressable
              key={point.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              hitSlop={8}
              style={[
                styles.marker,
                badge && styles.markerBadge,
                active && styles.markerActive,
                positionStyle(point.x, point.y),
              ]}
              onPress={() => onMarkerPress(point)}
            >
              {content}
            </Pressable>
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

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

const MARKER_SIZE = 16;
const VALUE_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
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
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    marginLeft: -MARKER_SIZE / 2,
    marginTop: -MARKER_SIZE / 2,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  markerBadge: {
    width: MARKER_SIZE + 4,
    height: MARKER_SIZE + 4,
    marginLeft: -(MARKER_SIZE + 4) / 2,
    marginTop: -(MARKER_SIZE + 4) / 2,
  },
  markerActive: {
    borderWidth: 2,
    borderColor: colors.gray.white,
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
