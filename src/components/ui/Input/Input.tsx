import { StyleSheet, View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type InputProps } from './input.types';

export function Input({ label, fieldProps, addFieldProps, recommendation, style }: InputProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Typography variant="bodyM" color={colors.gray[800]} style={styles.label}>
          {label}
        </Typography>
        <TextField {...fieldProps} />
      </View>

      {addFieldProps ? (
        <View style={styles.fieldOnlyRow}>
          <TextField {...addFieldProps} />
        </View>
      ) : null}

      {recommendation ? (
        <View style={styles.recommendationRow}>
          <Typography
            variant="tag"
            color={colors.secondary}
            numberOfLines={1}
            style={styles.recommendation}
          >
            {recommendation}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 357.832,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  label: {
    flexShrink: 0,
  },
  fieldOnlyRow: {
    alignItems: 'flex-end',
  },
  recommendationRow: {
    width: 263,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
  },
  recommendation: {
    flexShrink: 1,
  },
});
