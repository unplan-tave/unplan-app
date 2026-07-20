import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

interface ConditionSleepConflictSheetProps {
  visible: boolean;
  source: 'condition' | 'sleep';
  onClose: () => void;
  onOpenSleepRecords: () => void;
}

/** 수면 시간대에 컨디션을 입력하려 할 때 다음 동작을 안내합니다. */
export function ConditionSleepConflictSheet({
  visible,
  source,
  onClose,
  onOpenSleepRecords,
}: ConditionSleepConflictSheetProps) {
  const isSleepSource = source === 'sleep';
  const title = isSleepSource
    ? '수면 기록과 에너지 기록이 겹쳐요!'
    : '수면 시간대와 컨디션 시간이 겹쳐요!';
  const description = isSleepSource
    ? '입력한 수면 시간 중 일부가 기존 에너지 기록 시간과 겹쳐요\n하나의 시간대엔 한 가지 기록만 남길 수 있어요'
    : '입력한 컨디션 시간이 수면 기록 시간대와 겹쳐요\n자는 중에는 컨디션을 입력할 수 없어요';
  const viewRecordLabel = isSleepSource ? '기존 컨디션 기록 확인하기' : '수면 기록 시간 확인하기';
  const changeTimeLabel = isSleepSource ? '수면 기록 시간 변경하기' : '컨디션 입력 시간 변경하기';

  return (
    <BottomSheet visible={visible} contentStyle={styles.sheet} onClose={onClose}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="기록 충돌 안내 닫기"
          accessibilityRole="button"
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        </Pressable>
        <Typography variant="bodyM" color={colors.gray[900]}>
          기록 충돌 확인
        </Typography>
        <Pressable
          accessibilityLabel="기록 충돌 안내 확인"
          accessibilityRole="button"
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.errorCard}>
        <Icon name="warning" variant="badge" size={96} />
        <View style={styles.message}>
          <Typography variant="titleS" align="center" color={colors.secondary}>
            {title}
          </Typography>
          <Typography variant="bodyS" align="center" color={colors.gray[600]}>
            {description}
          </Typography>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          fullWidth
          label={viewRecordLabel}
          variant="conditionRecommendationSecondary"
          onPress={onOpenSleepRecords}
        />
        <Button
          fullWidth
          label={changeTimeLabel}
          variant="conditionRecommendationSecondary"
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[3],
  },
  header: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  errorCard: {
    width: '100%',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  message: {
    alignItems: 'center',
    gap: spacing[1],
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
});
