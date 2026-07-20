import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

interface HomeConditionPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onConditionPress: () => void;
}

/** 홈 첫 진입 시 오늘의 컨디션 기록을 가볍게 안내합니다. */
export function HomeConditionPromptModal({
  visible,
  onClose,
  onConditionPress,
}: HomeConditionPromptModalProps) {
  return (
    <Modal
      visible={visible}
      contentStyle={styles.content}
      overlayVariant="dimmed"
      onClose={onClose}
    >
      <View style={styles.textGroup}>
        <Typography variant="titleS" color={colors.gray[900]} align="center">
          {t('home.conditionPrompt.title')}
        </Typography>
        <Typography variant="bodyS" color={colors.gray[600]} align="center">
          {t('home.conditionPrompt.description')}
        </Typography>
      </View>
      <View style={styles.actions}>
        <Button
          fullWidth
          label={t('home.conditionPrompt.conditionAction')}
          variant="primary"
          onPress={onConditionPress}
        />
      </View>
      <Pressable
        accessibilityLabel={t('home.conditionPrompt.dismiss')}
        accessibilityRole="button"
        hitSlop={spacing[2]}
        style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}
        onPress={onClose}
      >
        <Typography variant="bodyS" color={colors.gray[500]} align="center">
          {t('home.conditionPrompt.dismiss')}
        </Typography>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
    backgroundColor: colors.alpha.white88,
  },
  textGroup: {
    alignItems: 'center',
    gap: spacing[2],
  },
  actions: {
    width: '100%',
    gap: spacing[2],
  },
  dismiss: {
    paddingVertical: spacing[1],
  },
  pressed: {
    opacity: 0.72,
  },
});
