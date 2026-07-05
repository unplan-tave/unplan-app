import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { canSubmitCardSearch, normalizeCardSearchQuery } from '@/domains/schedule/search';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

const CONTENT_MAX_WIDTH = 353;

export function CardSearchScreen() {
  const recentSearches = useScheduleStore((store) => store.cardRecentSearches);
  const addRecentSearch = useScheduleStore((store) => store.addCardRecentSearch);
  const deleteRecentSearch = useScheduleStore((store) => store.deleteCardRecentSearch);
  const deleteAllRecentSearches = useScheduleStore((store) => store.deleteAllCardRecentSearches);
  const [query, setQuery] = useState('');

  const submitSearch = useCallback(
    (value: string) => {
      if (!canSubmitCardSearch(value)) {
        return;
      }

      const normalized = normalizeCardSearchQuery(value);

      addRecentSearch(normalized);
      router.navigate({ pathname: '/schedule', params: { q: normalized } });
    },
    [addRecentSearch],
  );

  return (
    <ScreenLayout backgroundColor={colors.onboardingMutedBackground}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로가기"
          accessibilityRole="button"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Icon name="arrowLeft" size={24} color={colors.gray[400]} />
        </Pressable>
        <View style={styles.searchBar}>
          <Icon name="search" size={24} color={colors.gray[400]} />
          <TextInput
            autoFocus
            accessibilityLabel="일정 카드 검색"
            placeholder="일정 카드 검색"
            placeholderTextColor={colors.gray[400]}
            returnKeyType="search"
            enablesReturnKeyAutomatically
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => submitSearch(query)}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recentHeader}>
          <Typography variant="titleS" color={colors.gray[900]}>
            최근 검색어
          </Typography>
          {recentSearches.length > 0 ? (
            <Pressable
              accessibilityLabel="최근 검색어 전체삭제"
              accessibilityRole="button"
              style={({ pressed }) => pressed && styles.pressed}
              onPress={deleteAllRecentSearches}
            >
              <Typography variant="bodyM" color={colors.gray[400]}>
                전체삭제
              </Typography>
            </Pressable>
          ) : null}
        </View>

        {recentSearches.length === 0 ? (
          <View style={styles.emptyRow}>
            <Typography variant="bodyM" color={colors.gray[400]} align="center">
              최근 검색 내역이 없습니다
            </Typography>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentSearches.map((term) => (
              <View key={term} style={styles.recentRow}>
                <Pressable
                  accessibilityLabel={`${term} 검색`}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.recentTerm, pressed && styles.pressed]}
                  onPress={() => submitSearch(term)}
                >
                  <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
                    {term}
                  </Typography>
                </Pressable>
                <Pressable
                  accessibilityLabel={`${term} 검색 기록 삭제`}
                  accessibilityRole="button"
                  hitSlop={spacing[2]}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={() => deleteRecentSearch(term)}
                >
                  <Icon name="cancel" size={16} color={colors.gray[400]} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[1] + 1,
    paddingHorizontal: spacing[2],
  },
  searchBar: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    paddingLeft: spacing[3],
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.gray[400],
    backgroundColor: colors.alpha.white20,
  },
  input: {
    ...typography.bodyS,
    flex: 1,
    minWidth: 0,
    padding: spacing[0],
    color: colors.gray[800],
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: spacing[2],
    paddingTop: spacing[6],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  recentList: {
    gap: spacing[1],
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  recentTerm: {
    flexShrink: 1,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[6],
  },
  pressed: {
    opacity: 0.72,
  },
});
