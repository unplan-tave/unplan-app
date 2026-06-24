import { TimeStepper } from '@/components/ui/TimeStepper';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { Modal } from './Modal';
import { type StepperModalProps } from './modal.types';

export function StepperModal({
  title,
  label,
  onDecrease,
  onIncrease,
  ...props
}: StepperModalProps) {
  return (
    <Modal {...props}>
      <Typography variant="titleS" color={colors.gray[800]} align="center">
        {title}
      </Typography>
      <TimeStepper label={label} onDecrease={onDecrease} onIncrease={onIncrease} />
    </Modal>
  );
}
