import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { type GNBItems, type GNBProps } from './gnb.types';
import { GNBAddButton } from './GNBAddButton';
import { GNBItem } from './GNBItem';

function createDefaultItems(): GNBItems {
  return [
    { label: t('navigation.home'), value: 'home', iconName: 'home' },
    { label: t('navigation.cardList'), value: 'list', iconName: 'list' },
    { label: t('navigation.condition'), value: 'condition', iconName: 'condition' },
    { label: t('navigation.setting'), value: 'setting', iconName: 'setting' },
  ];
}

// 알약(stadium) 모양: 반지름은 높이의 절반. (Figma border-radius 65 > 높이/2라 실제로는 완전 라운드 끝)
const GNB_HEIGHT = 66;
const GNB_RADIUS = GNB_HEIGHT / 2;
// backdrop-filter: blur(3.5px) 근사. expo-blur intensity(0~100)는 px과 1:1이 아니라 살짝 낮게 잡음.
const BLUR_INTENSITY = 16;

export function GNB({
  items,
  value = 'home',
  onChange,
  onAddPress,
  addAccessibilityLabel,
  style,
}: GNBProps) {
  const gnbItems = items ?? createDefaultItems();
  const [homeItem, listItem, conditionItem, settingItem] = gnbItems;
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) =>
      current.width === width && current.height === height ? current : { width, height },
    );
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {/* backdrop-filter: blur(3.5px) + background rgba(54,62,70,.5) + inset glow. 알약 모양으로 클립. */}
      <View style={styles.clip}>
        <BlurView
          intensity={BLUR_INTENSITY}
          tint="default"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.fill} />
        {size.width > 0 ? (
          <Svg style={StyleSheet.absoluteFill} width={size.width} height={size.height}>
            <Defs>
              {/* box-shadow inset(gray300) 근사: 중앙 투명 → 가장자리로 갈수록 밝아지는 안쪽 글로우. */}
              <RadialGradient id="gnbGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={colors.gray[300]} stopOpacity={0} />
                <Stop offset="0.62" stopColor={colors.gray[300]} stopOpacity={0} />
                <Stop offset="1" stopColor={colors.gray[300]} stopOpacity={0.55} />
              </RadialGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              rx={size.height / 2}
              ry={size.height / 2}
              fill="url(#gnbGlow)"
            />
          </Svg>
        ) : null}
      </View>

      {/* border: 1px solid #FFF */}
      <View pointerEvents="none" style={styles.border} />

      <View style={styles.content}>
        <View style={styles.items}>
          {[homeItem, listItem].map((item) => (
            <GNBItem
              key={item.value}
              item={item}
              selected={item.value === value}
              onPress={() => onChange?.(item.value)}
            />
          ))}
        </View>
        <GNBAddButton accessibilityLabel={addAccessibilityLabel} onPress={onAddPress} />
        <View style={styles.items}>
          {[conditionItem, settingItem].map((item) => (
            <GNBItem
              key={item.value}
              item={item}
              selected={item.value === value}
              onPress={() => onChange?.(item.value)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 354,
    height: GNB_HEIGHT,
    borderRadius: GNB_RADIUS,
    // 바 분리를 위한 은은한 바깥 그림자.
    shadowColor: colors.shadow.blueGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  clip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: GNB_RADIUS,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.alpha.gray70050,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: GNB_RADIUS,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
