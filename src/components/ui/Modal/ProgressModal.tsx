import { ProgressBar } from '@/components/ui/ProgressBar';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { Modal } from './Modal';
import { type ProgressModalProps } from './modal.types';

export function ProgressModal({ title, description, progress, ...props }: ProgressModalProps) {
  return (
    <Modal {...props}>
      <Typography variant="titleS" color={colors.gray[800]} align="center">
        {title}
      </Typography>
      {description ? (
        <Typography variant="bodyS" color={colors.gray[500]} align="center">
          {description}
        </Typography>
      ) : null}
      <ProgressBar value={progress} width={280} />
    </Modal>
  );
}
