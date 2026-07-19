import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
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
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const normalizedContent = content.trim();
  const isAtLimit = memos.length >= DAILY_MEMO_MAX_COUNT;
  const canAdd = !isAtLimit && !isCreating;
  const canSubmit = normalizedContent.length > 0 && !isAtLimit && !isCreating;

  useEffect(() => {
    if (!visible) {
      setContent('');
      setIsComposing(false);
    }
  }, [visible]);

  // 편집 모드로 전환되면 새 초안 행에 포커스를 줘 키보드를 띄운다.
  useEffect(() => {
    if (isComposing) {
      inputRef.current?.focus();
    }
  }, [isComposing]);

  const handleStartComposing = () => {
    if (!canAdd) {
      return;
    }
    setIsComposing(true);
    inputRef.current?.focus();
  };

  const handleCancelComposing = () => {
    setContent('');
    setIsComposing(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await onCreate(normalizedContent);
      // 커밋 후 편집 모드를 종료해 키보드를 닫는다. 추가 입력은 다시 "메모 추가하기"로 진입한다.
      setContent('');
      setIsComposing(false);
    } catch {
      // The screen keeps the input intact and renders the shared mutation error below.
    }
  };

  return (
    <BottomSheet visible={visible} avoidKeyboard onClose={onClose}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onClose} hitSlop={spacing[2]}>
          <Typography variant="bodyM" color={colors.primary}>
            {t('common.cancel')}
          </Typography>
        </Pressable>
        <Typography variant="bodyM" color={colors.gray[900]}>
          {t('home.dailyMemo.title')}
        </Typography>
        <Pressable accessibilityRole="button" onPress={onClose} hitSlop={spacing[2]}>
          <Typography variant="bodyM" color={colors.primary}>
            {t('common.done')}
          </Typography>
        </Pressable>
      </View>

      <View style={styles.memoCard}>
        <Typography variant="titleS" color={colors.gray[900]} style={styles.dateLabel}>
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
                  variant="bodyM"
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
                  style={styles.rowAction}
                  onPress={() => onDelete(memo.id)}
                >
                  <View style={styles.rowActionDivider} />
                  {deletingMemoId === memo.id ? (
                    <ActivityIndicator size="small" color={colors.gray[400]} />
                  ) : (
                    <Icon name="cancel" size={24} color={colors.gray[400]} />
                  )}
                </Pressable>
              </View>
            ))
          : null}

        {!isLoading && !isError && isComposing && !isAtLimit ? (
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={content}
              accessibilityLabel={t('home.dailyMemo.inputAccessibilityLabel')}
              blurOnSubmit={false}
              maxLength={DAILY_MEMO_MAX_LENGTH}
              placeholder={t('home.dailyMemo.placeholder')}
              placeholderTextColor={colors.gray[400]}
              returnKeyType="done"
              style={styles.input}
              onChangeText={setContent}
              onSubmitEditing={() => void handleSubmit()}
            />
            <Pressable
              accessibilityLabel={t('home.dailyMemo.clearInput')}
              accessibilityRole="button"
              hitSlop={spacing[2]}
              style={styles.rowAction}
              onPress={handleCancelComposing}
            >
              <View style={styles.rowActionDivider} />
              <Icon name="cancel" size={24} color={colors.gray[400]} />
            </Pressable>
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
        disabled={!canAdd}
        style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
        onPress={handleStartComposing}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color={colors.gray[400]} />
        ) : (
          <>
            <Icon name="plus" size={24} color={canAdd ? colors.gray[500] : colors.gray[300]} />
            <Typography variant="bodyM" color={canAdd ? colors.gray[500] : colors.gray[300]}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[1],
  },
  memoCard: {
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white70,
  },
  dateLabel: {
    paddingTop: spacing[1],
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },
  memoRow: {
    minHeight: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white70,
  },
  memoText: {
    flex: 1,
  },
  inputRow: {
    minHeight: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white70,
  },
  input: {
    ...typography.bodyM,
    minWidth: 0,
    flex: 1,
    paddingVertical: 0,
    color: colors.gray[700],
  },
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  rowActionDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.gray[300],
  },
  stateRow: {
    minHeight: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    minHeight: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white70,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
});
