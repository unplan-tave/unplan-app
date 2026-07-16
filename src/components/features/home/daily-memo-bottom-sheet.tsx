import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamilyWeight, radius, spacing, typography } from '@/constants/theme';
import {
  DAILY_MEMO_MAX_COUNT,
  DAILY_MEMO_MAX_LENGTH,
  type DailyMemo,
} from '@/domains/daily-memo/model';
import { t } from '@/lib/i18n';

interface DailyMemoBottomSheetProps {
  visible: boolean;
  dateLabel: string;
  memos: DailyMemo[];
  isLoading: boolean;
  isError: boolean;
  hasMutationError: boolean;
  isCreating: boolean;
  deletingMemoId: number | null;
  onClose: () => void;
  onRetry: () => void;
  onCreate: (content: string) => Promise<void>;
  onDelete: (id: number) => void;
}

export function DailyMemoBottomSheet({
  visible,
  dateLabel,
  memos,
  isLoading,
  isError,
  hasMutationError,
  isCreating,
  deletingMemoId,
  onClose,
  onRetry,
  onCreate,
  onDelete,
}: DailyMemoBottomSheetProps) {
  const [content, setContent] = useState('');
  const normalizedContent = content.trim();
  const isAtLimit = memos.length >= DAILY_MEMO_MAX_COUNT;
  const canSubmit = normalizedContent.length > 0 && !isAtLimit && !isCreating;

  useEffect(() => {
    if (!visible) {
      setContent('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await onCreate(normalizedContent);
      setContent('');
    } catch {
      // The screen keeps the input intact and renders the shared mutation error below.
    }
  };

  return (
    <BottomSheet
      visible={visible}
      avoidKeyboard
      onClose={onClose}
      contentStyle={styles.sheetContent}
    >
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onClose} hitSlop={spacing[2]}>
          <Typography variant="caption" color={colors.primary}>
            {t('common.cancel')}
          </Typography>
        </Pressable>
        <Typography variant="caption" color={colors.gray[800]}>
          {t('home.dailyMemo.title')}
        </Typography>
        <Pressable accessibilityRole="button" onPress={onClose} hitSlop={spacing[2]}>
          <Typography variant="caption" color={colors.primary}>
            {t('common.done')}
          </Typography>
        </Pressable>
      </View>

      <View style={styles.memoCard}>
        <Typography variant="bodyS" color={colors.gray[800]} style={styles.dateLabel}>
          {dateLabel}
        </Typography>

        {isLoading ? (
          <View style={styles.stateRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}

        {isError ? (
          <Pressable accessibilityRole="button" style={styles.stateRow} onPress={onRetry}>
            <Typography variant="caption" color={colors.secondary}>
              {t('home.dailyMemo.loadError')}
            </Typography>
          </Pressable>
        ) : null}

        {!isLoading && !isError
          ? memos.map((memo) => (
              <View key={memo.id} style={styles.memoRow}>
                <Typography
                  variant="caption"
                  color={colors.gray[700]}
                  numberOfLines={2}
                  style={styles.memoText}
                >
                  {memo.content}
                </Typography>
                <Pressable
                  accessibilityLabel={t('home.dailyMemo.deleteAccessibilityLabel').replace(
                    '{content}',
                    memo.content,
                  )}
                  accessibilityRole="button"
                  disabled={deletingMemoId != null}
                  hitSlop={spacing[2]}
                  onPress={() => onDelete(memo.id)}
                >
                  {deletingMemoId === memo.id ? (
                    <ActivityIndicator size="small" color={colors.gray[400]} />
                  ) : (
                    <Icon name="cancel" size={16} color={colors.gray[400]} />
                  )}
                </Pressable>
              </View>
            ))
          : null}

        {!isLoading && !isError && !isAtLimit ? (
          <View style={styles.inputRow}>
            <TextInput
              value={content}
              accessibilityLabel={t('home.dailyMemo.inputAccessibilityLabel')}
              blurOnSubmit={false}
              maxLength={DAILY_MEMO_MAX_LENGTH}
              placeholder={t('home.dailyMemo.placeholder')}
              placeholderTextColor={colors.gray[300]}
              returnKeyType="done"
              style={styles.input}
              onChangeText={setContent}
              onSubmitEditing={() => void handleSubmit()}
            />
            {content.length > 0 ? (
              <Pressable
                accessibilityLabel={t('home.dailyMemo.clearInput')}
                accessibilityRole="button"
                hitSlop={spacing[2]}
                onPress={() => setContent('')}
              >
                <Icon name="cancel" size={16} color={colors.gray[400]} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {hasMutationError ? (
        <Typography variant="caption" color={colors.secondary} align="center">
          {t('home.dailyMemo.mutationError')}
        </Typography>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        style={[styles.addButton, !canSubmit && styles.addButtonDisabled]}
        onPress={() => void handleSubmit()}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color={colors.gray[400]} />
        ) : (
          <>
            <Icon name="plus" size={16} color={canSubmit ? colors.gray[500] : colors.gray[300]} />
            <Typography variant="caption" color={canSubmit ? colors.gray[500] : colors.gray[300]}>
              {isAtLimit
                ? t('home.dailyMemo.maxCount').replace('{count}', String(DAILY_MEMO_MAX_COUNT))
                : t('home.dailyMemo.add')}
            </Typography>
          </>
        )}
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    gap: spacing[2],
    paddingHorizontal: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[1],
  },
  memoCard: {
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white70,
  },
  dateLabel: {
    fontFamily: fontFamilyWeight.semiBold,
  },
  memoRow: {
    minHeight: spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: radius.sm,
    backgroundColor: colors.alpha.white70,
  },
  memoText: {
    flex: 1,
  },
  inputRow: {
    minHeight: spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: radius.sm,
    backgroundColor: colors.alpha.white70,
  },
  input: {
    ...typography.caption,
    minWidth: 0,
    flex: 1,
    paddingVertical: 0,
    color: colors.gray[700],
  },
  stateRow: {
    minHeight: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    minHeight: spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    borderRadius: radius.sm,
    backgroundColor: colors.alpha.white70,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
});
