import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  getLocationSuggestions,
  getVisibleLocationRecentSearches,
  isValidLocationSearchLabel,
  LOCATION_SEARCH_MAX_LENGTH,
  normalizeLocationSearchLabel,
} from '@/state/pin-card/location';

interface LocationBottomSheetProps {
  visible: boolean;
  recentSearches?: string[];
  onClose: () => void;
  onSelect: (location: string) => void;
  onDeleteSearch?: (location: string) => void;
  onDeleteAllSearches?: () => void;
}

export function LocationBottomSheet({
  visible,
  recentSearches = [],
  onClose,
  onSelect,
  onDeleteSearch,
  onDeleteAllSearches,
}: LocationBottomSheetProps) {
  const searchInputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const visibleRecentSearches = useMemo(
    () => getVisibleLocationRecentSearches(recentSearches),
    [recentSearches],
  );
  const suggestions = useMemo(() => getLocationSuggestions(query), [query]);
  const isSearching = query.length > 0;
  const canDone = isValidLocationSearchLabel(query);

  const handleSheetShow = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!visible) {
      setQuery('');
    }
  }, [visible]);

  const handleDone = () => {
    if (!canDone) {
      return;
    }

    onSelect(normalizeLocationSearchLabel(query));
  };

  const handleSelect = (location: string) => {
    onSelect(normalizeLocationSearchLabel(location));
  };

  return (
    <BottomSheet
      visible={visible}
      avoidKeyboard
      contentStyle={styles.sheet}
      onClose={onClose}
      onShow={handleSheetShow}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="위치 선택 취소"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        </Pressable>
        <Typography
          pointerEvents="none"
          variant="bodyM"
          color={colors.gray[900]}
          align="center"
          style={styles.headerTitle}
        >
          위치
        </Typography>
        <Pressable
          accessibilityLabel="위치 선택 완료"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canDone }}
          disabled={!canDone}
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={handleDone}
        >
          <Typography variant="bodyM" color={canDone ? colors.primary : colors.gray[400]}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Icon name="search" size={24} color={colors.gray[400]} />
          <TextInput
            ref={searchInputRef}
            accessibilityLabel="장소 또는 주소 입력"
            value={query}
            placeholder="장소, 주소 입력"
            placeholderTextColor={colors.gray[400]}
            returnKeyType="search"
            maxLength={LOCATION_SEARCH_MAX_LENGTH}
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.searchInput}
            onChangeText={setQuery}
            onSubmitEditing={handleDone}
          />
        </View>

        {isSearching ? (
          <View style={styles.suggestionList}>
            {suggestions.map((item) => (
              <Pressable
                key={item}
                accessibilityLabel={`${item} 선택`}
                accessibilityRole="button"
                style={({ pressed }) => [styles.suggestionItem, pressed && styles.pressed]}
                onPress={() => handleSelect(item)}
              >
                <Typography variant="bodyS" color={colors.gray[600]} numberOfLines={1}>
                  {item}
                </Typography>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Typography variant="bodyM" color={colors.gray[900]}>
                최근 검색어
              </Typography>
              <Pressable
                accessibilityLabel="최근 검색어 전체 삭제"
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={onDeleteAllSearches}
              >
                <Typography variant="bodyS" color={colors.gray[400]} align="center">
                  전체삭제
                </Typography>
              </Pressable>
            </View>

            {visibleRecentSearches.length > 0 ? (
              <View style={styles.searchList}>
                {visibleRecentSearches.map((item) => (
                  <View key={item} style={styles.searchItem}>
                    <Pressable
                      accessibilityLabel={`${item} 선택`}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.searchItemPressable,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Typography
                        variant="bodyS"
                        color={colors.gray[600]}
                        numberOfLines={1}
                        style={styles.searchItemText}
                      >
                        {item}
                      </Typography>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`${item} 검색어 삭제`}
                      accessibilityRole="button"
                      hitSlop={8}
                      style={({ pressed }) => pressed && styles.pressed}
                      onPress={() => onDeleteSearch?.(item)}
                    >
                      <Icon name="cancel" size={16} color={colors.gray[400]} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyHistory}>
                <Typography variant="bodyM" color={colors.gray[400]} align="center">
                  최근 검색 내역이 없습니다
                </Typography>
              </View>
            )}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[16] - spacing[1],
  },
  header: {
    width: '100%',
    maxWidth: 369,
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
  },
  headerAction: {
    zIndex: 2,
    minWidth: 33,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  card: {
    width: '100%',
    gap: spacing[4],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    width: '100%',
    maxWidth: 329,
    height: spacing[10],
    alignSelf: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  searchInput: {
    ...typography.bodyS,
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: colors.gray[800],
  },
  suggestionList: {
    alignSelf: 'stretch',
    gap: spacing[1],
    paddingHorizontal: spacing[1],
  },
  suggestionItem: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  recentSection: {
    alignSelf: 'stretch',
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  searchList: {
    gap: spacing[1],
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  searchItemPressable: {
    flex: 1,
  },
  searchItemText: {
    flex: 1,
  },
  emptyHistory: {
    alignSelf: 'stretch',
    paddingVertical: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
