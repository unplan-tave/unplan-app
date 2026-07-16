import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
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
  onChangeCardType: (value: CardTypeFilter) => void;
  onToggleExpanded: (key: CardListMultiFilterKey) => void;
  onToggleProgressStatus: (value: CardProgressStatus) => void;
  onToggleConditionTag: (value: ConditionTagId) => void;
  onTogglePersonalTag: (value: string) => void;
}) {
  const [scrollX, setScrollX] = useState(0);
  const [anchorX, setAnchorX] = useState<Record<CardListMultiFilterKey, number>>({
    progress: 0,
    condition: 0,
    personal: 0,
  });

  const filters: Array<{
    key: CardListMultiFilterKey;
    label: string;
    summary: string;
    options: DropdownOption[];
    emptyText?: string;
    onToggleOption: (optionKey: string) => void;
  }> = [
    {
      key: 'progress',
      label: '진행 상태 필터',
      summary: getProgressSummary(progressStatuses),
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
      options: personalTags.map((tag) => ({
        key: tag.id,
        label: tag.label,
        selected: personalTagIds.includes(tag.id),
      })),
      emptyText: '등록된 개인 태그가 없어요',
      onToggleOption: onTogglePersonalTag,
    },
  ];

  const expanded = filters.find((filter) => filter.key === expandedFilter) ?? null;
  const expandedActive = expanded != null && expanded.options.some((option) => option.selected);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.row}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => setScrollX(event.nativeEvent.contentOffset.x)}
      >
        <Chip
          label="핀 카드"
          selected={cardType === 'pin'}
          style={styles.chip}
          onPress={() => onChangeCardType(cardType === 'pin' ? 'all' : 'pin')}
        />
        <Chip
          label="큐 카드"
          selected={cardType === 'queue'}
          style={styles.chip}
          onPress={() => onChangeCardType(cardType === 'queue' ? 'all' : 'queue')}
        />
        {filters.map((filter) => {
          const active = filter.options.some((option) => option.selected);

          return (
            <View
              key={filter.key}
              onLayout={(event) => {
                const { x } = event.nativeEvent.layout;
                setAnchorX((prev) =>
                  prev[filter.key] === x ? prev : { ...prev, [filter.key]: x },
                );
              }}
            >
              <MultiFilterChip
                label={filter.label}
                summary={filter.summary}
                active={active}
                onPress={() => onToggleExpanded(filter.key)}
              />
            </View>
          );
        })}
      </ScrollView>

      {expanded != null ? (
        <View
          style={[styles.dropdown, { left: Math.max(anchorX[expanded.key] - scrollX, 0) }]}
          accessibilityLabel={`${expanded.label} 목록`}
        >
          <Pressable
            accessibilityLabel={`${expanded.label} 접기`}
            accessibilityRole="button"
            hitSlop={spacing[1]}
            style={({ pressed }) => [styles.dropdownIcon, pressed && styles.pressed]}
            onPress={() => onToggleExpanded(expanded.key)}
          >
            <Icon
              name="chevronUp"
              size={16}
              color={expandedActive ? colors.chip.selectedText : colors.gray[700]}
            />
          </Pressable>
          <View>
            {expandedActive ? (
              <Pressable
                accessibilityLabel={`${expanded.label} 접기`}
                accessibilityRole="button"
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => onToggleExpanded(expanded.key)}
              >
                <Typography variant="bodyS" color={colors.chip.selectedText} numberOfLines={1}>
                  {expanded.summary}
                </Typography>
              </Pressable>
            ) : null}
            {expanded.options.length === 0 && expanded.emptyText != null ? (
              <Typography variant="bodyS" color={colors.gray[400]}>
                {expanded.emptyText}
              </Typography>
            ) : (
              expanded.options.map((option) => (
                <Pressable
                  key={option.key}
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: option.selected }}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={() => expanded.onToggleOption(option.key)}
                >
                  <Typography
                    variant="bodyS"
                    color={option.selected ? colors.chip.selectedText : colors.gray[700]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Typography>
                </Pressable>
              ))
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
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

  return PROGRESS_OPTIONS.filter((option) => statuses.includes(option.value))
    .map((option) => option.label)
    .join(', ');
}

function getConditionSummary(tagIds: ConditionTagId[]) {
  if (tagIds.length === 0) {
    return '컨디션 태그';
  }

  return CONDITION_TAG_OPTIONS.filter((option) => tagIds.includes(option.id))
    .map((option) => option.label)
    .join(', ');
}

function getPersonalSummary(tagIds: string[], personalTags: PersonalTagOption[]) {
  if (tagIds.length === 0) {
    return '개인 태그';
  }

  return personalTags
    .filter((tag) => tagIds.includes(tag.id))
    .map((tag) => tag.label)
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
  chip: {
    minHeight: 24,
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing[2] + 1,
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
  dropdownIcon: {
    height: 22,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
