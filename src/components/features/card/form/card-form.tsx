import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import {
  type CardTab,
  type ConditionTagOption,
  type DateMode,
  type PersonalTagOption,
  type CardFormValues,
  type RecurrenceValue,
  type TimeFocus,
} from '@/state/card/model';

import { CardFormHeader } from './card-form-header';
import { PinFormBody } from './pin-form-body';
import { QueueFormBody } from './queue-form-body';

import type { Control } from 'react-hook-form';

export function CardForm({
  control,
  activeTab,
  primaryTag,
  personalTags,
  dateMode,
  dateValue,
  timeFilled,
  timeValue,
  repeatEnabled,
  recurrence,
  showTitleError,
  showDateError,
  showTimeError,
  showDueError = false,
  showDurationError = false,
  dueDate = '',
  durationHours = 0,
  durationMinutes = 0,
  durationUnknown = false,
  tagFeedback,
  onChangeTab,
  onOpenConditionTag,
  onOpenPersonalTags,
  onOpenDateTime,
  onOpenDueDuration,
  onOpenLocation,
  onToggleRepeat,
  onPressRepeatChip,
  onRemoveRepeat,
  onMemoFocus,
  onMemoBlur,
  onMemoReachLimit,
}: {
  control: Control<CardFormValues>;
  activeTab: CardTab;
  primaryTag: ConditionTagOption;
  personalTags: PersonalTagOption[];
  dateMode: DateMode;
  dateValue: readonly [string, string] | string;
  timeFilled: boolean;
  timeValue: readonly [string, string];
  repeatEnabled: boolean;
  recurrence: RecurrenceValue | null;
  showTitleError: boolean;
  showDateError: boolean;
  showTimeError: boolean;
  showDueError?: boolean;
  showDurationError?: boolean;
  dueDate?: string;
  durationHours?: number;
  durationMinutes?: number;
  durationUnknown?: boolean;
  tagFeedback: 'none' | 'success' | 'error';
  onChangeTab: (tab: CardTab) => void;
  onOpenConditionTag: () => void;
  onOpenPersonalTags: () => void;
  onOpenDateTime: (focus: TimeFocus) => void;
  onOpenDueDuration?: () => void;
  onOpenLocation: () => void;
  onToggleRepeat: () => void;
  onPressRepeatChip: () => void;
  onRemoveRepeat: () => void;
  onMemoFocus?: () => void;
  onMemoBlur?: () => void;
  onMemoReachLimit?: () => void;
}) {
  return (
    <>
      <CardFormHeader
        control={control}
        primaryTag={primaryTag}
        personalTags={personalTags}
        tagFeedback={tagFeedback}
        showTitleError={showTitleError}
        onOpenConditionTag={onOpenConditionTag}
        onOpenPersonalTags={onOpenPersonalTags}
      />

      <View style={styles.body}>
        <View style={styles.tabCard}>
          <View style={[styles.tabHighlight, activeTab === 'queue' && styles.tabHighlightQueue]} />
          <TabButton
            active={activeTab === 'pin'}
            label="핀카드"
            onPress={() => onChangeTab('pin')}
          />
          <TabButton
            active={activeTab === 'queue'}
            label="큐카드"
            onPress={() => onChangeTab('queue')}
          />
        </View>

        {activeTab === 'pin' ? (
          <PinFormBody
            control={control}
            dateMode={dateMode}
            dateValue={dateValue}
            timeFilled={timeFilled}
            timeValue={timeValue}
            repeatEnabled={repeatEnabled}
            recurrence={recurrence}
            showDateError={showDateError}
            showTimeError={showTimeError}
            onOpenDateTime={onOpenDateTime}
            onOpenLocation={onOpenLocation}
            onToggleRepeat={onToggleRepeat}
            onPressRepeatChip={onPressRepeatChip}
            onRemoveRepeat={onRemoveRepeat}
            onMemoFocus={onMemoFocus}
            onMemoBlur={onMemoBlur}
            onMemoReachLimit={onMemoReachLimit}
          />
        ) : (
          <QueueFormBody
            control={control}
            dueDate={dueDate}
            durationHours={durationHours}
            durationMinutes={durationMinutes}
            durationUnknown={durationUnknown}
            showDueError={showDueError}
            showDurationError={showDurationError}
            onOpenDueDuration={onOpenDueDuration}
            onOpenLocation={onOpenLocation}
            onMemoFocus={onMemoFocus}
            onMemoBlur={onMemoBlur}
            onMemoReachLimit={onMemoReachLimit}
          />
        )}
      </View>
    </>
  );
}

function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 탭`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Typography
        variant="titleS"
        color={active ? colors.gray[500] : colors.gray[300]}
        align="center"
      >
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    gap: spacing[6],
  },
  tabCard: {
    width: '100%',
    height: spacing[10],
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.gray[200],
  },
  tabHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
    shadowColor: colors.gray[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 5,
  },
  tabHighlightQueue: {
    left: '50%',
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
