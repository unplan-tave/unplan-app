import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { CONDITION_TAG_OPTIONS } from '@/state/pin-card/data';
import { type ConditionTagId, getConditionTagDescription } from '@/state/pin-card/model';

const TAG_DOT_SIZE = 5.411;

export function ConditionTagBottomSheet({
  visible,
  selectedTagId,
  onClose,
  onSelect,
  onDone,
}: {
  visible: boolean;
  selectedTagId: ConditionTagId | null;
  onClose: () => void;
  onSelect: (tagId: ConditionTagId) => void;
  onDone: () => void;
}) {
  const [viewMode, setViewMode] = useState<'list' | 'description'>('list');
  const canDone = selectedTagId != null;

  useEffect(() => {
    if (visible) {
      setViewMode('list');
    }
  }, [visible]);

  return (
    <BottomSheet visible={visible} contentStyle={styles.tagSheet} onClose={onClose}>
      <View style={styles.sheetHeader}>
        <Pressable
          accessibilityLabel="태그 선택 취소"
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
          태그
        </Typography>
        <Pressable
          accessibilityLabel="태그 선택 완료"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canDone }}
          disabled={!canDone}
          hitSlop={8}
          style={({ pressed }) => [styles.sheetHeaderAction, pressed && styles.pressed]}
          onPress={onDone}
        >
          <Typography variant="bodyM" color={canDone ? colors.primary : colors.gray[400]}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.tagSheetContent}>
        <View style={styles.tagSheetTabs}>
          <View style={styles.tagSheetTabHighlight} />
          <Typography
            variant="bodyS"
            color={colors.gray[800]}
            align="center"
            style={styles.tagSheetTabLabel}
          >
            컨디션 태그
          </Typography>
          <Typography
            variant="bodyS"
            color={colors.gray[600]}
            align="center"
            style={styles.tagSheetTabLabel}
          >
            개인 태그
          </Typography>
        </View>

        {viewMode === 'list' ? (
          <ConditionTagListPanel
            selectedTagId={selectedTagId}
            onSelect={onSelect}
            onOpenDescription={() => setViewMode('description')}
          />
        ) : (
          <ConditionTagDescriptionPanel
            selectedTagId={selectedTagId}
            onBack={() => setViewMode('list')}
          />
        )}
      </View>
    </BottomSheet>
  );
}

function ConditionTagListPanel({
  selectedTagId,
  onSelect,
  onOpenDescription,
}: {
  selectedTagId: ConditionTagId | null;
  onSelect: (tagId: ConditionTagId) => void;
  onOpenDescription: () => void;
}) {
  return (
    <View style={styles.tagSheetPanel}>
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
    </View>
  );
}

function ConditionTagDescriptionPanel({
  selectedTagId,
  onBack,
}: {
  selectedTagId: ConditionTagId | null;
  onBack: () => void;
}) {
  return (
    <View style={styles.tagSheetPanel}>
      <Typography variant="bodyS" color={colors.gray[700]} style={styles.tagDescriptionIntro}>
        일정에 맞는 컨디션 태그를 선택하면 현재 컨디션에 수행하기 적합한지 알려드려요
      </Typography>
      <View style={styles.divider} />
      <View style={styles.tagDescriptionList}>
        {CONDITION_TAG_OPTIONS.map((tag) => {
          const selected = tag.id === selectedTagId;
          const description = getConditionTagDescription(tag.id);

          return (
            <View key={tag.id} style={styles.tagDescriptionItem}>
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
        style={({ pressed }) => [styles.tagDescriptionBack, pressed && styles.pressed]}
        onPress={onBack}
      >
        <Typography variant="caption" color={colors.gray[600]}>
          ‹
        </Typography>
        <Typography variant="caption" color={colors.gray[600]}>
          컨디션 태그 목록
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tagSheet: {
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
  tagSheetContent: {
    width: '100%',
    gap: spacing[3],
  },
  tagSheetTabs: {
    width: '100%',
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.gray[200],
  },
  tagSheetTabHighlight: {
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
  tagSheetTabLabel: {
    flex: 1,
  },
  tagSheetPanel: {
    width: '100%',
    gap: spacing[6],
    padding: spacing[3],
    borderRadius: radius.modal,
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
    borderRadius: radius.xs,
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
  tagDescriptionIntro: {
    width: '100%',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[50],
  },
  tagDescriptionList: {
    width: '100%',
    gap: spacing[3],
  },
  tagDescriptionItem: {
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
    borderRadius: radius.xs,
    backgroundColor: colors.gray.white,
  },
  tagDot: {
    width: TAG_DOT_SIZE,
    height: TAG_DOT_SIZE,
    borderRadius: radius.full,
  },
  tagDescriptionBack: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  pressed: {
    opacity: 0.72,
  },
});
