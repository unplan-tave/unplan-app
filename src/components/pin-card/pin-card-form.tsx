import { Controller, type Control } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  type CardTab,
  type ConditionTagOption,
  type DateMode,
  type PersonalTagOption,
  type PinCardFormValues,
  type TimeFocus,
} from '@/state/pin-card/model';

const CONTENT_MAX_WIDTH = 353;
const BOX_PADDING = spacing[4];
const FIELD_LABEL_WIDTH = 72;
const FIELD_MIN_VALUE_WIDTH = 248;
const REQUIRED_MARK_SIZE = 14;
const TOGGLE_WIDTH = spacing[10];
const TOGGLE_HEIGHT = spacing[6];
const TOGGLE_THUMB_SIZE = 18;
const TOGGLE_THUMB_OFFSET = 3;

export function PinCardForm({
  control,
  activeTab,
  primaryTag,
  personalTags,
  dateMode,
  dateValue,
  timeFilled,
  timeValue,
  repeatEnabled,
  // reminderEnabled,
  location,
  showTitleError,
  showDateError,
  showTimeError,
  tagFeedback,
  onChangeTab,
  onOpenConditionTag,
  onOpenPersonalTags,
  onOpenDateTime,
  onToggleRepeat,
  // onToggleReminder,
}: {
  control: Control<PinCardFormValues>;
  activeTab: CardTab;
  primaryTag: ConditionTagOption;
  personalTags: PersonalTagOption[];
  dateMode: DateMode;
  dateValue: readonly [string, string] | string;
  timeFilled: boolean;
  timeValue: readonly [string, string];
  repeatEnabled: boolean;
  // reminderEnabled: boolean;
  location: string;
  showTitleError: boolean;
  showDateError: boolean;
  showTimeError: boolean;
  tagFeedback: 'none' | 'success' | 'error';
  onChangeTab: (tab: CardTab) => void;
  onOpenConditionTag: () => void;
  onOpenPersonalTags: () => void;
  onOpenDateTime: (focus: TimeFocus) => void;
  onToggleRepeat: () => void;
  // onToggleReminder: () => void;
}) {
  return (
    <>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <Controller
            control={control}
            name="title"
            rules={{
              validate: (value) => value.trim().length > 0,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                accessibilityLabel="일정 제목 입력"
                value={value}
                placeholder="일정 제목"
                placeholderTextColor={showTitleError ? colors.secondary : colors.gray[400]}
                style={[
                  styles.titleInput,
                  value.trim().length > 0 && styles.titleInputFilled,
                  showTitleError && styles.titleInputError,
                ]}
                onChangeText={onChange}
              />
            )}
          />
          <Typography variant="display" color={colors.secondary} style={styles.requiredTitle}>
            *
          </Typography>
        </View>
        <View style={styles.tagRow}>
          <Tag
            variant="condition"
            condition={primaryTag.id}
            label={primaryTag.label}
            accessibilityLabel="조건 태그 변경"
            onPress={onOpenConditionTag}
          />
          <Pressable
            accessibilityLabel="개인 태그 선택"
            accessibilityRole="button"
            style={({ pressed }) => [styles.addPersonalTag, pressed && styles.pressed]}
            onPress={onOpenPersonalTags}
          >
            <Typography variant="tag" color={colors.gray[700]} style={styles.tagText}>
              + 개인태그
            </Typography>
          </Pressable>
          {personalTags.map((tag) => (
            <Tag
              key={tag.id}
              variant="personal"
              label={tag.label}
              accessibilityLabel={`${tag.label} 개인 태그 편집`}
              onPress={onOpenPersonalTags}
            />
          ))}
        </View>
        <TagFeedback state={tagFeedback} />
      </View>

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
            {repeatEnabled ? <RepeatSummaryChip onRemove={onToggleRepeat} /> : null}
          </FormBox>

          <FormBox>
            <FormRow label="위치">
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    accessibilityLabel="위치 입력"
                    value={value}
                    placeholder="위치를 입력해주세요"
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    style={[styles.valueInput, location.length > 0 && styles.locationValueInput]}
                    onChangeText={onChange}
                  />
                )}
              />
            </FormRow>
            {/* reminder UI disabled — not yet implemented */}
          </FormBox>

          <FormBox>
            <Controller
              control={control}
              name="memo"
              render={({ field: { onChange, value } }) =>
                value.length > 0 ? (
                  <TextInput
                    accessibilityLabel="메모 입력"
                    value={value}
                    placeholder="메모를 입력해주세요"
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    style={styles.memoFilledInput}
                    onChangeText={onChange}
                  />
                ) : (
                  <FormRow label="메모">
                    <TextInput
                      accessibilityLabel="메모 입력"
                      value={value}
                      placeholder="메모를 입력해주세요"
                      placeholderTextColor={colors.gray[400]}
                      style={styles.valueInput}
                      onChangeText={onChange}
                    />
                  </FormRow>
                )
              }
            />
          </FormBox>
        </View>
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

