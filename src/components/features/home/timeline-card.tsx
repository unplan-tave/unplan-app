import { Pressable, StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

import { Card, CardTagList, type CardTagItem } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

type TimelineCardStatus = 'complete' | 'default' | 'recommendation';

const HOME_CARD_MIN_HEIGHT = 108;
const HOME_CARD_PADDING_HORIZONTAL = 15;
const HOME_CARD_PADDING_VERTICAL = 9;
const HOME_CARD_CONTENT_GAP = 10;
const HOME_TIMELINE_ROW_WIDTH = 273;
const HOME_TIMELINE_TIME_WIDTH = 43;
const HOME_TIMELINE_ROW_GAP = 9;
const HOME_TIMELINE_TICK_GAP = 2;
const HOME_TIMELINE_CARD_WIDTH = 221;

interface TimelineCardProps {
  time: string;
  title: string;
  range: string;
  status?: TimelineCardStatus;
  tags?: CardTagItem[];
  helperText?: string;
  compact?: boolean;
  cardStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onAddPress?: () => void;
  onDismissPress?: () => void;
}

export function TimelineCard({
  time,
  title,
  range,
  status = 'default',
  tags = [],
  helperText,
  compact = false,
  cardStyle,
  onPress,
  onAddPress,
  onDismissPress,
}: TimelineCardProps) {
  const isComplete = status === 'complete';
  const isRecommendation = status === 'recommendation';

  const card = (
    <Card
      variant="glass"
      accessibilityLabel={`${title} 카드`}
      style={[
        styles.card,
        compact && styles.cardCompact,
        isComplete && styles.cardComplete,
        isRecommendation && styles.cardRecommendation,
        cardStyle,
      ]}
      onPress={onPress}
    >
      <View style={styles.contentGroup}>
        {helperText ? (
          <View style={styles.helperRow}>
            <Typography variant="caption" color={colors.gray[400]}>
              ✦
            </Typography>
            <Typography variant="caption" color={colors.gray[400]}>
              {helperText}
            </Typography>
          </View>
        ) : null}
        <View style={styles.textStack}>
          <Typography
            variant="titleM"
            color={colors.gray[800]}
            style={[styles.title, isComplete && styles.completedTitle]}
          >
            {title}
          </Typography>
          <Typography
            variant="bodyM"
            color={isRecommendation ? colors.secondary : colors.gray[500]}
          >
            {range}
          </Typography>
        </View>
        <CardTagList tags={tags} />
        {isRecommendation ? (
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="추천 삭제"
              accessibilityRole="button"
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              onPress={onDismissPress}
            >
              <Typography variant="bodyS" color={colors.gray[400]} align="center">
                추천 삭제
              </Typography>
            </Pressable>
            <Pressable
              accessibilityLabel="추천 일정 추가"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionButton,
                styles.addActionButton,
                pressed && styles.pressed,
              ]}
              onPress={onAddPress}
            >
              <Typography variant="bodyS" color={colors.gray.white} align="center">
                일정 추가
              </Typography>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Card>
  );

  if (compact) {
    return card;
  }

  return (
    <View style={styles.row}>
      <View style={styles.timeBox}>
        <Typography variant="caption" color={colors.gray[300]} align="right">
          {time}
        </Typography>
        <View style={styles.tick} />
      </View>
      {card}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    maxWidth: HOME_TIMELINE_ROW_WIDTH,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HOME_TIMELINE_ROW_GAP,
  },
  timeBox: {
    width: HOME_TIMELINE_TIME_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: HOME_TIMELINE_TICK_GAP,
    paddingTop: spacing[2],
  },
  tick: {
    width: 4,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  card: {
    width: HOME_TIMELINE_CARD_WIDTH,
    minHeight: HOME_CARD_MIN_HEIGHT,
    paddingHorizontal: HOME_CARD_PADDING_HORIZONTAL,
    paddingVertical: HOME_CARD_PADDING_VERTICAL,
  },
  cardCompact: {
    width: undefined,
  },
  cardComplete: {
    opacity: 0.7,
  },
  cardRecommendation: {
    backgroundColor: colors.alpha.transparent,
  },
  contentGroup: {
    gap: HOME_CARD_CONTENT_GAP,
    paddingBottom: spacing[1],
  },
  textStack: {
    alignItems: 'flex-start',
  },
  title: {
    marginBottom: -2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[1],
    marginTop: spacing[4],
  },
  actionButton: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.gray[200],
  },
  addActionButton: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
