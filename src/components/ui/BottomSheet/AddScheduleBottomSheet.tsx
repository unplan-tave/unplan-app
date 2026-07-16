import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

import { BottomSheet } from './BottomSheet';
import { type AddScheduleBottomSheetProps } from './bottomSheet.types';

export function AddScheduleBottomSheet({
  titleFieldProps,
  timeFieldProps,
  onAddPress,
  addLabel = '추가',
  ...props
}: AddScheduleBottomSheetProps) {
  return (
    <BottomSheet {...props}>
      <View style={styles.content}>
        <TextField variant="long" width="100%" {...titleFieldProps} />
        {timeFieldProps ? <TextField width="100%" {...timeFieldProps} /> : null}
        <Button label={addLabel} variant="primary" fullWidth onPress={onAddPress} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});
