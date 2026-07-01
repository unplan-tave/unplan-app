import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PinCardCreateHeader } from '@/components/pin-card/pin-card-create-header';
import { PinCardToast } from '@/components/pin-card/pin-card-required-toast';
import { RecommendTimeModal } from '@/components/pin-card/recommend-time-modal';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { getConditionTagById, type PinCardItem } from '@/state/pin-card/model';
import {
  formatDueCountdown,
  formatDueDateDisplay,
  formatDurationInline,
  getMockRecommendationLabel,
  hasDueDate,
  hasQueueDurationOrUnknown,
  UNKNOWN_DURATION_LABEL,
} from '@/state/pin-card/queue';
import { formatRecurrenceChipSegments } from '@/state/pin-card/recurrence';
import { usePinCardStore } from '@/state/pin-card/use-pin-card-store';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];
const BOX_PADDING = spacing[4];
const FIELD_LABEL_WIDTH = 72;
const HEAD_GAP = 6;
const RECOMMEND_BUTTON_GAP = 10;

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

export function PinCardViewScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const card = usePinCardStore((store) => store.cards.find((c) => c.id === cardId));
  const personalTags = usePinCardStore((store) => store.personalTags);
  const patchCard = usePinCardStore((store) => store.patchCard);
  const [isRecommendModalVisible, setIsRecommendModalVisible] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const handleBack = useCallback(() => router.back(), []);
  const handleEdit = useCallback(() => {
    router.push(`/pin-card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  const handleOpenRecommendModal = useCallback(() => {
    setIsRecommendModalVisible(true);
  }, []);

  const handleCloseRecommendModal = useCallback(() => {
    setIsRecommendModalVisible(false);
  }, []);

  const handleConfirmRecommendation = useCallback(() => {
    if (cardId == null) {
      return;
    }

    patchCard(cardId, { recommendationAcknowledged: true });
    setIsRecommendModalVisible(false);
    setToast({ message: '추천 시간을 확인했어요!', variant: 'confirm' });
  }, [cardId, patchCard]);

  useEffect(() => {
    if (toast == null) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 3_000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (card == null) {
      router.back();
    }
  }, [card]);

  if (card == null) {
    return null;
  }

  const conditionTag = getConditionTagById(card.conditionTagId);
  const cardPersonalTags = personalTags.filter((tag) => card.personalTagIds.includes(tag.id));

  return (
    <ScreenLayout
      backgroundColor={colors.surface}
      contentStyle={styles.screenContent}
      useSafeArea={false}
    >
      <StatusBar style="dark" />
      <View style={styles.canvas}>
        <PinCardCreateHeader
          variant="view"
          cardType={card.cardType}
          doneEnabled
          onClose={handleBack}
          onDone={handleEdit}
        />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.head}>
            <Typography variant="display" color={colors.gray[900]}>
              {card.title}
            </Typography>
            <View style={styles.tagRow}>
              <Tag variant="condition" condition={conditionTag.id} label={conditionTag.label} />
              {cardPersonalTags.map((tag) => (
                <Tag key={tag.id} variant="personal" label={tag.label} />
              ))}
            </View>
          </View>

          {card.cardType === 'queue' ? (
            <QueueViewBody card={card} onOpenRecommendModal={handleOpenRecommendModal} />
          ) : (
            <PinViewBody card={card} />
          )}
        </ScrollView>
      </View>

      {card.cardType === 'queue' ? (
        <>
          <RecommendTimeModal
            visible={isRecommendModalVisible}
            onClose={handleCloseRecommendModal}
            onConfirm={handleConfirmRecommendation}
          />
          {toast != null ? (
            <PinCardToast
              message={toast.message}
              variant={toast.variant}
              onClose={() => setToast(null)}
              onConfirm={() => setToast(null)}
            />
          ) : null}
        </>
      ) : null}
    </ScreenLayout>
  );
}

function PinViewBody({ card }: { card: PinCardItem }) {
  const sections: Array<{ key: string; node: React.ReactNode }> = [];

  const scheduleRows: Array<{ key: string; node: React.ReactNode }> = [];

  if (card.dateMode !== 'empty' && card.dateStart.length > 0) {
    scheduleRows.push({
      key: 'date',
      node: (
        <ViewRow label="날짜">
          {card.dateMode === 'range' && card.dateEnd.length > 0 ? (
            <ViewDateRange start={card.dateStart} end={card.dateEnd} />
          ) : (
            <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
              {card.dateStart}
            </Typography>
          )}
        </ViewRow>
      ),
    });
  }

  if (card.timeFilled && card.timeStart.length > 0 && card.timeEnd.length > 0) {
    scheduleRows.push({
      key: 'time',
      node: (
        <ViewRow label="시간">
          <ViewTimeRange start={card.timeStart} end={card.timeEnd} />
        </ViewRow>
      ),
    });
  }

  if (card.repeatEnabled && card.recurrence != null) {
    scheduleRows.push({
      key: 'repeat',
      node: <ViewRepeatRow recurrence={card.recurrence} />,
    });
  }

  if (scheduleRows.length > 0) {
    sections.push({
      key: 'schedule',
      node: <ViewBox rows={scheduleRows} />,
    });
  }

  if (card.location.trim().length > 0) {
    sections.push({
      key: 'location',
      node: (
        <ViewBox
          rows={[
            {
              key: 'location',
              node: (
                <ViewLocationRow location={card.location} locationDetail={card.locationDetail} />
              ),
            },
          ]}
        />
      ),
    });
  }

  if (card.memo.trim().length > 0) {
    sections.push({
      key: 'memo',
      node: (
        <Card variant="solid" accessibilityRole="none" style={styles.formBox}>
          <ViewMemoBlock memo={card.memo} />
        </Card>
      ),
    });
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.sections}>
      {sections.map((section) => (
        <View key={section.key}>{section.node}</View>
      ))}
    </View>
  );
}

function QueueViewBody({
  card,
  onOpenRecommendModal,
}: {
  card: PinCardItem;
  onOpenRecommendModal: () => void;
}) {
  const sections: Array<{ key: string; node: React.ReactNode }> = [];
  const dueDurationRows: Array<{ key: string; node: React.ReactNode }> = [];

  if (hasDueDate(card.dueDate)) {
    dueDurationRows.push({
      key: 'due',
      node: (
        <ViewRow label="마감일">
          <ViewDueDateValue dueDate={card.dueDate} />
        </ViewRow>
      ),
    });
  }

  if (
    hasQueueDurationOrUnknown(
      card.durationHours,
      card.durationMinutes,
      card.durationUnknown ?? false,
    )
  ) {
    dueDurationRows.push({
      key: 'duration',
      node: (
        <ViewRow label="소요시간">
          <ViewDurationValue
            hours={card.durationHours}
            minutes={card.durationMinutes}
            durationUnknown={card.durationUnknown ?? false}
          />
        </ViewRow>
      ),
    });
  }

  if (dueDurationRows.length > 0) {
    sections.push({
      key: 'due-duration',
      node: <ViewBox rows={dueDurationRows} />,
    });
  }

  sections.push({
    key: 'recommend',
    node: (
      <ViewBox
        rows={[
          {
            key: 'recommend',
            node: (
              <ViewRecommendRow
                acknowledged={card.recommendationAcknowledged ?? false}
                onPressConfirm={onOpenRecommendModal}
              />
            ),
          },
        ]}
      />
    ),
  });

  if (card.location.trim().length > 0) {
    sections.push({
      key: 'location',
      node: (
        <ViewBox
          rows={[
            {
              key: 'location',
              node: (
                <ViewLocationRow location={card.location} locationDetail={card.locationDetail} />
              ),
            },
          ]}
        />
      ),
    });
  }

  if (card.memo.trim().length > 0) {
    sections.push({
      key: 'memo',
      node: (
        <Card variant="solid" accessibilityRole="none" style={styles.formBox}>
          <ViewMemoBlock memo={card.memo} />
        </Card>
      ),
    });
  }

  return (
    <View style={styles.sections}>
      {sections.map((section) => (
        <View key={section.key}>{section.node}</View>
      ))}
    </View>
  );
}

function ViewBox({ rows }: { rows: Array<{ key: string; node: React.ReactNode }> }) {
  return (
    <Card variant="solid" accessibilityRole="none" style={styles.formBox}>
      {rows.map((row, index) => (
        <View key={row.key}>
          {index > 0 ? <Divider /> : null}
          {row.node}
        </View>
      ))}
    </Card>
  );
}

function ViewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.formRow}>
      <View style={styles.labelGroup}>
        <Typography variant="bodyM" color={colors.gray[800]}>
          {label}
        </Typography>
      </View>
      <View style={styles.valueGroup}>{children}</View>
    </View>
  );
}

function ViewDateRange({ start, end }: { start: string; end: string }) {
  return (
    <View style={styles.inlineRange}>
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {start}
      </Typography>
      <View style={styles.dateDivider} />
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {end}
      </Typography>
    </View>
  );
}

function ViewTimeRange({ start, end }: { start: string; end: string }) {
  return (
    <View style={styles.inlineRange}>
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {start}
      </Typography>
      <Typography variant="bodyM" color={colors.gray[600]}>
        -
      </Typography>
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {end}
      </Typography>
    </View>
  );
}

function ViewRepeatRow({ recurrence }: { recurrence: NonNullable<PinCardItem['recurrence']> }) {
  const segments = formatRecurrenceChipSegments(recurrence);

  return (
    <View style={styles.repeatRow}>
      <View style={styles.labelGroup}>
        <Typography variant="bodyM" color={colors.gray[800]}>
          반복
        </Typography>
      </View>
      <View style={styles.repeatChip}>
        <View style={styles.repeatChipTextGroup}>
          {segments.map((segment, index) => (
            <Typography
              key={`${segment.text}-${index}`}
              variant="bodyS"
              color={segment.muted ? colors.gray[300] : colors.gray[600]}
            >
              {segment.text}
            </Typography>
          ))}
        </View>
      </View>
    </View>
  );
}

function ViewLocationRow({
  location,
  locationDetail,
}: {
  location: string;
  locationDetail: string;
}) {
  const hasDetail = locationDetail.trim().length > 0;

  return (
    <View style={styles.formRow}>
      <View style={styles.labelGroup}>
        <Typography variant="bodyM" color={colors.gray[800]}>
          위치
        </Typography>
      </View>
      <View style={styles.locationValue}>
        <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
          {location}
        </Typography>
        {hasDetail ? (
          <>
            <Typography variant="bodyM" color={colors.gray[300]}>
              ∙
            </Typography>
            <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
              {locationDetail}
            </Typography>
          </>
        ) : null}
      </View>
    </View>
  );
}

function ViewDueDateValue({ dueDate }: { dueDate: string }) {
  return (
    <View style={styles.queueDueValue}>
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {formatDueDateDisplay(dueDate)}
      </Typography>
      <Typography variant="bodyM" color={colors.gray[600]}>
        까지
      </Typography>
      <View style={styles.queueVerticalDivider} />
      <Typography variant="bodyM" color={colors.gray[400]}>
        {formatDueCountdown(dueDate)}
      </Typography>
    </View>
  );
}

function ViewDurationValue({
  hours,
  minutes,
  durationUnknown,
}: {
  hours: number;
  minutes: number;
  durationUnknown: boolean;
}) {
  if (durationUnknown) {
    return (
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {UNKNOWN_DURATION_LABEL}
      </Typography>
    );
  }

  return (
    <View style={styles.durationValue}>
      <Typography variant="bodyM" color={colors.gray[600]}>
        약
      </Typography>
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {formatDurationInline(hours, minutes)}
      </Typography>
      <Typography variant="bodyM" color={colors.gray[600]}>
        소요
      </Typography>
    </View>
  );
}

function ViewRecommendRow({
  acknowledged,
  onPressConfirm,
}: {
  acknowledged: boolean;
  onPressConfirm: () => void;
}) {
  return (
    <View style={styles.formRow}>
      <View style={styles.labelGroup}>
        <Typography variant="bodyM" color={colors.gray[800]}>
          추천 시간
        </Typography>
      </View>
      {acknowledged ? (
        <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
          {getMockRecommendationLabel()}
        </Typography>
      ) : (
        <Pressable
          accessibilityLabel="추천 시간 확인하기"
          accessibilityRole="button"
          style={({ pressed }) => [styles.recommendButton, pressed && styles.pressed]}
          onPress={onPressConfirm}
        >
          <Typography variant="bodyM" color={colors.gray.white}>
            확인하기
          </Typography>
          <Icon name="arrowRight" size={24} color={colors.gray.white} />
        </Pressable>
      )}
    </View>
  );
}

function ViewMemoBlock({ memo }: { memo: string }) {
  return (
    <View style={styles.memoBlock}>
      <Typography variant="bodyM" color={colors.gray[600]} style={styles.memoText}>
        {memo}
      </Typography>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  canvas: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH,
    flex: 1,
    alignSelf: 'center',
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: FORM_GAP,
    paddingTop: CONTENT_TOP,
    paddingBottom: spacing[16],
  },
  head: {
    width: '100%',
    gap: HEAD_GAP,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flexWrap: 'wrap',
  },
  sections: {
    width: '100%',
    gap: FORM_GAP,
  },
  formBox: {
    width: '100%',
    gap: spacing[2],
    padding: BOX_PADDING,
    borderWidth: 0,
  },
  formRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    paddingLeft: spacing[1],
  },
  labelGroup: {
    width: FIELD_LABEL_WIDTH,
  },
  valueGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  inlineRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
    flexShrink: 1,
  },
  dateDivider: {
    width: 1,
    height: spacing[4],
    backgroundColor: colors.gray[200],
  },
  repeatRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
    paddingLeft: spacing[1],
  },
  repeatChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: spacing[2] - 2,
    paddingHorizontal: spacing[3],
    borderRadius: radius.xs,
    backgroundColor: colors.gray[50],
  },
  repeatChipTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  locationValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
    flexShrink: 1,
  },
  queueDueValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
    flexShrink: 1,
  },
  queueVerticalDivider: {
    width: 1,
    height: spacing[4],
    backgroundColor: colors.gray[200],
  },
  durationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  recommendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RECOMMEND_BUTTON_GAP,
    paddingVertical: spacing[2],
    paddingLeft: spacing[3],
    paddingRight: spacing[2],
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  memoBlock: {
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    paddingLeft: spacing[1],
  },
  memoText: {
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[50],
  },
  pressed: {
    opacity: 0.72,
  },
});
