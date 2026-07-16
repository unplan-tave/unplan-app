import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { Modal } from './Modal';
import { type ScheduleEditModalProps } from './modal.types';

export function ScheduleEditModal({
  title = '일정 수정',
  titleFieldProps,
  startFieldProps,
  endFieldProps,
  onSave,
  ...props
}: ScheduleEditModalProps) {
  return (
    <Modal {...props}>
      <Typography variant="titleS" color={colors.gray[800]} align="center">
        {title}
      </Typography>
      <View style={styles.fields}>
        <TextField variant="long" width="100%" {...titleFieldProps} />
        {startFieldProps ? <TextField width="100%" {...startFieldProps} /> : null}
        {endFieldProps ? <TextField width="100%" {...endFieldProps} /> : null}
      </View>
      <Button label="저장" variant="primary" fullWidth onPress={onSave} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 10,
  },
});
