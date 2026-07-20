/**
 * ai-recommendation 도메인의 서버 API 경계입니다.
 * 화면은 generated endpoint를 직접 호출하지 않고 이 파일의 함수만 통해
 * 추천 기준 설정, 컨디션 기반 추천 조회, 추천 수락 요청을 수행합니다.
 */
import { isAxiosError } from 'axios';

import {
  acceptRecommendation,
  getConditionRecommendations,
  getQueueCardRecommendations,
  getRecommendations,
  passRecommendation,
} from '@/lib/api/endpoints/recommendation/recommendation';
import {
  getEmptyTimeRecommendSetting as getRecommendationCriteriaSetting,
  updateEmptyTimeRecommendSetting as updateRecommendationCriteriaSetting,
} from '@/lib/api/endpoints/setting-controller/setting-controller';

import {
  toConditionRecommendationViewModel,
  toEmptyTimeSettingRequest,
  toRecommendationAcceptRequest,
  toRecommendationCriteriaSettings,
  toQueueTimeRecommendationResult,
  toScheduleRecommendations,
} from './mapper';

import type {
  AcceptConditionRecommendationInput,
  AcceptRecommendationResult,
  RecommendationAcceptErrorKind,
  QueueTimeRecommendationErrorMode,
  QueueTimeRecommendationResult,
  RecommendationCriteriaSettings,
  ScheduleRecommendation,
} from '../model';
import type { ConditionFreeSlot, ConditionRecommendation } from '@/domains/condition/model';
import type { ConditionTagId } from '@/domains/schedule/model';

export interface ConditionRecommendationResult {
  conditionTagId: ConditionTagId | null;
  conditionTagLabel: string | null;
  freeSlot: ConditionFreeSlot | null;
  summaryMessage: string | null;
  recommendations: ConditionRecommendation[];
}

class RecommendationAcceptError extends Error {
  constructor(readonly kind: RecommendationAcceptErrorKind) {
    super(kind);
  }
}

class QueueTimeRecommendationError extends Error {
  constructor(readonly mode: QueueTimeRecommendationErrorMode) {
    super(mode);
  }
}

export function getRecommendationAcceptErrorKind(error: unknown): RecommendationAcceptErrorKind {
  return error instanceof RecommendationAcceptError ? error.kind : 'unknown';
}

export function getQueueTimeRecommendationErrorMode(
  error: unknown,
): QueueTimeRecommendationErrorMode | null {
  return error instanceof QueueTimeRecommendationError ? error.mode : null;
}

export async function fetchRecommendationCriteriaSettings(): Promise<RecommendationCriteriaSettings> {
  const response = await getRecommendationCriteriaSetting();

  return toRecommendationCriteriaSettings(response.data);
}

export async function submitRecommendationCriteriaSettings(
  settings: RecommendationCriteriaSettings,
): Promise<void> {
  await updateRecommendationCriteriaSetting(toEmptyTimeSettingRequest(settings));
}

export async function fetchConditionRecommendations(
  date: string,
): Promise<ConditionRecommendationResult> {
  const response = await getConditionRecommendations({ date });

  return toConditionRecommendationViewModel(response.data);
}

export async function submitAcceptRecommendation(
  input: AcceptConditionRecommendationInput,
): Promise<AcceptRecommendationResult> {
  try {
    const response = await acceptRecommendation(
      input.recommendId,
      toRecommendationAcceptRequest({
        keepQueueCard: input.keepQueueCard,
        recoveryMean: input.recoveryMean,
      }),
    );

    return {
      scheduleId: response.schedule_id ?? null,
      created: response.created === true,
    };
  } catch (error) {
    throw new RecommendationAcceptError(toRecommendationAcceptErrorKind(error));
  }
}

/** 추천을 당일 목록에서만 건너뜁니다. 원본 큐 카드는 유지됩니다. */
export async function submitPassRecommendation(recommendId: number): Promise<void> {
  await passRecommendation(recommendId);
}

/** 특정 날짜의 일반 큐 카드 추천을 조회합니다. */
export async function fetchScheduleRecommendations(
  date: string,
): Promise<ScheduleRecommendation[]> {
  const response = await getRecommendations({ date });

  return toScheduleRecommendations(response);
}

/** 특정 큐 카드의 추천 시간대를 조회합니다. */
export async function fetchQueueTimeRecommendations(
  scheduleId: number,
  days = 7,
): Promise<QueueTimeRecommendationResult> {
  try {
    return toQueueTimeRecommendationResult(await getQueueCardRecommendations(scheduleId, { days }));
  } catch (error) {
    throw new QueueTimeRecommendationError(toQueueTimeRecommendationErrorMode(error, days));
  }
}

function toRecommendationAcceptErrorKind(error: unknown): RecommendationAcceptErrorKind {
  if (!isAxiosError(error)) return 'network';
  if (error.response?.status === 404) return 'expired';
  if (error.response?.status === 409) return 'conflict';
  if (error.response == null) return 'network';

  return 'unknown';
}

function toQueueTimeRecommendationErrorMode(
  error: unknown,
  days: number,
): QueueTimeRecommendationErrorMode {
  if (!isAxiosError(error) || error.response?.status !== 409) {
    return days === 7 ? 'error-7day' : 'error-14day';
  }

  const data = error.response.data;
  if (typeof data !== 'object' || data == null) {
    return days === 7 ? 'error-7day' : 'error-14day';
  }

  const { canExtendTo14Days, mustChangeDuration } = data as {
    canExtendTo14Days?: unknown;
    mustChangeDuration?: unknown;
  };

  if (mustChangeDuration === true) return 'error-no-duration';
  if (days === 7 && canExtendTo14Days === true) return 'error-7day';

  return 'error-14day';
}
