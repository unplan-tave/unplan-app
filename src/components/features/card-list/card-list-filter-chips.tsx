import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { CONDITION_TAG_OPTIONS } from '@/domains/schedule/data';

import type { CardListMultiFilterKey, CardTypeFilter } from '@/domains/schedule/list';
import type {
  CardProgressStatus,
  ConditionTagId,
  PersonalTagOption,
} from '@/domains/schedule/model';

const PROGRESS_OPTIONS: Array<{ value: CardProgressStatus; label: string }> = [
  { value: 'incomplete', label: '미완료' },
  { value: 'in_progress', label: '진행중' },
  { value: 'complete', label: '완료' },
];

const CARD_TYPE_OPTIONS: Array<{ value: CardTypeFilter; label: string }> = [
  { value: 'all', label: '전체 카드' },
  { value: 'pin', label: '핀 카드' },
  { value: 'queue', label: '큐 카드' },
];

interface DropdownOption {
  key: string;
  label: string;
  selected: boolean;
}

export function CardListFilterChips({
  cardType,
  progressStatuses,
  conditionTagIds,
  personalTagIds,
  expandedFilter,
  personalTags,
  isPersonalTagsLoading = false,
  isPersonalTagsError = false,
  onChangeCardType,
  onToggleExpanded,
  onToggleProgressStatus,
  onToggleConditionTag,
  onTogglePersonalTag,
}: {
  cardType: CardTypeFilter;
  progressStatuses: CardProgressStatus[];
  conditionTagIds: ConditionTagId[];
  personalTagIds: string[];
  expandedFilter: CardListMultiFilterKey | null;
  personalTags: PersonalTagOption[];
  isPersonalTagsLoading?: boolean;
  isPersonalTagsError?: boolean;
  onChangeCardType: (value: CardTypeFilter) => void;
  onToggleExpanded: (key: CardListMultiFilterKey) => void;
  onToggleProgressStatus: (value: CardProgressStatus) => void;
  onToggleConditionTag: (value: ConditionTagId) => void;
  onTogglePersonalTag: (value: string) => void;
}) {
  const [scrollX, setScrollX] = useState(0);
  const [anchors, setAnchors] = useState<Record<CardListMultiFilterKey, { x: number; y: number }>>({
    cardType: { x: 0, y: 0 },
    progress: { x: 0, y: 0 },
    condition: { x: 0, y: 0 },
    personal: { x: 0, y: 0 },
  });
  const [dropdownWidths, setDropdownWidths] = useState<Record<CardListMultiFilterKey, number>>({
    cardType: 0,
    progress: 0,
    condition: 0,
    personal: 0,
  });

  const filters: Array<{
    key: CardListMultiFilterKey;
    label: string;
    summary: string;
    isActive: boolean;
    options: DropdownOption[];
    emptyText?: string;
    onToggleOption: (optionKey: string) => void;
  }> = [
    {
      key: 'cardType',
      label: '카드 타입 필터',
      summary: getCardTypeSummary(cardType),
      isActive: true,
      options: CARD_TYPE_OPTIONS.map((option) => ({
        key: option.value,
        label: option.label,
        selected: cardType === option.value,
      })),
      onToggleOption: (optionKey) => onChangeCardType(optionKey as CardTypeFilter),
    },
    {
      key: 'progress',
      label: '진행 상태 필터',
      summary: getProgressSummary(progressStatuses),
      isActive: progressStatuses.length > 0,
      options: PROGRESS_OPTIONS.map((option) => ({
        key: option.value,
        label: option.label,
        selected: progressStatuses.includes(option.value),
      })),
      onToggleOption: (optionKey) => onToggleProgressStatus(optionKey as CardProgressStatus),
    },
    {
      key: 'condition',
      label: '컨디션 태그 필터',
      summary: getConditionSummary(conditionTagIds),
      isActive: conditionTagIds.length > 0,
      options: CONDITION_TAG_OPTIONS.map((option) => ({
        key: option.id,
        label: option.label,
        selected: conditionTagIds.includes(option.id),
      })),
      onToggleOption: (optionKey) => onToggleConditionTag(optionKey as ConditionTagId),
    },
    {
      key: 'personal',
      label: '개인 태그 필터',
      summary: getPersonalSummary(personalTagIds, personalTags),
      isActive: personalTagIds.length > 0,
      options: personalTags.map((tag) => ({
        key: tag.id,
        label: tag.label,
        selected: personalTagIds.includes(tag.id),
      })),
      emptyText: '등록된\n개인태그가\n없어요!',
      onToggleOption: onTogglePersonalTag,
    },
  ];

  const expanded = filters.find((filter) => filter.key === expandedFilter) ?? null;
  const selectedOptions = expanded?.options.filter((option) => option.selected) ?? [];
  const unselectedOptions = expanded?.options.filter((option) => !option.selected) ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.row}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => setScrollX(event.nativeEvent.contentOffset.x)}
      >
        {filters.map((filter) => {
          return (
            <View
              key={filter.key}
              pointerEvents={expandedFilter === filter.key ? 'none' : 'auto'}
              style={[
                expandedFilter === filter.key && styles.expandedChipAnchor,
                expandedFilter === filter.key && dropdownWidths[filter.key] > 0
                  ? { width: dropdownWidths[filter.key] }
                  : undefined,
              ]}
              onLayout={(event) => {
                const { x, y } = event.nativeEvent.layout;
                setAnchors((previous) => {
                  const current = previous[filter.key];
                  return current.x === x && current.y === y
                    ? previous
                    : { ...previous, [filter.key]: { x, y } };
                });
              }}
            >
              <MultiFilterChip
                label={filter.label}
                summary={filter.summary}
                active={filter.isActive}
                onPress={() => onToggleExpanded(filter.key)}
              />
            </View>
          );
        })}
      </ScrollView>

      {expanded != null ? (
        <View
          style={[
            styles.dropdown,
            {
              top: anchors[expanded.key].y,
              left: Math.max(anchors[expanded.key].x - scrollX, 0),
            },
          ]}
          accessibilityLabel={`${expanded.label} 목록`}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setDropdownWidths((previous) =>
              previous[expanded.key] === width ? previous : { ...previous, [expanded.key]: width },
            );
          }}
        >
          <Pressable
            accessibilityLabel={`${expanded.label} 접기`}
            accessibilityRole="button"
            hitSlop={spacing[1]}
            style={({ pressed }) => [styles.dropdownIcon, pressed && styles.pressed]}
            onPress={() => onToggleExpanded(expanded.key)}
          >
            <Icon name="chevronUp" size={16} color={colors.gray[700]} />
          </Pressable>
          <View>
            <View>
              {expanded.key === 'personal' && isPersonalTagsLoading ? (
                <Typography variant="bodyS" color={colors.gray[400]}>
                  개인 태그를 불러오는 중이에요
                </Typography>
              ) : expanded.key === 'personal' && isPersonalTagsError ? (
                <Typography variant="bodyS" color={colors.gray[400]}>
                  개인 태그를 불러오지 못했어요
                </Typography>
              ) : (
                <>
                  {selectedOptions.length > 0 ? (
                    <View style={styles.selectedOptionsRow}>
                      {selectedOptions.map((option, index) => (
                        <Pressable
                          key={option.key}
                          accessibilityLabel={`${option.label} 선택 해제`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: true }}
                          style={({ pressed }) => pressed && styles.pressed}
                          onPress={() => expanded.onToggleOption(option.key)}
                        >
                          <Typography variant="bodyS" color={colors.chip.selectedText}>
                            {option.label}
                            {index < selectedOptions.length - 1 ? ', ' : ''}
                          </Typography>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                  {expanded.options.length === 0 && expanded.emptyText != null ? (
                    <Typography variant="bodyS" color={colors.gray[400]} style={styles.emptyText}>
                      {expanded.emptyText}
                    </Typography>
                  ) : (
                    unselectedOptions.map((option) => (
                      <Pressable
                        key={option.key}
                        accessibilityLabel={option.label}
                        accessibilityRole="button"
                        accessibilityState={{ selected: option.selected }}
                        style={({ pressed }) => pressed && styles.pressed}
                        onPress={() => expanded.onToggleOption(option.key)}
                      >
                        <Typography variant="bodyS" color={colors.gray[700]}>
                          {option.label}
                        </Typography>
                      </Pressable>
                    ))
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function getCardTypeSummary(cardType: CardTypeFilter) {
  return CARD_TYPE_OPTIONS.find((option) => option.value === cardType)?.label ?? '전체 카드';
}

function MultiFilterChip({
  label,
  summary,
  active,
  onPress,
}: {
  label: string;
  summary: string;
  active: boolean;
  onPress: () => void;
}) {
  const contentColor = active ? colors.chip.selectedText : colors.gray[700];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.multiChip,
        active && styles.multiChipActive,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Icon name="chevronDown" size={16} color={contentColor} />
      <Typography variant="bodyS" color={contentColor}>
        {summary}
      </Typography>
    </Pressable>
  );
}

function getProgressSummary(statuses: CardProgressStatus[]) {
  if (statuses.length === 0) {
    return '진행 상태';
  }

  return statuses
    .map((status) => PROGRESS_OPTIONS.find((option) => option.value === status)?.label)
    .filter((label): label is string => label != null)
    .join(', ');
}

function getConditionSummary(tagIds: ConditionTagId[]) {
  if (tagIds.length === 0) {
    return '컨디션 태그';
  }

  return tagIds
    .map((tagId) => CONDITION_TAG_OPTIONS.find((option) => option.id === tagId)?.label)
    .filter((label): label is string => label != null)
    .join(', ');
}

function getPersonalSummary(tagIds: string[], personalTags: PersonalTagOption[]) {
  if (tagIds.length === 0) {
    return '개인 태그';
  }

  return tagIds
    .map((tagId) => personalTags.find((tag) => tag.id === tagId)?.label)
    .filter((label): label is string => label != null)
    .join(', ');
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingRight: spacing[1],
  },
  multiChip: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing[2] - 1,
    paddingRight: spacing[2] + 1,
    borderRadius: radius['2xl'],
    backgroundColor: colors.gray.white,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  multiChipActive: {
    backgroundColor: colors.chip.selectedBackground,
    borderColor: colors.primary,
  },
  dropdown: {
    position: 'absolute',
    top: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2] + 2,
    paddingVertical: spacing[2] - 2,
    paddingLeft: spacing[1] + 1,
    paddingRight: spacing[2] + 2,
    borderRadius: radius['2xl'],
    backgroundColor: colors.gray.white,
  },
  expandedChipAnchor: {
    opacity: 0,
  },
  selectedOptionsRow: {
    flexDirection: 'row',
  },
  emptyText: {
    textAlign: 'center',
  },
  dropdownIcon: {
    height: 22,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
