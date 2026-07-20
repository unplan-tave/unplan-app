import { useEffect, useRef, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SleepWeekPicker } from '@/components/features/sleep/sleep-week-picker';
import { AppBackground } from '@/components/ui/AppBackground';
import { Header, HeaderCancel } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useSleepMeasureScreen } from './hooks/use-sleep-measure-screen';

const CONTENT_MAX_WIDTH = 393;
const SLEEP_INPUT_ACCESSORY_ID = 'sleep-input-accessory';

export function SleepMeasureScreen() {
  const sleep = useSleepMeasureScreen();

  return (
    <View style={styles.screen}>
      <AppBackground variant="reversed" />
      <SafeAreaView style={styles.safeArea}>
        <Header
          left={<HeaderCancel color={colors.primary} onPress={sleep.cancel} />}
          title="수면 측정"
          right={
            <Pressable
              accessibilityLabel="수면 기록 저장"
              accessibilityRole="button"
              accessibilityState={{
                disabled: !sleep.canSubmit || sleep.isSaving,
              }}
              disabled={!sleep.canSubmit || sleep.isSaving}
              hitSlop={8}
              style={({ pressed }) => [
                styles.done,
                !sleep.canSubmit && styles.doneDisabled,
                pressed && sleep.canSubmit && styles.pressed,
              ]}
              onPress={sleep.submit}
            >
              <Typography
                variant="bodyM"
                color={sleep.canSubmit ? colors.primary : colors.gray[400]}
              >
                완료
              </Typography>
            </Pressable>
          }
        />

        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View style={styles.canvas}>
            <View style={styles.content}>
              <View style={styles.heading}>
                <Typography variant="titleL" align="center" color={colors.gray[900]}>
                  {sleep.title}
                </Typography>
                <Typography variant="bodyM" align="center" color={colors.gray[700]}>
                  {sleep.subtitle}
                </Typography>
                {sleep.isSaveErrorVisible ? (
                  <Typography variant="caption" align="center" color={colors.secondary}>
                    저장하지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.
                  </Typography>
                ) : null}
                {sleep.validationMessage ? (
                  <Typography variant="caption" align="center" color={colors.secondary}>
                    {sleep.validationMessage}
                  </Typography>
                ) : null}
              </View>

              {sleep.isRecordLoading ? (
                <View style={styles.card}>
                  <Typography variant="bodyM" align="center" color={colors.gray[500]}>
                    {t('sleep.measure.loading')}
                  </Typography>
                </View>
              ) : sleep.isRecordLoadError ? (
                <View style={styles.card}>
                  <Typography variant="bodyM" align="center" color={colors.secondary}>
                    {t('sleep.measure.loadError')}
                  </Typography>
                  <Pressable
                    accessibilityLabel={t('sleep.measure.retryAccessibilityLabel')}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                    onPress={sleep.retryRecordLoad}
                  >
                    <Typography variant="bodyM" color={colors.primary}>
                      {t('sleep.measure.retry')}
                    </Typography>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.card}>
                  {!sleep.isAllNight ? (
                    <SleepWeekPicker
                      monthLabel={sleep.monthLabel}
                      days={sleep.weekDays}
                      onSelect={sleep.selectDate}
                    />
                  ) : (
                    <SleepTooltip
                      message="밤샘으로 기록할까요?"
                      accessibilityLabel="밤샘 기록 안내 닫기"
                      onDismiss={sleep.dismissAllNightTooltip}
                      visible={sleep.isAllNightTooltipVisible}
                    />
                  )}

                  <View style={styles.timeRange}>
                    <TwoDigitTimeInput
                      value={sleep.bedTime}
                      error={sleep.validationMessage != null}
                      accessibilityLabel="취침 시각 선택"
                      onChange={sleep.changeBedTime}
                    />
                    <Typography variant="bodyM" color={colors.gray[400]}>
                      –
                    </Typography>
                    <TwoDigitTimeInput
                      value={sleep.wakeUpTime}
                      accessibilityLabel="기상 시각 선택"
                      onChange={sleep.changeWakeTime}
                    />
                  </View>

                  <View style={styles.divider} />

                  <SleepTooltip
                    message="낮잠으로 기록할까요?"
                    accessibilityLabel="낮잠 기록 안내 닫기"
                    onDismiss={sleep.dismissNapTooltip}
                    visible={sleep.isNapTooltipVisible}
                  />
                  <ToggleRow label="낮잠으로 기록" value={sleep.isNap} onChange={sleep.toggleNap} />
                  <ToggleRow
                    label="밤샘으로 기록"
                    value={sleep.isAllNight}
                    onChange={sleep.toggleAllNight}
                  />

                  <View style={styles.divider} />

                  <SleepDurationInput
                    durationMinutes={sleep.durationMinutes}
                    error={sleep.validationMessage != null}
                    onChange={sleep.changeDuration}
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      <InputAccessoryView nativeID={SLEEP_INPUT_ACCESSORY_ID}>
        <View style={styles.keyboardAccessory}>
          <Pressable
            accessibilityLabel="숫자 입력 완료"
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.keyboardDone, pressed && styles.pressed]}
            onPress={Keyboard.dismiss}
          >
            <Typography variant="bodyM" color={colors.primary}>
              완료
            </Typography>
          </Pressable>
        </View>
      </InputAccessoryView>

      {sleep.validationMessage ? (
        <SleepErrorToast onDismiss={sleep.dismissValidationMessage} />
      ) : null}
    </View>
  );
}

