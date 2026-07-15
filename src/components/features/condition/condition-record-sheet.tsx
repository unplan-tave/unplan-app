import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

interface ConditionRecordSheetProps {
  visible: boolean;
  mode: 'create' | 'update';
  dateLabel: string;
  bodyScore: number;
  mindScore: number;
  saving?: boolean;
  onBodyScoreChange: (score: number) => void;
  onMindScoreChange: (score: number) => void;
  onClose: () => void;
  onSave: () => void;
}

const MIN_SCORE = 0;
const MAX_SCORE = 6;

export function ConditionRecordSheet({
  visible,
  mode,
  dateLabel,
  bodyScore,
  mindScore,
  saving = false,
  onBodyScoreChange,
  onMindScoreChange,
  onClose,
  onSave,
}: ConditionRecordSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} contentStyle={styles.content}>
      <View style={styles.header}>
        <Typography variant="titleS" color={colors.gray[800]} align="center">
          {mode === 'create' ? '컨디션 기록 추가' : '컨디션 기록 수정'}
        </Typography>
        <Typography variant="bodyS" color={colors.gray[500]} align="center">
          {dateLabel}
        </Typography>
      </View>

      <View style={styles.scoreGroup}>
        <ScoreControl
          label="Body"
          description="몸의 에너지"
          value={bodyScore}
          onChange={onBodyScoreChange}
        />
        <ScoreControl
          label="Mind"
          description="집중과 정신 상태"
          value={mindScore}
          onChange={onMindScoreChange}
        />
      </View>

      <View style={styles.actions}>
        <Button label="취소" fullWidth onPress={onClose} />
        <Button
          label={saving ? '저장 중' : '저장'}
          variant="primary"
          fullWidth
          disabled={saving}
          onPress={onSave}
        />
      </View>
    </BottomSheet>
  );
}

function ScoreControl({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (score: number) => void;
}) {
  const decreaseDisabled = value <= MIN_SCORE;
  const increaseDisabled = value >= MAX_SCORE;

  return (
    <View style={styles.scoreCard}>
      <View style={styles.scoreText}>
        <Typography variant="bodyM" color={colors.gray[800]}>
          {label}
        </Typography>
        <Typography variant="bodyS" color={colors.gray[500]}>
          {description}
        </Typography>
      </View>
      <View style={styles.stepper}>
        <ScoreButton
          iconName="minus"
          disabled={decreaseDisabled}
          onPress={() => onChange(clampScore(value - 1))}
        />
        <Typography variant="titleL" color={colors.gray[800]} align="center" style={styles.value}>
          {value}
        </Typography>
        <ScoreButton
          iconName="plus"
          disabled={increaseDisabled}
          onPress={() => onChange(clampScore(value + 1))}
        />
      </View>
    </View>
  );
}

function ScoreButton({
  iconName,
  disabled,
  onPress,
}: {
  iconName: 'minus' | 'plus';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.stepperButton,
        disabled && styles.stepperButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Icon name={iconName} size={18} color={disabled ? colors.gray[300] : colors.primary} />
    </Pressable>
  );
}

function clampScore(score: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[5],
  },
  header: {
    gap: spacing[2],
  },
  scoreGroup: {
    gap: spacing[3],
  },
  scoreCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white70,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  scoreText: {
    flex: 1,
    gap: spacing[1],
  },
  stepper: {
    width: 136,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.alpha.primary20,
  },
  stepperButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  value: {
    width: 40,
  },
  actions: {
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.72,
  },
});
