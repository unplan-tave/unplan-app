import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { type CardItem } from '@/state/card/model';
import { formatRecurrenceChipSegments } from '@/state/card/recurrence';

const BOX_PADDING = spacing[4];
const FIELD_LABEL_WIDTH = 72;
const FORM_GAP = spacing[6];

export function PinViewBody({ card }: { card: CardItem }) {
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

  if ((card.location ?? '').trim().length > 0) {
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

  if ((card.memo ?? '').trim().length > 0) {
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

function ViewRepeatRow({ recurrence }: { recurrence: NonNullable<CardItem['recurrence']> }) {
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
  const hasDetail = (locationDetail ?? '').trim().length > 0;

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
});
