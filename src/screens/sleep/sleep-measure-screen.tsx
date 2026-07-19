import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SleepDurationWheel } from '@/components/features/sleep/sleep-duration-wheel';
import { SleepWeekPicker } from '@/components/features/sleep/sleep-week-picker';
import { AppBackground } from '@/components/ui/AppBackground';
import { TimePickerBottomSheet } from '@/components/ui/BottomSheet';
import { Header, HeaderCancel } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { SLEEP_TIME_OPTIONS } from '@/domains/sleep/measure';

import { useSleepMeasureScreen } from './hooks/use-sleep-measure-screen';

const CONTENT_MAX_WIDTH = 393;

export function SleepMeasureScreen() {
  const sleep = useSleepMeasureScreen();

  return (
    <View style={styles.screen}>
      <AppBackground />
      <SafeAreaView style={styles.safeArea}>
        <Header
          left={<HeaderCancel color={colors.primary} onPress={sleep.cancel} />}
          title="수면 측정"
          right={
            <Pressable
              accessibilityLabel="수면 기록 저장"
              accessibilityRole="button"
              accessibilityState={{
                disabled: sleep.isSaving || sleep.isRecordLoading || sleep.isRecordLoadError,
              }}
              disabled={sleep.isSaving || sleep.isRecordLoading || sleep.isRecordLoadError}
              hitSlop={8}
              style={({ pressed }) => [styles.done, pressed && styles.pressed]}
              onPress={sleep.submit}
            >
              <Typography variant="bodyM" color={colors.primary}>
                완료
              </Typography>
            </Pressable>
          }
        />

        <View style={styles.canvas}>
          <View style={styles.heading}>
            <Typography variant="titleL" align="center" color={colors.gray[800]}>
              {sleep.title}
            </Typography>
            <Typography variant="bodyS" align="center" color={colors.gray[500]}>
              {sleep.subtitle}
            </Typography>
            {sleep.isSaveErrorVisible ? (
              <Typography variant="caption" align="center" color={colors.secondary}>
                저장하지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.
              </Typography>
            ) : null}
          </View>

          {sleep.isRecordLoading ? (
            <View style={styles.card}>
              <Typography variant="bodyM" align="center" color={colors.gray[500]}>
                수면 기록을 불러오는 중이에요.
              </Typography>
            </View>
          ) : sleep.isRecordLoadError ? (
            <View style={styles.card}>
              <Typography variant="bodyM" align="center" color={colors.secondary}>
                수면 기록을 불러오지 못했어요. 다시 시도해 주세요.
              </Typography>
              <Pressable
                accessibilityLabel="수면 기록 다시 불러오기"
                accessibilityRole="button"
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                onPress={sleep.retryRecordLoad}
              >
                <Typography variant="bodyM" color={colors.primary}>
                  다시 시도
                </Typography>
              </Pressable>
            </View>
          ) : (
            <View style={styles.card}>
              <SleepWeekPicker
                monthLabel={sleep.monthLabel}
                days={sleep.weekDays}
                onSelect={sleep.selectDate}
              />

              <View style={styles.timeRange}>
                <TimePill
                  time={sleep.bedTime}
                  accessibilityLabel="취침 시각 선택"
                  onPress={() => sleep.openTimeField('bed')}
                />
                <Typography variant="bodyM" color={colors.gray[400]}>
                  –
                </Typography>
                <TimePill
                  time={sleep.wakeUpTime}
                  accessibilityLabel="기상 시각 선택"
                  onPress={() => sleep.openTimeField('wake')}
                />
              </View>

              <View style={styles.divider} />

              <ToggleRow label="낮잠으로 기록" value={sleep.isNap} onChange={sleep.toggleNap} />
              <ToggleRow
                label="밤샘으로 기록"
                value={sleep.isAllNight}
                onChange={sleep.toggleAllNight}
              />

              <View style={styles.divider} />

              <SleepDurationWheel
                durationMinutes={sleep.durationMinutes}
                onChange={sleep.changeDuration}
              />
            </View>
          )}
        </View>
      </SafeAreaView>

      <TimePickerBottomSheet
        visible={sleep.activeTimeField != null}
        title="시각 선택"
        value={sleep.timeOptionValue}
        options={SLEEP_TIME_OPTIONS}
        onSelect={sleep.selectTime}
        onClose={sleep.closeTimeField}
      />
    </View>
  );
}

function TimePill({
  time,
  accessibilityLabel,
  onPress,
}: {
  time: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [styles.timePill, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Typography variant="titleS" align="center" color={colors.gray[700]}>
        {time}
      </Typography>
    </Pressable>
  );
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
      <Typography variant="titleS" color={colors.gray[800]}>
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
  canvas: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    flex: 1,
    alignSelf: 'center',
    paddingHorizontal: spacing[5],
    gap: spacing[6],
  },
  heading: {
    marginTop: spacing[8],
    gap: spacing[2],
  },
  card: {
    gap: spacing[4],
    padding: spacing[5],
    borderRadius: radius['2xl'],
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
    gap: spacing[3],
  },
  timePill: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white70,
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
  pressed: {
    opacity: 0.72,
  },
});
