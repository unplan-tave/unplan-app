import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { getConditionScoreTheme } from '@/domains/condition/score-theme';

import type { ConditionMetricCard } from '@/domains/condition/model';

interface ConditionGraphCardProps {
  metrics: [ConditionMetricCard, ConditionMetricCard, ConditionMetricCard];
  score: number;
}

const GRAPH_WIDTH = 305;
const GRAPH_HEIGHT = 230;
const CARD_HEIGHT = 260;
const CENTER_X = GRAPH_WIDTH / 2;
const CENTER_Y = GRAPH_HEIGHT / 2;
const AXIS_HALF_HEIGHT = 90;
const AXIS_HALF_WIDTH = 131;
/** 기록이 없어도(0%) 그래프 형태가 보이도록 하는 최소 반경. */
const MIN_RADIUS = 8;
const LABEL_OFFSET = 14;

/**
 * Body(위) / Mind(아래) / Sleep(오른쪽) 축 위에 컨디션 값을 얹은 방사형 그래프.
 * 세 지표의 비율에 따라 blob 모양이 달라집니다.
 */
export function ConditionGraphCard({ metrics, score }: ConditionGraphCardProps) {
  const scoreTheme = getConditionScoreTheme(score);
  const [body, mind, sleep] = metrics;
  const bodyPoint = { x: CENTER_X, y: CENTER_Y - toRadius(body.progress, AXIS_HALF_HEIGHT) };
  const sleepPoint = { x: CENTER_X + toRadius(sleep.progress, AXIS_HALF_WIDTH), y: CENTER_Y };
  const mindPoint = { x: CENTER_X, y: CENTER_Y + toRadius(mind.progress, AXIS_HALF_HEIGHT) };
  const leftPoint = {
    x: CENTER_X - toRadius((body.progress + mind.progress) / 2, AXIS_HALF_WIDTH),
    y: CENTER_Y,
  };

  return (
    <View style={styles.card}>
      <Svg
        width="100%"
        height={GRAPH_HEIGHT}
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      >
        <Defs>
          <RadialGradient id="conditionBlob" cx="33%" cy="45%">
            <Stop offset="0" stopColor={scoreTheme.secondary} stopOpacity={0.35} />
            <Stop offset="1" stopColor={scoreTheme.primary} stopOpacity={0.85} />
          </RadialGradient>
        </Defs>
        <Line
          x1={CENTER_X}
          y1={CENTER_Y - AXIS_HALF_HEIGHT}
          x2={CENTER_X}
          y2={CENTER_Y + AXIS_HALF_HEIGHT}
          stroke={colors.gray[300]}
          strokeWidth={1}
        />
        <Line
          x1={CENTER_X - AXIS_HALF_WIDTH}
          y1={CENTER_Y}
          x2={CENTER_X + AXIS_HALF_WIDTH}
          y2={CENTER_Y}
          stroke={colors.gray[300]}
          strokeWidth={1}
        />
        <Path
          d={toBlobPath([bodyPoint, sleepPoint, mindPoint, leftPoint])}
          fill="url(#conditionBlob)"
        />
      </Svg>
      <Typography variant="bodyS" color={colors.gray[600]} style={styles.bodyLabel}>
        {body.label}
      </Typography>
      <Typography variant="bodyS" color={colors.gray[600]} style={styles.mindLabel}>
        {mind.label}
      </Typography>
      <Typography variant="bodyS" color={colors.gray[600]} style={styles.sleepLabel}>
        {sleep.label}
      </Typography>
    </View>
  );
}

function toRadius(progress: number, axisLength: number) {
  return Math.max(MIN_RADIUS, (progress / 100) * axisLength);
}

interface Point {
  x: number;
  y: number;
}

/** 네 꼭짓점(Body·Sleep·Mind·왼쪽 보조점)을 Catmull-Rom 곡선으로 이어 닫힌 blob path를 만듭니다. */
function toBlobPath(points: [Point, Point, Point, Point]) {
  const segments = points.map((point, index) => {
    const previous = pointAt(points, index - 1);
    const next = pointAt(points, index + 1);
    const afterNext = pointAt(points, index + 2);
    const control1 = {
      x: point.x + (next.x - previous.x) / 6,
      y: point.y + (next.y - previous.y) / 6,
    };
    const control2 = {
      x: next.x - (afterNext.x - point.x) / 6,
      y: next.y - (afterNext.y - point.y) / 6,
    };

    return `C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${next.x} ${next.y}`;
  });
  const [start] = points;

  return `M ${start.x} ${start.y} ${segments.join(' ')} Z`;
}

function pointAt(points: [Point, Point, Point, Point], index: number): Point {
  const [first, second, third, fourth] = points;
  const wrapped = ((index % points.length) + points.length) % points.length;

  if (wrapped === 0) {
    return first;
  }

  if (wrapped === 1) {
    return second;
  }

  return wrapped === 2 ? third : fourth;
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
  bodyLabel: {
    position: 'absolute',
    top: LABEL_OFFSET,
    alignSelf: 'center',
    opacity: 0.8,
  },
  mindLabel: {
    position: 'absolute',
    bottom: LABEL_OFFSET,
    alignSelf: 'center',
    opacity: 0.8,
  },
  sleepLabel: {
    position: 'absolute',
    right: LABEL_OFFSET,
    opacity: 0.8,
  },
});
