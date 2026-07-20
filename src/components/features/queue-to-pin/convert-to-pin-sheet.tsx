import { useCallback, useEffect, useId, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { DateTimeSheet } from '@/components/domain/schedule/date-time-editor';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { type CardFormValues, type CardItem, type DateTimeDraft } from '@/domains/schedule/model';
import {
  createQueueToPinValuesFromCandidate,
  type RecommendationCandidate,
} from '@/domains/schedule/queue';
import { isValidTimeRange } from '@/hooks/use-time-range-validation';

import type { ScheduleRecommendation } from '@/domains/ai-recommendation/model';
const SHEET_HEADER_MAX_WIDTH = 369;

type SheetMode =
  | 'loading'
  | 'recommend'
  | 'manual'
  | 'error-no-duration'
  | 'error-7day'
  | 'error-14day';

export function ConvertToPinBottomSheet({
  visible,
  card,
  candidates,
  isRecommendationLoading,
  recommendationErrorMode,
  onClose,
  onConvert,
  onAcceptRecommendation,
  onSearch14Days,
  onEditDuration,
}: {
  visible: boolean;
  card: CardItem;
  candidates: ScheduleRecommendation[];
  isRecommendationLoading: boolean;
  recommendationErrorMode: Extract<
    SheetMode,
    'error-no-duration' | 'error-7day' | 'error-14day'
  > | null;
  onClose: () => void;
  onConvert: (values: CardFormValues, keepOriginal: boolean) => void;
  onAcceptRecommendation: (recommendId: number, keepOriginal: boolean) => void;
  onSearch14Days: () => void;
  onEditDuration: () => void;
}) {
  const [mode, setMode] = useState<SheetMode>('loading');
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [keepOriginal, setKeepOriginal] = useState(true);
  const [manualStartDate, setManualStartDate] = useState('');
  const [manualEndDate, setManualEndDate] = useState('');
  const [manualStartTime, setManualStartTime] = useState('14:00');
  const [manualEndTime, setManualEndTime] = useState('15:00');
  const currentCandidate = candidates[candidateIndex] ?? candidates[0];

  useEffect(() => {
    if (!visible) return;

    setCandidateIndex(0);
    setKeepOriginal(true);
  }, [visible]);

  useEffect(() => {
    if (!visible || mode === 'manual') return;

    if (card.durationUnknown) {
      setMode('error-no-duration');
    } else if (isRecommendationLoading) {
      setMode('loading');
    } else if (recommendationErrorMode != null) {
      setMode(recommendationErrorMode);
    } else {
      setMode(candidates.length > 0 ? 'recommend' : 'error-7day');
    }
  }, [
    card.durationUnknown,
    candidates.length,
    isRecommendationLoading,
    mode,
    recommendationErrorMode,
    visible,
  ]);

  const handleAccept = useCallback(() => {
    if (mode === 'manual') {
      const candidate: RecommendationCandidate = {
        id: 'manual',
        date: manualStartDate,
        startTime: manualStartTime,
        endTime: manualEndTime,
        description: '',
      };
      onConvert(createQueueToPinValuesFromCandidate(card, candidate), keepOriginal);
      return;
    }

    if (currentCandidate == null) return;

    onAcceptRecommendation(currentCandidate.recommendId, keepOriginal);
  }, [
    mode,
    manualStartDate,
    manualStartTime,
    manualEndTime,
    currentCandidate,
    card,
    keepOriginal,
    onConvert,
    onAcceptRecommendation,
  ]);

  const handleSwitchToManual = useCallback(() => {
    if (currentCandidate == null) return;
    setManualStartDate(currentCandidate.date);
    setManualEndDate(currentCandidate.date);
    setManualStartTime(currentCandidate.startTime);
    setManualEndTime(currentCandidate.endTime);
    setMode('manual');
  }, [currentCandidate]);

  const handleSearch14Day = useCallback(() => {
    onSearch14Days();
  }, [onSearch14Days]);

  const handleManualDraftChange = useCallback((draft: DateTimeDraft) => {
    setManualStartDate(draft.dateStart);
    setManualEndDate(draft.dateEnd || draft.dateStart);
    setManualStartTime(draft.timeStart);
    setManualEndTime(draft.timeEnd);
  }, []);

  const canAccept =
    mode === 'recommend' ||
    (mode === 'manual' &&
      manualStartDate.length > 0 &&
      manualEndDate.length > 0 &&
      isValidTimeRange(manualStartTime, manualEndTime));
  const showFooter = mode === 'recommend' || mode === 'manual';
  const sheetTitle = mode === 'error-no-duration' ? '소요 시간 확인' : '추천 시간 확인';

  return (
    <>
      <BottomSheet visible={visible} contentStyle={styles.sheetContent} onClose={onClose}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="취소"
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
            {sheetTitle}
          </Typography>
          {showFooter ? (
            <Pressable
              accessibilityLabel="완료"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canAccept }}
              hitSlop={8}
              disabled={!canAccept}
              style={({ pressed }) => [styles.headerAction, pressed && canAccept && styles.pressed]}
              onPress={handleAccept}
            >
              <Typography variant="bodyM" color={canAccept ? colors.primary : colors.gray[300]}>
                완료
              </Typography>
            </Pressable>
          ) : (
            <View style={styles.headerAction} />
          )}
        </View>

        {mode === 'loading' && <LoadingContent />}

        {mode === 'recommend' && (
          <RecommendContent
            candidates={candidates}
            currentIndex={candidateIndex}
            keepOriginal={keepOriginal}
            onChangeIndex={setCandidateIndex}
            onToggleKeepOriginal={() => setKeepOriginal((prev) => !prev)}
          />
        )}

        {mode === 'manual' && (
          <DateTimeSheet
            visible={visible}
            focus="start"
            presentation="embedded"
            value={{
              dateMode: manualEndDate !== manualStartDate ? 'range' : 'single',
              dateStart: manualStartDate,
              dateEnd: manualEndDate !== manualStartDate ? manualEndDate : '',
              timeStart: manualStartTime,
              timeEnd: manualEndTime,
            }}
            onClose={onClose}
            onDone={handleAccept}
            onDraftChange={handleManualDraftChange}
          />
        )}

        {mode === 'error-no-duration' && (
          <ErrorContent
            title="소요 시간이 정해지지 않았어요!"
            description="소요 시간을 입력하면 더 정확한 추천 시간을 찾을 수 있어요."
            buttons={[{ label: '소요시간 변경하기', onPress: onEditDuration }]}
          />
        )}

        {mode === 'error-7day' && (
          <ErrorContent
            title="추천 시간대가 없어요!"
            description={`7일 내로 추천할 시간대를 찾지 못했어요.\n14일 이내의 추천 시간대를 찾아볼까요?`}
            buttons={[
              { label: '다음 주 시간도 보기', onPress: handleSearch14Day },
              { label: '소요 시간 변경하기', onPress: onEditDuration },
            ]}
          />
        )}

        {mode === 'error-14day' && (
          <ErrorContent
            title="추천 시간대가 없어요!"
            description="1~2주 뒤에 다시 찾아보는 걸 추천해요."
            buttons={[{ label: '소요 시간 변경하기', onPress: onEditDuration }]}
          />
        )}

        {showFooter && (
          <View style={styles.footer}>
            <SheetActionButton
              label={mode === 'manual' ? '추천 시간 보기' : '시간 직접 입력'}
              variant="secondary"
              onPress={mode === 'manual' ? () => setMode('recommend') : handleSwitchToManual}
            />
            <SheetActionButton
              label="추천 수락"
              variant="primary"
              disabled={!canAccept}
              onPress={handleAccept}
            />
          </View>
        )}
      </BottomSheet>
    </>
  );
}

