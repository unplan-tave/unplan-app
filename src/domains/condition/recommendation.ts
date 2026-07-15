/**
 * condition 추천 UI에 필요한 fallback/표시 로직입니다.
 * 서버 추천 API가 주는 값과 별도로, 빈 시간 문구·소요 시간 라벨·추천 타입 판별을 제공합니다.
 */
import { type RecoveryOptionId } from '@/domains/onboarding/model';
import { type CardItem } from '@/domains/schedule/model';
import { formatMinutesToTime, parseTimeToMinutes } from '@/domains/schedule/time';
import { t } from '@/lib/i18n';
import { type TranslationKey } from '@/translations/ko';

import {
  type ConditionFreeSlot,
  type ConditionRecommendation,
  type QueueConditionRecommendation,
  type RecoveryConditionRecommendation,
  type RecoveryRecommendationOption,
} from './model';

const MINUTES_PER_HOUR = 60;
const RECOVERY_SLOT_MINUTES = 30;
const RECOVERY_RECOMMENDATION_ID = 'recovery';

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

/**
 * 선택한 날짜의 핀 일정 사이에서 가장 먼저 나오는 빈 시간대를 찾습니다.
 * 추천 API 연동 전까지 클라이언트가 보유한 핀 카드만으로 계산합니다.
 */
export function findFreeSlot(
  pinCards: CardItem[],
  fromTime: string,
  dayEndTime: string,
  minimumMinutes: number,
): ConditionFreeSlot | null {
  const dayEndMinutes = parseTimeToMinutes(dayEndTime);
  let cursor = parseTimeToMinutes(fromTime);

  if (cursor == null || dayEndMinutes == null) {
    return null;
  }

  const busyRanges = pinCards
    .filter((card) => card.cardType === 'pin' && card.timeFilled)
    .map((card) => ({
      start: parseTimeToMinutes(card.timeStart),
      end: parseTimeToMinutes(card.timeEnd),
    }))
    .filter(
      (range): range is { start: number; end: number } => range.start != null && range.end != null,
    )
    .sort((first, second) => first.start - second.start);

  for (const range of busyRanges) {
    if (range.end <= cursor) {
      continue;
    }

    if (range.start - cursor >= minimumMinutes) {
      return toFreeSlot(cursor, range.start);
    }

    cursor = Math.max(cursor, range.end);
  }

  if (dayEndMinutes - cursor >= minimumMinutes) {
    return toFreeSlot(cursor, dayEndMinutes);
  }

  return null;
}

/** 빈 시간대에 넣을 수 있는(소요 시간이 슬롯보다 짧은) 큐 카드만 추천 후보로 남깁니다. */
export function toQueueRecommendations(
  queueCards: CardItem[],
  slot: ConditionFreeSlot,
): QueueConditionRecommendation[] {
  return queueCards
    .filter((card) => card.cardType === 'queue')
    .filter((card) => getCardDurationMinutes(card) <= slot.durationMinutes)
    .map((card) => ({
      kind: 'queue',
      id: card.id,
      title: card.title,
      conditionTagId: card.conditionTagId,
      reason: t('condition.recommendation.queue.reason'),
      dueLabel: card.dueDate
        ? `${t('condition.recommendation.dueDatePrefix')} ${formatDueDate(card.dueDate)}`
        : null,
      durationLabel: card.durationUnknown
        ? t('condition.recommendation.durationUnknown')
        : formatDurationCaption(getCardDurationMinutes(card)),
    }));
}

const RECOVERY_OPTION_LABEL_KEYS = {
  nap: 'settings.recovery.nap',
  music: 'settings.recovery.music',
  walk: 'settings.recovery.walk',
  stretching: 'settings.recovery.stretching',
  food: 'settings.recovery.food',
} as const satisfies Record<Exclude<RecoveryOptionId, 'custom'>, TranslationKey>;

/** 온보딩/설정에서 고른 회복 수단을 추천 시트에 노출할 칩 목록으로 변환합니다. */
export function toRecoveryOptions(
  optionIds: RecoveryOptionId[],
  customLabel: string | null,
): RecoveryRecommendationOption[] {
  return optionIds.flatMap<RecoveryRecommendationOption>((optionId) => {
    if (optionId === 'custom') {
      return customLabel ? [{ id: optionId, label: customLabel }] : [];
    }

    return [{ id: optionId, label: t(RECOVERY_OPTION_LABEL_KEYS[optionId]) }];
  });
}

/** 회복 수단 추천. 사용자가 설정한 회복 수단이 없으면 추천하지 않습니다. */
export function toRecoveryRecommendation(
  options: RecoveryRecommendationOption[],
): RecoveryConditionRecommendation | null {
  if (options.length === 0) {
    return null;
  }

  return {
    kind: 'recovery',
    id: RECOVERY_RECOMMENDATION_ID,
    reason: t('condition.recommendation.recovery.reason'),
    durationLabel: formatDurationCaption(RECOVERY_SLOT_MINUTES),
    options,
  };
}

export function getCardDurationMinutes(card: CardItem): number {
  return card.durationHours * MINUTES_PER_HOUR + card.durationMinutes;
}

/** 현재 페이지의 추천이 회복 수단 추천인지 판단합니다. */
export function isRecoveryRecommendation(
  recommendation: ConditionRecommendation | undefined,
): recommendation is RecoveryConditionRecommendation {
  return recommendation?.kind === 'recovery';
}

function toFreeSlot(startMinutes: number, endMinutes: number): ConditionFreeSlot {
  return {
    startTime: formatMinutesToTime(startMinutes),
    endTime: formatMinutesToTime(endMinutes),
    durationMinutes: endMinutes - startMinutes,
  };
}

/** `2026-06-20` → `6/20` */
function formatDueDate(dueDate: string): string {
  const [, month = '', day = ''] = dueDate.split('-');

  return `${Number(month)}/${Number(day)}`;
}
