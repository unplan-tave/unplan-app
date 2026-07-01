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
  variant = 'default',
  style,
}: IconProps) {
  const iconColor = disabled ? colors.gray[300] : color;
  const width = name === 'toggle' ? size * 1.3 : size;

  return (
    <View style={[styles.container, { width, height: size }, style]}>
      <Svg width={width} height={size} viewBox={getViewBox(name, variant)} fill="none">
        {renderIcon(name, iconColor, variant)}
      </Svg>
    </View>
  );
}

function getViewBox(name: IconProps['name'], variant: IconProps['variant']) {
  if (name === 'warning' && variant === 'badge') {
    return '0 0 96 96';
  }

  if (name === 'toggle') {
    return '0 0 52 40';
  }

  return '0 0 24 24';
}

function renderIcon(name: IconProps['name'], color: string, variant: IconProps['variant']) {
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
    case 'home':
      return <Home color={color} />;
    case 'list':
      return <List color={color} />;
    case 'condition':
      return <Condition color={color} />;
    case 'setting':
      return <Setting color={color} />;
    case 'warning':
      return variant === 'badge' ? <WarningBadge /> : <Warning color={color} />;
    case 'refresh':
      return <Refresh color={color} />;
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

function Home({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.8 10.8L12 4.8L19.2 10.8" />
      <Path d="M7.2 10.2V19.2H16.8V10.2" />
      <Path d="M10 19.2V14.3H14V19.2" />
    </G>
  );
}

function List({ color }: { color: string }) {
  return (
    <G fill={color}>
      <Rect x={5} y={5} width={6} height={6} rx={1.2} />
      <Rect x={13} y={5} width={6} height={6} rx={1.2} />
      <Rect x={5} y={13} width={6} height={6} rx={1.2} />
      <Rect x={13} y={13} width={6} height={6} rx={1.2} />
    </G>
  );
}

function Condition({ color }: { color: string }) {
  return (
    <G fill={color}>
      <Path d="M12 4.5C10 6.2 9 8.1 9 10.2C9 12.1 10.3 13.4 12 13.4C13.7 13.4 15 12.1 15 10.2C15 8.1 14 6.2 12 4.5Z" />
      <Path
        d="M6.4 11.1C5.2 12.2 4.6 13.4 4.6 14.7C4.6 16.2 5.7 17.3 7.1 17.3C8.5 17.3 9.6 16.2 9.6 14.7C9.6 13.4 8.5 12.1 6.4 11.1Z"
        opacity={0.75}
      />
      <Path
        d="M17.6 11.1C15.5 12.1 14.4 13.4 14.4 14.7C14.4 16.2 15.5 17.3 16.9 17.3C18.3 17.3 19.4 16.2 19.4 14.7C19.4 13.4 18.8 12.2 17.6 11.1Z"
        opacity={0.75}
      />
    </G>
  );
}

function Warning({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <SvgLine x1={12} y1={9} x2={12} y2={13} color={color} strokeWidth={1.8} />
      <Circle cx={12} cy={17} r={0.5} fill={color} stroke={color} strokeWidth={1} />
    </G>
  );
}

function WarningBadge() {
  return (
    <>
      <Circle cx={48} cy={48} r={36} fill={colors.secondary} />
      <Line
        x1={48}
        y1={29}
        x2={48}
        y2={49}
        stroke={colors.gray.white}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <Circle cx={48} cy={63} r={3.5} fill={colors.gray.white} />
    </>
  );
}

function Setting({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3.2} />
      <Path d="M12 4.4V6.1M12 17.9V19.6M4.4 12H6.1M17.9 12H19.6M6.6 6.6L7.8 7.8M16.2 16.2L17.4 17.4M17.4 6.6L16.2 7.8M7.8 16.2L6.6 17.4" />
    </G>
  );
}

function Refresh({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 12a8 8 0 1 0-2.3 5.6" />
      <Polyline points="20 4 20 12 12 12" />
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
