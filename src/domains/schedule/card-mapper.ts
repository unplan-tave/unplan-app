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
    date: createInput.date,
    startTime: createInput.startTime,
    endTime: createInput.endTime,
    estimatedMinutes: toEstimatedMinutes(values),
    memo: createInput.memo,
    isReminderEnabled: createInput.isReminderEnabled,
    reminderMinutes: createInput.reminderMinutes,
    reminderType: createInput.reminderType,
    reminderSoundType: createInput.reminderSoundType,
  };
}

export function toCardItemFromScheduleDetail(detail: ScheduleDetail): CardItem {
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

export function toCardItemsFromScheduleList(items: ScheduleListItem[]): CardItem[] {
  return items.map(toCardItemFromScheduleListItem);
}

export function toCardItemFromScheduleListItem(item: ScheduleListItem): CardItem {
  const defaults = createDefaultCardFormValues();
  const estimatedDuration = fromEstimatedMinutes(item.estimatedMinutes);
  const isPinTimeFilled = !item.isQueue && item.startTime.length > 0 && item.endTime.length > 0;

  return {
    ...defaults,
    id: String(item.id),
    cardType: item.isQueue ? 'queue' : 'pin',
    title: item.title,
    conditionTagId: item.conditionTagId,
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

function toScheduleInputBase(
  values: CardFormValues,
  personalTags: PersonalTagOption[],
): ScheduleCreateInput {
  return {
    title: values.title.trim(),
    conditionTagId: values.conditionTagId,
    personalTags: toPersonalTagLabels(values.personalTagIds, personalTags),
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
