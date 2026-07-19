import Svg, {
  Defs,
  Line,
  Path,
  Polyline,
  RadialGradient,
  Stop,
  Text as SvgText,
  TSpan,
  SvgXml,
} from 'react-native-svg';

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
  isEmpty?: boolean;
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
const EMPTY_MESSAGE_X = 24;
const EMPTY_MESSAGE_Y = 106;
const EMPTY_MESSAGE_LINE_HEIGHT = 22.4;
const ARROW_SIZE = 5;
const EMPTY_BLOB_X = -27;
const EMPTY_BLOB_Y = 9;
const EMPTY_BLOB_WIDTH = 268;
const EMPTY_BLOB_HEIGHT = 207;
const EMPTY_BLOB_SVG = `<svg width="268" height="207" viewBox="0 0 268 207" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_f_2124_164072)">
<path d="M56.1094 45.9374L36.9568 70.6173C23.2184 88.3205 22.7184 112.939 35.7266 131.185L55.8471 159.408C68.3997 177.015 90.7312 184.734 111.477 178.636L204.814 151.199C253.955 136.754 253.181 66.8779 203.732 53.5246L109.428 28.0584C89.6758 22.7246 68.6528 29.7741 56.1094 45.9374Z" fill="url(#paint0_radial_2124_164072)"/>
<path d="M56.1094 45.9374L36.9568 70.6173C23.2184 88.3205 22.7184 112.939 35.7266 131.185L55.8471 159.408C68.3997 177.015 90.7312 184.734 111.477 178.636L204.814 151.199C253.955 136.754 253.181 66.8779 203.732 53.5246L109.428 28.0584C89.6758 22.7246 68.6528 29.7741 56.1094 45.9374Z" fill="white" fill-opacity="0.5" style="mix-blend-mode:overlay"/>
<path d="M56.1094 45.9374L36.9568 70.6173C23.2184 88.3205 22.7184 112.939 35.7266 131.185L55.8471 159.408C68.3997 177.015 90.7312 184.734 111.477 178.636L204.814 151.199C253.955 136.754 253.181 66.8779 203.732 53.5246L109.428 28.0584C89.6758 22.7246 68.6528 29.7741 56.1094 45.9374Z" fill="url(#paint1_linear_2124_164072)" fill-opacity="0.2"/>
</g>
<defs>
<filter id="filter0_f_2124_164072" x="-0.00019456" y="-0.00019456" width="267.549" height="207" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="13.15" result="effect1_foregroundBlur_2124_164072"/></filter>
<radialGradient id="paint0_radial_2124_164072" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(96.1895 96.5457) rotate(77.1039) scale(81.6137 175.032)"><stop stop-color="#777F88" stop-opacity="0"/><stop offset="0.5" stop-color="#777F88" stop-opacity="0.3"/><stop offset="1" stop-color="#777F88"/></radialGradient>
<linearGradient id="paint1_linear_2124_164072" x1="74.8516" y1="74.0763" x2="133.774" y2="180.699" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#B9C1C9"/></linearGradient>
</defs>
</svg>`;

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
  isEmpty = false,
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
      {isEmpty ? (
        <>
          <SvgXml
            xml={EMPTY_BLOB_SVG}
            x={EMPTY_BLOB_X}
            y={EMPTY_BLOB_Y}
            width={EMPTY_BLOB_WIDTH}
            height={EMPTY_BLOB_HEIGHT}
          />
          <Polyline
            points={`${origin.x - ARROW_SIZE},${AXIS_TOP + ARROW_SIZE} ${origin.x},${AXIS_TOP} ${origin.x + ARROW_SIZE},${AXIS_TOP + ARROW_SIZE}`}
            fill="none"
            stroke={colors.gray[300]}
            strokeWidth={1}
          />
          <Polyline
            points={`${origin.x - ARROW_SIZE},${AXIS_BOTTOM - ARROW_SIZE} ${origin.x},${AXIS_BOTTOM} ${origin.x + ARROW_SIZE},${AXIS_BOTTOM - ARROW_SIZE}`}
            fill="none"
            stroke={colors.gray[300]}
            strokeWidth={1}
          />
          <Polyline
            points={`${AXIS_RIGHT - ARROW_SIZE},${origin.y - ARROW_SIZE} ${AXIS_RIGHT},${origin.y} ${AXIS_RIGHT - ARROW_SIZE},${origin.y + ARROW_SIZE}`}
            fill="none"
            stroke={colors.gray[300]}
            strokeWidth={1}
          />
        </>
      ) : null}

      {!isEmpty ? <Path d={blobPath} fill="url(#conditionBlob)" /> : null}

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
      {isEmpty ? (
        <SvgText
          x={EMPTY_MESSAGE_X}
          y={EMPTY_MESSAGE_Y}
          fill={colors.gray[900]}
          fontSize={LABEL_FONT_SIZE}
          fontFamily={fontFamilyWeight.light}
          letterSpacing={-0.28}
        >
          <TSpan x={EMPTY_MESSAGE_X} dy={0}>
            컨디션 분석을 위해
          </TSpan>
          <TSpan x={EMPTY_MESSAGE_X} dy={EMPTY_MESSAGE_LINE_HEIGHT}>
            에너지와 수면 데이터를 입력해주세요!
          </TSpan>
        </SvgText>
      ) : null}
    </Svg>
  );
}
