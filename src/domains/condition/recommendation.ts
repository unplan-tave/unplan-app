/**
 * 컨디션 추천 UI의 서버 응답 표시 로직입니다.
 */
import { t } from '@/lib/i18n';

import {
  type ConditionFreeSlot,
  type ConditionRecommendation,
  type RecoveryConditionRecommendation,
} from './model';

const MINUTES_PER_HOUR = 60;

/**
 * 빈 시간대 안내 문구.
 * 예: `14:00 ~ 15:30까지, 1시간 30분 동안 스케줄이 비어 있어요`
 */
export function formatFreeSlotMessage(slot: ConditionFreeSlot): string {
  return `${slot.startTime} ~ ${slot.endTime}까지, ${formatDurationLabel(slot.durationMinutes)} ${t('condition.recommendation.freeSlotMessageSuffix')}`;
}

/** `약 1시간 소요` 형태의 소요 시간 라벨. */
export function formatDurationCaption(totalMinutes: number): string {
  return `약 ${formatDurationLabel(totalMinutes)} ${t('condition.recommendation.durationSuffix')}`;
}

export function formatDurationLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (hours > 0 && minutes > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  return hours > 0 ? `${hours}시간` : `${minutes}분`;
}

/** 현재 페이지의 추천이 회복 수단 추천인지 판단합니다. */
export function isRecoveryRecommendation(
  recommendation: ConditionRecommendation | undefined,
): recommendation is RecoveryConditionRecommendation {
  return recommendation?.kind === 'recovery';
}
