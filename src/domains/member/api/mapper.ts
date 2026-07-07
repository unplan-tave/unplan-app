import type { AlarmSettings, MemberProfile, MemberProfileUpdateInput } from '../model';
import type {
  AlarmSettingRequestDto,
  AlarmSettingResponseDto,
  GetProfileResponseDto,
  UpdateProfileRequestDto,
} from '@/lib/api/model';

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

export function toAlarmSettings(response: AlarmSettingResponseDto | undefined): AlarmSettings {
  return {
    scheduleEndAlarmOn: response?.is_schedule_end_alarm_on ?? false,
    conditionRecordAlarmOn: response?.is_condition_record_alarm_on ?? false,
    recommendAlarmOn: response?.is_recommend_alarm_on ?? false,
  };
}

export function toAlarmSettingRequest(settings: AlarmSettings): AlarmSettingRequestDto {
  return {
    is_schedule_end_alarm_on: settings.scheduleEndAlarmOn,
    is_condition_record_alarm_on: settings.conditionRecordAlarmOn,
    is_recommend_alarm_on: settings.recommendAlarmOn,
  };
}
