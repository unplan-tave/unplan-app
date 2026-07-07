import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

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

interface OnboardingNotificationModalProps {
  visible: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onAllow: () => void;
  onDeny: () => void;
}

export function OnboardingNotificationModal({
  visible,
  isSubmitting = false,
  errorMessage,
  onAllow,
  onDeny,
}: OnboardingNotificationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDeny}>
      <View style={styles.overlay}>
        <View style={styles.cardBorder}>
          {BlurView != null ? (
            <BlurView intensity={18} tint="light" style={styles.card}>
              <ModalContent
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                onAllow={onAllow}
                onDeny={onDeny}
              />
            </BlurView>
          ) : (
            <View style={[styles.card, styles.cardFallback]}>
              <ModalContent
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                onAllow={onAllow}
                onDeny={onDeny}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ModalContent({
  isSubmitting,
  errorMessage,
  onAllow,
  onDeny,
}: {
  isSubmitting: boolean;
  errorMessage?: string | null;
  onAllow: () => void;
  onDeny: () => void;
}) {
  return (
    <>
      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <Icon name="bell" size={50} color={colors.primary} />
        </View>
        <View style={styles.textGroup}>
          <Typography variant="titleS" color={colors.gray[900]} align="center">
            {t('onboarding.notification.title')}
          </Typography>
          <Typography variant="bodyS" color={colors.gray[900]} align="center">
            {t('onboarding.notification.description')}
          </Typography>
        </View>
        {errorMessage ? (
          <Typography variant="caption" color={colors.secondary} align="center">
            {errorMessage}
          </Typography>
        ) : null}
      </View>
      <View style={styles.actions}>
        <ActionButton
          label={isSubmitting ? t('common.saving') : t('onboarding.notification.allow')}
          variant="primary"
          disabled={isSubmitting}
          onPress={onAllow}
        />
        <ActionButton
          label={t('onboarding.notification.deny')}
          disabled={isSubmitting}
          onPress={onDeny}
        />
      </View>
    </>
  );
}

function ActionButton({
  label,
  variant = 'secondary',
  disabled = false,
  onPress,
}: {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
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
          id="onboardingNotificationPrimary"
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
      <Rect width="100%" height="100%" fill="url(#onboardingNotificationPrimary)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[7],
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
  iconBadge: {
    width: 95,
    height: 95,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.gray.white,
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
  buttonDisabled: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.72,
  },
});
