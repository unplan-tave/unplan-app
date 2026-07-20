import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { getConditionTagById } from '@/domains/schedule/model';

import { TimelineCard } from './timeline-card';

import type { ScheduleRecommendation } from '@/domains/ai-recommendation/model';

interface HomeAddBottomSheetProps {
  visible: boolean;
  recommendations: ScheduleRecommendation[];
  onClose: () => void;
  onCreatePress: () => void;
  onDismissRecommendation: (recommendId: number) => void;
  onRecommendationAddPress: (recommendId: number) => void;
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
                const conditionTag = getConditionTagById(item.conditionTagId);

                return (
                  <TimelineCard
                    key={item.recommendId}
                    compact
                    time=""
                    title={item.title}
                    range={`${item.startTime} - ${item.endTime}`}
                    status="recommendation"
                    helperText="잠깐 쉬는 게 어떨까요?"
                    tags={[
                      {
                        label: conditionTag.label,
                        variant: 'condition',
                        condition: conditionTag.id,
                      },
                    ]}
                    cardStyle={styles.recommendCard}
                    onAddPress={() => onRecommendationAddPress(item.recommendId)}
                    onDismissPress={
                      item.conditionTagId === 'rest'
                        ? undefined
                        : () => onDismissRecommendation(item.recommendId)
                    }
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
