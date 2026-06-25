import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type BottomSheetProps } from './bottomSheet.types';
import { BottomSheetHandle } from './BottomSheetHandle';

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
        <View style={[styles.sheet, contentStyle]}>
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
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.alpha.black12,
  },
  sheet: {
    width: '100%',
    maxWidth: 393,
    alignSelf: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 60,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
});
