import { type StyleProp, Pressable, StyleSheet, Switch, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

export interface SettingsListRow {
  label: string;
  value?: string;
  type?: 'navigation' | 'switch' | 'text';
  disabled?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
}

interface SettingsListProps {
  title?: string;
  rows: SettingsListRow[];
  style?: StyleProp<ViewStyle>;
}

export function SettingsList({ title, rows, style }: SettingsListProps) {
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <Typography variant="titleS" color={colors.gray[900]} style={styles.title}>
          {title}
        </Typography>
      ) : null}
      <View style={styles.rows}>
        {rows.map((row) => (
          <SettingsRow key={row.label} row={row} />
        ))}
      </View>
    </View>
  );
}

function SettingsRow({ row }: { row: SettingsListRow }) {
  const type = row.type ?? 'navigation';
  const isPressable = type === 'navigation' && row.onPress != null && !row.disabled;

  return (
    <Pressable
      accessibilityRole={isPressable ? 'button' : undefined}
      accessibilityState={{ disabled: row.disabled }}
      disabled={!isPressable}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={row.onPress}
    >
      <Typography variant="bodyM" color={row.disabled ? colors.gray[400] : colors.gray[700]}>
        {row.label}
      </Typography>
      <View style={styles.trailing}>
        {row.value ? (
          <Typography variant="bodyM" color={colors.gray[400]} numberOfLines={1}>
            {row.value}
          </Typography>
        ) : null}
        {type === 'switch' ? (
          <Switch
            value={row.switchValue}
            trackColor={{ false: colors.gray[300], true: colors.primary }}
            thumbColor={colors.gray.white}
            ios_backgroundColor={colors.gray[300]}
            onValueChange={row.onSwitchChange}
          />
        ) : null}
        {type === 'navigation' ? (
          <Icon name="arrowRight" size={24} color={colors.gray[300]} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 353,
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
  },
  title: {
    marginBottom: spacing[4],
  },
  rows: {
    gap: spacing[4],
  },
  row: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  trailing: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.72,
  },
});
