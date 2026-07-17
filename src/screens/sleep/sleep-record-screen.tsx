import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Header, HeaderBack } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import { useSleepRecordScreen } from './hooks/use-sleep-record-screen';

/** Figma 수면 기록 화면의 JSX와 스타일을 렌더링합니다. */
export function SleepRecordScreen() {
  const sleep = useSleepRecordScreen();
  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title="수면 기록"
        left={<HeaderBack onPress={sleep.goBack} />}
        right={<View style={styles.headerSide} />}
      />
      <View style={styles.content}>
        <View style={styles.hero}>
          <Typography variant="titleL" color={colors.gray[900]} align="center">
            오늘의 수면을 기록해요
          </Typography>
          <Typography variant="bodyM" color={colors.gray[500]} align="center">
            수면 시간은 컨디션 분석에 반영돼요.
          </Typography>
        </View>
        <View style={styles.card}>
          <TimeField label="잠든 시간" value={sleep.bedTime} onChangeText={sleep.setBedTime} />
          <View style={styles.divider} />
          <TimeField
            label="일어난 시간"
            value={sleep.wakeUpTime}
            onChangeText={sleep.setWakeUpTime}
          />
        </View>
        <View style={styles.card}>
          <SettingRow label="낮잠" value={sleep.isNap} onValueChange={sleep.toggleNap} />
          <View style={styles.divider} />
          <SettingRow label="밤샘" value={sleep.isAllNight} onValueChange={sleep.toggleAllNight} />
        </View>
        {sleep.error ? (
          <Typography variant="bodyS" color={colors.secondary} align="center">
            수면 기록을 저장하지 못했어요.
          </Typography>
        ) : null}
        <Button
          label={sleep.isSaving ? '저장 중' : '기록 완료'}
          variant="primary"
          fullWidth
          disabled={sleep.isSaving}
          onPress={sleep.save}
        />
      </View>
    </ScreenLayout>
  );
}

function TimeField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.row}>
      <Typography variant="bodyM" color={colors.gray[700]}>
        {label}
      </Typography>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="00:00"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        style={styles.input}
      />
    </View>
  );
}
function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: () => void;
}) {
  return (
    <View style={styles.row}>
      <Typography variant="bodyM" color={colors.gray[700]}>
        {label}
      </Typography>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray[300], true: colors.primary }}
        thumbColor={colors.gray.white}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  headerSide: { width: 44, height: 44 },
  content: { flex: 1, gap: spacing[4], padding: spacing[5] },
  hero: { gap: spacing[2], paddingVertical: spacing[4] },
  card: {
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: { height: 1, backgroundColor: colors.gray[200] },
  input: { minWidth: 72, paddingVertical: spacing[1], color: colors.gray[800], textAlign: 'right' },
});
