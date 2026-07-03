import { useRef, useState } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  type DateMode,
  MEMO_MAX_LENGTH,
  type CardFormValues,
  type RecurrenceValue,
  type TimeFocus,
} from '@/state/card/model';
import { formatRecurrenceChipSegments } from '@/state/card/recurrence';

const BOX_PADDING = spacing[4];
const FIELD_LABEL_WIDTH = 72;
const FIELD_MIN_VALUE_WIDTH = 248;
const TOGGLE_WIDTH = spacing[10];
const TOGGLE_HEIGHT = spacing[6];
const TOGGLE_THUMB_SIZE = 18;
const TOGGLE_THUMB_OFFSET = 3;
const LABEL_GROUP_GAP = 2;
const CHIP_PADDING_V = 6;
const CHIP_CLOSE_LINE_WIDTH = 10;
const CHIP_CLOSE_LINE_HEIGHT = 1;

export function PinFormBody({
  control,
  dateMode,
  dateValue,
  timeFilled,
  timeValue,
  repeatEnabled,
  recurrence,
  showDateError,
  showTimeError,
  onOpenDateTime,
  onOpenLocation,
  onToggleRepeat,
  onPressRepeatChip,
  onRemoveRepeat,
  onMemoFocus,
  onMemoBlur,
  onMemoReachLimit,
}: {
  control: Control<CardFormValues>;
  dateMode: DateMode;
  dateValue: readonly [string, string] | string;
  timeFilled: boolean;
  timeValue: readonly [string, string];
  repeatEnabled: boolean;
  recurrence: RecurrenceValue | null;
  showDateError: boolean;
  showTimeError: boolean;
  onOpenDateTime: (focus: TimeFocus) => void;
  onOpenLocation: () => void;
  onToggleRepeat: () => void;
  onPressRepeatChip: () => void;
  onRemoveRepeat: () => void;
  onMemoFocus?: () => void;
  onMemoBlur?: () => void;
  onMemoReachLimit?: () => void;
}) {
  return (
    <View style={styles.formStack}>
      <FormBox>
        <Controller
          control={control}
          name="dateMode"
          rules={{
            validate: (value) => value !== 'empty',
          }}
          render={() => (
            <FormRow required={dateMode === 'empty'} label="날짜">
              <Pressable
                accessibilityLabel="날짜 선택"
                accessibilityRole="button"
                style={({ pressed }) => [styles.valuePressable, pressed && styles.pressed]}
                onPress={() => onOpenDateTime('start')}
              >
                <DateValue mode={dateMode} value={dateValue} error={showDateError} />
              </Pressable>
            </FormRow>
          )}
        />
        <Divider />
        <Controller
          control={control}
          name="timeFilled"
          rules={{
            validate: (value) => value,
          }}
          render={() => (
            <FormRow required={!timeFilled} label="시간">
              <Pressable
                accessibilityLabel="시간 선택"
                accessibilityRole="button"
                style={({ pressed }) => [styles.valuePressable, pressed && styles.pressed]}
                onPress={() => onOpenDateTime('start')}
              >
                <RangeValue value={timeValue} filled={timeFilled} error={showTimeError} />
              </Pressable>
            </FormRow>
          )}
        />
        <Divider />
        <FormRow label="반복">
          <ToggleSwitch
            value={repeatEnabled}
            accessibilityLabel="반복 설정"
            onPress={onToggleRepeat}
          />
        </FormRow>
        {recurrence != null ? (
          <RepeatSummaryChip
            recurrence={recurrence}
            onPress={onPressRepeatChip}
            onRemove={onRemoveRepeat}
          />
        ) : null}
      </FormBox>

      <FormBox>
        <Controller
          control={control}
          name="location"
          render={({ field: { value } }) => (
            <LocationField location={value} control={control} onOpenLocation={onOpenLocation} />
          )}
        />
      </FormBox>

      <FormBox>
        <MemoField
          control={control}
          onBlur={onMemoBlur}
          onFocus={onMemoFocus}
          onReachLimit={onMemoReachLimit}
        />
      </FormBox>
    </View>
  );
}

