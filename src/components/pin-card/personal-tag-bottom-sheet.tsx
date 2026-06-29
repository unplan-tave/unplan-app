import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  canCreatePersonalTag,
  normalizePersonalTagLabel,
  type PersonalTagOption,
  sortPersonalTags,
} from '@/state/pin-card/model';

interface PersonalTagBottomSheetProps {
  visible: boolean;
  personalTags: PersonalTagOption[];
  selectedTagIds: string[];
  onClose: () => void;
  onCreateTag: (label: string) => PersonalTagOption | null;
  onDone: (selectedTagIds: string[]) => void;
}

export function PersonalTagBottomSheet({
  visible,
  personalTags,
  selectedTagIds,
  onClose,
  onCreateTag,
  onDone,
}: PersonalTagBottomSheetProps) {
  const [query, setQuery] = useState('');
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>(selectedTagIds);
  const normalizedQuery = normalizePersonalTagLabel(query);
  const sortedTags = useMemo(() => sortPersonalTags(personalTags), [personalTags]);
  const selectedTags = sortedTags.filter((tag) => draftSelectedIds.includes(tag.id));
  const visibleTags = sortedTags.filter((tag) => {
    if (draftSelectedIds.includes(tag.id)) {
      return false;
    }

    return normalizedQuery.length === 0 || tag.label.includes(normalizedQuery);
  });
  const canCreate = canCreatePersonalTag(normalizedQuery, personalTags);

  useEffect(() => {
    if (visible) {
      setDraftSelectedIds(selectedTagIds);
      setQuery('');
    }
  }, [selectedTagIds, visible]);

  const handleToggleTag = (tagId: string) => {
    setDraftSelectedIds((prev) =>
      prev.includes(tagId) ? prev.filter((selectedId) => selectedId !== tagId) : [...prev, tagId],
    );
  };

  const handleCreate = () => {
    const tag = onCreateTag(normalizedQuery);

    if (tag == null) {
      return;
    }

    setDraftSelectedIds((prev) => [...prev, tag.id]);
    setQuery('');
  };

  return (
    <BottomSheet visible={visible} contentStyle={styles.sheet} onClose={onClose}>
      <View style={styles.sheetHeader}>
        <Pressable
          accessibilityLabel="개인 태그 선택 취소"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.sheetHeaderAction, pressed && styles.pressed]}
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
          style={styles.sheetTitle}
        >
          개인 태그
        </Typography>
        <Pressable
          accessibilityLabel="개인 태그 선택 완료"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.sheetHeaderAction, pressed && styles.pressed]}
          onPress={() => onDone(draftSelectedIds)}
        >
          <Typography variant="bodyM" color={colors.primary}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="개인 태그 검색 또는 생성"
          value={query}
          placeholder="개인 태그 검색"
          placeholderTextColor={colors.gray[400]}
          returnKeyType="search"
          maxLength={25}
          style={styles.searchInput}
          onChangeText={setQuery}
          onSubmitEditing={handleCreate}
        />
        <Pressable
          accessibilityLabel="개인 태그 생성"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canCreate }}
          disabled={!canCreate}
          style={({ pressed }) => [
            styles.createButton,
            !canCreate && styles.createButtonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handleCreate}
        >
          <Typography
            variant="bodyS"
            color={canCreate ? colors.primary : colors.gray[400]}
            align="center"
          >
            +생성
          </Typography>
        </Pressable>
      </View>

      {selectedTags.length > 0 ? (
        <View style={styles.selectedSection}>
          <View style={styles.tagWrap}>
            {selectedTags.map((tag) => (
              <PersonalTagChip
                key={tag.id}
                selected
                label={tag.label}
                onPress={() => handleToggleTag(tag.id)}
              />
            ))}
          </View>
          <View style={styles.divider} />
        </View>
      ) : null}

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.tagWrap}
        showsVerticalScrollIndicator={false}
      >
        {visibleTags.map((tag) => (
          <PersonalTagChip key={tag.id} label={tag.label} onPress={() => handleToggleTag(tag.id)} />
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

function PersonalTagChip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 개인 태그 ${selected ? '선택 해제' : '선택'}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.tagChip,
        selected && styles.tagChipSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Typography variant="tag" color={selected ? colors.primary : colors.gray[700]}>
        {label}
      </Typography>
      {selected ? (
        <Typography variant="tag" color={colors.primary}>
          X
        </Typography>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[16] - spacing[1],
  },
  sheetHeader: {
    width: '100%',
    maxWidth: 369,
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
  },
  sheetHeaderAction: {
    zIndex: 2,
    minWidth: 33,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  searchInput: {
    ...typography.bodyM,
    flex: 1,
    minHeight: spacing[10],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
    color: colors.gray[800],
  },
  createButton: {
    minWidth: 68,
    minHeight: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[50],
  },
  selectedSection: {
    gap: spacing[3],
  },
  list: {
    maxHeight: 260,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagChip: {
    minHeight: spacing[7],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: radius.xs,
    backgroundColor: colors.gray.white,
  },
  tagChipSelected: {
    backgroundColor: colors.alpha.primary20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[50],
  },
  pressed: {
    opacity: 0.72,
  },
});
