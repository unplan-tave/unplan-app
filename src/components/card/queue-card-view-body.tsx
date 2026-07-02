import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { type CardItem } from '@/state/card/model';
import {
  formatDueCountdown,
  formatDueDateDisplay,
  formatDurationInline,
  getMockRecommendationLabel,
  hasDueDate,
  hasQueueDurationOrUnknown,
  UNKNOWN_DURATION_LABEL,
} from '@/state/card/queue';

const BOX_PADDING = spacing[4];
const FIELD_LABEL_WIDTH = 72;
const FORM_GAP = spacing[6];
const RECOMMEND_BUTTON_GAP = 10;

export function QueueCardViewBody({
  card,
  onOpenRecommendModal,
}: {
  card: CardItem;
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
  locationValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
    flexShrink: 1,
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
