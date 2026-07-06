import { getProfile, updateProfile } from '@/lib/api/endpoints/member-controller/member-controller';

import { toMemberProfile, toUpdateProfileRequest } from './mapper';

import type { MemberProfile, MemberProfileUpdateInput } from '../model';

export async function fetchMemberProfile(): Promise<MemberProfile> {
  const response = await getProfile();

  return toMemberProfile(response);
}

export async function submitMemberProfileUpdate(input: MemberProfileUpdateInput): Promise<void> {
  await updateProfile(toUpdateProfileRequest(input));
}
