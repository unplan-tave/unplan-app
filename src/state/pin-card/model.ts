import { CONDITION_TAG_OPTIONS, DEFAULT_DATE_RANGE, DEFAULT_TIME_RANGE } from './data';
import { type RecurrenceValue } from './recurrence';

export type { RecurrenceValue } from './recurrence';

export type CardTab = 'pin' | 'queue';
export type DateMode = 'empty' | 'single' | 'range';
export type TimeFocus = 'start' | 'end';
export type ConditionTagId = 'urgent' | 'core' | 'brain' | 'daily' | 'labor' | 'rest';

export const MEMO_MAX_LENGTH = 2000;

export interface PinCardFormValues {
  title: string;
  conditionTagId: ConditionTagId;
  personalTagIds: string[];
  dateMode: DateMode;
  dateStart: string;
  dateEnd: string;
  timeFilled: boolean;
  timeStart: string;
  timeEnd: string;
  location: string;
  locationDetail: string;
  memo: string;
  repeatEnabled: boolean;
  recurrence: RecurrenceValue | null;
  reminderEnabled: boolean;
  dueDate: string;
  durationHours: number;
  durationMinutes: number;
  durationUnknown: boolean;
  recommendationAcknowledged: boolean;
}

export interface PinCardItem extends PinCardFormValues {
  id: string;
  cardType: CardTab;
  createdAt: string;
  updatedAt: string;
}

export interface PinCardDraft {
  mode: 'create' | 'edit';
  editingCardId: string | null;
  cardType: CardTab;
  values: PinCardFormValues;
}

export interface DateTimeDraft {
  dateMode: DateMode;
  dateStart: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
}

export interface ConditionTagOption {
  id: ConditionTagId;
  label: string;
  color: string;
}

export interface PersonalTagOption {
  id: string;
  label: string;
  createdAt: string;
}

export interface CalendarCell {
  key: string;
  label: string;
  value: string;
  isToday: boolean;
}

export function createDefaultPinCardFormValues(): PinCardFormValues {
  return {
    title: '',
    conditionTagId: 'daily',
    personalTagIds: [],
    dateMode: 'empty',
    dateStart: '',
    dateEnd: '',
    timeFilled: false,
    timeStart: '',
    timeEnd: '',
    location: '',
    locationDetail: '',
    memo: '',
    repeatEnabled: false,
    recurrence: null,
    reminderEnabled: false,
    dueDate: '',
    durationHours: 0,
    durationMinutes: 0,
    durationUnknown: false,
    recommendationAcknowledged: false,
  };
}

