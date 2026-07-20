import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

import { type ModalProps } from './modal.types';

export function Modal({
  visible,
  children,
  onClose,
  contentStyle,
  overlayVariant = 'default',
  animationType = 'fade',
  transparent = true,
  ...props
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
      {...props}
    >
      <View style={[styles.overlay, overlayVariant === 'dimmed' && styles.overlayDimmed]}>
        <Pressable
          accessibilityLabel="모달 닫기"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.alpha.black12,
  },
  overlayDimmed: {
    backgroundColor: colors.alpha.black35,
  },
  content: {
    width: '100%',
    maxWidth: 337,
    gap: 16,
    paddingHorizontal: 25,
    paddingTop: 24,
    paddingBottom: 16,
    borderRadius: radius.modal,
    backgroundColor: colors.alpha.white50,
    shadowColor: colors.shadow.blueGray,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 78,
    elevation: 10,
  },
});
