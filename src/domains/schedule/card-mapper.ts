/**
 * card form 값과 schedule card item 사이의 변환 로직입니다.
 * create/edit 화면의 draft를 store/list 표현으로 바꿀 때 사용하는 순수 mapper입니다.
 */
import { createDefaultCardFormValues } from './model';

import type {
  CardFormValues,
  CardItem,
  CardTab,
  PersonalTagOption,
  ScheduleCreateInput,
  ScheduleDetail,
  ScheduleListItem,
  ScheduleUpdateInput,
} from './model';
import type { DueDurationDraft } from './queue';

export function toScheduleCreateInput(
  cardType: CardTab,
  values: CardFormValues,
  personalTags: PersonalTagOption[],
): ScheduleCreateInput {
  const baseInput = toScheduleInputBase(values, personalTags);

  if (cardType === 'queue') {
    return {
      ...baseInput,
      date: normalizeOptionalDate(values.dueDate),
      estimatedMinutes: toEstimatedMinutes(values),
    };
  }

  return {
    ...baseInput,
    date: requirePinDate(values),
    startTime: requirePinTime(values.timeStart, 'startTime'),
    endTime: requirePinTime(values.timeEnd, 'endTime'),
    recurrence: values.repeatEnabled ? values.recurrence : null,
  };
}

export function toScheduleUpdateInput(
  values: CardFormValues,
  personalTags: PersonalTagOption[],
): ScheduleUpdateInput {
  const createInput = toScheduleCreateInput('pin', values, personalTags);

  return {
    title: createInput.title,
    conditionTagId: createInput.conditionTagId,
    personalTags: createInput.personalTags,
    date: createInput.date,
    startTime: createInput.startTime,
    endTime: createInput.endTime,
    estimatedMinutes: toEstimatedMinutes(values),
    memo: createInput.memo,
    isReminderEnabled: createInput.isReminderEnabled,
  };
}

/**
 * 핀카드를 큐카드로 전환할 때의 일정 수정 입력.
 * 시작/종료 시간을 비워 큐카드로 만들고 마감일(date)과 소요시간을 넘깁니다.
 * TODO(pin-to-queue-api): 빈 문자열 start/end 전송으로 큐 전환되는지 백엔드 동작 확인 필요.
 */
export function toQueueConversionUpdateInput(draft: DueDurationDraft): ScheduleUpdateInput {
  const minutes = draft.durationUnknown
    ? undefined
    : draft.durationHours * 60 + draft.durationMinutes;

  return {
    date: normalizeOptionalDate(draft.dueDate),
    startTime: '',
    endTime: '',
    estimatedMinutes: minutes != null && minutes > 0 ? minutes : undefined,
  };
}

export function toCardItemFromScheduleDetail(
  detail: ScheduleDetail,
  personalTags: PersonalTagOption[],
): CardItem {
  const defaults = createDefaultCardFormValues();
  const estimatedDuration = fromEstimatedMinutes(detail.estimatedMinutes);
  const isPinTimeFilled =
    !detail.isQueue && detail.startTime.length > 0 && detail.endTime.length > 0;

  return {
    ...defaults,
    id: String(detail.id),
    cardType: detail.isQueue ? 'queue' : 'pin',
    title: detail.title,
    conditionTagId: detail.conditionTagId,
    personalTagIds: toPersonalTagIds(detail.personalTags, personalTags),
    personalTagLabels: detail.personalTags,
    dateMode: detail.isQueue ? 'empty' : 'single',
    dateStart: detail.isQueue ? '' : detail.date,
    timeFilled: isPinTimeFilled,
    timeStart: isPinTimeFilled ? detail.startTime : '',
    timeEnd: isPinTimeFilled ? detail.endTime : '',
    location: detail.location,
    memo: detail.memo,
    reminderEnabled: detail.isReminderEnabled,
    dueDate: detail.isQueue ? detail.date : '',
    durationHours: estimatedDuration.hours,
    durationMinutes: estimatedDuration.minutes,
    durationUnknown: detail.isQueue && detail.estimatedMinutes == null,
    createdAt: '',
    updatedAt: '',
  };
}

