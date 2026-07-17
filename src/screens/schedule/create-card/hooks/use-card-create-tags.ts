import { useEffect, useRef, useState } from 'react';

import {
  getSuggestedConditionTag,
  type CardFormValues,
  type ConditionTagId,
} from '@/domains/schedule/model';

import type { UseFormSetValue } from 'react-hook-form';

type TagFeedbackState = 'none' | 'success' | 'error';

interface UseCardCreateTagsParams {
  title: string;
  initializedTitle: string | null;
  conditionTagId: ConditionTagId;
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  syncTagSheetSelectedId: (tagId: ConditionTagId) => void;
}

/** 카드 생성 form의 컨디션·개인 태그 선택을 관리합니다. */
export function useCardCreateTags({
  title,
  initializedTitle,
  conditionTagId,
  setValue,
  updateDraftValues,
  syncTagSheetSelectedId,
}: UseCardCreateTagsParams) {
  const previousTitleRef = useRef('');
  const skipNextTitleEffectRef = useRef(false);
  const [showTagFeedback, setShowTagFeedback] = useState(false);
  const [showTagErrorFeedback, setShowTagErrorFeedback] = useState(false);

  useEffect(() => {
    if (initializedTitle == null) return;
    previousTitleRef.current = initializedTitle;
    skipNextTitleEffectRef.current = true;
  }, [initializedTitle]);

  useEffect(() => {
    if (skipNextTitleEffectRef.current) {
      skipNextTitleEffectRef.current = false;
      return;
    }

    if (title === previousTitleRef.current) return;
    previousTitleRef.current = title;

    if (title.trim().length === 0) {
      setShowTagFeedback(false);
      setShowTagErrorFeedback(false);
      setValue('conditionTagId', 'daily', { shouldDirty: true });
      updateDraftValues({ conditionTagId: 'daily' });
      syncTagSheetSelectedId('daily');
      return;
    }

    const nextTag = getSuggestedConditionTag(title);

    if (nextTag == null) {
      setValue('conditionTagId', 'daily', { shouldDirty: true });
      updateDraftValues({ conditionTagId: 'daily' });
      syncTagSheetSelectedId('daily');
      setShowTagFeedback(false);
      setShowTagErrorFeedback(true);
      return;
    }

    if (conditionTagId !== nextTag.id) {
      setValue('conditionTagId', nextTag.id, { shouldDirty: true });
      updateDraftValues({ conditionTagId: nextTag.id });
      syncTagSheetSelectedId(nextTag.id);
      setShowTagErrorFeedback(false);
      setShowTagFeedback(true);
    }
  }, [conditionTagId, setValue, syncTagSheetSelectedId, title, updateDraftValues]);

  useEffect(() => {
    if (!showTagFeedback) return;
    const id = setTimeout(() => setShowTagFeedback(false), 3_000);
    return () => clearTimeout(id);
  }, [showTagFeedback]);

  useEffect(() => {
    if (!showTagErrorFeedback) return;
    const id = setTimeout(() => setShowTagErrorFeedback(false), 3_000);
    return () => clearTimeout(id);
  }, [showTagErrorFeedback]);

  const tagFeedback: TagFeedbackState = showTagErrorFeedback
    ? 'error'
    : showTagFeedback
      ? 'success'
      : 'none';

  return {
    tagFeedback,
  };
}
