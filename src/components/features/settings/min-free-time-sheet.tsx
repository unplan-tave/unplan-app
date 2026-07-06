import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { formatDurationLabel } from '@/domains/ai-recommendation/model';
import { t } from '@/lib/i18n';

const INCREMENT_OPTIONS = [1, 5, 10, 30, 60, 180] as const;
const REFRESH_BUTTON_SIZE = 32;

function toIncrementLabel(minutes: number): string {
  if (minutes >= 60) {
    return `+${minutes / 60}시간`;
  }

  return `+${minutes}분`;
}

interface MinFreeTimeSheetProps {
  visible: boolean;
  minutes: number;
  onAddMinutes: (minutes: number) => void;
  onReset: () => void;
  onClose: () => void;
}

export function MinFreeTimeSheet({
  visible,
  minutes,
  onAddMinutes,
  onReset,
  onClose,
}: MinFreeTimeSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.valueRow}>
        <Typography variant="bodyM" color={colors.gray[600]}>
          {t('settings.recommendation.minFreeTime')}
        </Typography>
        <View style={styles.valueControls}>
          <View style={styles.valueChip}>
            <Typography variant="bodyM" color={colors.gray[800]}>
              {formatDurationLabel(minutes)}
            </Typography>
          </View>
          <Pressable
            accessibilityLabel={t('settings.recommendation.resetMinFreeTime')}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
            onPress={onReset}
          >
            <Icon name="refresh" size={24} color={colors.gray[400]} />
          </Pressable>
        </View>
      </View>
      <View style={styles.buttonGrid}>
        {INCREMENT_OPTIONS.map((incrementMinutes) => {
          const label = toIncrementLabel(incrementMinutes);

          return (
            <Pressable
              key={incrementMinutes}
              accessibilityLabel={label}
              accessibilityRole="button"
              style={({ pressed }) => [styles.incrementButton, pressed && styles.pressed]}
              onPress={() => onAddMinutes(incrementMinutes)}
            >
              <Typography variant="bodyM" color={colors.gray[800]}>
                {label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  valueControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  valueChip: {
    height: REFRESH_BUTTON_SIZE,
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white70,
  },
  refreshButton: {
    width: REFRESH_BUTTON_SIZE,
    height: REFRESH_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  incrementButton: {
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 41,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.alpha.white70,
  },
  pressed: {
    opacity: 0.72,
  },
});
