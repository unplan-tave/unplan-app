import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { CONDITION_RECOMMENDATION_HEADER_SPACER_WIDTH } from '@/constants/condition-ui';
import { colors, radius, spacing } from '@/constants/theme';
import { isRecoveryRecommendation } from '@/domains/condition/recommendation';
import { getConditionTagById } from '@/domains/schedule/model';
import { t } from '@/lib/i18n';

import type {
  ConditionRecommendation,
  QueueConditionRecommendation,
  RecoveryConditionRecommendation,
} from '@/domains/condition/model';

interface ConditionRecommendationSheetProps {
  visible: boolean;
  /** 빈 시간대 안내 문구. 추천이 없을 때는 비어 있을 수 있습니다. */
  slotMessage: string | null;
  recommendations: ConditionRecommendation[];
  activeIndex: number;
  selectedRecoveryOptionId: string | null;
  /** 추천이 없을 때 error 카드에 붙는 설명 문구. */
  emptyDescription: string;
  onClose: () => void;
  onPrevPress: () => void;
  onNextPress: () => void;
  onSelectRecoveryOption: (optionId: string) => void;
  onKeepQueuePress: () => void;
  onManualTimePress: () => void;
  onAccept: () => void;
}

export function ConditionRecommendationSheet({
  visible,
  slotMessage,
  recommendations,
  activeIndex,
  selectedRecoveryOptionId,
  emptyDescription,
  onClose,
  onPrevPress,
  onNextPress,
  onSelectRecoveryOption,
  onKeepQueuePress,
  onManualTimePress,
  onAccept,
}: ConditionRecommendationSheetProps) {
  const recommendation = recommendations[activeIndex];
  const isEmpty = recommendation == null || slotMessage == null;
  const isRecovery = isRecoveryRecommendation(recommendation);
  const needsRecoveryOption = isRecovery && selectedRecoveryOptionId == null;

  return (
    <BottomSheet visible={visible} onClose={onClose} contentStyle={styles.content}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
          <Typography variant="bodyM" color={colors.gray[500]}>
            {t('common.cancel')}
          </Typography>
        </Pressable>
        <Typography variant="bodyM" color={colors.gray[600]}>
          {t('condition.recommendation.sheet.title')}
        </Typography>
        {isEmpty ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
            <Typography variant="bodyM" color={colors.primary}>
              {t('common.done')}
            </Typography>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyCard}>
          <Typography variant="titleS" color={colors.gray[800]} align="center">
            {t('condition.recommendation.empty.title')}
          </Typography>
          <Typography variant="bodyS" color={colors.gray[600]} align="center">
            {emptyDescription}
          </Typography>
        </View>
      ) : (
        <>
          <View style={styles.contentCard}>
            <View style={styles.intro}>
              <Typography variant="bodyS" color={colors.gray[700]}>
                {slotMessage}
              </Typography>
              <View style={styles.introTagRow}>
                <RecommendationTag recommendation={recommendation} />
                <Typography variant="bodyS" color={colors.gray[700]}>
                  {isRecovery
                    ? t('condition.recommendation.recovery.conditionSuffix')
                    : t('condition.recommendation.queue.conditionSuffix')}
                </Typography>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.recommendationHead}>
              <View style={styles.recommendationTitleRow}>
                <Typography variant="bodyS" color={colors.gray[800]}>
                  {t('condition.recommendation.itemTitle')} {activeIndex + 1}
                </Typography>
                <View style={styles.pagination}>
                  <Typography variant="bodyS" color={colors.gray[800]}>
                    {activeIndex + 1}/{recommendations.length}
                  </Typography>
                  <Pressable
                    accessibilityLabel={t('condition.recommendation.prevAccessibilityLabel')}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: activeIndex === 0 }}
                    disabled={activeIndex === 0}
                    hitSlop={8}
                    onPress={onPrevPress}
                  >
                    <Icon
                      name="arrowLeft"
                      size={16}
                      color={activeIndex === 0 ? colors.gray[300] : colors.gray[600]}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityLabel={t('condition.recommendation.nextAccessibilityLabel')}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: activeIndex >= recommendations.length - 1 }}
                    disabled={activeIndex >= recommendations.length - 1}
                    hitSlop={8}
                    onPress={onNextPress}
                  >
                    <Icon
                      name="arrowRight"
                      size={16}
                      color={
                        activeIndex >= recommendations.length - 1
                          ? colors.gray[300]
                          : colors.gray[600]
                      }
                    />
                  </Pressable>
                </View>
              </View>
              <Typography variant="bodyS" color={colors.gray[600]}>
                {recommendation.reason}
              </Typography>
            </View>

            {isRecovery ? (
              <RecoveryRecommendationCard
                recommendation={recommendation}
                selectedOptionId={selectedRecoveryOptionId}
                onSelectOption={onSelectRecoveryOption}
              />
            ) : (
              <QueueRecommendationCard
                recommendation={recommendation}
                onKeepQueuePress={onKeepQueuePress}
              />
            )}
          </View>

          <View style={styles.actions}>
            <Button
              label={t('condition.recommendation.manualTime')}
              fullWidth
              onPress={onManualTimePress}
            />
            <Button
              label={t('condition.recommendation.accept')}
              variant="primary"
              fullWidth
              disabled={needsRecoveryOption}
              onPress={onAccept}
            />
          </View>
        </>
      )}
    </BottomSheet>
  );
}

