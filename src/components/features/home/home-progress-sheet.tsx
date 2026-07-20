import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressSegment } from '@/components/ui/ProgressSegment';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import type { ProgressSegmentOption, ProgressSegmentValue } from '@/components/ui/ProgressSegment';
import type { CardProgressStatus } from '@/domains/schedule/model';

const SEGMENT_OPTIONS: ProgressSegmentOption[] = [
  { label: '시작전', value: 'todo' },
  { label: '진행중', value: 'ongoing' },
  { label: '완료', value: 'done' },
];

const PROGRESS_TO_SEGMENT: Record<CardProgressStatus, ProgressSegmentValue> = {
  incomplete: 'todo',
  in_progress: 'ongoing',
  complete: 'done',
};

const SEGMENT_TO_PROGRESS: Record<ProgressSegmentValue, CardProgressStatus> = {
  todo: 'incomplete',
  ongoing: 'in_progress',
  done: 'complete',
};

export interface HomeProgressSheetProps {
  visible: boolean;
  title: string;
  timeSummary: string;
  status: CardProgressStatus;
  step: 'status' | 'action';
  onChangeStatus: (status: CardProgressStatus) => void;
  onCancel: () => void;
  onBack: () => void;
  onComplete: () => void;
  completeDisabled?: boolean;
  onReschedulePress?: () => void;
  onLeaveAsQueuePress?: () => void;
  onExtendTimePress?: () => void;
}

export function HomeProgressSheet({
  visible,
  title,
  timeSummary,
  status,
  step,
  onChangeStatus,
  onCancel,
  onBack,
  onComplete,
  completeDisabled = false,
  onReschedulePress,
  onLeaveAsQueuePress,
  onExtendTimePress,
}: HomeProgressSheetProps) {
  const segmentValue = PROGRESS_TO_SEGMENT[status];
  const isActionStep = step === 'action';

  return (
    <BottomSheet
      visible={visible}
      onClose={isActionStep ? onBack : onCancel}
      contentStyle={styles.content}
    >
      <View style={styles.header}>
        {isActionStep ? (
          <Pressable
            accessibilityLabel="이전 단계로 돌아가기"
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
            onPress={onBack}
          >
            <Icon name="arrowLeft" size={24} color={colors.gray[500]} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="취소"
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
            onPress={onCancel}
          >
            <Typography variant="bodyM" color={colors.primary}>
              취소
            </Typography>
          </Pressable>
        )}
        <Typography
          align="center"
          pointerEvents="none"
          variant="bodyM"
          color={colors.gray[900]}
          style={styles.headerTitle}
        >
          일정 완료 확인
        </Typography>
        <Pressable
          accessibilityLabel="완료"
          accessibilityRole="button"
          accessibilityState={{ disabled: completeDisabled || isActionStep }}
          disabled={completeDisabled || isActionStep}
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && !isActionStep && styles.pressed]}
          onPress={onComplete}
        >
          <Typography
            variant="bodyM"
            color={completeDisabled || isActionStep ? colors.gray[300] : colors.primary}
          >
            완료
          </Typography>
        </Pressable>
      </View>

      {isActionStep ? (
        <ActionContent
          status={status}
          onReschedulePress={onReschedulePress}
          onLeaveAsQueuePress={onLeaveAsQueuePress}
          onExtendTimePress={onExtendTimePress}
        />
      ) : (
        <View style={styles.statusContent}>
          <Typography variant="bodyM" color={colors.gray[700]} align="center">
            일정 진행 상태를 알려주세요!
          </Typography>
          <View style={styles.summaryCard}>
            <View style={styles.summaryText}>
              <Typography variant="titleM" color={colors.gray[900]} align="center">
                {title}
              </Typography>
              <Typography variant="bodyS" color={colors.gray[600]} align="center">
                {timeSummary}
              </Typography>
            </View>
            <ProgressSegment
              options={SEGMENT_OPTIONS}
              value={segmentValue}
              onChange={(next) => onChangeStatus(SEGMENT_TO_PROGRESS[next])}
            />
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

function ActionContent({
  status,
  onReschedulePress,
  onLeaveAsQueuePress,
  onExtendTimePress,
}: {
  status: CardProgressStatus;
  onReschedulePress?: () => void;
  onLeaveAsQueuePress?: () => void;
  onExtendTimePress?: () => void;
}) {
  return (
    <View style={styles.actionContent}>
      <Typography variant="bodyM" color={colors.gray[700]} align="center">
        일정을 어떻게 수정할까요?
      </Typography>
      {status === 'incomplete' ? (
        <View style={styles.actionButtons}>
          <Button label="다른 시간에 다시 하기" fullWidth onPress={onReschedulePress} />
          <Button label="큐 카드로 남겨두기" fullWidth onPress={onLeaveAsQueuePress} />
        </View>
      ) : null}
      {status === 'in_progress' ? (
        <Button label="종료 시간 연장" fullWidth onPress={onExtendTimePress} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
  },
  header: {
    position: 'relative',
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
  },
  headerAction: {
    minWidth: spacing[8] + spacing.px,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerTitle: {
    left: 0,
    position: 'absolute',
    right: 0,
    alignSelf: 'center',
    textAlign: 'center',
  },
  statusContent: {
    gap: spacing[3],
  },
  summaryCard: {
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  summaryText: {
    gap: spacing[1],
  },
  actionContent: {
    gap: spacing[4],
  },
  actionButtons: {
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.72,
  },
});
