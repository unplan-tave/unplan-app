import { useCallback, useEffect, useRef, useState } from 'react';

import { useTagRecommendationQuery } from '@/domains/schedule/api/queries';
import {
  getConditionTagIdByRecommendation,
  type CardFormValues,
  type ConditionTagId,
} from '@/domains/schedule/model';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

import type { UseFormSetValue } from 'react-hook-form';

type TagFeedbackState = 'none' | 'success' | 'error';

const TAG_RECOMMENDATION_DEBOUNCE_MS = 400;
const TAG_FEEDBACK_VISIBLE_MS = 3_000;

interface UseCardCreateTagsParams {
  title: string;
  initializedTitle: string | null;
  conditionTagId: ConditionTagId;
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  syncTagSheetSelectedId: (tagId: ConditionTagId) => void;
}

/**
 * 카드 생성 form의 컨디션 태그 자동 선택을 관리합니다.
 * 제목 입력이 멈추면 /schedules/tag-recommendation 응답으로 컨디션 태그를 골라줍니다.
 */
export function useCardCreateTags({
  title,
  initializedTitle,
  conditionTagId,
  setValue,
  updateDraftValues,
  syncTagSheetSelectedId,
}: UseCardCreateTagsParams) {
  const trimmedTitle = title.trim();
  const debouncedTitle = useDebouncedValue(trimmedTitle, TAG_RECOMMENDATION_DEBOUNCE_MS);
  const initializedTitleValue = initializedTitle?.trim() ?? null;
  const isInitializedTitle =
    initializedTitleValue != null && debouncedTitle === initializedTitleValue;

  const [feedback, setFeedback] = useState<TagFeedbackState>('none');

  const conditionTagIdRef = useRef(conditionTagId);
  conditionTagIdRef.current = conditionTagId;

  const applyConditionTag = useCallback(
    (nextId: ConditionTagId) => {
      if (conditionTagIdRef.current === nextId) {
        return;
      }

      setValue('conditionTagId', nextId, { shouldDirty: true });
      updateDraftValues({ conditionTagId: nextId });
      syncTagSheetSelectedId(nextId);
    },
    [setValue, syncTagSheetSelectedId, updateDraftValues],
  );

  const recommendationQuery = useTagRecommendationQuery(debouncedTitle, {
    enabled: debouncedTitle.length > 0 && !isInitializedTitle,
  });
  const recommendationData = recommendationQuery.data;
  const recommendationStatus = recommendationQuery.status;
  const isRecommendationFetching = recommendationQuery.isFetching;

  // 제목을 비우면 기본 컨디션 태그로 되돌리고 피드백을 숨깁니다.
  useEffect(() => {
    if (trimmedTitle.length > 0) {
      return;
    }

    applyConditionTag('daily');
    setFeedback('none');
  }, [applyConditionTag, trimmedTitle]);

  // 추천 응답이 도착하면 컨디션 태그와 피드백을 반영합니다.
  useEffect(() => {
    if (isInitializedTitle || debouncedTitle.length === 0 || isRecommendationFetching) {
      return;
    }

    if (recommendationStatus === 'error') {
      applyConditionTag('daily');
      setFeedback('error');
      return;
    }

    if (recommendationStatus !== 'success') {
      return;
    }

    const nextId =
      recommendationData == null
        ? null
        : getConditionTagIdByRecommendation(recommendationData.label);

    if (nextId == null) {
      applyConditionTag('daily');
      setFeedback('error');
      return;
    }

    applyConditionTag(nextId);
    setFeedback('success');
  }, [
    applyConditionTag,
    debouncedTitle,
    isInitializedTitle,
    isRecommendationFetching,
    recommendationData,
    recommendationStatus,
  ]);

  useEffect(() => {
    if (feedback === 'none') {
      return;
    }

    const timer = setTimeout(() => setFeedback('none'), TAG_FEEDBACK_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [feedback]);

  return {
    tagFeedback: feedback,
  };
}