function MemoField({
  control,
  onFocus,
  onBlur,
  onReachLimit,
}: {
  control: Control<CardFormValues>;
  onFocus?: () => void;
  onBlur?: () => void;
  onReachLimit?: () => void;
}) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isExpanded = isFocused;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  return (
    <Controller
      control={control}
      name="memo"
      render={({ field: { onChange, value, onBlur: fieldOnBlur } }) => {
        const memoValue = value ?? '';
        const hasMemo = memoValue.trim().length > 0;
        const showFilledLayout = hasMemo || isExpanded;

        const revertToDefault = () => {
          onChange('');
          setIsFocused(false);
          inputRef.current?.blur();
          Keyboard.dismiss();
          onBlur?.();
          fieldOnBlur();
        };

        const handleBlur = () => {
          if (memoValue.trim().length === 0) {
            onChange('');
          }
          setIsFocused(false);
          onBlur?.();
          fieldOnBlur();
        };

        const handleChangeText = (nextValue: string) => {
          const wasUnderLimit = memoValue.length < MEMO_MAX_LENGTH;
          const cappedValue = nextValue.slice(0, MEMO_MAX_LENGTH);
          onChange(cappedValue);

          if (wasUnderLimit && cappedValue.length === MEMO_MAX_LENGTH) {
            onReachLimit?.();
          }
        };

        const handleEnterOnEmpty = () => {
          if (memoValue.trim().length === 0) {
            revertToDefault();
          }
        };

        if (!showFilledLayout) {
          return (
            <FormRow label="메모">
              <Pressable
                accessibilityLabel="메모 입력"
                accessibilityRole="button"
                style={styles.memoDefaultPressable}
                onPress={() => setIsFocused(true)}
              >
                <Typography
                  variant="bodyM"
                  color={colors.gray[400]}
                  style={styles.memoDefaultPlaceholder}
                >
                  메모를 입력해주세요
                </Typography>
              </Pressable>
            </FormRow>
          );
        }

        return (
          <TextInput
            ref={inputRef}
            accessibilityLabel="메모 입력"
            autoFocus
            value={value}
            placeholder="메모를 입력해주세요"
            placeholderTextColor={colors.gray[400]}
            multiline
            style={styles.memoFilledInput}
            textAlignVertical="top"
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Enter') {
                handleEnterOnEmpty();
              }
            }}
          />
        );
      }}
    />
  );
}

function LocationField({
  location,
  control,
  onOpenLocation,
}: {
  location: string;
  control: Control<CardFormValues>;
  onOpenLocation: () => void;
}) {
  const hasLocation = (location ?? '').trim().length > 0;

  if (!hasLocation) {
    return (
      <FormRow label="위치">
        <Pressable
          accessibilityLabel="위치 선택"
          accessibilityRole="button"
          style={({ pressed }) => [styles.valuePressable, pressed && styles.pressed]}
          onPress={onOpenLocation}
        >
          <Typography variant="bodyM" color={colors.gray[400]} numberOfLines={1}>
            위치를 입력해주세요
          </Typography>
        </Pressable>
      </FormRow>
    );
  }

  return (
    <View style={styles.locationFilled}>
      <Pressable
        accessibilityLabel="위치 수정"
        accessibilityRole="button"
        style={({ pressed }) => [styles.locationMainRow, pressed && styles.pressed]}
        onPress={onOpenLocation}
      >
        <Typography variant="bodyM" color={colors.gray[800]}>
          위치
        </Typography>
        <Typography
          variant="bodyM"
          color={colors.gray[600]}
          numberOfLines={1}
          style={styles.locationName}
        >
          {location}
        </Typography>
      </Pressable>
      <Controller
        control={control}
        name="locationDetail"
        render={({ field: { onChange, value } }) => (
          <View style={styles.locationDetailRow}>
            <TextInput
              accessibilityLabel="상세 위치 입력"
              value={value}
              placeholder="상세위치"
              placeholderTextColor={colors.gray[400]}
              style={styles.locationDetailInput}
              onChangeText={onChange}
            />
          </View>
        )}
      />
    </View>
  );
}

function FormBox({ children }: { children: React.ReactNode }) {
  return (
    <Card variant="solid" accessibilityRole="none" style={styles.formBox}>
      {children}
    </Card>
  );
}

function FormRow({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.formRow}>
      <View style={styles.labelGroup}>
        <Typography variant="bodyM" color={colors.gray[800]}>
          {label}
        </Typography>
        {required ? (
          <Typography variant="bodyM" color={colors.secondary} style={styles.requiredMark}>
            *
          </Typography>
        ) : null}
      </View>
      <View style={styles.valueBox}>{children}</View>
    </View>
  );
}

function DateValue({
  mode,
  value,
  error,
}: {
  mode: DateMode;
  value: readonly [string, string] | string;
  error: boolean;
}) {
  if (mode === 'single') {
    return (
      <Typography variant="bodyM" color={colors.gray[600]} numberOfLines={1}>
        {value}
      </Typography>
    );
  }

  return (
    <RangeValue
      value={value as readonly [string, string]}
      filled={mode === 'range'}
      error={error}
    />
  );
}

function RangeValue({
  value,
  filled,
  error = false,
}: {
  value: readonly [string, string];
  filled: boolean;
  error?: boolean;
}) {
  const textColor = error ? colors.secondary : filled ? colors.gray[600] : colors.gray[400];

  return (
    <View style={styles.rangeValue}>
      <Typography variant="bodyM" color={textColor} numberOfLines={1}>
        {value[0]}
      </Typography>
      <Typography variant="bodyM" color={textColor}>
        -
      </Typography>
      <Typography variant="bodyM" color={textColor} numberOfLines={1}>
        {value[1]}
      </Typography>
    </View>
  );
}

