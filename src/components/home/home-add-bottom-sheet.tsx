import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { type ConditionTagOption, type PersonalTagOption, type CardItem } from '@/state/card/model';
import {
  formatDueCountdown,
  formatDueDateDisplay,
  formatDurationInline,
  hasDueDate,
  UNKNOWN_DURATION_LABEL,
} from '@/state/card/queue';

import { TimelineCard } from './timeline-card';

export interface RecommendationItem {
  card: CardItem;
  conditionTag: ConditionTagOption;
  personalTags: PersonalTagOption[];
}

interface HomeAddBottomSheetProps {
  visible: boolean;
  recommendations: RecommendationItem[];
  onClose: () => void;
  onCreatePress: () => void;
  onDismissRecommendation: (cardId: string) => void;
  onRecommendationAddPress: (cardId: string) => void;
  onViewQueuePress: () => void;
}

const RECOMMEND_CARD_WIDTH = 216;
const CREATE_BUTTON_HEIGHT = spacing[10];

export function HomeAddBottomSheet({
  visible,
  recommendations,
  onClose,
  onCreatePress,
  onDismissRecommendation,
  onRecommendationAddPress,
  onViewQueuePress,
}: HomeAddBottomSheetProps) {
  return (
    <BottomSheet visible={visible} contentStyle={styles.sheet} onClose={onClose}>
      <View style={styles.content}>
        {recommendations.length > 0 ? (
          <View style={styles.recommendSection}>
            <View style={styles.sectionHeader}>
              <Typography variant="titleS" color={colors.gray[900]}>
                오늘 추가하기 좋은 일정
              </Typography>
              <Pressable
                accessibilityLabel="전체 큐 카드 보기"
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => pressed && styles.pressed}
                onPress={onViewQueuePress}
              >
                <Typography variant="bodyS" color={colors.gray[500]}>
                  전체 큐 카드 보기 →
                </Typography>
              </Pressable>
            </View>
            <View style={styles.recommendList}>
              {recommendations.map((item) => {
                const { card, conditionTag, personalTags } = item;
                const timeLabel = getQueueRecommendationRange(card);

                return (
                  <TimelineCard
                    key={card.id}
                    compact
                    time=""
                    title={card.title}
                    range={timeLabel}
                    status="recommendation"
                    helperText="큐카드에서 가져오기"
                    tags={[
                      {
                        label: conditionTag.label,
                        variant: 'condition',
                        condition: conditionTag.id,
                      },
                      ...personalTags.map((tag) => ({
                        label: tag.label,
                        variant: 'personal' as const,
                      })),
                    ]}
                    cardStyle={styles.recommendCard}
                    onAddPress={() => onRecommendationAddPress(card.id)}
                    onDismissPress={() => onDismissRecommendation(card.id)}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.createSection}>
          <Typography variant="titleS" color={colors.gray[900]}>
            새로 만들기
          </Typography>
          <Pressable
            accessibilityLabel="일정 카드 등록하기"
            accessibilityRole="button"
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
            onPress={onCreatePress}
          >
            <Typography variant="bodyM" color={colors.gray[800]} align="center">
              일정 카드 등록하기
            </Typography>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

function getQueueRecommendationRange(card: CardItem) {
  const dueLabel = hasDueDate(card.dueDate)
    ? `${formatDueDateDisplay(card.dueDate)} ${formatDueCountdown(card.dueDate)}`
    : '마감일 미정';

  if (card.durationUnknown) {
    return `${dueLabel} · ${UNKNOWN_DURATION_LABEL}`;
  }

  if (card.durationHours > 0 || card.durationMinutes > 0) {
    return `${dueLabel} · 약 ${formatDurationInline(card.durationHours, card.durationMinutes)}`;
  }

  return dueLabel;
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[15],
  },
  content: {
    width: '100%',
    gap: spacing[3],
  },
  recommendSection: {
    gap: spacing[1],
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  recommendList: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[1],
  },
  recommendCard: {
    width: RECOMMEND_CARD_WIDTH,
  },
  createSection: {
    width: '100%',
    gap: spacing[1],
  },
  createButton: {
    width: '100%',
    height: CREATE_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
  pressed: {
    opacity: 0.72,
  },
});
