/** 약관 화면의 route 파라미터 해석과 뒤로가기를 관리합니다. */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

const TERMS_COPY = {
  service: { title: 'terms.service.title', body: 'terms.service.body' },
  privacy: { title: 'terms.privacy.title', body: 'terms.privacy.body' },
} as const;

type TermsType = keyof typeof TERMS_COPY;

/** 약관 route 파라미터가 지원되는 종류인지 확인합니다. */
function isTermsType(value: unknown): value is TermsType {
  return value === 'service' || value === 'privacy';
}

/** 약관 화면이 표시할 문자열 키와 이동 이벤트를 반환합니다. */
export function useTermsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const termsType = isTermsType(type) ? type : 'service';
  const handleBack = useCallback(() => router.back(), [router]);

  return { copy: TERMS_COPY[termsType], handleBack };
}
