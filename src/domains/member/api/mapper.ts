import type { MemberProfile, MemberProfileUpdateInput } from '../model';
import type { GetProfileResponseDto, UpdateProfileRequestDto } from '@/lib/api/model';

export function toMemberProfile(response: GetProfileResponseDto): MemberProfile {
  return {
    name: response.name ?? '',
    nickname: response.nickname ?? '',
    email: response.email ?? '',
    hasCompletedOnboarding: response.onboarding_completed,
  };
}

export function toUpdateProfileRequest(input: MemberProfileUpdateInput): UpdateProfileRequestDto {
  return {
    name: input.name,
    nickname: input.nickname,
    email: input.email,
  };
}