export function toCardItemsFromScheduleList(
  items: ScheduleListItem[],
  personalTags: PersonalTagOption[],
): CardItem[] {
  return items.map((item) => toCardItemFromScheduleListItem(item, personalTags));
}

export function toCardItemFromScheduleListItem(
  item: ScheduleListItem,
  personalTags: PersonalTagOption[],
): CardItem {
  const defaults = createDefaultCardFormValues();
  const estimatedDuration = fromEstimatedMinutes(item.estimatedMinutes);
  const isPinTimeFilled = !item.isQueue && item.startTime.length > 0 && item.endTime.length > 0;

  return {
    ...defaults,
    id: String(item.id),
    cardType: item.isQueue ? 'queue' : 'pin',
    title: item.title,
    conditionTagId: item.conditionTagId,
    personalTagIds: toPersonalTagIds(item.personalTags, personalTags),
    personalTagLabels: item.personalTags,
    progressStatus: toCardProgressStatus(item.status),
    dateMode: item.isQueue ? 'empty' : 'single',
    dateStart: item.isQueue ? '' : item.date,
    timeFilled: isPinTimeFilled,
    timeStart: isPinTimeFilled ? item.startTime : '',
    timeEnd: isPinTimeFilled ? item.endTime : '',
    dueDate: item.isQueue ? item.date : '',
    durationHours: estimatedDuration.hours,
    durationMinutes: estimatedDuration.minutes,
    durationUnknown: item.isQueue && item.estimatedMinutes == null,
    createdAt: '',
    updatedAt: '',
  };
}

function toPersonalTagIds(tagLabels: string[], personalTags: PersonalTagOption[]) {
  const labelSet = new Set(tagLabels.map((label) => label.trim()).filter(Boolean));

  return personalTags.filter((tag) => labelSet.has(tag.label)).map((tag) => tag.id);
}

function toScheduleInputBase(
  values: CardFormValues,
  personalTags: PersonalTagOption[],
): ScheduleCreateInput {
  return {
    title: values.title.trim(),
    conditionTagId: values.conditionTagId,
    personalTags: toMergedPersonalTagLabels(values, personalTags),
    memo: normalizeOptionalText(values.memo),
    isReminderEnabled: values.reminderEnabled,
  };
}

function toPersonalTagLabels(tagIds: string[], personalTags: PersonalTagOption[]) {
  const labels = personalTags
    .filter((tag) => tagIds.includes(tag.id))
    .map((tag) => tag.label.trim())
    .filter((label) => label.length > 0);

  return labels.length > 0 ? labels : undefined;
}

function toMergedPersonalTagLabels(values: CardFormValues, personalTags: PersonalTagOption[]) {
  const selectedLabels = toPersonalTagLabels(values.personalTagIds, personalTags) ?? [];
  const labels = [...values.personalTagLabels, ...selectedLabels]
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  const uniqueLabels = [...new Set(labels)];

  return uniqueLabels.length > 0 ? uniqueLabels : undefined;
}

function toEstimatedMinutes(values: CardFormValues) {
  if (values.durationUnknown) {
    return undefined;
  }

  const minutes = values.durationHours * 60 + values.durationMinutes;

  return minutes > 0 ? minutes : undefined;
}

function fromEstimatedMinutes(value: number | null) {
  const minutes = value ?? 0;

  return {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  };
}

function toCardProgressStatus(status: ScheduleListItem['status']) {
  switch (status) {
    case 'done':
      return 'complete';
    case 'inProgress':
      return 'in_progress';
    case 'todo':
    default:
      return 'incomplete';
  }
}

function normalizeOptionalDate(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function requirePinDate(values: CardFormValues) {
  const date = normalizeOptionalDate(values.dateStart);

  if (date == null) {
    throw new Error('Pin card date is required.');
  }

  return date;
}

function requirePinTime(value: string, fieldName: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`Pin card ${fieldName} is required.`);
  }

  return normalized;
}