function TagFeedback({ state }: { state: 'none' | 'success' | 'error' }) {
  if (state === 'error') {
    return (
      <Typography variant="tag" color={colors.secondary} style={styles.feedbackText}>
        어울리는 컨디션 태그를 찾지 못했어요. 직접 선택해 주세요
      </Typography>
    );
  }

  if (state === 'success') {
    return (
      <Typography variant="tag" color={colors.gray[300]} style={styles.feedbackText}>
        일정 제목을 바탕으로 어울리는 컨디션 태그를 골랐어요!
      </Typography>
    );
  }

  return <View style={styles.feedbackSpacer} />;
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

function RepeatSummaryChip({ onRemove }: { onRemove: () => void }) {
  return (
    <View style={styles.chipRow}>
      <View style={styles.summaryChip}>
        <View style={styles.summaryChipTextGroup}>
          <Typography variant="bodyS" color={colors.gray[600]}>
            2주마다
          </Typography>
          <Typography variant="bodyS" color={colors.gray[600]}>
            (월, 수)
          </Typography>
          <Typography variant="bodyS" color={colors.gray[300]}>
            ∙
          </Typography>
          <Typography variant="bodyS" color={colors.gray[600]}>
            10회 반복
          </Typography>
        </View>
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
  head: {
    width: '100%',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  titleInput: {
    ...typography.display,
    minWidth: 0,
    maxWidth: CONTENT_MAX_WIDTH - spacing[8],
    flexShrink: 1,
    padding: spacing[0],
    color: colors.gray[800],
  },
  titleInputFilled: {
    color: colors.gray[900],
  },
  titleInputError: {
    color: colors.secondary,
  },
  requiredTitle: {
    width: REQUIRED_MARK_SIZE,
    lineHeight: 38,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    overflow: 'hidden',
  },
  addPersonalTag: {
    minHeight: 20,
    justifyContent: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: colors.gray[200],
    opacity: 0.5,
  },
  tagText: {
    opacity: 0.6,
  },
  feedbackSpacer: {
    height: 19,
  },
  feedbackText: {
    height: 19,
  },
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
    gap: 2,
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
  valueInput: {
    ...typography.bodyM,
    width: '100%',
    minWidth: 0,
    padding: spacing[0],
    color: colors.gray[800],
    textAlign: 'right',
  },
  locationValueInput: {
    color: colors.gray[600],
    lineHeight: 32,
  },
  memoFilledInput: {
    ...typography.bodyM,
    width: '100%',
    minHeight: 56,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[1],
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
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2] - 2,
    borderRadius: radius.xs,
    backgroundColor: colors.gray[50],
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
    width: 10,
    height: 1,
    borderRadius: radius.full,
    backgroundColor: colors.gray[300],
    transform: [{ rotate: '45deg' }],
  },
  chipCloseBackward: {
    position: 'absolute',
    width: 10,
    height: 1,
    borderRadius: radius.full,
    backgroundColor: colors.gray[300],
    transform: [{ rotate: '-45deg' }],
  },
  pressed: {
    opacity: 0.72,
  },
});
