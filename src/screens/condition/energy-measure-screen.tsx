import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConditionQuadrantPlot } from '@/components/features/condition/condition-quadrant-plot';
import { AppBackground } from '@/components/ui/AppBackground';
import { TimePickerBottomSheet } from '@/components/ui/BottomSheet';
import { Header, HeaderCancel } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import { useEnergyMeasureScreen } from './hooks/use-energy-measure-screen';

const CONTENT_MAX_WIDTH = 393;

export function EnergyMeasureScreen() {
  const energy = useEnergyMeasureScreen();

  return (
    <View style={styles.screen}>
      <AppBackground variant="reversed" />
      <SafeAreaView style={styles.safeArea}>
        <Header
          left={<HeaderCancel color={colors.primary} onPress={energy.cancel} />}
          title="에너지 측정"
          right={
            <Pressable
              accessibilityLabel="에너지 기록 저장"
              accessibilityRole="button"
              accessibilityState={{ disabled: energy.isSaving }}
              disabled={energy.isSaving}
              hitSlop={8}
              style={({ pressed }) => [styles.done, pressed && styles.pressed]}
              onPress={energy.submit}
            >
              <Typography
                variant="bodyM"
                color={energy.isSaving ? colors.gray[300] : colors.primary}
              >
                완료
              </Typography>
            </Pressable>
          }
        />

        <View style={styles.canvas}>
          <View style={styles.heading}>
            <Typography variant="titleL" align="center" color={colors.gray[800]}>
              {energy.title}
            </Typography>
            <Typography variant="bodyS" align="center" color={colors.gray[500]}>
              {energy.subtitle}
            </Typography>
            {energy.validationMessage != null ? (
              <Typography
                accessibilityLiveRegion="polite"
                variant="caption"
                align="center"
                color={colors.secondary}
              >
                {energy.validationMessage}
              </Typography>
            ) : null}
          </View>

          <ConditionQuadrantPlot value={energy.value} onSelect={energy.selectPoint} />

          <View style={styles.card}>
            <FieldRow label="날짜" value={energy.dateLabel} onPress={energy.openDateField} />
            <FieldRow label="시간" value={energy.timeLabel} onPress={energy.openTimeField} />
          </View>
        </View>
      </SafeAreaView>

      <TimePickerBottomSheet
        visible={energy.activeField != null}
        title={energy.activeField === 'date' ? '날짜 선택' : '시각 선택'}
        value={energy.fieldValue}
        options={energy.fieldOptions}
        onSelect={energy.selectOption}
        onClose={energy.closeField}
      />
    </View>
  );
}

function FieldRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.fieldRow}>
      <Typography variant="bodyM" color={colors.gray[700]}>
        {label}
      </Typography>
      <Pressable
        accessibilityLabel={`${label} 선택`}
        accessibilityRole="button"
        style={({ pressed }) => [styles.fieldChip, pressed && styles.pressed]}
        onPress={onPress}
      >
        <Typography variant="bodyM" align="center" color={colors.gray[700]}>
          {value}
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldChip: {
    minWidth: 120,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white70,
  },
  pressed: {
    opacity: 0.72,
  },
});
