import { useRef, useState } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { MEMO_MAX_LENGTH, type CardFormValues } from '@/domains/card/model';
import {
  formatDueCountdown,
  formatDueDateDisplay,
  formatDurationInline,
  hasDueDate,
  hasQueueDurationOrUnknown,
  UNKNOWN_DURATION_LABEL,
} from '@/domains/card/queue';

const BOX_PADDING = spacing[4];
const FIELD_LABEL_WIDTH = 72;
const FIELD_MIN_VALUE_WIDTH = 248;
const LABEL_GROUP_GAP = 2;

export function QueueFormBody({
  control,
  dueDate = '',
  durationHours = 0,
  durationMinutes = 0,
  durationUnknown = false,
  showDueError = false,
  showDurationError = false,
  onOpenDueDuration,
  onOpenLocation,
  onMemoFocus,
  onMemoBlur,
  onMemoReachLimit,
}: {
  control: Control<CardFormValues>;
  dueDate?: string;
  durationHours?: number;
  durationMinutes?: number;
  durationUnknown?: boolean;
  showDueError?: boolean;
  showDurationError?: boolean;
  onOpenDueDuration?: () => void;
  onOpenLocation: () => void;
  onMemoFocus?: () => void;
  onMemoBlur?: () => void;
  onMemoReachLimit?: () => void;
}) {
  return (
    <View style={styles.formStack}>
      <FormBox>
        <FormRow required={!hasDueDate(dueDate)} label="마감일">
          <Pressable
            accessibilityLabel="마감일 선택"
            accessibilityRole="button"
            style={({ pressed }) => [styles.valuePressable, pressed && styles.pressed]}
            onPress={onOpenDueDuration}
          >
            <DueDateValue dueDate={dueDate} error={showDueError} />
          </Pressable>
        </FormRow>
        <Divider />
        <FormRow
          required={!hasQueueDurationOrUnknown(durationHours, durationMinutes, durationUnknown)}
          label="소요시간"
        >
          <Pressable
            accessibilityLabel="소요시간 선택"
            accessibilityRole="button"
            style={({ pressed }) => [styles.valuePressable, pressed && styles.pressed]}
            onPress={onOpenDueDuration}
          >
            <DurationValue
              hours={durationHours}
              minutes={durationMinutes}
              durationUnknown={durationUnknown}
              error={showDurationError}
            />
          </Pressable>
        </FormRow>
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

function DueDateValue({ dueDate, error }: { dueDate: string; error: boolean }) {
  const filled = hasDueDate(dueDate);
  const dateText = formatDueDateDisplay(dueDate);
  const countdown = formatDueCountdown(dueDate);
  const dateColor = error ? colors.secondary : filled ? colors.gray[600] : colors.gray[400];
  const countdownColor = error ? colors.secondary : colors.gray[400];

  return (
    <View style={styles.queueDueValue}>
      <Typography variant="bodyM" color={dateColor} numberOfLines={1}>
        {dateText}
      </Typography>
      <Typography variant="bodyM" color={dateColor}>
        까지
      </Typography>
      <View style={styles.queueVerticalDivider} />
      <Typography variant="bodyM" color={countdownColor}>
        {countdown}
      </Typography>
    </View>
  );
}

function DurationValue({
  hours,
  minutes,
  durationUnknown,
  error,
}: {
  hours: number;
  minutes: number;
  durationUnknown: boolean;
  error: boolean;
}) {
  if (durationUnknown) {
    return (
      <Typography
        variant="bodyM"
        color={error ? colors.secondary : colors.gray[600]}
        numberOfLines={1}
      >
        {UNKNOWN_DURATION_LABEL}
      </Typography>
    );
  }

  const filled = hours > 0 || minutes > 0;
  const textColor = error ? colors.secondary : filled ? colors.gray[600] : colors.gray[400];

  return (
    <View style={styles.durationValue}>
      <Typography variant="bodyM" color={textColor}>
        약
      </Typography>
      <Typography variant="bodyM" color={textColor} numberOfLines={1}>
        {formatDurationInline(hours, minutes)}
      </Typography>
      <Typography variant="bodyM" color={textColor}>
        소요
      </Typography>
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

function Divider() {
  return <View style={styles.divider} />;
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
  queueDueValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  durationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  queueVerticalDivider: {
    width: 1,
    height: spacing[4],
    backgroundColor: colors.gray[200],
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
  pressed: {
    opacity: 0.72,
  },
});
