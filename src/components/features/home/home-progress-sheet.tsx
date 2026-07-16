import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
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
  /** 카드 상단에 표시되는 요약(예: "06/19 08:30-09:00") */
  timeSummary: string;
  status: CardProgressStatus;
  onChangeStatus: (status: CardProgressStatus) => void;
  onCancel: () => void;
  onComplete: () => void;
  completeDisabled?: boolean;
  /** "다른 시간에 다시 하기"(추천 재탐색) — 추천 API 미출시로 현재 비활성화 */
  onReschedulePress?: () => void;
  /** "큐 카드로 남겨두기"(핀 → 큐 전환) */
  onLeaveAsQueuePress?: () => void;
  /** "종료 시간 연장" */
  onExtendTimePress?: () => void;
}

export function HomeProgressSheet({
  visible,
  timeSummary,
  status,
  onChangeStatus,
  onCancel,
  onComplete,
  completeDisabled = false,
  onReschedulePress,
  onLeaveAsQueuePress,
  onExtendTimePress,
}: HomeProgressSheetProps) {
  const segmentValue = PROGRESS_TO_SEGMENT[status];
  const actions = useMemo(() => renderableActions(segmentValue), [segmentValue]);

  return (
    <BottomSheet visible={visible} onClose={onCancel} contentStyle={styles.content}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onCancel}>
          <Typography variant="bodyM" color={colors.gray[500]}>
            취소
          </Typography>
        </Pressable>
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
        일정 진행 상태를 알려주세요!
      </Typography>

      <View style={styles.summaryCard}>
        <Typography variant="bodyS" color={colors.gray[600]}>
          {timeSummary}
        </Typography>
        <ProgressSegment
          options={SEGMENT_OPTIONS}
          value={segmentValue}
          onChange={(next) => onChangeStatus(SEGMENT_TO_PROGRESS[next])}
        />
      </View>

      {actions.reschedule ? (
        // TODO(recommendation-api): "다른 시간에 다시 하기"는 백엔드 추천 시간대 API가
        // 아직 없어 비활성화 상태로만 노출합니다. API 연동 시 disabled/onPress 해제.
        <Button label="다른 시간에 다시 하기" fullWidth disabled onPress={onReschedulePress} />
      ) : null}

      {actions.leaveAsQueue ? (
        <Button label="큐 카드로 남겨두기" fullWidth onPress={onLeaveAsQueuePress} />
      ) : null}

      {actions.extendTime ? (
        <Button label="종료 시간 연장" fullWidth onPress={onExtendTimePress} />
      ) : null}
    </BottomSheet>
  );
}

function renderableActions(value: ProgressSegmentValue) {
  return {
    reschedule: value === 'todo',
    leaveAsQueue: value === 'todo',
    extendTime: value === 'ongoing',
  };
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
  summaryCard: {
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
});
