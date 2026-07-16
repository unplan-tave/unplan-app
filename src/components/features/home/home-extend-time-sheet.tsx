import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { TimeStepper } from '@/components/ui/TimeStepper';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

export interface HomeExtendTimeSheetProps {
  visible: boolean;
  title: string;
  /** "06/19" 형태 */
  dateLabel: string;
  /** "08:30" */
  startTime: string;
  /** 연장이 반영된 종료 시각 "09:10" */
  newEndTime: string;
  /** 연장한 분 (스텝퍼 라벨 "N분") */
  addedMinutes: number;
  /** 최소 연장(10분)에 도달해 더 줄일 수 없음 */
  decreaseDisabled?: boolean;
  /** 다음 일정과 겹침 */
  hasConflict?: boolean;
  onBack: () => void;
  onComplete: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  completeDisabled?: boolean;
}

export function HomeExtendTimeSheet({
  visible,
  title,
  dateLabel,
  startTime,
  newEndTime,
  addedMinutes,
  decreaseDisabled = false,
  hasConflict = false,
  onBack,
  onComplete,
  onDecrease,
  onIncrease,
  completeDisabled = false,
}: HomeExtendTimeSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onBack} contentStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
        >
          <Icon name="arrowLeft" size={24} color={colors.gray[700]} />
        </Pressable>
        <Typography variant="bodyM" color={colors.gray[800]}>
          종료 시간 연장
        </Typography>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: completeDisabled }}
          disabled={completeDisabled}
          hitSlop={8}
          onPress={onComplete}
        >
          <Typography variant="bodyM" color={completeDisabled ? colors.gray[300] : colors.primary}>
            완료
          </Typography>
        </Pressable>
      </View>

      <Typography variant="bodyM" color={colors.gray[700]} align="center">
        조금만 더 힘내볼까요?
      </Typography>

      <View style={styles.card}>
        <Typography variant="titleS" color={colors.gray[800]} align="center">
          {title}
        </Typography>
        <View style={styles.timeRow}>
          <Typography variant="bodyS" color={colors.gray[600]}>
            {`${dateLabel}  ${startTime}-`}
          </Typography>
          <Typography variant="bodyS" color={hasConflict ? colors.secondary : colors.primary}>
            {newEndTime}
          </Typography>
        </View>
      </View>

      <TimeStepper
        variant="action"
        tone={hasConflict ? 'error' : 'default'}
        label={`${addedMinutes}분`}
        decreaseDisabled={decreaseDisabled}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
