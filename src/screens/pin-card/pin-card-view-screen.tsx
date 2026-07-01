import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PinCardCreateHeader } from '@/components/pin-card/pin-card-create-header';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { getConditionTagById, type PinCardItem } from '@/state/pin-card/model';
import { formatRecurrenceSummary } from '@/state/pin-card/recurrence';
import { usePinCardStore } from '@/state/pin-card/use-pin-card-store';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];
const BOX_PADDING = spacing[4];
const FIELD_LABEL_WIDTH = 72;

export function PinCardViewScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const card = usePinCardStore((store) => store.cards.find((c) => c.id === cardId));
  const personalTags = usePinCardStore((store) => store.personalTags);

  const handleBack = useCallback(() => router.back(), []);
  const handleEdit = useCallback(() => {
    router.push(`/pin-card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  if (card == null) {
    router.back();
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
        <PinCardCreateHeader variant="view" doneEnabled onClose={handleBack} onDone={handleEdit} />
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

          <ViewFormCard card={card} />
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

function ViewFormCard({ card }: { card: PinCardItem }) {
  const rows: Array<{ key: string; node: React.ReactNode }> = [];

  if (card.dateMode !== 'empty' && card.dateStart) {
    const dateLabel =
      card.dateMode === 'range' && card.dateEnd
        ? `${card.dateStart}  -  ${card.dateEnd}`
        : card.dateStart;
    rows.push({
      key: 'date',
      node: <ViewFormRow label="날짜" value={dateLabel} />,
    });
  }

  if (card.timeFilled && card.timeStart && card.timeEnd) {
    rows.push({
      key: 'time',
      node: <ViewFormRow label="시간" value={`${card.timeStart}  -  ${card.timeEnd}`} />,
    });
  }

  if (card.repeatEnabled && card.recurrence != null) {
    rows.push({
      key: 'repeat',
      node: <ViewFormRow label="반복" value={formatRecurrenceSummary(card.recurrence)} />,
    });
  }

  if (card.location.trim().length > 0) {
    const locationValue =
      card.locationDetail.trim().length > 0
        ? `${card.location}\n${card.locationDetail}`
        : card.location;

    rows.push({
      key: 'location',
      node: <ViewFormRow label="위치" value={locationValue} multiline />,
    });
  }

  // if (card.reminderEnabled) {
  //   rows.push({ key: 'reminder', node: <ViewFormRow label="알림" value="시작 30분 전" icon="bell" /> });
  // }

  if (card.memo.trim().length > 0) {
    rows.push({
      key: 'memo',
      node: <ViewFormRow label="메모" value={card.memo} multiline />,
    });
  }

  if (rows.length === 0) {
    return null;
  }

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

function ViewFormRow({
  label,
  value,
  multiline = false,
  icon,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  icon?: 'bell';
}) {
  return (
    <View style={[styles.formRow, multiline && styles.formRowMultiline]}>
      <View style={styles.labelGroup}>
        <Typography variant="bodyM" color={colors.gray[800]}>
          {label}
        </Typography>
      </View>
      <View style={[styles.valueGroup, multiline && styles.valueGroupMultiline]}>
        {icon === 'bell' ? <Icon name="bell" size={16} color={colors.gray[600]} /> : null}
        <Typography
          variant="bodyM"
          color={colors.gray[600]}
          style={multiline ? styles.valueMultiline : undefined}
        >
          {value}
        </Typography>
      </View>
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
    gap: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flexWrap: 'wrap',
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
  formRowMultiline: {
    alignItems: 'flex-start',
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
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
  valueGroupMultiline: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  valueMultiline: {
    flex: 1,
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[50],
  },
});
