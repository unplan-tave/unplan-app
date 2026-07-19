/** 홈 화면에서 쓰는 React 비의존 계산을 모읍니다. */
import { getConditionCommentByDate } from '@/domains/condition/comment';
import { getCardPersonalTagLabels } from '@/domains/schedule/list';
import {
  getConditionTagById,
  type CardItem,
  type PersonalTagOption,
} from '@/domains/schedule/model';
import { type DueDurationDraft } from '@/domains/schedule/queue';
import { addMinutesToTime, parseTimeToMinutes } from '@/domains/schedule/time';
import { getLocale } from '@/lib/i18n';

/** 타임라인 카드가 화면에 표시할 props를 생성합니다. */
export function toHomeTimelineCardViewModel(
  card: CardItem,
  personalTags: PersonalTagOption[],
  isRecommendation: boolean,
) {
  const conditionTag = getConditionTagById(card.conditionTagId);

  return {
    id: card.id,
    title: card.title,
    time: card.timeStart || '00:00',
    range: card.timeFilled
      ? `${card.timeStart || '00:00'} - ${card.timeEnd || '00:00'}`
      : '00:00 - 00:00',
    status: isRecommendation
      ? ('recommendation' as const)
      : card.progressStatus === 'complete'
        ? ('complete' as const)
        : ('default' as const),
    tags: [
      { label: conditionTag.label, variant: 'condition' as const, condition: card.conditionTagId },
      ...getCardPersonalTagLabels(card, personalTags).map((label) => ({
        label,
        variant: 'personal' as const,
      })),
    ],
  };
}

/** 선택한 일정의 종료 시각이 현재 시각을 지났는지 판별합니다. */
export function isHomeScheduleEnded(card: CardItem, selectedDate: Date, now: Date) {
  if (card.cardType === 'queue' || !card.timeFilled || !card.timeEnd) {
    return false;
  }

  const [hours, minutes] = card.timeEnd.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }

  const endAt = new Date(selectedDate);
  endAt.setHours(hours, minutes, 0, 0);

  return endAt.getTime() <= now.getTime();
}

/** 카드의 날짜와 시간으로 진행 상태 시트의 요약 문구를 만듭니다. */
export function getHomeProgressTimeSummary(card: CardItem) {
  const dateLabel = card.dateStart ? card.dateStart.slice(5).replace(/[.-]/g, '/') : '';
  const range = card.timeFilled ? `${card.timeStart} - ${card.timeEnd}` : '';

  return [dateLabel, range].filter(Boolean).join('  ');
}

/** 핀 카드를 큐 카드로 바꿀 때 사용하는 시트의 초기값을 계산합니다. */
export function createHomeQueueDraft(card: CardItem | null): DueDurationDraft {
  if (card == null) {
    return { dueDate: '', durationHours: 0, durationMinutes: 0, durationUnknown: false };
  }

  const startMinutes = parseTimeToMinutes(card.timeStart);
  const endMinutes = parseTimeToMinutes(card.timeEnd);
  const rangeMinutes =
    card.timeFilled && startMinutes != null && endMinutes != null && endMinutes > startMinutes
      ? endMinutes - startMinutes
      : card.durationHours * 60 + card.durationMinutes;

  return {
    dueDate: '',
    durationHours: Math.floor(rangeMinutes / 60),
    durationMinutes: rangeMinutes % 60,
    durationUnknown: false,
  };
}

export interface HomeExtendState {
  newEndTime: string;
  hasConflict: boolean;
  decreaseDisabled: boolean;
}

/** 일정 연장 후의 종료 시각·충돌 여부·감소 가능 여부를 계산합니다. */
export function getHomeExtendState(
  card: CardItem | null,
  extensionMinutes: number,
  cards: CardItem[],
  minimumExtensionMinutes: number,
): HomeExtendState {
  if (card == null) {
    return { newEndTime: '', hasConflict: false, decreaseDisabled: true };
  }

  const newEndTime = addMinutesToTime(card.timeEnd, extensionMinutes);
  const newEndMinutes = parseTimeToMinutes(newEndTime);
  const originalEndMinutes = parseTimeToMinutes(card.timeEnd);
  const nextStartMinutes = getNextHomeScheduleStartMinutes(card, originalEndMinutes, cards);

  return {
    newEndTime,
    hasConflict:
      newEndMinutes != null && nextStartMinutes != null && newEndMinutes > nextStartMinutes,
    decreaseDisabled: extensionMinutes <= minimumExtensionMinutes,
  };
}

/** 연장 대상 뒤에 시작하는 가장 이른 핀 카드 시각을 찾습니다. */
function getNextHomeScheduleStartMinutes(
  card: CardItem,
  originalEndMinutes: number | null,
  cards: CardItem[],
): number | null {
  if (originalEndMinutes == null) {
    return null;
  }

  let nextStart: number | null = null;
  for (const other of cards) {
    if (other.id === card.id || other.cardType === 'queue' || !other.timeFilled) {
      continue;
    }

    const startMinutes = parseTimeToMinutes(other.timeStart);
    if (startMinutes == null || startMinutes < originalEndMinutes) {
      continue;
    }

    if (nextStart == null || startMinutes < nextStart) {
      nextStart = startMinutes;
    }
  }

  return nextStart;
}

/** 현재 시각을 타임라인 배지의 HH:mm 문자열로 포맷합니다. */
export function formatHomeCurrentTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** 메모 시트 상단에 표시할 날짜 문자열을 포맷합니다. */
export function formatHomeDailyMemoDate(date: Date) {
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}

/** 서버 메시지와 로딩·오류 상태로 홈 헤더 메시지를 선택합니다. */
export function getHomeHeaderMessage({
  dailyMessage,
  isError,
  isLoading,
  selectedDateValue,
}: {
  dailyMessage?: string;
  isError: boolean;
  isLoading: boolean;
  selectedDateValue: string;
}) {
  if (dailyMessage?.trim()) {
    return dailyMessage;
  }

  if (isError) {
    return '홈 데이터를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.';
  }

  if (isLoading) {
    return '오늘의 컨디션과 일정을 불러오고 있어요.';
  }

  return getConditionCommentByDate(selectedDateValue);
}
