import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

const TOAST_MAX_WIDTH = 353;
const TOAST_ICON_SIZE = spacing[6];
const TOAST_CONTENT_GAP = 10;
const GNB_HEIGHT = 66;
const TOAST_GNB_GAP = spacing[3];

export function CardToast({
  message,
  bottomOffset,
  variant = 'warning',
  onClose,
  onConfirm,
}: {
  message: string;
  bottomOffset?: number;
  variant?: 'warning' | 'confirm';
  onClose: () => void;
  onConfirm?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const resolvedBottomOffset =
    bottomOffset ?? insets.bottom + GNB_HEIGHT + spacing[2] + TOAST_GNB_GAP;

  return (
    <View style={[styles.toastPositioner, { bottom: resolvedBottomOffset }]}>
      <View style={styles.toast}>
        <View style={styles.toastContent}>
          {variant === 'warning' ? (
            <Icon name="warning" size={TOAST_ICON_SIZE} variant="badge" />
          ) : null}
          <Typography
            variant="bodyM"
            color={colors.gray.white}
            numberOfLines={2}
            style={styles.toastText}
          >
            {message}
          </Typography>
        </View>
        {variant === 'confirm' ? (
          <Pressable
            accessibilityLabel="알림 확인"
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.toastConfirm, pressed && styles.pressed]}
            onPress={onConfirm ?? onClose}
          >
            <Typography variant="bodyM" color={colors.gray.white}>
              확인
            </Typography>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="알림 닫기"
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.toastClose, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Icon name="cancel" size={TOAST_ICON_SIZE} color={colors.gray.white} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastPositioner: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
  },
  toast: {
    width: '100%',
    maxWidth: TOAST_MAX_WIDTH,
    minHeight: spacing[12],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.gray[600],
  },
  toastContent: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOAST_CONTENT_GAP,
  },
  toastText: {
    minWidth: 0,
    flex: 1,
  },
  toastClose: {
    width: TOAST_ICON_SIZE,
    height: TOAST_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastConfirm: {
    minWidth: spacing[10],
    minHeight: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  pressed: {
    opacity: 0.72,
  },
});
