/**
 * member API DTO를 앱 내부 프로필/알림 설정 모델로 변환합니다.
 * 서버의 snake_case 설정 필드와 화면의 boolean 설정 이름 차이를 이 파일에서 흡수합니다.
 */
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
