import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';

import { type ModalActionsProps } from './modal.types';

export function ModalActions({
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmDisabled = false,
  onConfirm,
  onCancel,
  style,
}: ModalActionsProps) {
  return (
    <View style={[styles.container, style]}>
      <Button label={cancelLabel} fullWidth onPress={onCancel} />
      <Button
        label={confirmLabel}
        variant="primary"
        fullWidth
        disabled={confirmDisabled}
        onPress={onConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
});
