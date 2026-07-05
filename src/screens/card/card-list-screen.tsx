import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardListEmptyState } from '@/components/features/card/list/card-list-empty-state';
import {
  CardListFilterChips,
  type CardListMultiFilterKey,
} from '@/components/features/card/list/card-list-filter-chips';
import { CardListPinItem } from '@/components/features/card/list/card-list-pin-item';
import { CardListQueueItem } from '@/components/features/card/list/card-list-queue-item';
import { CardListSearchBar } from '@/components/features/card/list/card-list-search-bar';
import { HomeBackground } from '@/components/features/home/home-background';
import { HomeBottomNav } from '@/components/features/home/home-bottom-nav';
import { type CardTagItem } from '@/components/ui/Card';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import {
  createDefaultCardListFilters,
  filterCardsForList,
  groupCardsByMonth,
  type CardListFilters,
} from '@/state/card/list';
import {
  getConditionTagById,
  type CardItem,
  type CardProgressStatus,
  type PersonalTagOption,
} from '@/state/card/model';
import { useCardStore } from '@/state/card/use-card-store';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const BOTTOM_NAV_HEIGHT = 66;

export function CardListScreen() {
  const insets = useSafeAreaInsets();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const cards = useCardStore((store) => store.cards);
  const personalTags = useCardStore((store) => store.personalTags);
  const [filters, setFilters] = useState<CardListFilters>(() => createDefaultCardListFilters());
  const [expandedFilter, setExpandedFilter] = useState<CardListMultiFilterKey | null>(null);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, searchQuery: q ?? '' }));
  }, [q]);

  const filteredCards = useMemo(() => filterCardsForList(cards, filters), [cards, filters]);
  const sections = useMemo(() => groupCardsByMonth(filteredCards), [filteredCards]);
  const hasActiveFilter =
    filters.cardType !== 'all' ||
    filters.progressStatuses.length > 0 ||
    filters.conditionTagIds.length > 0 ||
    filters.personalTagIds.length > 0 ||
    filters.searchQuery.trim().length > 0;

  const handleCardPress = useCallback((cardId: string) => {
    router.push(`/card/view?cardId=${cardId}`);
  }, []);

  const handleCreateCard = useCallback(() => {
    router.push('/card/card-detail');
  }, []);

  const handleSearchPress = useCallback(() => {
    router.push('/card/search');
  }, []);

  const handleSearchClear = useCallback(() => {
    router.setParams({ q: '' });
  }, []);

  const handleNavItemPress = useCallback((value: string) => {
    if (value === 'home') {
      router.navigate('/(tabs)');
      return;
    }

    if (value === 'setting') {
      router.navigate('/settings');
      return;
    }

    router.navigate('/schedule');
  }, []);

  const toggleProgressStatus = useCallback((status: CardProgressStatus) => {
    setFilters((prev) => ({
      ...prev,
      progressStatuses: toggleListValue(prev.progressStatuses, status),
    }));
  }, []);

  const toggleConditionTag = useCallback((tagId: CardListFilters['conditionTagIds'][number]) => {
    setFilters((prev) => ({
      ...prev,
      conditionTagIds: toggleListValue(prev.conditionTagIds, tagId),
    }));
  }, []);

  const togglePersonalTag = useCallback((tagId: string) => {
    setFilters((prev) => ({
      ...prev,
      personalTagIds: toggleListValue(prev.personalTagIds, tagId),
    }));
  }, []);

  const toggleExpandedFilter = useCallback((key: CardListMultiFilterKey) => {
    setExpandedFilter((prev) => (prev === key ? null : key));
  }, []);

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
              onChangeCardType={(cardType) => setFilters((prev) => ({ ...prev, cardType }))}
              onToggleExpanded={toggleExpandedFilter}
              onToggleProgressStatus={toggleProgressStatus}
              onToggleConditionTag={toggleConditionTag}
              onTogglePersonalTag={togglePersonalTag}
            />
          </View>

          <Typography variant="caption" color={colors.gray.white} style={styles.headerLabel}>
            총 {filteredCards.length}개의 카드
          </Typography>

          {filteredCards.length === 0 ? (
            <CardListEmptyState hasActiveFilter={hasActiveFilter} />
          ) : (
            sections.map((section) => (
              <View key={section.monthKey} style={styles.section}>
                <Typography variant="caption" color={colors.gray.white} style={styles.headerLabel}>
                  {section.monthLabel}
                </Typography>
                <View style={styles.grid}>
                  {section.cards.map((card) => (
                    <View key={card.id} style={styles.gridItem}>
                      <CardListGridItem
                        card={card}
                        personalTags={personalTags}
                        onPress={() => handleCardPress(card.id)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))
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

function CardListGridItem({
  card,
  personalTags,
  onPress,
}: {
  card: CardItem;
  personalTags: PersonalTagOption[];
  onPress: () => void;
}) {
  const tags = useMemo(() => buildCardTags(card, personalTags), [card, personalTags]);

  if (card.cardType === 'queue') {
    return <CardListQueueItem card={card} tags={tags} onPress={onPress} />;
  }

  return <CardListPinItem card={card} tags={tags} onPress={onPress} />;
}

function buildCardTags(card: CardItem, personalTags: PersonalTagOption[]): CardTagItem[] {
  const conditionTag = getConditionTagById(card.conditionTagId);
  const cardPersonalTags = personalTags.filter((tag) => card.personalTagIds.includes(tag.id));

  return [
    {
      label: conditionTag.label,
      variant: 'condition' as const,
      condition: card.conditionTagId,
    },
    ...cardPersonalTags.map((tag) => ({
      label: tag.label,
      variant: 'personal' as const,
    })),
  ];
}

function toggleListValue<T extends string>(values: T[], value: T): T[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
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
  section: {
    gap: spacing[2],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  gridItem: {
    flexBasis: '48%',
    flexGrow: 1,
    maxWidth: '49%',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing[2],
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
});
