import type { AuthSession } from '../model';
import type { SocialLoginResponseDto } from '@/lib/api/model';

export function toAuthSession(response: SocialLoginResponseDto): AuthSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    isNewUser: response.is_new_user,
  };
}