// ─── Loading ────────────────────────────────────────────────────────────────

function LoadingContent() {
  return (
    <View style={styles.loadingBox}>
      <View style={styles.loadingHead}>
        <Typography variant="titleS" color={colors.gray[800]} align="center">
          추천 시간 탐색 중
        </Typography>
        <Typography variant="bodyS" color={colors.gray[600]} align="center">
          일정과 컨디션을 분석해 7일 이내의 시간대를 찾고 있어요
        </Typography>
      </View>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
}

// ─── Recommend ──────────────────────────────────────────────────────────────

function RecommendContent({
  candidates,
  currentIndex,
  keepOriginal,
  onChangeIndex,
  onToggleKeepOriginal,
}: {
  candidates: ScheduleRecommendation[];
  currentIndex: number;
  keepOriginal: boolean;
  onChangeIndex: (index: number) => void;
  onToggleKeepOriginal: () => void;
}) {
  const current = candidates[currentIndex];
  const total = candidates.length;

  if (current == null) return null;

  return (
    <View style={styles.recommendWrapper}>
      <View style={styles.candidateCard}>
        {/* Nav row */}
        <View style={styles.candidateNav}>
          <Typography variant="titleS" color={colors.gray[900]}>
            추천 시간 {currentIndex + 1}
          </Typography>
          <View style={styles.candidatePager}>
            <Pressable
              hitSlop={8}
              disabled={currentIndex === 0}
              accessibilityLabel="이전 추천 시간"
              accessibilityRole="button"
              style={({ pressed }) => [pressed && styles.pressed]}
              onPress={() => onChangeIndex(currentIndex - 1)}
            >
              <Icon
                name="arrowLeft"
                size={24}
                color={currentIndex === 0 ? colors.gray[300] : colors.gray[600]}
              />
            </Pressable>
            <Typography variant="bodyS" color={colors.gray[500]}>
              {currentIndex + 1}/{total}
            </Typography>
            <Pressable
              hitSlop={8}
              disabled={currentIndex === total - 1}
              accessibilityLabel="다음 추천 시간"
              accessibilityRole="button"
              style={({ pressed }) => [pressed && styles.pressed]}
              onPress={() => onChangeIndex(currentIndex + 1)}
            >
              <Icon
                name="arrowRight"
                size={24}
                color={currentIndex === total - 1 ? colors.gray[300] : colors.gray[600]}
              />
            </Pressable>
          </View>
        </View>

        {/* Description */}
        <Typography variant="bodyS" color={colors.gray[600]}>
          일정과 컨디션을 바탕으로 가장 적합한 시간대를 찾았어요.
        </Typography>

        {/* Datetime rows */}
        <DatetimeRows date={current.date} startTime={current.startTime} endTime={current.endTime} />
      </View>

      {/* Keep original checkbox */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="기존 큐 카드 유지하기"
        accessibilityState={{ checked: keepOriginal }}
        style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}
        onPress={onToggleKeepOriginal}
      >
        <Typography variant="bodyM" color={colors.gray[600]}>
          기존 큐 카드 유지하기
        </Typography>
        <View style={[styles.checkbox, keepOriginal && styles.checkboxChecked]}>
          {keepOriginal && <Icon name="done" size={14} color={colors.gray.white} />}
        </View>
      </Pressable>
    </View>
  );
}

function DatetimeRows({
  date,
  startTime,
  endTime,
}: {
  date: string;
  startTime: string;
  endTime: string;
}) {
  return (
    <View style={styles.datetimeRows}>
      <View style={styles.datetimeRow}>
        <Typography variant="bodyM" color={colors.gray[600]}>
          시작 일시
        </Typography>
        <View style={styles.datetimeChips}>
          <View style={styles.dateChip}>
            <Typography variant="bodyM" color={colors.gray[800]}>
              {date}
            </Typography>
          </View>
          <View style={styles.timeChip}>
            <Typography variant="bodyM" color={colors.gray[800]}>
              {startTime}
            </Typography>
          </View>
        </View>
      </View>
      <View style={styles.datetimeRow}>
        <Typography variant="bodyM" color={colors.gray[600]}>
          종료 일시
        </Typography>
        <View style={styles.datetimeChips}>
          <View style={styles.dateChip}>
            <Typography variant="bodyM" color={colors.gray[800]}>
              {date}
            </Typography>
          </View>
          <View style={styles.timeChip}>
            <Typography variant="bodyM" color={colors.gray[800]}>
              {endTime}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Error ──────────────────────────────────────────────────────────────────

function ErrorContent({
  title,
  description,
  buttons,
}: {
  title: string;
  description: string;
  buttons: Array<{ label: string; onPress: () => void }>;
}) {
  return (
    <View style={styles.errorBox}>
      <Icon name="warning" variant="badge" size={72} color={colors.gray[200]} />
      <View style={styles.errorTextGroup}>
        <Typography variant="titleS" color={colors.gray[800]} align="center">
          {title}
        </Typography>
        <Typography variant="bodyS" color={colors.gray[500]} align="center">
          {description}
        </Typography>
      </View>
      <View style={[styles.errorButtons, buttons.length > 1 && styles.errorButtonsRow]}>
        {buttons.map((btn) => (
          <SheetActionButton
            key={btn.label}
            label={btn.label}
            variant="secondary"
            style={buttons.length > 1 ? styles.footerFlex : undefined}
            onPress={btn.onPress}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Sheet action button ─────────────────────────────────────────────────────

function SheetActionButton({
  label,
  variant = 'secondary',
  disabled = false,
  style,
  onPress,
}: {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: object;
  onPress: () => void;
}) {
  const gradientId = useId().replace(/:/g, '');
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.sheetBtn,
        isPrimary ? styles.sheetBtnPrimary : styles.sheetBtnSecondary,
        disabled && styles.sheetBtnDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      {isPrimary && !disabled && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.sheetBtnGradientWrap]}>
          <Svg
            style={StyleSheet.absoluteFill}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            <Defs>
              <RadialGradient
                id={gradientId}
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                gradientUnits="objectBoundingBox"
              >
                <Stop offset="0" stopColor={colors.primary} stopOpacity={0.2} />
                <Stop offset="1" stopColor={colors.primary} stopOpacity={1} />
              </RadialGradient>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              rx={radius.md}
              ry={radius.md}
              fill={`url(#${gradientId})`}
            />
          </Svg>
        </View>
      )}
      <Typography
        variant="titleS"
        color={disabled ? colors.gray[300] : isPrimary ? colors.gray.white : colors.gray[600]}
        align="center"
      >
        {label}
      </Typography>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContent: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[15],
  },

  // Header
  header: {
    width: '100%',
    maxWidth: SHEET_HEADER_MAX_WIDTH,
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

  // Loading
  loadingBox: {
    gap: spacing[4],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  loadingHead: {
    gap: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing[12],
  },
  // Recommend wrapper
  recommendWrapper: {
    gap: spacing[3],
  },
  candidateCard: {
    gap: spacing[6],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  candidateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidatePager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },

  // Datetime rows
  datetimeRows: {
    gap: 6,
  },
  datetimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: spacing[8],
  },
  datetimeChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  dateChip: {
    height: spacing[8],
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.alpha.white50,
    borderRadius: radius['2xs'],
  },
  timeChip: {
    width: spacing[15],
    height: spacing[8],
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.alpha.white50,
    borderRadius: radius['2xs'],
  },
  chipActive: {
    backgroundColor: colors.alpha.white70,
  },
  chipSelected: {
    backgroundColor: colors.alpha.white70,
  },

  // Checkbox row
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: spacing[8],
    paddingHorizontal: spacing[1],
  },
  checkbox: {
    width: spacing[6],
    height: spacing[6],
    borderRadius: radius['2xs'],
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Error
  errorBox: {
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  errorTextGroup: {
    gap: spacing[2],
    alignItems: 'center',
  },
  errorButtons: {
    width: '100%',
    gap: spacing[2],
  },
  errorButtonsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  footerFlex: {
    flex: 1,
  },

  // Sheet action buttons
  footer: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  sheetBtn: {
    flex: 1,
    height: spacing[12],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
    paddingHorizontal: spacing[2],
  },
  sheetBtnSecondary: {
    backgroundColor: colors.gray.white,
  },
  sheetBtnPrimary: {
    backgroundColor: colors.primary,
  },
  sheetBtnDisabled: {
    backgroundColor: colors.gray[200],
  },
  sheetBtnGradientWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },

  pressed: {
    opacity: 0.72,
  },
});
