import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ConditionScoreBackground } from '@/components/domain/condition/condition-score-background';
import { CardListDateRangeSheet } from '@/components/features/card-list/card-list-date-range-sheet';
import { CardListEmptyState } from '@/components/features/card-list/card-list-empty-state';
import { CardListFilterChips } from '@/components/features/card-list/card-list-filter-chips';
import { CardListSearchBar } from '@/components/features/card-list/card-list-search-bar';
import { CardListSections } from '@/components/features/card-list/card-list-sections';
import { CardListStatusMessage } from '@/components/features/card-list/card-list-status-message';
import { Icon } from '@/components/ui/Icon';
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
    isPersonalTagsLoading,
    isPersonalTagsError,
    filteredCards,
    sections,
    hasActiveFilter,
    totalCards,
    periodLabel,
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
    isDateRangeSheetVisible,
    openDateRangeSheet,
    closeDateRangeSheet,
    applyDateRange,
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
        <View style={[styles.stickyHeader, { paddingTop: insets.top + spacing[2] }]}>
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
              isPersonalTagsLoading={isPersonalTagsLoading}
              isPersonalTagsError={isPersonalTagsError}
              onChangeCardType={handleChangeCardType}
              onToggleExpanded={toggleExpandedFilter}
              onToggleProgressStatus={toggleProgressStatus}
              onToggleConditionTag={toggleConditionTag}
              onTogglePersonalTag={togglePersonalTag}
            />
          </View>

          <View style={styles.metaRow}>
            <Typography variant="caption" color={colors.gray.white} style={styles.headerLabel}>
              총 {totalCards}개의 카드
            </Typography>
            <Pressable
              accessibilityLabel="조회 기간 선택"
              accessibilityRole="button"
              style={({ pressed }) => [styles.periodButton, pressed && styles.pressed]}
              onPress={openDateRangeSheet}
            >
              <Icon name="chevronDown" size={20} color={colors.gray.white} />
              <Typography variant="bodyM" color={colors.gray.white}>
                {periodLabel}
              </Typography>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + BOTTOM_NAV_HEIGHT + spacing[8],
            },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
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
      <CardListDateRangeSheet
        visible={isDateRangeSheetVisible}
        value={{
          dateMode: filters.startDate === filters.endDate ? 'single' : 'range',
          dateStart: filters.startDate,
          dateEnd: filters.endDate,
          timeStart: filters.startTime,
          timeEnd: filters.endTime,
        }}
        onClose={closeDateRangeSheet}
        onDone={applyDateRange}
      />
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
  stickyHeader: {
    zIndex: 10,
    elevation: 10,
    gap: spacing[4],
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
  },
  header: {
    gap: spacing[3],
  },
  headerLabel: {
    textShadowColor: colors.alpha.black35,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  metaRow: {
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  periodButton: {
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[1],
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
