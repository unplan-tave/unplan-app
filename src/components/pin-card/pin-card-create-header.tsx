import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

import type { CardTab } from '@/state/pin-card/model';

const HEADER_TOP_PADDING = spacing[16];
const HEADER_HEIGHT = spacing[6];

export function PinCardCreateHeader({
  variant = 'edit',
  cardType = 'pin',
  doneEnabled,
  deleteVisible = false,
  onClose,
  onDelete,
  onDone,
}: {
  variant?: 'edit' | 'view';
  cardType?: CardTab;
  doneEnabled: boolean;
  deleteVisible?: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onDone: () => void;
}) {
  const isView = variant === 'view';
  const viewTitle = cardType === 'queue' ? '큐 카드' : '핀 카드';

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={isView ? '뒤로 가기' : '카드 편집 취소'}
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
        onPress={onClose}
      >
        {isView ? (
          <Icon name="arrowLeft" size={24} color={colors.gray[800]} />
        ) : (
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        )}
      </Pressable>
      <Typography
        pointerEvents="none"
        variant="bodyM"
        color={colors.gray[600]}
        align="center"
        style={styles.headerTitle}
      >
        {isView ? viewTitle : '카드 편집'}
      </Typography>
      {!isView && deleteVisible ? (
        <Pressable
          accessibilityLabel="카드 삭제"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.deleteAction, pressed && styles.pressed]}
          onPress={onDelete}
        >
          <Typography variant="bodyS" color={colors.secondary}>
            삭제
          </Typography>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel={isView ? '카드 편집' : '카드 편집 완료'}
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
        onPress={onDone}
      >
        <Typography
          variant="bodyM"
          color={isView || doneEnabled ? colors.primary : colors.gray[400]}
        >
          {isView ? '편집' : '완료'}
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: HEADER_TOP_PADDING,
    left: 0,
    right: 0,
    zIndex: 2,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  headerAction: {
    zIndex: 2,
    minWidth: 33,
    minHeight: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  deleteAction: {
    position: 'absolute',
    right: 56,
    zIndex: 2,
    minHeight: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