function TwoDigitTimeInput({
  value,
  error = false,
  accessibilityLabel,
  onChange,
}: {
  value: string | null;
  error?: boolean;
  accessibilityLabel: string;
  onChange: (time: string | null) => void;
}) {
  const initial = timeParts(value);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [activePart, setActivePart] = useState<'hours' | 'minutes' | null>(null);
  const hoursInputRef = useRef<TextInput>(null);
  const minutesInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (value == null) return;

    const next = timeParts(value);
    setHours(next.hours);
    setMinutes(next.minutes);
  }, [value]);

  useEffect(() => {
    if (activePart === 'hours') hoursInputRef.current?.focus();
    if (activePart === 'minutes') minutesInputRef.current?.focus();
  }, [activePart]);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => setActivePart(null));
    return () => subscription.remove();
  }, []);

  const commit = (nextHours: string, nextMinutes: string) => {
    if (
      nextHours.length !== 2 ||
      nextMinutes.length !== 2 ||
      Number(nextHours) > 23 ||
      Number(nextMinutes) > 59
    ) {
      onChange(null);
      return;
    }

    onChange(`${nextHours}:${nextMinutes}`);
  };

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.timePill, error && styles.timePillError]}
    >
      {activePart === 'hours' ? (
        <TextInput
          ref={hoursInputRef}
          accessibilityLabel={`${accessibilityLabel} 시`}
          keyboardType="number-pad"
          inputAccessoryViewID={SLEEP_INPUT_ACCESSORY_ID}
          maxLength={2}
          placeholder="--"
          placeholderTextColor={colors.gray[500]}
          selectTextOnFocus
          style={styles.timeInput}
          value={hours}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
          onChangeText={(text) => {
            const nextHours = timeHoursOnly(text);
            setHours(nextHours);
            commit(nextHours, minutes);

            if (nextHours.length === 2) setActivePart('minutes');
          }}
        />
      ) : (
        <TimeValue
          accessibilityLabel={`${accessibilityLabel} 시 입력`}
          value={hours}
          onPress={() => setActivePart('hours')}
        />
      )}
      <Typography variant="bodyM" color={colors.gray[500]}>
        :
      </Typography>
      {activePart === 'minutes' ? (
        <TextInput
          ref={minutesInputRef}
          accessibilityLabel={`${accessibilityLabel} 분`}
          keyboardType="number-pad"
          inputAccessoryViewID={SLEEP_INPUT_ACCESSORY_ID}
          maxLength={2}
          placeholder="--"
          placeholderTextColor={colors.gray[500]}
          selectTextOnFocus
          style={styles.timeInput}
          value={minutes}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
          onChangeText={(text) => {
            const nextMinutes = minutesOnly(text);
            setMinutes(nextMinutes);
            commit(hours, nextMinutes);
          }}
        />
      ) : (
        <TimeValue
          accessibilityLabel={`${accessibilityLabel} 분 입력`}
          value={minutes}
          onPress={() => setActivePart('minutes')}
        />
      )}
    </View>
  );
}

