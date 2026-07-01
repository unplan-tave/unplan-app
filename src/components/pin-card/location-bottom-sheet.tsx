import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface LocationBottomSheetProps {
  visible: boolean;
  recentSearches?: string[];
  onClose: () => void;
  onDone: (location: string) => void;
  onDeleteSearch?: (location: string) => void;
  onDeleteAllSearches?: () => void;
}

export function LocationBottomSheet({
  visible,
  recentSearches = [],
  onClose,
  onDone,
  onDeleteSearch,
  onDeleteAllSearches,
}: LocationBottomSheetProps) {
  const [query, setQuery] = useState('');
  const canDone = query.trim().length > 0;

  const handleDone = () => {
    if (canDone) {
      onDone(query.trim());
    }
  };

  return (
    <BottomSheet visible={visible} contentStyle={styles.sheet} onClose={onClose}>
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
            accessibilityLabel="장소 또는 주소 입력"
            value={query}
            placeholder="장소, 주소 입력"
            placeholderTextColor={colors.gray[400]}
            returnKeyType="search"
            maxLength={50}
            style={styles.searchInput}
            onChangeText={setQuery}
            onSubmitEditing={handleDone}
          />
        </View>

        {recentSearches.length > 0 ? (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Typography variant="bodyM" color={colors.gray[900]}>
                최근 검색어
              </Typography>
              <Pressable
                accessibilityLabel="최근 검색어 전체 삭제"
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => pressed && styles.pressed}
                onPress={onDeleteAllSearches}
              >
                <Typography variant="bodyS" color={colors.gray[400]}>
                  전체삭제
                </Typography>
              </Pressable>
            </View>
            <View style={styles.searchList}>
              {recentSearches.map((item) => (
                <View key={item} style={styles.searchItem}>
                  <Typography
                    variant="bodyS"
                    color={colors.gray[600]}
                    style={styles.searchItemText}
                  >
                    {item}
                  </Typography>
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
          </View>
        ) : null}
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
    height: spacing[10],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  searchInput: {
    ...typography.bodyS,
    flex: 1,
    color: colors.gray[800],
  },
  recentSection: {
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  searchList: {
    gap: spacing[2],
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchItemText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
  },
});
