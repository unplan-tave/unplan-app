import { StyleSheet, View } from 'react-native';

import { Card, CardTagList, type CardTagItem } from '@/components/ui/Card';
import { ProgressSegment, type ProgressSegmentValue } from '@/components/ui/ProgressSegment';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { getConditionTagById } from '@/domains/schedule/model';

import type { ScheduleListItem } from '@/domains/schedule/model';

const PROGRESS_OPTIONS = [
  { label: '시작전', value: 'todo' },
  { label: '진행중', value: 'ongoing' },
  { label: '완료', value: 'done' },
] as const;

const ACTION_ROW_WIDTH = 320;
const TAG_AREA_WIDTH = 104;
const DIVIDER_LEFT = 119;
const PROGRESS_LEFT = 134;

interface CompletedScheduleCardProps {
  schedule: ScheduleListItem;
  disabled: boolean;
  progressValue: ProgressSegmentValue;
  onChange: (value: ProgressSegmentValue) => void;
}

/** 알림 완료 탭에서 종료된 일정의 진행 상태를 확인하는 카드입니다. */
export function CompletedScheduleCard({
  schedule,
  disabled,
  progressValue,
  onChange,
}: CompletedScheduleCardProps) {
  const isDone = schedule.status === 'done';
  const conditionTag = getConditionTagById(schedule.conditionTagId);
  const tags: CardTagItem[] = [
    {
      label: conditionTag.label,
      variant: 'condition',
      condition: conditionTag.id,
    },
    ...schedule.personalTags.map((label) => ({ label, variant: 'personal' as const })),
  ];

  return (
    <Card disabled style={[styles.card, isDone && styles.completedCard]}>
      <Typography
        variant="titleS"
        color={isDone ? colors.gray[500] : colors.gray[800]}
        numberOfLines={1}
        style={[styles.title, isDone && styles.completedTitle]}
      >
        {schedule.title}
      </Typography>
      <View style={styles.metaRow}>
        <Typography variant="bodyS" color={colors.gray[500]} numberOfLines={1}>
          {formatScheduleDateRange(schedule.date)}
        </Typography>
        <Typography variant="bodyS" color={colors.gray[500]} numberOfLines={1}>
          {schedule.startTime} - {schedule.endTime}
        </Typography>
      </View>
      <View style={styles.actionRow}>
        <View style={styles.tags}>
          <CardTagList tags={tags} maxVisible={2} style={styles.tagList} />
        </View>
        <View style={styles.divider} />
        <ProgressSegment
          value={progressValue}
          options={[...PROGRESS_OPTIONS]}
          style={styles.progress}
          onChange={onChange}
        />
        {disabled ? <View pointerEvents="auto" style={styles.disabledOverlay} /> : null}
      </View>
    </Card>
  );
}

function formatScheduleDateRange(date: string): string {
  const formattedDate = date.replaceAll('-', '.');

  return `${formattedDate} - ${formattedDate}`;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[1.5],
    height: 124,
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 0,
    backgroundColor: colors.gray.white,
    boxShadow: `0 0 ${spacing[12]}px ${spacing[1.75]}px ${colors.alpha.blueGray15}`,
  },
  completedCard: { backgroundColor: colors.alpha.white20 },
  title: { minHeight: 29 },
  completedTitle: { textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', gap: spacing[2] },
  actionRow: {
    position: 'relative',
    height: 32,
    width: ACTION_ROW_WIDTH,
    maxWidth: '100%',
  },
  tags: {
    position: 'absolute',
    top: spacing[1],
    left: 0,
    width: TAG_AREA_WIDTH,
    height: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  tagList: { flexWrap: 'nowrap' },
  divider: {
    position: 'absolute',
    top: spacing.px,
    left: DIVIDER_LEFT,
    width: spacing.px,
    height: 30,
    backgroundColor: colors.gray[300],
  },
  progress: { position: 'absolute', top: 0, left: PROGRESS_LEFT },
  disabledOverlay: { ...StyleSheet.absoluteFill },
});
