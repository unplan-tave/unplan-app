import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect, type NumberProp } from 'react-native-svg';

import { colors } from '@/constants/theme';

import { type IconProps } from './icon.types';

const DEFAULT_STROKE_WIDTH = 1.8;

export function Icon({
  name,
  size = 20,
  color = colors.gray[700],
  disabled = false,
  style,
}: IconProps) {
  const iconColor = disabled ? colors.gray[300] : color;
  const width = name === 'toggle' ? size * 1.3 : size;

  return (
    <View style={[styles.container, { width, height: size }, style]}>
      <Svg width={width} height={size} viewBox={getViewBox(name)} fill="none">
        {renderIcon(name, iconColor)}
      </Svg>
    </View>
  );
}

function getViewBox(name: IconProps['name']) {
  if (name === 'toggle') {
    return '0 0 52 40';
  }

  return '0 0 24 24';
}

function renderIcon(name: IconProps['name'], color: string) {
  switch (name) {
    case 'plus':
      return <Plus color={color} />;
    case 'minus':
      return <Minus color={color} />;
    case 'search':
      return <Search color={color} />;
    case 'maximize':
      return <Maximize color={color} />;
    case 'arrowLeft':
      return <ArrowLeft color={color} />;
    case 'arrowRight':
      return <ArrowRight color={color} />;
    case 'arrowDown':
      return <ArrowDown color={color} />;
    case 'chevronDown':
      return <ChevronDown color={color} />;
    case 'bell':
      return <Bell color={color} />;
    case 'cancel':
      return <Cancel color={color} />;
    case 'done':
      return <Done color={color} />;
    case 'edit':
      return <Edit color={color} />;
    case 'sort':
      return <Sort color={color} />;
    case 'toggle':
      return <Toggle color={color} />;
    default:
      return null;
  }
}

function SvgLine({
  x1,
  y1,
  x2,
  y2,
  color,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: {
  x1: NumberProp;
  y1: NumberProp;
  x2: NumberProp;
  y2: NumberProp;
  color: string;
  strokeWidth?: NumberProp;
}) {
  return (
    <Line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
}

function Plus({ color }: { color: string }) {
  return (
    <>
      <SvgLine x1={12} y1={6} x2={12} y2={18} color={color} />
      <SvgLine x1={6} y1={12} x2={18} y2={12} color={color} />
    </>
  );
}

function Minus({ color }: { color: string }) {
  return <SvgLine x1={6} y1={12} x2={18} y2={12} color={color} />;
}

function Search({ color }: { color: string }) {
  return (
    <>
      <Circle cx={10.8} cy={10.8} r={6.4} stroke={color} strokeWidth={1.8} />
      <SvgLine x1={15.6} y1={15.6} x2={20} y2={20} color={color} />
    </>
  );
}

function Maximize({ color }: { color: string }) {
  return (
    <>
      <Polyline
        points="14.5 4 20 4 20 9.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="9.5 20 4 20 4 14.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function ArrowLeft({ color }: { color: string }) {
  return (
    <Polyline
      points="15 6 9 12 15 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function ArrowRight({ color }: { color: string }) {
  return (
    <Polyline
      points="9 6 15 12 9 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function ArrowDown({ color }: { color: string }) {
  return (
    <>
      <SvgLine x1={12} y1={5} x2={12} y2={17} color={color} />
      <Polyline
        points="7 12 12 17 17 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function ChevronDown({ color }: { color: string }) {
  return (
    <Polyline
      points="6.5 9 12 14.5 17.5 9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Bell({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7.4 10.1C7.4 7 9.4 4.8 12 4.8C14.6 4.8 16.6 7 16.6 10.1V13.2L18 16.5H6L7.4 13.2V10.1Z" />
      <Path d="M10.2 18C10.6 19 11.2 19.5 12 19.5C12.8 19.5 13.4 19 13.8 18" />
    </G>
  );
}

function Cancel({ color }: { color: string }) {
  return (
    <>
      <SvgLine x1={7} y1={7} x2={17} y2={17} color={color} />
      <SvgLine x1={17} y1={7} x2={7} y2={17} color={color} />
    </>
  );
}

function Done({ color }: { color: string }) {
  return (
    <Polyline
      points="5.5 12.4 9.7 16.5 18.5 7.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Edit({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 17.7L6.2 13.2L15.6 3.8C16.3 3.1 17.5 3.1 18.2 3.8L20.2 5.8C20.9 6.5 20.9 7.7 20.2 8.4L10.8 17.8L6.3 19L5 17.7Z" />
      <Path d="M14.2 5.2L18.8 9.8" />
    </G>
  );
}

function Sort({ color }: { color: string }) {
  return (
    <>
      <SvgLine x1={6} y1={7} x2={18} y2={7} color={color} />
      <SvgLine x1={8} y1={12} x2={16} y2={12} color={color} />
      <SvgLine x1={10} y1={17} x2={14} y2={17} color={color} />
    </>
  );
}

function Toggle({ color }: { color: string }) {
  return (
    <>
      <Rect x={1} y={1} width={50} height={38} rx={19} stroke={color} strokeWidth={1.8} />
      <Circle cx={20} cy={20} r={10} fill={color} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
