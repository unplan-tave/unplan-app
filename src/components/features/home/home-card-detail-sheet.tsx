import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ProgressSegment } from '@/components/ui/ProgressSegment';
import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { formatRecurrenceChipSegments } from '@/domains/schedule/recurrence';

import type { ProgressSegmentOption, ProgressSegmentValue } from '@/components/ui/ProgressSegment';
import type { CardItem, CardProgressStatus, ConditionTagOption } from '@/domains/schedule/model';

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

export interface HomeCardDetailSheetProps {
  visible: boolean;
  card: CardItem | null;
  conditionTag: ConditionTagOption | null;
  personalTagLabels: string[];
  isLoading: boolean;
  isError: boolean;
  status: CardProgressStatus;
  onChangeStatus: (status: CardProgressStatus) => void;
  onClose: () => void;
  onEdit: () => void;
}

/** 홈 타임라인 핀 카드의 읽기 전용 상세 sheet입니다. 알림은 제품 범위에서 제외합니다. */
export function HomeCardDetailSheet({
  visible,
  card,
  conditionTag,
  personalTagLabels,
  isLoading,
  isError,
  status,
  onChangeStatus,
  onClose,
  onEdit,
}: HomeCardDetailSheetProps) {
  const isReady = card != null && conditionTag != null;

  return (
    <BottomSheet visible={visible} onClose={onClose} contentStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로가기"
          accessibilityRole="button"
          hitSlop={spacing[2]}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Icon name="arrowLeft" size={24} color={colors.gray[500]} />
        </Pressable>
        <Typography
          align="center"
          pointerEvents="none"
          variant="bodyM"
          color={colors.gray[900]}
          style={styles.headerTitle}
        >
          핀 카드
        </Typography>
        <Pressable
          accessibilityLabel="편집"
          accessibilityRole="button"
          accessibilityState={{ disabled: !isReady }}
          disabled={!isReady}
          hitSlop={spacing[2]}
          style={({ pressed }) => [styles.headerAction, pressed && isReady && styles.pressed]}
          onPress={onEdit}
        >
          <Typography variant="bodyM" color={isReady ? colors.primary : colors.gray[300]}>
            편집
          </Typography>
        </Pressable>
      </View>

      {isReady ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="solid" accessibilityRole="none" style={styles.summaryCard}>
            <Typography variant="titleS" color={colors.gray[900]} numberOfLines={2}>
              {card.title}
            </Typography>
            <View style={styles.summaryBottomRow}>
              <View style={styles.tagRow}>
                <Tag variant="condition" condition={conditionTag.id} label={conditionTag.label} />
                {personalTagLabels.map((label) => (
                  <Tag key={label} variant="personal" label={label} />
                ))}
              </View>
              <ProgressSegment
                options={SEGMENT_OPTIONS}
                value={PROGRESS_TO_SEGMENT[status]}
                onChange={(next) => onChangeStatus(SEGMENT_TO_PROGRESS[next])}
              />
            </View>
          </Card>
          <PinDetailContent card={card} />
        </ScrollView>
      ) : visible ? (
        <View style={styles.stateBox}>
          <Typography variant="bodyM" color={colors.gray[600]} align="center">
            {isError ? '카드를 불러오지 못했어요.' : isLoading ? '카드를 불러오는 중이에요.' : ''}
          </Typography>
        </View>
      ) : null}
    </BottomSheet>
  );
}

function PinDetailContent({ card }: { card: CardItem }) {
  const hasSchedule = card.dateMode !== 'empty' || card.timeFilled || card.repeatEnabled;
  const hasLocation = (card.location ?? '').trim().length > 0;
  const hasMemo = (card.memo ?? '').trim().length > 0;

  return (
    <View style={styles.detailSections}>
      {hasSchedule ? (
        <Card variant="solid" accessibilityRole="none" style={styles.detailCard}>
          {card.dateMode !== 'empty' && card.dateStart.length > 0 ? (
            <DetailRow label="날짜">
              <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
                {card.dateMode === 'range' && card.dateEnd.length > 0
                  ? `${card.dateStart}  –  ${card.dateEnd}`
                  : card.dateStart}
              </Typography>
            </DetailRow>
          ) : null}
          {card.timeFilled && card.timeStart.length > 0 && card.timeEnd.length > 0 ? (
            <>
              <DetailDivider />
              <DetailRow label="시간">
                <Typography variant="bodyM" color={colors.gray[600]}>
                  {card.timeStart} – {card.timeEnd}
                </Typography>
              </DetailRow>
            </>
          ) : null}
          {card.repeatEnabled && card.recurrence != null ? (
            <>
              <DetailDivider />
              <DetailRow label="반복">
                <View style={styles.repeatChip}>
                  {formatRecurrenceChipSegments(card.recurrence).map((segment, index) => (
                    <Typography
                      key={`${segment.text}-${index}`}
                      variant="bodyS"
                      color={segment.muted ? colors.gray[300] : colors.gray[600]}
                    >
                      {segment.text}
                    </Typography>
                  ))}
                </View>
              </DetailRow>
            </>
          ) : null}
        </Card>
      ) : null}
      {hasLocation ? (
        <Card variant="solid" accessibilityRole="none" style={styles.detailCard}>
          <DetailRow label="위치">
            <View style={styles.locationValue}>
              <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
                {card.location}
              </Typography>
              {(card.locationDetail ?? '').trim().length > 0 ? (
                <>
                  <Typography variant="bodyS" color={colors.gray[300]}>
                    ∙
                  </Typography>
                  <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
                    {card.locationDetail}
                  </Typography>
                </>
              ) : null}
            </View>
          </DetailRow>
        </Card>
      ) : null}
      {hasMemo ? (
        <Card variant="solid" accessibilityRole="none" style={styles.memoCard}>
          <Typography variant="bodyM" color={colors.gray[600]}>
            {card.memo}
          </Typography>
        </Card>
      ) : null}
    </View>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.detailRow}>
      <Typography variant="bodyM" color={colors.gray[800]}>
        {label}
      </Typography>
      <View style={styles.detailValue}>{children}</View>
    </View>
  );
}

function DetailDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  content: { gap: spacing[4] },
  header: {
    position: 'relative',
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  headerAction: {
    minWidth: spacing[8],
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerTitle: { position: 'absolute', right: 0, left: 0, textAlign: 'center' },
  scroll: { width: '100%' },
  scrollContent: { gap: spacing[6], paddingBottom: spacing[4] },
  summaryCard: {
    width: '100%',
    gap: spacing[1],
    padding: spacing[3],
    borderWidth: 0,
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
  },
  summaryBottomRow: {
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  tagRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[1],
  },
  detailSections: { width: '100%', gap: spacing[6] },
  detailCard: {
    width: '100%',
    gap: spacing[2],
    padding: spacing[4],
    borderWidth: 0,
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  detailRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[6],
    paddingLeft: spacing[1],
  },
  detailValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  divider: { width: '100%', height: 1, backgroundColor: colors.alpha.white50 },
  repeatChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray[50],
  },
  locationValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  memoCard: {
    width: '100%',
    minHeight: 120,
    justifyContent: 'center',
    padding: spacing[4],
    borderWidth: 0,
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  stateBox: { paddingVertical: spacing[10] },
  pressed: { opacity: 0.72 },
});
