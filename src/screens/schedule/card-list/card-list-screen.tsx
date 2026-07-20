import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ConditionScoreBackground } from '@/components/domain/condition/condition-score-background';
import { CardListEmptyState } from '@/components/features/card-list/card-list-empty-state';
import { CardListFilterChips } from '@/components/features/card-list/card-list-filter-chips';
import { CardListSearchBar } from '@/components/features/card-list/card-list-search-bar';
import { CardListSections } from '@/components/features/card-list/card-list-sections';
import { CardListStatusMessage } from '@/components/features/card-list/card-list-status-message';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { useTodayConditionScore } from '@/hooks/use-condition-score';

import { useCardListScreen } from './hooks/use-card-list-screen';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 393;
const BOTTOM_NAV_HEIGHT = 66;

export function CardListScreen() {
  const {
    insets,
    filters,
    expandedFilter,
    personalTags,
    filteredCards,
    sections,
    hasActiveFilter,
    totalCards,
    isLoading,
    isError,
    isFetchingNextPage,
    handleScroll,
    handleCardPress,
    handleSearchPress,
    handleSearchClear,
    handleChangeCardType,
    toggleExpandedFilter,
    toggleProgressStatus,
    toggleConditionTag,
    togglePersonalTag,
  } = useCardListScreen();
  const conditionScore = useTodayConditionScore();

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.screenContent}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <ConditionScoreBackground score={conditionScore} />
      <View style={styles.canvas}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing[2],
              paddingBottom: insets.bottom + BOTTOM_NAV_HEIGHT + spacing[8],
            },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.header}>
            <CardListSearchBar
              value={filters.searchQuery}
              onPress={handleSearchPress}
              onClear={handleSearchClear}
            />
            <CardListFilterChips
              cardType={filters.cardType}
              progressStatuses={filters.progressStatuses}
              conditionTagIds={filters.conditionTagIds}
              personalTagIds={filters.personalTagIds}
              expandedFilter={expandedFilter}
              personalTags={personalTags}
              onChangeCardType={handleChangeCardType}
              onToggleExpanded={toggleExpandedFilter}
              onToggleProgressStatus={toggleProgressStatus}
              onToggleConditionTag={toggleConditionTag}
              onTogglePersonalTag={togglePersonalTag}
            />
          </View>

          <Typography variant="caption" color={colors.gray.white} style={styles.headerLabel}>
            총 {totalCards}개의 카드
          </Typography>

          {isLoading ? (
            <CardListStatusMessage message="카드 목록을 불러오는 중이에요." />
          ) : isError ? (
            <CardListStatusMessage message="카드 목록을 불러오지 못했어요." />
          ) : filteredCards.length === 0 ? (
            <CardListEmptyState hasActiveFilter={hasActiveFilter} />
          ) : (
            <CardListSections
              sections={sections}
              personalTags={personalTags}
              onCardPress={handleCardPress}
            />
          )}
          {isFetchingNextPage ? (
            <CardListStatusMessage message="카드를 더 불러오는 중이에요." />
          ) : null}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[3],
  },
  header: {
    gap: spacing[3],
    zIndex: 10,
  },
  headerLabel: {
    textShadowColor: colors.alpha.black35,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});