function RecommendationTag({ recommendation }: { recommendation: ConditionRecommendation }) {
  const tagId = recommendation.kind === 'queue' ? recommendation.conditionTagId : 'rest';

  return <Tag variant="condition" condition={tagId} label={getConditionTagById(tagId).label} />;
}

function QueueRecommendationCard({
  recommendation,
  onKeepQueuePress,
}: {
  recommendation: QueueConditionRecommendation;
  onKeepQueuePress: () => void;
}) {
  return (
    <View style={styles.detailCard}>
      <Typography variant="titleS" color={colors.gray[800]} numberOfLines={1}>
        {recommendation.title}
      </Typography>
      <RecommendationTag recommendation={recommendation} />
      <View style={styles.detailMetaRow}>
        {recommendation.dueLabel ? (
          <>
            <Typography variant="bodyS" color={colors.gray[600]}>
              {recommendation.dueLabel}
            </Typography>
            <View style={styles.metaDivider} />
          </>
        ) : null}
        <Typography variant="bodyS" color={colors.gray[600]}>
          {recommendation.durationLabel}
        </Typography>
      </View>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.keepQueueRow, pressed && styles.pressed]}
        onPress={onKeepQueuePress}
      >
        <Typography variant="bodyS" color={colors.gray[500]}>
          {t('condition.recommendation.keepQueue')}
        </Typography>
        <Icon name="arrowRight" size={16} color={colors.gray[500]} />
      </Pressable>
    </View>
  );
}

function RecoveryRecommendationCard({
  recommendation,
  selectedOptionId,
  onSelectOption,
}: {
  recommendation: RecoveryConditionRecommendation;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.recoveryOptions}>
        {recommendation.options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            variant="square"
            selected={option.id === selectedOptionId}
            onPress={() => onSelectOption(option.id)}
          />
        ))}
      </View>
      <RecommendationTag recommendation={recommendation} />
      <View style={styles.detailMetaRow}>
        <Typography variant="bodyS" color={colors.gray[600]}>
          {recommendation.durationLabel}
        </Typography>
      </View>
      {selectedOptionId == null ? (
        <Typography variant="bodyS" color={colors.secondary}>
          {t('condition.recommendation.recovery.selectRequired')}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: CONDITION_RECOMMENDATION_HEADER_SPACER_WIDTH,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  contentCard: {
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
  },
  intro: {
    gap: spacing[1],
  },
  introTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
  },
  recommendationHead: {
    gap: spacing[1],
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  detailCard: {
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
  },
  detailMetaRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.gray[300],
  },
  recoveryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  keepQueueRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    gap: spacing[4],
  },
  pressed: {
    opacity: 0.72,
  },
});
