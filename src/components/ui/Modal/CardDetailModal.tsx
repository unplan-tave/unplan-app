import { ProgressSegment } from '@/components/ui/ProgressSegment';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { Modal } from './Modal';
import { type CardDetailModalProps } from './modal.types';

export function CardDetailModal({
  title,
  description,
  status,
  onStatusChange,
  ...props
}: CardDetailModalProps) {
  return (
    <Modal {...props}>
      <Typography variant="titleS" color={colors.gray[800]}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="bodyS" color={colors.gray[500]}>
          {description}
        </Typography>
      ) : null}
      <ProgressSegment value={status} onChange={onStatusChange} />
    </Modal>
  );
}
