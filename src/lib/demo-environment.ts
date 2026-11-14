import { Config } from '@/constants/config';

import { validateDemoApiUrl } from '../../scripts/demo-config.cjs';

export function assertDemoApiUrl(url: string): void {
  if (!Config.isDemo) throw new Error('데모 전용 기능입니다.');
  validateDemoApiUrl(url);
}
