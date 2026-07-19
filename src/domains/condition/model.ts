/**
 * condition 도메인의 화면 독립 모델입니다.
 * 컨디션 기록, 그래프/기간 모드, 추천 카드에 필요한 데이터 구조를 정의합니다.
 */
import { type ConditionTagId } from '@/domains/schedule/model';

/** 컨디션 그래프 상단 토글. `flow`(흐름 보기)는 Figma 기준 발표 이후 구현 예정입니다. */
export type ConditionGraphMode = 'average' | 'flow';

/** 컨디션 탭이 보여주는 기간 단위. 홈 탭의 view mode와 동일한 축을 사용합니다. */
export type ConditionPeriodMode = 'daily' | 'weekly' | 'monthly';

export type ConditionMetricKey = 'body' | 'mind' | 'sleep';

export interface ConditionRecordEntry {
  id: number;
  bodyScore: number;
  mindScore: number;
  bodyScorePercent: number;
  mindScorePercent: number;
  dateTime: string;
}

export interface ConditionRecordInput {
  id?: number;
  bodyScore: number;
  mindScore: number;
  dateTime: string;
}

/** 게이지 카드 한 장(Body/Mind/Sleep)에 필요한 표시 값. */
export interface ConditionMetricCard {
  key: ConditionMetricKey;
  label: string;
  /** 카드에 노출되는 값 문자열. Body/Mind는 `80%`, Sleep은 `12h 50m` 형태입니다. */
  value: string;
  /** 게이지 채움 비율(0~100). */
  progress: number;
  comment: string;
}

/** 추천 일정을 배치할 수 있는 빈 시간대. */
export interface ConditionFreeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

/** 큐 카드를 빈 시간대에 배치하는 추천. */
export interface QueueConditionRecommendation {
  kind: 'queue';
  id: string;
  recommendId?: number;
  title: string;
  conditionTagId: ConditionTagId;
  /** 서버 condition_tag_label. 없으면 conditionTagId의 기본 라벨을 사용합니다. */
  conditionTagLabel?: string;
  /** 비회복 추천의 후보별 추천 근거입니다. */
  reasonMessages: string[];
  dueLabel: string | null;
  durationLabel: string;
}

/** 회복 수단을 제안하는 추천. 사용자가 온보딩/설정에서 고른 회복 수단 중 하나를 선택합니다. */
export interface RecoveryConditionRecommendation {
  kind: 'recovery';
  id: string;
  recommendId?: number;
  reasonMessages: string[];
  durationLabel: string;
  options: RecoveryRecommendationOption[];
}

export interface RecoveryRecommendationOption {
  id: string;
  label: string;
}

export type ConditionRecommendation =
  | QueueConditionRecommendation
  | RecoveryConditionRecommendation;
