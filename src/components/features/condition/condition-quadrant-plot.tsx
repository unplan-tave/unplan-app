import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, G, Line, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import {
  CONDITION_QUADRANT,
  CONDITION_QUADRANT_GRID_LINES,
  toConditionHistoryListPosition,
  toConditionQuadrantPosition,
  type QuadrantPoint,
} from '@/domains/condition/quadrant';
import { useConditionQuadrantInteraction } from '@/hooks/use-condition-quadrant-interaction';

export type { QuadrantPoint } from '@/domains/condition/quadrant';

export interface ConditionHistoryListItem {
  id: number;
  label: string;
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
  /** 활성 단일 마커 아래에 표시할 기록 시각입니다. */
  activeMarkerTime?: string | null;
  /** 겹친 활성 마커 옆에 표시할 오름차순 기록 목록입니다. */
  activeMarkerRecords?: ConditionHistoryListItem[];
  /** 겹친 마커의 기록 목록에서 항목을 눌렀을 때 호출합니다. */
  onHistoryRecordPress?: (recordId: number) => void;
  /** 겹친 마커의 기록 목록에서 선택된 기록 id입니다. */
  selectedHistoryRecordId?: number | null;
  /** 마커·목록 밖을 눌렀을 때 선택을 해제합니다. */
  onBackgroundPress?: () => void;
  /** 기록이 없을 때 중앙 원점 마커를 보여줍니다. */
  showOrigin?: boolean;
}

const VIEW = CONDITION_QUADRANT.view;
const GRID_INSET = CONDITION_QUADRANT.gridInset;
const GRID_SIZE = CONDITION_QUADRANT.gridSize;
const GRID_CENTER = GRID_INSET + GRID_SIZE / 2;

/** Body(세로)·Mind(가로) 2축 사분면에 컨디션 기록을 찍는 플롯입니다. */
export function ConditionQuadrantPlot({
  points = [],
  value = null,
  activeMarkerId = null,
  onSelect,
  onMarkerPress,
  activeMarkerTime = null,
  activeMarkerRecords = [],
  onHistoryRecordPress,
  selectedHistoryRecordId = null,
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

        {CONDITION_QUADRANT_GRID_LINES.map((offset) => (
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

        <Line
          x1={GRID_INSET}
          y1={GRID_CENTER}
          x2={GRID_INSET + GRID_SIZE}
          y2={GRID_CENTER}
          stroke={colors.gray[400]}
          strokeWidth={0.8}
        />
        <Line
          x1={GRID_CENTER}
          y1={GRID_INSET}
          x2={GRID_CENTER}
          y2={GRID_INSET + GRID_SIZE}
          stroke={colors.gray[400]}
          strokeWidth={0.8}
        />
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
        <View style={[styles.dot, toConditionQuadrantPosition(0, 0)]} pointerEvents="none" />
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
            <View
              key={point.id}
              style={[styles.markerAnchor, toConditionQuadrantPosition(point.x, point.y)]}
            >
              <Pressable
                accessibilityLabel="Body Mind 기록"
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                hitSlop={8}
                style={[
                  styles.marker,
                  styles.markerInAnchor,
                  badge && styles.markerBadgeInAnchor,
                  active && styles.markerActive,
                ]}
                onPress={() => onMarkerPress(point)}
              >
                {content}
              </Pressable>
              {active && !badge && activeMarkerTime != null ? (
                <Typography
                  variant="caption"
                  align="center"
                  color={colors.secondary}
                  style={styles.markerTime}
                >
                  {activeMarkerTime}
                </Typography>
              ) : null}
              {active && badge && activeMarkerRecords.length > 0 ? (
                <View
                  style={[styles.historyList, toConditionHistoryListPosition(point.x, point.y)]}
                >
                  {activeMarkerRecords.map((record, index) => (
                    <View key={record.id}>
                      {index > 0 ? <View style={styles.historyDivider} /> : null}
                      <Pressable
                        accessibilityLabel={`${record.label} 기록 선택`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: selectedHistoryRecordId === record.id }}
                        hitSlop={spacing[1]}
                        style={[
                          styles.historyRecord,
                          selectedHistoryRecordId === record.id && styles.historyRecordSelected,
                        ]}
                        onPress={() => onHistoryRecordPress?.(record.id)}
                      >
                        <Typography
                          variant="caption"
                          align="center"
                          color={colors.gray[700]}
                          numberOfLines={1}
                        >
                          {record.label}
                        </Typography>
                      </Pressable>
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
            style={[
              styles.marker,
              badge && styles.markerBadge,
              toConditionQuadrantPosition(point.x, point.y),
            ]}
          >
            {content}
          </View>
        );
      })}

      {value != null ? (
        <View
          style={[styles.valueDot, toConditionQuadrantPosition(value.x, value.y)]}
          pointerEvents="none"
        />
      ) : null}
    </View>
  );
}

const MARKER_SIZE = CONDITION_QUADRANT.markerSize;
const VALUE_SIZE = CONDITION_QUADRANT.valueSize;

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
  markerInAnchor: {
    marginLeft: spacing[0],
    marginTop: spacing[0],
  },
  markerBadgeInAnchor: {
    marginLeft: -spacing.px,
    marginTop: -spacing.px,
  },
  markerAnchor: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -MARKER_SIZE / 2,
    marginTop: -MARKER_SIZE / 2,
  },
  markerTime: {
    position: 'absolute',
    top: MARKER_SIZE,
    width: spacing[15],
    marginLeft: -spacing[5],
  },
  historyList: {
    position: 'absolute',
    zIndex: 1,
    width: spacing[16],
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
  historyRecord: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing[1],
    paddingVertical: spacing.px,
    borderRadius: radius.sm,
  },
  historyRecordSelected: {
    backgroundColor: colors.gray.white,
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
