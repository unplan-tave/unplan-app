import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type BottomSheetProps } from './bottomSheet.types';
import { BottomSheetHandle } from './BottomSheetHandle';

// 뒤 콘텐츠가 살짝 비치도록 중간 강도. (native scale 1–100, Figma 4.5px보다 약간 강함)
const SHEET_BLUR_INTENSITY = 24;

let BlurView: React.ComponentType<{
  intensity: number;
  tint: string;
  style?: object;
  children?: React.ReactNode;
}> | null = null;

try {
  BlurView = require('expo-blur').BlurView;
} catch {
  BlurView = null;
}

export function BottomSheet({
  visible,
  title,
  description,
  children,
  onClose,
  contentStyle,
  animationType = 'slide',
  transparent = true,
  ...props
}: BottomSheetProps) {
  const innerStyle = styles.sheetInner;
  const contentAreaStyle = [styles.sheetContent, contentStyle];

  const sheetContent = (
    <>
      <BottomSheetHandle />
      {title ? (
        <Typography variant="titleS" color={colors.gray[800]} align="center">
          {title}
        </Typography>
      ) : null}
      {description ? (
        <Typography variant="bodyS" color={colors.gray[500]} align="center">
          {description}
        </Typography>
      ) : null}
      {children}
    </>
  );

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
      {...props}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="바텀시트 닫기"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        {/* Border wrapper: white stroke visible at rounded corners — NO overflow:hidden */}
        <View style={styles.sheetBorder}>
          <View style={innerStyle}>
            {BlurView != null ? (
              <BlurView
                intensity={SHEET_BLUR_INTENSITY}
                tint="extraLight"
                style={styles.sheetBlurLayer}
              />
            ) : null}
            <View
              pointerEvents="none"
              style={[styles.sheetGlassLayer, BlurView == null && styles.sheetFallback]}
            />
            <View style={contentAreaStyle}>{sheetContent}</View>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const SHEET_RADIUS = 36;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.alpha.black50,
  },
  // Outer wrapper: owns the white border. No overflow:hidden so corners render fully.
  sheetBorder: {
    width: '100%',
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  // Inner shell: clips blur/glass layers to the sheet radius.
  sheetInner: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  sheetBlurLayer: {
    ...StyleSheet.absoluteFill,
  },
  sheetGlassLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.alpha.white50,
  },
  sheetContent: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 60,
  },
  sheetFallback: {
    backgroundColor: colors.alpha.white50,
  },
});
