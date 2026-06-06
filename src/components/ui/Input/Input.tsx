import { StyleSheet, View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type InputProps } from './input.types';

export function Input({ label, fieldProps, addFieldProps, recommendation, style }: InputProps) {
  const resolvedFieldProps = {
    ...fieldProps,
    width: fieldProps.width ?? '100%',
  } satisfies InputProps['fieldProps'];
  const resolvedAddFieldProps = addFieldProps
    ? ({
        ...addFieldProps,
        width: addFieldProps.width ?? '100%',
      } satisfies InputProps['fieldProps'])
    : undefined;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Typography variant="bodyM" color={colors.gray[800]} style={styles.label}>
          {label}
        </Typography>
        <View style={styles.fieldColumn}>
          <TextField {...resolvedFieldProps} />

          {resolvedAddFieldProps ? <TextField {...resolvedAddFieldProps} /> : null}

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 357.832,
    alignSelf: 'stretch',
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
  fieldColumn: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  recommendationRow: {
    width: '100%',
    paddingHorizontal: 12,
  },
  recommendation: {
    flexShrink: 1,
  },
});
