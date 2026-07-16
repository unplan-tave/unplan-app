/**
 * schedule 도메인의 정적 옵션 데이터입니다.
 * condition tag, 기본 날짜/시간 범위처럼 여러 화면이 공유하는 선택지를 정의합니다.
 */
import { colors } from '@/constants/theme';

import { type ConditionTagOption } from './model';

export const DEFAULT_DATE_RANGE = ['0000.00.00', '0000.00.00'] as const;
export const DEFAULT_TIME_RANGE = ['00:00', '00:00'] as const;
export const TIME_PRESETS = ['00:00', '09:00', '12:00', '15:00', '18:00', '21:00'] as const;
export const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export const CONDITION_TAG_OPTIONS: [
  ConditionTagOption,
  ConditionTagOption,
  ConditionTagOption,
  ConditionTagOption,
  ConditionTagOption,
  ConditionTagOption,
] = [
  { id: 'urgent', label: '긴급 처리', color: colors.condition.urgent },
  { id: 'core', label: '핵심 작업', color: colors.condition.core },
  { id: 'brain', label: '두뇌 활동', color: colors.condition.brain },
  { id: 'daily', label: '일상 작업', color: colors.condition.daily },
  { id: 'labor', label: '단순 노동', color: colors.condition.labor },
  { id: 'rest', label: '기력 회복', color: colors.condition.rest },
];
