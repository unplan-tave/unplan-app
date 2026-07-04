import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { isValidTimeRange, useTimeRangeValidation } from '@/hooks/use-time-range-validation';
import { type CardFormValues, type CardItem, getCalendarMonth } from '@/state/card/model';
import {
  createQueueToPinValuesFromCandidate,
  formatDueDateForStorage,
  getMockRecommendationCandidates,
  parseDueDateToDate,
  type RecommendationCandidate,
} from '@/state/card/queue';

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TIME_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const TIME_MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const DRUM_ITEM_HEIGHT = 32;
const DRUM_PADDING = 2;
const SHEET_HEADER_MAX_WIDTH = 369;
const DATE_CELL_SIZE = 32;

const LOADING_STEPS = [
  { ongoing: '일정 흐름을 확인하고 있어요...', done: '일정 흐름 확인을 완료했어요.' },
  { ongoing: '소요 시간을 확인하고 있어요...', done: '소요 시간 확인을 완료했어요.' },
  { ongoing: '컨디션 흐름을 확인하고 있어요...', done: '컨디션 흐름 확인을 완료했어요.' },
];

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
  onClose,
  onConvert,
  onEditDuration,
}: {
  visible: boolean;
  card: CardItem;
  onClose: () => void;
  onConvert: (values: CardFormValues, keepOriginal: boolean) => void;
  onEditDuration: () => void;
}) {
  const [mode, setMode] = useState<SheetMode>('loading');
  const [loadingStep, setLoadingStep] = useState(0);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [keepOriginal, setKeepOriginal] = useState(true);
  const [calendarBase, setCalendarBase] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [manualStartTime, setManualStartTime] = useState('14:00');
  const [manualEndTime, setManualEndTime] = useState('15:00');
  const [activeTimeField, setActiveTimeField] = useState<'start' | 'end'>('start');
  const [isTimeWheelVisible, setIsTimeWheelVisible] = useState(false);
  const handleShowCalendar = useCallback(() => setIsTimeWheelVisible(false), []);
  const isReSearchRef = useRef(false);

  const candidates = useMemo(() => getMockRecommendationCandidates(), []);
  const currentCandidate = candidates[candidateIndex] ?? candidates[0];

  useEffect(() => {
    if (!visible) return;

    setLoadingStep(0);
    setCandidateIndex(0);
    setKeepOriginal(true);
    isReSearchRef.current = false;

    if (card.durationUnknown ?? false) {
      setMode('error-no-duration');
    } else {
      setMode('loading');
    }
  }, [visible, card.durationUnknown]);

  useEffect(() => {
    if (!visible || mode !== 'loading') return;

    const t1 = setTimeout(() => setLoadingStep(1), 700);
    const t2 = setTimeout(() => setLoadingStep(2), 1400);
    const t3 = setTimeout(() => setLoadingStep(3), 2100);
    const t4 = setTimeout(() => {
      if (isReSearchRef.current) {
        isReSearchRef.current = false;
        setMode('error-14day');
      } else {
        setMode('recommend');
      }
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [visible, mode]);

  const handleAccept = useCallback(() => {
    let candidate: RecommendationCandidate;

    if (mode === 'manual') {
      candidate = {
        id: 'manual',
        date: selectedDate,
        startTime: manualStartTime,
        endTime: manualEndTime,
        description: '',
      };
    } else {
      if (currentCandidate == null) return;
      candidate = currentCandidate;
    }

    onConvert(createQueueToPinValuesFromCandidate(card, candidate), keepOriginal);
  }, [
    mode,
    selectedDate,
    manualStartTime,
    manualEndTime,
    currentCandidate,
    card,
    keepOriginal,
    onConvert,
  ]);

  const handleSwitchToManual = useCallback(() => {
    if (currentCandidate == null) return;
    const date = parseDueDateToDate(currentCandidate.date) ?? new Date();
    setCalendarBase(date);
    setSelectedDate(currentCandidate.date);
    setManualStartTime(currentCandidate.startTime);
    setManualEndTime(currentCandidate.endTime);
    setActiveTimeField('start');
    setIsTimeWheelVisible(false);
    setMode('manual');
  }, [currentCandidate]);

  const handleUseOneHour = useCallback(() => {
    setLoadingStep(0);
    setMode('loading');
  }, []);

  const handleSearch14Day = useCallback(() => {
    isReSearchRef.current = true;
    setLoadingStep(0);
    setMode('loading');
  }, []);

  const handleSelectTimePart = useCallback(
    (part: 'hour' | 'minute', value: string) => {
      if (activeTimeField === 'start') {
        setManualStartTime((prev) => {
          const [h, m] = prev.split(':');
          return part === 'hour' ? `${value}:${m}` : `${h}:${value}`;
        });
      } else {
        setManualEndTime((prev) => {
          const [h, m] = prev.split(':');
          return part === 'hour' ? `${value}:${m}` : `${h}:${value}`;
        });
      }
    },
    [activeTimeField],
  );

  const canAccept =
    mode === 'recommend' ||
    (mode === 'manual' &&
      selectedDate.length > 0 &&
      isValidTimeRange(manualStartTime, manualEndTime));
  const showFooter = mode === 'recommend' || mode === 'manual';
  const sheetTitle = mode === 'error-no-duration' ? '소요 시간 확인' : '추천 시간 확인';

  return (
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

      {mode === 'loading' && <LoadingContent step={loadingStep} />}

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
        <ManualContent
          calendarBase={calendarBase}
          selectedDate={selectedDate}
          startTime={manualStartTime}
          endTime={manualEndTime}
          activeTimeField={activeTimeField}
          isTimeWheelVisible={isTimeWheelVisible}
          onChangeCalendarBase={setCalendarBase}
          onSelectDate={setSelectedDate}
          onActivateTime={(field) => {
            setActiveTimeField(field);
            setIsTimeWheelVisible(true);
          }}
          onShowCalendar={handleShowCalendar}
          onSelectTimePart={handleSelectTimePart}
        />
      )}

      {mode === 'error-no-duration' && (
        <ErrorContent
          title="소요 시간이 정해지지 않았어요!"
          description={`소요 시간을 입력하면 더 정확하게 추천할 수 있어요.\n지금은 1시간으로 가정해 추천할까요?`}
          buttons={[
            { label: '소요시간 변경하기', onPress: onEditDuration },
            { label: '1시간 기준 추천', onPress: handleUseOneHour },
          ]}
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
  );
}

// ─── Loading ────────────────────────────────────────────────────────────────

function LoadingContent({ step }: { step: number }) {
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
      <View style={styles.loadingItems}>
        {LOADING_STEPS.map((item, index) => {
          const isDone = step > index;
          const isActive = step === index;
          return (
            <View key={item.done} style={styles.loadingItem}>
              {isDone ? (
                <Icon name="done" size={20} color={colors.primary} />
              ) : (
                <ActivityIndicator
                  size="small"
                  color={isActive ? colors.primary : colors.gray[300]}
                />
              )}
              <Typography
                variant="bodyS"
                color={isDone ? colors.gray[800] : isActive ? colors.gray[600] : colors.gray[300]}
              >
                {isDone ? item.done : item.ongoing}
              </Typography>
            </View>
          );
        })}
      </View>
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
  candidates: RecommendationCandidate[];
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
          {current.description}
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

// ─── Manual ─────────────────────────────────────────────────────────────────

function ManualContent({
  calendarBase,
  selectedDate,
  startTime,
  endTime,
  activeTimeField,
  isTimeWheelVisible,
  onChangeCalendarBase,
  onSelectDate,
  onActivateTime,
  onShowCalendar,
  onSelectTimePart,
}: {
  calendarBase: Date;
  selectedDate: string;
  startTime: string;
  endTime: string;
  activeTimeField: 'start' | 'end';
  isTimeWheelVisible: boolean;
  onChangeCalendarBase: (date: Date) => void;
  onSelectDate: (date: string) => void;
  onActivateTime: (field: 'start' | 'end') => void;
  onShowCalendar: () => void;
  onSelectTimePart: (part: 'hour' | 'minute', value: string) => void;
}) {
  const calendar = useMemo(() => getCalendarMonth(calendarBase), [calendarBase]);
  const todayStr = useMemo(() => formatDueDateForStorage(new Date()), []);
  const { isValid: isTimeValid } = useTimeRangeValidation(startTime, endTime);

  return (
    <View style={styles.manualContent}>
      <View style={styles.manualCard}>
        <Typography variant="titleS" color={colors.gray[900]}>
          직접 입력
        </Typography>

        {/* Datetime rows for manual entry */}
        <View
          style={[styles.manualDatetimeSection, !isTimeValid && styles.manualDatetimeSectionError]}
        >
          <View style={styles.datetimeRow}>
            <Typography variant="bodyM" color={colors.gray[600]}>
              시작 일시
            </Typography>
            <View style={styles.datetimeChips}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="날짜 선택"
                style={({ pressed }) => [
                  styles.dateChip,
                  selectedDate.length > 0 && styles.chipActive,
                  pressed && styles.pressed,
                ]}
                onPress={onShowCalendar}
              >
                <Typography
                  variant="bodyM"
                  color={selectedDate.length > 0 ? colors.gray[800] : colors.gray[300]}
                >
                  {selectedDate.length > 0 ? selectedDate : '--.--.--'}
                </Typography>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="시작 시간 선택"
                accessibilityState={{ selected: isTimeWheelVisible && activeTimeField === 'start' }}
                style={({ pressed }) => [
                  styles.timeChip,
                  isTimeWheelVisible && activeTimeField === 'start' && styles.chipSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => onActivateTime('start')}
              >
                <Typography
                  variant="bodyM"
                  color={
                    isTimeWheelVisible && activeTimeField === 'start'
                      ? colors.primary
                      : colors.gray[800]
                  }
                >
                  {startTime}
                </Typography>
              </Pressable>
            </View>
          </View>

          <View style={styles.datetimeRow}>
            <Typography variant="bodyM" color={colors.gray[600]}>
              종료 일시
            </Typography>
            <View style={styles.datetimeChips}>
              <View style={[styles.dateChip, selectedDate.length > 0 && styles.chipActive]}>
                <Typography
                  variant="bodyM"
                  color={selectedDate.length > 0 ? colors.gray[800] : colors.gray[300]}
                >
                  {selectedDate.length > 0 ? selectedDate : '--.--.--'}
                </Typography>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="종료 시간 선택"
                accessibilityState={{ selected: isTimeWheelVisible && activeTimeField === 'end' }}
                style={({ pressed }) => [
                  styles.timeChip,
                  isTimeWheelVisible && activeTimeField === 'end' && styles.chipSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => onActivateTime('end')}
              >
                <Typography
                  variant="bodyM"
                  color={
                    isTimeWheelVisible && activeTimeField === 'end'
                      ? colors.primary
                      : colors.gray[800]
                  }
                >
                  {endTime}
                </Typography>
              </Pressable>
            </View>
          </View>
          {!isTimeValid && (
            <Typography variant="caption" color={colors.secondary}>
              종료 시간이 시작 시간보다 늦어야 해요.
            </Typography>
          )}
        </View>

        {/* Calendar — shows for date picking */}
        {!isTimeWheelVisible && (
          <View style={styles.calendarSection}>
            <View style={styles.calendarMonthRow}>
              <Pressable
                accessibilityLabel="이전 달"
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [styles.monthBtn, pressed && styles.pressed]}
                onPress={() =>
                  onChangeCalendarBase(
                    new Date(calendarBase.getFullYear(), calendarBase.getMonth() - 1, 1),
                  )
                }
              >
                <Icon name="arrowLeft" size={24} color={colors.gray[400]} />
              </Pressable>
              <Typography variant="titleS" color={colors.gray[900]} align="center">
                {calendar.title}
              </Typography>
              <Pressable
                accessibilityLabel="다음 달"
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [styles.monthBtn, pressed && styles.pressed]}
                onPress={() =>
                  onChangeCalendarBase(
                    new Date(calendarBase.getFullYear(), calendarBase.getMonth() + 1, 1),
                  )
                }
              >
                <Icon name="arrowRight" size={24} color={colors.gray[400]} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map((label) => (
                <Typography
                  key={label}
                  variant="caption"
                  color={colors.gray[400]}
                  align="center"
                  style={styles.weekCell}
                >
                  {label}
                </Typography>
              ))}
            </View>

            <View style={styles.dateGrid}>
              {calendar.cells.map((cell) => {
                const isSelected = cell.value === selectedDate;
                const isPast = cell.value.length > 0 && cell.value < todayStr;
                const isEmpty = cell.value.length === 0;
                return (
                  <Pressable
                    key={cell.key}
                    accessibilityRole={isEmpty ? undefined : 'button'}
                    accessibilityLabel={isEmpty ? undefined : `${cell.value} 선택`}
                    accessibilityState={
                      isEmpty ? undefined : { selected: isSelected, disabled: isPast }
                    }
                    disabled={isEmpty || isPast}
                    style={({ pressed }) => [
                      styles.dateCell,
                      pressed && !isEmpty && !isPast && styles.pressed,
                    ]}
                    onPress={() => !isEmpty && !isPast && onSelectDate(cell.value)}
                  >
                    <View style={[styles.dateDot, isSelected && styles.dateDotSelected]}>
                      <Typography
                        variant="bodyM"
                        color={
                          isEmpty
                            ? colors.alpha.transparent
                            : isSelected
                              ? colors.gray.white
                              : isPast
                                ? colors.gray[300]
                                : colors.gray[700]
                        }
                        align="center"
                      >
                        {cell.label}
                      </Typography>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Time wheel — shows when time chip is tapped */}
        {isTimeWheelVisible && (
          <DrumTimePicker
            value={activeTimeField === 'start' ? startTime : endTime}
            onSelectPart={onSelectTimePart}
          />
        )}
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

// ─── Drum time picker ────────────────────────────────────────────────────────

function DrumTimePicker({
  value,
  onSelectPart,
}: {
  value: string;
  onSelectPart: (part: 'hour' | 'minute', value: string) => void;
}) {
  const [hourStr, minuteStr] = (value || '00:00').split(':');
  const hourIndex = Math.max(0, TIME_HOURS.indexOf(hourStr));
  const minuteIndex = Math.max(0, (TIME_MINUTES as string[]).indexOf(minuteStr));

  return (
    <View style={styles.drum}>
      <View style={styles.drumHighlight} pointerEvents="none" />
      <DrumColumn
        items={TIME_HOURS}
        selectedIndex={hourIndex}
        onSelect={(v) => onSelectPart('hour', v)}
      />
      <Typography variant="bodyM" color={colors.gray[900]} align="center">
        :
      </Typography>
      <DrumColumn
        items={TIME_MINUTES as unknown as string[]}
        selectedIndex={minuteIndex}
        onSelect={(v) => onSelectPart('minute', v)}
      />
    </View>
  );
}

function DrumColumn({
  items,
  selectedIndex,
  onSelect,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (value: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * DRUM_ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const handleMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / DRUM_ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      if (items[clamped] !== undefined) {
        onSelect(items[clamped]);
      }
    },
    [items, onSelect],
  );

  const handlePress = useCallback(
    (actualIndex: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, actualIndex));
      scrollRef.current?.scrollTo({ y: clamped * DRUM_ITEM_HEIGHT, animated: true });
      onSelect(items[clamped]);
    },
    [items, onSelect],
  );

  const padded = [...Array(DRUM_PADDING).fill(''), ...items, ...Array(DRUM_PADDING).fill('')];

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.drumColumn}
      showsVerticalScrollIndicator={false}
      snapToInterval={DRUM_ITEM_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onMomentumScrollEnd={handleMomentumScrollEnd}
    >
      {padded.map((item, i) => {
        const actualIndex = i - DRUM_PADDING;
        const isActual = actualIndex >= 0 && actualIndex < items.length;
        const dist = Math.abs(actualIndex - selectedIndex);
        const opacity = !isActual ? 0 : dist === 0 ? 1 : dist === 1 ? 0.45 : 0.18;
        return (
          <Pressable
            key={i}
            style={styles.drumItem}
            disabled={!isActual}
            accessibilityRole={isActual ? 'button' : undefined}
            accessibilityLabel={isActual ? `${item} 선택` : undefined}
            accessibilityState={isActual ? { selected: dist === 0 } : undefined}
            onPress={isActual ? () => handlePress(actualIndex) : undefined}
          >
            <Typography variant="bodyM" color={colors.gray[900]} align="center" style={{ opacity }}>
              {item}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
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
  loadingItems: {
    gap: 4,
  },
  loadingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 28,
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

  // Datetime rows (shared between recommend and manual)
  datetimeRows: {
    gap: 6,
  },
  datetimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: DATE_CELL_SIZE,
  },
  datetimeChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  dateChip: {
    height: DATE_CELL_SIZE,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.alpha.white50,
    borderRadius: radius['2xs'],
  },
  timeChip: {
    width: spacing[15],
    height: DATE_CELL_SIZE,
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
    minHeight: DATE_CELL_SIZE,
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

  // Manual content
  manualContent: {
    gap: spacing[3],
  },
  manualCard: {
    gap: spacing[6],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  manualDatetimeSection: {
    gap: 6,
  },
  manualDatetimeSectionError: {
    gap: spacing[2],
  },

  // Calendar
  calendarSection: {
    gap: spacing[2],
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: spacing[8],
  },
  monthBtn: {
    minWidth: spacing[8],
    minHeight: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekCell: {
    width: '14.285%',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  dateCell: {
    width: '14.285%',
    height: DATE_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDot: {
    width: DATE_CELL_SIZE,
    height: DATE_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DATE_CELL_SIZE / 2,
  },
  dateDotSelected: {
    backgroundColor: colors.primary,
  },

  // Drum picker
  drum: {
    width: '100%',
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  drumHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: DRUM_ITEM_HEIGHT * DRUM_PADDING,
    height: DRUM_ITEM_HEIGHT,
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  drumColumn: {
    width: 40,
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
  },
  drumItem: {
    height: DRUM_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
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
