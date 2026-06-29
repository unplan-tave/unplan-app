import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

export function PinCardRequiredToast({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.toast}>
      <View style={styles.toastContent}>
        <View style={styles.warningIcon}>
          <Typography
            variant="caption"
            color={colors.gray.white}
            align="center"
            style={styles.warningText}
          >
            !
          </Typography>
        </View>
        <Typography
          variant="bodyM"
          color={colors.gray.white}
          numberOfLines={1}
          style={styles.toastText}
        >
          아직 입력되지 않은 필수 정보가 있어요!
        </Typography>
      </View>
      <Pressable
        accessibilityLabel="필수 정보 안내 닫기"
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => [styles.toastClose, pressed && styles.pressed]}
        onPress={onClose}
      >
        <View style={styles.closeLineForward} />
        <View style={styles.closeLineBackward} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing[5],
    right: spacing[5],
    bottom: 70.5,
    zIndex: 5,
    minHeight: spacing[12],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.modal,
    backgroundColor: colors.gray[600],
  },
  toastContent: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  warningText: {
    lineHeight: 18,
  },
  toastText: {
    minWidth: 0,
    flex: 1,
  },
  toastClose: {
    width: spacing[6],
    height: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLineForward: {
    position: 'absolute',
    width: 14,
    height: 1,
    borderRadius: radius.full,
    backgroundColor: colors.gray[300],
    transform: [{ rotate: '45deg' }],
  },
  closeLineBackward: {
    position: 'absolute',
    width: 14,
    height: 1,
    borderRadius: radius.full,
    backgroundColor: colors.gray[300],
    transform: [{ rotate: '-45deg' }],
  },
  pressed: {
    opacity: 0.72,
  },
});
