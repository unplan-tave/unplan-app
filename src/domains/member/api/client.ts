/**
 * member 도메인의 서버 API 경계입니다.
 * 프로필과 알림 설정 조회/수정을 감싸 settings/home 화면이 generated DTO에 의존하지 않게 합니다.
 */
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