function SleepDurationInput({
  durationMinutes,
  error = false,
  onChange,
}: {
  durationMinutes: number | null;
  error?: boolean;
  onChange: (durationMinutes: number | null) => void;
}) {
  const initial = durationParts(durationMinutes);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [activePart, setActivePart] = useState<'hours' | 'minutes' | null>(null);
  const hoursInputRef = useRef<TextInput>(null);
  const minutesInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (durationMinutes == null) return;

    const next = durationParts(durationMinutes);
    setHours(next.hours);
    setMinutes(next.minutes);
  }, [durationMinutes]);

  useEffect(() => {
    if (activePart === 'hours') hoursInputRef.current?.focus();
    if (activePart === 'minutes') minutesInputRef.current?.focus();
  }, [activePart]);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => setActivePart(null));
    return () => subscription.remove();
  }, []);

  const commit = (nextHours: string, nextMinutes: string) => {
    if (nextHours.length !== 2 || nextMinutes.length !== 2 || Number(nextMinutes) > 59) {
      onChange(null);
      return;
    }

    onChange(Number(nextHours) * 60 + Number(nextMinutes));
  };

  return (
    <View style={[styles.durationInput, error && styles.durationInputError]}>
      {activePart === 'hours' ? (
        <TextInput
          ref={hoursInputRef}
          accessibilityLabel="수면 시간"
          keyboardType="number-pad"
          inputAccessoryViewID={SLEEP_INPUT_ACCESSORY_ID}
          maxLength={2}
          placeholder="--"
          placeholderTextColor={colors.gray[500]}
          selectTextOnFocus
          style={styles.durationNumberInput}
          value={hours}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
          onChangeText={(text) => {
            const nextHours = digitsOnly(text);
            setHours(nextHours);
            commit(nextHours, minutes);

            if (nextHours.length === 2) setActivePart('minutes');
          }}
        />
      ) : (
        <DurationValue
          accessibilityLabel="수면 시간 입력"
          value={hours}
          onPress={() => setActivePart('hours')}
        />
      )}
      <Typography variant="titleS" color={colors.gray[600]}>
        시간
      </Typography>
      {activePart === 'minutes' ? (
        <TextInput
          ref={minutesInputRef}
          accessibilityLabel="수면 분"
          keyboardType="number-pad"
          inputAccessoryViewID={SLEEP_INPUT_ACCESSORY_ID}
          maxLength={2}
          placeholder="--"
          placeholderTextColor={colors.gray[500]}
          selectTextOnFocus
          style={styles.durationNumberInput}
          value={minutes}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
          onChangeText={(text) => {
            const nextMinutes = minutesOnly(text);
            setMinutes(nextMinutes);
            commit(hours, nextMinutes);
          }}
        />
      ) : (
        <DurationValue
          accessibilityLabel="수면 분 입력"
          value={minutes}
          onPress={() => setActivePart('minutes')}
        />
      )}
      <Typography variant="titleS" color={colors.gray[600]}>
        분
      </Typography>
    </View>
  );
}

function TimeValue({
  accessibilityLabel,
  value,
  onPress,
}: {
  accessibilityLabel: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={styles.timeValue}
      onPress={onPress}
    >
      <Typography
        variant="bodyM"
        align="center"
        color={value ? colors.gray[700] : colors.gray[500]}
      >
        {value || '--'}
      </Typography>
    </Pressable>
  );
}

