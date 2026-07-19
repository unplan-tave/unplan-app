import Svg, { Defs, Line, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

import { colors, fontFamilyWeight } from '@/constants/theme';
import {
  CONDITION_GRAPH_GEOMETRY,
  toAxisCrossingBlobPath,
  toConditionAxisAnchors,
} from '@/domains/condition/graph';

interface ConditionBlobGraphProps {
  body: number;
  mind: number;
  sleep: number;
  labels?: {
    body: string;
    mind: string;
    sleep: string;
  };
  primaryColor: string;
  secondaryColor: string;
}

const DEFAULT_LABELS = { body: 'Body', mind: 'Mind', sleep: 'Sleep' };

const { width, height, origin, axisLength } = CONDITION_GRAPH_GEOMETRY;
const AXIS_TOP = origin.y - axisLength.body;
const AXIS_BOTTOM = origin.y + axisLength.mind;
const AXIS_RIGHT = origin.x + axisLength.sleep;
/** 가로 축 왼쪽 끝(그래프 프레임 왼쪽 가장자리). */
const AXIS_LEFT = 4;
const LABEL_FONT_SIZE = 14;
const LABEL_OPACITY = 0.8;

/**
 * Body(y축 위) / Mind(y축 아래) / Sleep(x축 오른쪽) 값을 축 위의 통과 지점으로만 사용해
 * x축·y축을 지나는 부드러운 blob을 그립니다. point circle은 렌더링하지 않습니다.
 */
export function ConditionBlobGraph({
  body,
  mind,
  sleep,
  labels = DEFAULT_LABELS,
  primaryColor,
  secondaryColor,
}: ConditionBlobGraphProps) {
  const anchors = toConditionAxisAnchors({ body, mind, sleep });
  const blobPath = toAxisCrossingBlobPath(anchors);

  return (
    <Svg
      width="100%"
      height={height}
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${width} ${height}`}
    >
      <Defs>
        <RadialGradient id="conditionBlob" cx="33%" cy="45%">
          <Stop offset="0" stopColor={secondaryColor} stopOpacity={0.35} />
          <Stop offset="1" stopColor={primaryColor} stopOpacity={0.85} />
        </RadialGradient>
      </Defs>

      <Line
        x1={origin.x}
        y1={AXIS_TOP}
        x2={origin.x}
        y2={AXIS_BOTTOM}
        stroke={colors.gray[300]}
        strokeWidth={1}
      />
      <Line
        x1={AXIS_LEFT}
        y1={origin.y}
        x2={AXIS_RIGHT}
        y2={origin.y}
        stroke={colors.gray[300]}
        strokeWidth={1}
      />

      <Path d={blobPath} fill="url(#conditionBlob)" />

      <SvgText
        x={origin.x}
        y={AXIS_TOP - 6}
        fill={colors.gray[800]}
        opacity={LABEL_OPACITY}
        fontSize={LABEL_FONT_SIZE}
        fontFamily={fontFamilyWeight.light}
        textAnchor="middle"
      >
        {labels.body}
      </SvgText>
      <SvgText
        x={origin.x}
        y={AXIS_BOTTOM + 16}
        fill={colors.gray[800]}
        opacity={LABEL_OPACITY}
        fontSize={LABEL_FONT_SIZE}
        fontFamily={fontFamilyWeight.light}
        textAnchor="middle"
      >
        {labels.mind}
      </SvgText>
      <SvgText
        x={AXIS_RIGHT + 9}
        y={origin.y + 5}
        fill={colors.gray[800]}
        opacity={LABEL_OPACITY}
        fontSize={LABEL_FONT_SIZE}
        fontFamily={fontFamilyWeight.light}
        textAnchor="start"
      >
        {labels.sleep}
      </SvgText>
    </Svg>
  );
}