export function createPinCardItem(
  cardType: CardTab,
  values: PinCardFormValues,
  id = createPinCardId(),
): PinCardItem {
  const now = new Date().toISOString();

  return {
    ...clonePinCardFormValues(values),
    id,
    cardType,
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePinCardItem(
  card: PinCardItem,
  cardType: CardTab,
  values: PinCardFormValues,
): PinCardItem {
  return {
    ...card,
    ...clonePinCardFormValues(values),
    cardType,
    updatedAt: new Date().toISOString(),
  };
}

export function createPinCardDraft(cardType: CardTab, values: PinCardFormValues): PinCardDraft {
  return {
    mode: 'create',
    editingCardId: null,
    cardType,
    values: clonePinCardFormValues(values),
  };
}

export function createPinCardEditDraft(card: PinCardItem): PinCardDraft {
  return {
    mode: 'edit',
    editingCardId: card.id,
    cardType: card.cardType,
    values: clonePinCardFormValues(card),
  };
}

export function clonePinCardFormValues(values: PinCardFormValues): PinCardFormValues {
  return {
    title: values.title,
    conditionTagId: values.conditionTagId,
    personalTagIds: [...values.personalTagIds],
    dateMode: values.dateMode,
    dateStart: values.dateStart,
    dateEnd: values.dateEnd,
    timeFilled: values.timeFilled,
    timeStart: values.timeStart,
    timeEnd: values.timeEnd,
    location: values.location,
    locationDetail: values.locationDetail,
    memo: values.memo,
    repeatEnabled: values.repeatEnabled,
    recurrence:
      values.recurrence == null
        ? null
        : { ...values.recurrence, byDay: [...values.recurrence.byDay] },
    reminderEnabled: values.reminderEnabled,
    dueDate: values.dueDate ?? '',
    durationHours: values.durationHours ?? 0,
    durationMinutes: values.durationMinutes ?? 0,
    durationUnknown: values.durationUnknown ?? false,
    recommendationAcknowledged: values.recommendationAcknowledged ?? false,
  };
}

function createPinCardId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getConditionTagById(tagId: ConditionTagId) {
  return CONDITION_TAG_OPTIONS.find((tag) => tag.id === tagId) ?? CONDITION_TAG_OPTIONS[3];
}

export function getConditionTagDescription(tagId: ConditionTagId) {
  switch (tagId) {
    case 'urgent':
      return {
        summary: '마감이나 우선순위가 높은 급한 일정',
        examples: '당장 마감인 업무, 급한 제출',
      };
    case 'core':
      return {
        summary: '집중력과 에너지가 모두 필요한 중요 일정',
        examples: '보고서 작성, 시험 공부, 운동',
      };
    case 'brain':
      return {
        summary: '생각하고 아이디어를 내는 일정',
        examples: '기획, 독서, 전략 수립',
      };
    case 'daily':
      return {
        summary: '부담 없이 할 수 있는 일상 업무',
        examples: '메일 확인, 가벼운 미팅, 일상 루틴',
      };
    case 'labor':
      return {
        summary: '반복적이거나 몸을 움직이는 일정',
        examples: '정리정돈, 집안일, 물건 옮기기',
      };
    case 'rest':
      return {
        summary: '휴식과 재충전을 위한 일정',
        examples: '낮잠, 산책, 명상',
      };
  }
}

export function getSuggestedConditionTag(title: string) {
  if (title.includes('아르바이트') || title.includes('청소') || title.includes('정리')) {
    return getConditionTagById('labor');
  }

  if (
    title.includes('회의') ||
    title.includes('독서') ||
    title.includes('공부') ||
    title.includes('기획')
  ) {
    return getConditionTagById('brain');
  }

  if (title.includes('휴식') || title.includes('산책') || title.includes('회복')) {
    return getConditionTagById('rest');
  }

  if (title.includes('과제') || title.includes('프로젝트') || title.includes('마감')) {
    return getConditionTagById('core');
  }

  return null;
}

export function normalizePersonalTagLabel(label: string) {
  return label.trim().slice(0, 25);
}

export function canCreatePersonalTag(label: string, personalTags: PersonalTagOption[]) {
  const normalizedLabel = normalizePersonalTagLabel(label);

  if (normalizedLabel.length === 0 || normalizedLabel.length > 25 || personalTags.length >= 100) {
    return false;
  }

  return !personalTags.some((tag) => tag.label === normalizedLabel);
}

export function sortPersonalTags(personalTags: PersonalTagOption[]) {
  return [...personalTags].sort((first, second) => first.label.localeCompare(second.label, 'ko'));
}

export function createPersonalTag(label: string): PersonalTagOption {
  const normalizedLabel = normalizePersonalTagLabel(label);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: normalizedLabel,
    createdAt: new Date().toISOString(),
  };
}

export function getDateValue(mode: DateMode, dateStart: string, dateEnd: string) {
  if (mode === 'single') {
    return dateStart || DEFAULT_DATE_RANGE[0];
  }

  if (mode === 'range') {
    return [dateStart || DEFAULT_DATE_RANGE[0], dateEnd || DEFAULT_DATE_RANGE[1]] as const;
  }

  return DEFAULT_DATE_RANGE;
}

export function getTimeValue(filled: boolean, timeStart: string, timeEnd: string) {
  if (!filled) {
    return DEFAULT_TIME_RANGE;
  }

  return [timeStart || DEFAULT_TIME_RANGE[0], timeEnd || DEFAULT_TIME_RANGE[1]] as const;
}

export function hasCompleteTime(draft: DateTimeDraft) {
  return draft.timeStart.length > 0 && draft.timeEnd.length > 0;
}

export function getCalendarMonth(today: Date) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const leadingEmptyCount = firstDate.getDay();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < leadingEmptyCount; index += 1) {
    cells.push({ key: `empty-start-${index}`, label: '', value: '', isToday: false });
  }

  for (let day = 1; day <= lastDate.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const value = formatDateValue(date);

    cells.push({
      key: value,
      label: String(day),
      value,
      isToday: day === today.getDate(),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, label: '', value: '', isToday: false });
  }

  return {
    title: `${year}년 ${month + 1}월`,
    cells,
  };
}

export function sortDateValues(first: string, second: string) {
  return first <= second ? ([first, second] as const) : ([second, first] as const);
}

export function isDateInDraftRange(value: string, draft: DateTimeDraft) {
  if (value.length === 0 || draft.dateMode !== 'range' || draft.dateEnd.length === 0) {
    return false;
  }

  return value > draft.dateStart && value < draft.dateEnd;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}