function DurationValue({
  accessibilityLabel,
  value,
  onPress,
}: {
  accessibilityLabel: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={styles.durationValue}
      onPress={onPress}
    >
      <Typography
        variant="display"
        align="center"
        color={value ? colors.primary : colors.gray[500]}
      >
        {value || '--'}
      </Typography>
    </Pressable>
  );
}

function timeParts(time: string | null) {
  if (time == null) return { hours: '', minutes: '' };

  const [hours = '', minutes = ''] = time.split(':');
  return { hours, minutes };
}

function durationParts(durationMinutes: number | null) {
  if (durationMinutes == null) return { hours: '', minutes: '' };

  return {
    hours: String(Math.floor(durationMinutes / 60)).padStart(2, '0'),
    minutes: String(durationMinutes % 60).padStart(2, '0'),
  };
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '').slice(0, 2);
}

function timeHoursOnly(value: string) {
  const digits = digitsOnly(value);
  if (digits.length === 0 || Number(digits[0]) <= 2) {
    return digits.length < 2 || Number(digits) <= 23 ? digits : digits[0];
  }

  return '';
}

function minutesOnly(value: string) {
  const digits = digitsOnly(value);
  return digits.length === 0 || Number(digits[0]) <= 5 ? digits : '';
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Typography variant="bodyM" color={colors.gray[600]}>
        {label}
      </Typography>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.gray[300], true: colors.primary }}
        thumbColor={colors.gray.white}
        ios_backgroundColor={colors.gray[300]}
      />
    </View>
  );
}

function SleepTooltip({
  message,
  visible,
  accessibilityLabel,
  onDismiss,
}: {
  message: string;
  visible: boolean;
  accessibilityLabel: string;
  onDismiss: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={styles.tooltipRow}>
      <View style={styles.tooltip}>
        <Typography variant="caption" color={colors.gray.white}>
          {message}
        </Typography>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onDismiss}
        >
          <Typography variant="caption" color={colors.gray.white}>
            ×
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

function SleepErrorToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <View style={styles.errorToast}>
      <View style={styles.errorIcon}>
        <Typography variant="caption" color={colors.gray.white}>
          !
        </Typography>
      </View>
      <Typography variant="bodyS" color={colors.gray.white} style={styles.errorText}>
        취침 날짜/시각을 확인해 주세요!
      </Typography>
      <Pressable accessibilityRole="button" accessibilityLabel="오류 안내 닫기" onPress={onDismiss}>
        <Typography variant="titleS" color={colors.gray[300]}>
          ×
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.onboardingMutedBackground,
  },
  safeArea: {
    flex: 1,
  },
  done: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneDisabled: {
    opacity: 0.55,
  },
  canvas: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    flex: 1,
    alignSelf: 'center',
    paddingHorizontal: spacing[5],
  },
  content: {
    width: '100%',
    maxWidth: 287,
    alignSelf: 'center',
    gap: 36,
  },
  heading: {
    marginTop: 52,
    gap: spacing[1],
  },
  card: {
    gap: spacing[4],
    padding: spacing[6],
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
  retryButton: {
    alignSelf: 'center',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  timePill: {
    flex: 1,
    height: 32,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  timePillError: {
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  timeInput: {
    ...typography.bodyM,
    flex: 1,
    minWidth: 0,
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: 'center',
    color: colors.gray[700],
  },
  timeValue: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.alpha.white70,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tooltipRow: {
    alignItems: 'flex-start',
  },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray[600],
  },
  durationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    minHeight: 52,
    paddingHorizontal: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white70,
  },
  durationInputError: {
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  durationNumberInput: {
    ...typography.display,
    width: 48,
    height: 52,
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: 'center',
    color: colors.primary,
  },
  durationValue: {
    width: 48,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAccessory: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.gray.white,
  },
  keyboardDone: {
    minWidth: 44,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorToast: {
    position: 'absolute',
    right: spacing[5],
    bottom: spacing[5],
    left: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 52,
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.gray[600],
  },
  errorIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  errorText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
  },
});
