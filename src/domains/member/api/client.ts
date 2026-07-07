import { getProfile, updateProfile } from '@/lib/api/endpoints/member-controller/member-controller';
import {
  getAlarmSetting,
  updateAlarmSetting,
} from '@/lib/api/endpoints/setting-controller/setting-controller';

import {
  toAlarmSettingRequest,
  toAlarmSettings,
  toMemberProfile,
  toUpdateProfileRequest,
} from './mapper';

import type { AlarmSettings, MemberProfile, MemberProfileUpdateInput } from '../model';

export async function fetchMemberProfile(): Promise<MemberProfile> {
  const response = await getProfile();

  return toMemberProfile(response);
}

export async function submitMemberProfileUpdate(input: MemberProfileUpdateInput): Promise<void> {
  await updateProfile(toUpdateProfileRequest(input));
}

export async function fetchAlarmSettings(): Promise<AlarmSettings> {
  const response = await getAlarmSetting();

  return toAlarmSettings(response.data);
}

export async function submitAlarmSettings(settings: AlarmSettings): Promise<void> {
  await updateAlarmSetting(toAlarmSettingRequest(settings));
}
