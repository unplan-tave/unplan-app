import { Button } from '@/components/ui/Button';

import { type FooterCTAProps } from './footer.types';

export function FooterCTA({ label, disabled = false, style, ...props }: FooterCTAProps) {
  return (
    <Button
      label={label}
      variant="primary"
      fullWidth
      disabled={disabled}
      style={style}
      {...props}
    />
  );
}
