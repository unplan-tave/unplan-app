import { Pressable, StyleSheet, View } from 'react-native';

import { Modal } from '@/components/ui/Modal';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

interface SettingsConfirmModalProps {
  visible: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SettingsConfirmModal({
  visible,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: SettingsConfirmModalProps) {
  return (
    <Modal visible={visible} onClose={onCancel} contentStyle={styles.modal}>
      <Typography variant="titleS" color={colors.gray[900]} align="center" style={styles.title}>
        {title}
      </Typography>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          onPress={onConfirm}
        >
          <Typography variant="titleS" color={colors.gray[500]} align="center">
            {confirmLabel}
          </Typography>
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          onPress={onCancel}
        >
          <Typography variant="titleS" color={colors.gray[500]} align="center">
            {cancelLabel}
          </Typography>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    maxWidth: 337,
    gap: spacing[6],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    borderRadius: radius.modal,
    backgroundColor: colors.gray.white,
  },
  title: {
    opacity: 0.7,
  },
  actions: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    borderRadius: radius.sm,
    backgroundColor: colors.gray[200],
  },
  action: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 19,
    backgroundColor: colors.gray[300],
  },
  pressed: {
    opacity: 0.72,
  },
});
