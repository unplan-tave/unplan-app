import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { Modal } from './Modal';
import { type ConfirmModalProps } from './modal.types';
import { ModalActions } from './ModalActions';

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onClose,
  ...props
}: ConfirmModalProps) {
  return (
    <Modal onClose={onClose} {...props}>
      <Typography variant="titleS" color={colors.gray[800]} align="center">
        {title}
      </Typography>
      {description ? (
        <Typography variant="bodyS" color={colors.gray[500]} align="center">
          {description}
        </Typography>
      ) : null}
      <ModalActions
        confirmLabel={confirmLabel ?? (destructive ? '삭제' : undefined)}
        cancelLabel={cancelLabel}
        onCancel={onClose}
        onConfirm={onConfirm}
      />
    </Modal>
  );
}
