import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { CONDITION_TAG_OPTIONS } from '@/state/pin-card/data';
import {
  canCreatePersonalTag,
  getConditionTagDescription,
  normalizePersonalTagLabel,
  sortPersonalTags,
  type ConditionTagId,
  type PersonalTagOption,
} from '@/state/pin-card/model';

export type TagTab = 'condition' | 'personal';

const TAG_DOT_SIZE = 5.411;

interface TagPickerSheetProps {
  visible: boolean;
  activeTab: TagTab;
  selectedConditionTagId: ConditionTagId | null;
  personalTags: PersonalTagOption[];
  selectedPersonalTagIds: string[];
  onSwitchTab: (tab: TagTab) => void;
  onClose: () => void;
  onSelectConditionTag: (tagId: ConditionTagId) => void;
  onDoneConditionTag: () => void;
  onCreatePersonalTag: (label: string) => PersonalTagOption | null;
  onDonePersonalTags: (ids: string[]) => void;
}

export function TagPickerSheet({
  visible,
  activeTab,
  selectedConditionTagId,
  personalTags,
  selectedPersonalTagIds,
  onSwitchTab,
  onClose,
  onSelectConditionTag,
  onDoneConditionTag,
  onCreatePersonalTag,
  onDonePersonalTags,
}: TagPickerSheetProps) {
  const [query, setQuery] = useState('');
  const [draftPersonalIds, setDraftPersonalIds] = useState<string[]>(selectedPersonalTagIds);
  const [conditionViewMode, setConditionViewMode] = useState<'list' | 'description'>('list');

  useEffect(() => {
    if (!visible) return;
    if (activeTab === 'personal') {
      setDraftPersonalIds(selectedPersonalTagIds);
      setQuery('');
    }
  }, [selectedPersonalTagIds, visible, activeTab]);

  useEffect(() => {
    if (activeTab === 'condition') {
      setConditionViewMode('list');
    }
  }, [activeTab]);

  const normalizedQuery = normalizePersonalTagLabel(query);
  const sortedTags = useMemo(() => sortPersonalTags(personalTags), [personalTags]);
  const selectedPersonalTags = sortedTags.filter((t) => draftPersonalIds.includes(t.id));
  const visiblePersonalTags = sortedTags.filter(
    (t) =>
      !draftPersonalIds.includes(t.id) &&
      (normalizedQuery.length === 0 || t.label.includes(normalizedQuery)),
  );
  const canCreate = canCreatePersonalTag(normalizedQuery, personalTags);
  const canDoneCondition = selectedConditionTagId != null;

  const handleTogglePersonalTag = (tagId: string) => {
    setDraftPersonalIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleCreatePersonalTag = () => {
    const tag = onCreatePersonalTag(normalizedQuery);
    if (tag == null) return;
    setDraftPersonalIds((prev) => [...prev, tag.id]);
    setQuery('');
  };

  const handleDone = () => {
    if (activeTab === 'condition') {
      if (canDoneCondition) onDoneConditionTag();
    } else {
      onDonePersonalTags(draftPersonalIds);
    }
  };

  const canDone = activeTab === 'condition' ? canDoneCondition : true;

  return (
    <BottomSheet visible={visible} contentStyle={styles.sheet} onClose={onClose}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="태그 선택 취소"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        </Pressable>
        <View style={styles.tabs}>
          <View
            style={[styles.tabHighlight, activeTab === 'personal' && styles.tabHighlightRight]}
          />
          <Pressable
            accessibilityLabel="컨디션 태그 탭으로 전환"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'condition' }}
            style={styles.tabLabel}
            onPress={() => onSwitchTab('condition')}
          >
            <Typography
              variant="bodyS"
              color={activeTab === 'condition' ? colors.gray[800] : colors.gray[600]}
              align="center"
            >
              컨디션 태그
            </Typography>
          </Pressable>
          <Pressable
            accessibilityLabel="개인 태그 탭으로 전환"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'personal' }}
            style={styles.tabLabel}
            onPress={() => onSwitchTab('personal')}
          >
            <Typography
              variant="bodyS"
              color={activeTab === 'personal' ? colors.gray[800] : colors.gray[600]}
              align="center"
            >
              개인 태그
            </Typography>
          </Pressable>
        </View>
        <Pressable
          accessibilityLabel="태그 선택 완료"
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

      {activeTab === 'condition' ? (
        <View style={styles.panel}>
          {conditionViewMode === 'list' ? (
            <ConditionTagListView
              selectedTagId={selectedConditionTagId}
              onSelect={onSelectConditionTag}
              onOpenDescription={() => setConditionViewMode('description')}
            />
          ) : (
            <ConditionTagDescriptionView
              selectedTagId={selectedConditionTagId}
              onBack={() => setConditionViewMode('list')}
            />
          )}
        </View>
      ) : (
        <>
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Icon name="search" size={24} color={colors.gray[400]} />
              <TextInput
                accessibilityLabel="개인 태그 검색 또는 생성"
                value={query}
                placeholder="개인 태그 검색"
                placeholderTextColor={colors.gray[400]}
                returnKeyType="search"
                maxLength={25}
                style={styles.searchInput}
                onChangeText={setQuery}
                onSubmitEditing={handleCreatePersonalTag}
              />
            </View>
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
              onPress={handleCreatePersonalTag}
            >
              <Icon
                name="plus"
                size={20}
                color={canCreate ? colors.gray.white : colors.gray[300]}
              />
              <Typography variant="bodyS" color={canCreate ? colors.gray.white : colors.gray[300]}>
                생성
              </Typography>
            </Pressable>
          </View>

          {selectedPersonalTags.length > 0 ? (
            <View style={styles.selectedSection}>
              <View style={styles.tagWrap}>
                {selectedPersonalTags.map((tag) => (
                  <PersonalTagChip
                    key={tag.id}
                    selected
                    label={tag.label}
                    onPress={() => handleTogglePersonalTag(tag.id)}
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
            {visiblePersonalTags.map((tag) => (
              <PersonalTagChip
                key={tag.id}
                label={tag.label}
                onPress={() => handleTogglePersonalTag(tag.id)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </BottomSheet>
  );
}

function ConditionTagListView({
  selectedTagId,
  onSelect,
  onOpenDescription,
}: {
  selectedTagId: ConditionTagId | null;
  onSelect: (tagId: ConditionTagId) => void;
  onOpenDescription: () => void;
}) {
  return (
    <>
      <View style={styles.tagOptionGrid}>
        {CONDITION_TAG_OPTIONS.map((tag) => {
          const selected = tag.id === selectedTagId;
          return (
            <Pressable
              key={tag.id}
              accessibilityLabel={`${tag.label} 선택`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.tagOption,
                selected && styles.tagOptionSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => onSelect(tag.id)}
            >
              <View style={[styles.tagOptionDot, { backgroundColor: tag.color }]} />
              <Typography
                variant="tag"
                color={selected ? colors.primary : colors.gray[800]}
                style={!selected && styles.tagText}
              >
                {tag.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityLabel="컨디션 태그 설명 보기"
        accessibilityRole="button"
        style={({ pressed }) => [styles.tagSheetHelp, pressed && styles.pressed]}
        onPress={onOpenDescription}
      >
        <View style={styles.infoIcon}>
          <Typography
            variant="caption"
            color={colors.gray[600]}
            align="center"
            style={styles.infoIconText}
          >
            i
          </Typography>
        </View>
        <Typography variant="caption" color={colors.gray[600]}>
          컨디션 태그란?
        </Typography>
      </Pressable>
    </>
  );
}

function ConditionTagDescriptionView({
  selectedTagId,
  onBack,
}: {
  selectedTagId: ConditionTagId | null;
  onBack: () => void;
}) {
  return (
    <>
      <Typography variant="bodyS" color={colors.gray[700]} style={styles.descriptionIntro}>
        일정에 맞는 컨디션 태그를 선택하면 현재 컨디션에 수행하기 적합한지 알려드려요
      </Typography>
      <View style={styles.divider} />
      <View style={styles.descriptionList}>
        {CONDITION_TAG_OPTIONS.map((tag) => {
          const selected = tag.id === selectedTagId;
          const description = getConditionTagDescription(tag.id);
          return (
            <View key={tag.id} style={styles.descriptionItem}>
              <View style={[styles.descriptionTag, selected && styles.tagOptionSelected]}>
                <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                <Typography
                  variant="tag"
                  color={selected ? colors.primary : colors.gray[800]}
                  style={!selected && styles.tagText}
                >
                  {tag.label}
                </Typography>
              </View>
              <Typography variant="tag" color={colors.gray[600]}>
                {description.summary}
              </Typography>
              <Typography variant="tag" color={colors.gray[500]}>
                {description.examples}
              </Typography>
            </View>
          );
        })}
      </View>
      <Pressable
        accessibilityLabel="컨디션 태그 목록으로 돌아가기"
        accessibilityRole="button"
        style={({ pressed }) => [styles.descriptionBack, pressed && styles.pressed]}
        onPress={onBack}
      >
        <Typography variant="caption" color={colors.gray[600]}>
          ‹
        </Typography>
        <Typography variant="caption" color={colors.gray[600]}>
          컨디션 태그 목록
        </Typography>
      </Pressable>
    </>
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
        <>
          <View style={styles.tagCloseDivider} />
          <Icon name="cancel" size={14} color={colors.primary} />
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[15],
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
  tabs: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing[2],
  },
  tabHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
    shadowColor: colors.gray[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 5,
  },
  tabHighlightRight: {
    left: undefined,
    right: 0,
  },
  tabLabel: {
    flex: 1,
    justifyContent: 'center',
  },
  // Condition tag
  panel: {
    width: '100%',
    gap: spacing[6],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
  },
  tagOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagOption: {
    minWidth: 76,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: spacing[2],
    paddingRight: 6,
    paddingVertical: 1,
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray.white,
  },
  tagOptionSelected: {
    backgroundColor: colors.alpha.primary20,
  },
  tagOptionDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  tagText: {
    opacity: 0.6,
  },
  tagSheetHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  infoIcon: {
    width: spacing[5],
    height: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[600],
    borderRadius: radius.full,
  },
  infoIconText: {
    lineHeight: 18,
  },
  descriptionIntro: {
    width: '100%',
  },
  descriptionList: {
    width: '100%',
    gap: spacing[3],
  },
  descriptionItem: {
    width: '100%',
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  descriptionTag: {
    minHeight: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 7,
    paddingRight: 5,
    paddingVertical: 1,
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray.white,
  },
  tagDot: {
    width: TAG_DOT_SIZE,
    height: TAG_DOT_SIZE,
    borderRadius: radius.full,
  },
  descriptionBack: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  // Personal tag
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  searchBar: {
    flex: 1,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    minWidth: 60,
    height: spacing[10],
    paddingHorizontal: spacing[2],
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray[400],
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[200],
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
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray.white,
  },
  tagChipSelected: {
    backgroundColor: colors.alpha.primary20,
  },
  tagCloseDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.gray[200],
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
