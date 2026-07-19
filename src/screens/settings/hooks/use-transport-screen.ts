/** 이동 수단 설정 화면의 서버 상태와 표시용 옵션을 조합합니다. */
import { useRouter } from 'expo-router';

import { type TransportOptionId } from '@/domains/onboarding/model';
import { t } from '@/lib/i18n';
import { type TranslationKey } from '@/translations/ko';

import { useTransportSettings } from './use-transport-settings';

const TRANSPORT_OPTION_DEFINITIONS = [
  { id: 'walk', labelKey: 'settings.transport.walk' },
  { id: 'bicycle', labelKey: 'settings.transport.bicycle' },
  { id: 'publicTransit', labelKey: 'settings.transport.publicTransit' },
  { id: 'car', labelKey: 'settings.transport.car' },
] satisfies ReadonlyArray<{ id: TransportOptionId; labelKey: TranslationKey }>;

/** 이동 수단 화면에 필요한 상태·옵션·이벤트를 반환합니다. */
export function useTransportScreen() {
  const router = useRouter();
  const settings = useTransportSettings();
  const options = TRANSPORT_OPTION_DEFINITIONS.map((option) => ({
    ...option,
    label: t(option.labelKey),
  }));

  /** 이전 설정 화면으로 돌아갑니다. */
  const handleBack = () => router.back();

  return { ...settings, options, handleBack };
}
