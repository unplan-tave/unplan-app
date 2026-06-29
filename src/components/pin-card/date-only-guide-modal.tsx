import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

export function DateOnlyGuideModal({
  visible,
  onChangeToQueue,
  onOpenTime,
  onKeep,
}: {
  visible: boolean;
  onChangeToQueue: () => void;
  onOpenTime: () => void;
  onKeep: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeep}>
      <View style={styles.guideOverlay}>
        <View style={styles.guideCard}>
          <Typography variant="titleS" color={colors.gray[900]} align="center">
            시간 없이 저장할까요?
          </Typography>
          <Typography
            variant="bodyS"
            color={colors.gray[600]}
            align="center"
            style={styles.guideDescription}
          >
            날짜만 입력하면 핀카드 필수값이 아직 채워지지 않은 상태로 남아요
          </Typography>
          <View style={styles.guideActions}>
            <GuideAction label="큐카드로 바꾸기" onPress={onChangeToQueue} />
            <GuideAction label="시간 입력하기" primary onPress={onOpenTime} />
            <GuideAction label="이대로 저장하기" onPress={onKeep} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GuideAction({
  label,
  primary = false,
  onPress,
}: {
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.guideAction,
        primary && styles.guideActionPrimary,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Typography
        variant="bodyM"
        color={primary ? colors.gray.white : colors.gray[700]}
        align="center"
      >
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  guideOverlay: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    backgroundColor: colors.alpha.black12,
  },
  guideCard: {
    width: '100%',
    maxWidth: 260,
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.modal,
    backgroundColor: colors.gray.white,
  },
  guideDescription: {
    lineHeight: 20,
  },
  guideActions: {
    width: '100%',
    gap: spacing[2],
  },
  guideAction: {
    minHeight: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.gray[50],
  },
  guideActionPrimary: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