function RepeatSummaryChip({
  recurrence,
  onPress,
  onRemove,
}: {
  recurrence: RecurrenceValue;
  onPress: () => void;
  onRemove: () => void;
}) {
  const segments = formatRecurrenceChipSegments(recurrence);

  return (
    <View style={styles.chipRow}>
      <View style={styles.summaryChip}>
        <Pressable
          accessibilityLabel="반복 설정 수정"
          accessibilityRole="button"
          style={({ pressed }) => [styles.summaryChipPressable, pressed && styles.pressed]}
          onPress={onPress}
        >
          <View style={styles.summaryChipTextGroup}>
            {segments.map((segment, index) => (
              <Typography
                key={`${segment.text}-${index}`}
                variant="bodyS"
                color={segment.muted ? colors.gray[300] : colors.gray[600]}
              >
                {segment.text}
              </Typography>
            ))}
          </View>
        </Pressable>
        <View style={styles.chipDivider} />
        <ChipCloseIcon accessibilityLabel="반복 설정 삭제" onPress={onRemove} />
      </View>
    </View>
  );
}

function ChipCloseIcon({
  accessibilityLabel,
  onPress,
}: {
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.chipClose, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.chipCloseForward} />
      <View style={styles.chipCloseBackward} />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function ToggleSwitch({
  value,
  disabled = false,
  accessibilityLabel,
  onPress,
}: {
  value: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.toggle,
        value && styles.toggleEnabled,
        disabled && styles.toggleDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbEnabled]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  formStack: {
    width: '100%',
    gap: spacing[6],
  },
  formBox: {
    width: '100%',
    gap: spacing[2],
    padding: BOX_PADDING,
    borderWidth: 0,
  },
  formRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    paddingLeft: spacing[1],
  },
  labelGroup: {
    width: FIELD_LABEL_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LABEL_GROUP_GAP,
  },
  requiredMark: {
    lineHeight: 18,
  },
  valueBox: {
    minWidth: FIELD_MIN_VALUE_WIDTH,
    flex: 1,
    minHeight: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  valuePressable: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rangeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  locationFilled: {
    gap: spacing[2],
    paddingLeft: spacing[1],
  },
  locationMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    minHeight: 42,
  },
  locationName: {
    flex: 1,
    textAlign: 'right',
  },
  locationDetailRow: {
    minHeight: 42,
    justifyContent: 'center',
  },
  locationDetailInput: {
    ...typography.bodyM,
    flex: 1,
    color: colors.gray[600],
    textAlign: 'right',
    paddingVertical: spacing[2],
  },
  memoDefaultPressable: {
    flex: 1,
    minWidth: 0,
    minHeight: spacing[6],
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.sm,
  },
  memoDefaultPlaceholder: {
    textAlign: 'right',
  },
  memoFilledInput: {
    ...typography.bodyM,
    width: '100%',
    minHeight: spacing[6],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    paddingLeft: spacing[1],
    color: colors.gray[600],
    textAlignVertical: 'top',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[50],
  },
  toggle: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.gray[400],
  },
  toggleEnabled: {
    backgroundColor: colors.primary,
  },
  toggleDisabled: {
    backgroundColor: colors.gray[400],
  },
  toggleThumb: {
    width: TOGGLE_THUMB_SIZE,
    height: TOGGLE_THUMB_SIZE,
    marginLeft: TOGGLE_THUMB_OFFSET,
    borderRadius: radius.full,
    backgroundColor: colors.gray.white,
  },
  toggleThumbEnabled: {
    marginLeft: TOGGLE_WIDTH - TOGGLE_THUMB_SIZE - TOGGLE_THUMB_OFFSET,
  },
  chipRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: spacing[1],
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingRight: spacing[3],
    paddingVertical: CHIP_PADDING_V,
    borderRadius: radius.xs,
    backgroundColor: colors.gray[50],
  },
  summaryChipPressable: {
    flexShrink: 1,
    paddingLeft: spacing[3],
  },
  summaryChipTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  chipDivider: {
    width: 1,
    height: spacing[4],
    backgroundColor: colors.gray[200],
  },
  chipClose: {
    width: spacing[4],
    height: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCloseForward: {
    position: 'absolute',
    width: CHIP_CLOSE_LINE_WIDTH,
    height: CHIP_CLOSE_LINE_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.gray[300],
    transform: [{ rotate: '45deg' }],
  },
  chipCloseBackward: {
    position: 'absolute',
    width: CHIP_CLOSE_LINE_WIDTH,
    height: CHIP_CLOSE_LINE_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.gray[300],
    transform: [{ rotate: '-45deg' }],
  },
  pressed: {
    opacity: 0.72,
  },
});
