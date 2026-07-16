/**
 * auth API 응답 DTO를 앱 내부 세션 모델로 변환합니다.
 * access/refresh token과 onboarding 완료 여부를 이 경계에서 정리합니다.
 */
import type { AuthSession } from '../model';
import type { SocialLoginResponseDto, TokenReissueResponseDto } from '@/lib/api/model';

export function toAuthSession(response: SocialLoginResponseDto): AuthSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    isNewUser: response.is_new_user,
    hasCompletedOnboarding: response.onboarding_completed,
  };
}

export function toReissuedAuthSession(response: TokenReissueResponseDto): AuthSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  };
}
