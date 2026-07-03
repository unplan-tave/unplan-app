import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { getMockRecommendationLabel } from '@/state/card/queue';

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

export function RecommendTimeModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const recommendationLabel = getMockRecommendationLabel();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardBorder}>
          {BlurView != null ? (
            <BlurView intensity={18} tint="light" style={styles.card}>
              <ModalContent
                recommendationLabel={recommendationLabel}
                onClose={onClose}
                onConfirm={onConfirm}
              />
            </BlurView>
          ) : (
            <View style={[styles.card, styles.cardFallback]}>
              <ModalContent
                recommendationLabel={recommendationLabel}
                onClose={onClose}
                onConfirm={onConfirm}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ModalContent({
  recommendationLabel,
  onClose,
  onConfirm,
}: {
  recommendationLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={styles.content}>
      <Typography variant="titleS" color={colors.gray[900]} align="center">
        추천 시간
      </Typography>
      <Typography
        variant="bodyM"
        color={colors.gray[600]}
        align="center"
        style={styles.description}
      >
        {recommendationLabel}
      </Typography>
      <Typography variant="bodyS" color={colors.gray[400]} align="center">
        추천
      </Typography>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="추천 시간 닫기"
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.gray[600]} align="center">
            닫기
          </Typography>
        </Pressable>
        <Pressable
          accessibilityLabel="추천 시간 확인"
          accessibilityRole="button"
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={onConfirm}
        >
          <Typography variant="bodyM" color={colors.gray.white} align="center">
            확인
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    backgroundColor: colors.alpha.black50,
  },
  cardBorder: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.alpha.white70,
  },
  card: {
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  cardFallback: {
    backgroundColor: colors.gray.white,
  },
  content: {
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[6],
    backgroundColor: colors.alpha.white70,
  },
  description: {
    marginTop: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  secondaryButton: {
    flex: 1,
    minHeight: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.gray[50],
  },
  primaryButton: {
    flex: 1,
    minHeight: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
