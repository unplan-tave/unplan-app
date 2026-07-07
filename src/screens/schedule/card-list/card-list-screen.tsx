import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardListEmptyState } from '@/components/features/card-list/card-list-empty-state';
import { CardListFilterChips } from '@/components/features/card-list/card-list-filter-chips';
import { CardListSearchBar } from '@/components/features/card-list/card-list-search-bar';
import { CardListSections } from '@/components/features/card-list/card-list-sections';
import { HomeBackground } from '@/components/features/home/home-background';
import { HomeBottomNav } from '@/components/features/home/home-bottom-nav';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

import { useCardListScreen } from './hooks/use-card-list-screen';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const BOTTOM_NAV_HEIGHT = 66;

export function CardListScreen() {
  const insets = useSafeAreaInsets();
  const {
    filters,
    expandedFilter,
    personalTags,
    filteredCards,
    sections,
    hasActiveFilter,
    isLoading,
    isError,
    handleCardPress,
    handleCreateCard,
    handleSearchPress,
    handleSearchClear,
    handleNavItemPress,
    handleChangeCardType,
    toggleExpandedFilter,
    toggleProgressStatus,
    toggleConditionTag,
    togglePersonalTag,
  } = useCardListScreen();

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.screenContent}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <HomeBackground />
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
            총 {filteredCards.length}개의 카드
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
        </ScrollView>

        <View style={[styles.footer, { bottom: insets.bottom + spacing[2] }]}>
          <HomeBottomNav
            value="cardList"
            onAddPress={handleCreateCard}
            onItemPress={handleNavItemPress}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

function CardListStatusMessage({ message }: { message: string }) {
  return (
    <View style={styles.statusMessage}>
      <Typography variant="bodyM" color={colors.gray.white} align="center">
        {message}
      </Typography>
    </View>
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
    paddingHorizontal: spacing[5],
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing[2],
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
  statusMessage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[4],
  },
});
