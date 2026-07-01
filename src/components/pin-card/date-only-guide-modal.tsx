import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

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
      <View style={styles.overlay}>
        <View style={styles.cardBorder}>
          {BlurView != null ? (
            <BlurView intensity={18} tint="light" style={styles.card}>
              <ModalContent
                onChangeToQueue={onChangeToQueue}
                onOpenTime={onOpenTime}
                onKeep={onKeep}
              />
            </BlurView>
          ) : (
            <View style={[styles.card, styles.cardFallback]}>
              <ModalContent
                onChangeToQueue={onChangeToQueue}
                onOpenTime={onOpenTime}
                onKeep={onKeep}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ModalContent({
  onChangeToQueue,
  onOpenTime,
  onKeep,
}: {
  onChangeToQueue: () => void;
  onOpenTime: () => void;
  onKeep: () => void;
}) {
  return (
    <>
      <View style={styles.body}>
        <Icon name="warning" variant="badge" size={95.6} />
        <View style={styles.textGroup}>
          <Typography variant="titleS" color={colors.gray[900]} align="center">
            시간이 정해지지 않은 일정인가요?
          </Typography>
          <Typography variant="bodyS" color={colors.gray[900]} align="center">
            큐카드로 등록하면 빈 시간에 맞춰 일정을 추천해 드려요
          </Typography>
        </View>
      </View>
      <View style={styles.actions}>
        <ActionButton label="큐카드로 바꾸기" variant="primary" onPress={onChangeToQueue} />
        <ActionButton label="시간 입력하기" onPress={onOpenTime} />
        <ActionButton label="이대로 저장하기" onPress={onKeep} />
      </View>
    </>
  );
}

function ActionButton({
  label,
  variant = 'secondary',
  onPress,
}: {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {variant === 'primary' ? <PrimaryButtonBackground /> : null}
      <Typography
        variant="titleS"
        color={variant === 'primary' ? colors.gray.white : colors.gray[600]}
        align="center"
      >
        {label}
      </Typography>
    </Pressable>
  );
}

function PrimaryButtonBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <RadialGradient
          id="dateOnlyGuidePrimary"
          cx="50%"
          cy="50%"
          rx="52%"
          ry="88%"
          gradientUnits="objectBoundingBox"
        >
          <Stop offset="0" stopColor={colors.alpha.primary20} />
          <Stop offset="1" stopColor={colors.primary} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dateOnlyGuidePrimary)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    backgroundColor: colors.alpha.black50,
  },
  cardBorder: {
    width: '100%',
    maxWidth: 337,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray.white,
    shadowColor: colors.gray[700],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  card: {
    overflow: 'hidden',
    gap: spacing[8],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[4],
    borderRadius: radius['2xl'],
    backgroundColor: colors.alpha.white50,
  },
  cardFallback: {
    backgroundColor: colors.alpha.white70,
  },
  body: {
    alignItems: 'center',
    gap: spacing[3],
  },
  textGroup: {
    alignItems: 'center',
    gap: spacing[1],
  },
  actions: {
    width: '100%',
    gap: spacing[2],
  },
  button: {
    width: '100%',
    height: spacing[12],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.alpha.gray70050,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.gray.white,
  },
  pressed: {
    opacity: 0.72,
  },
});
