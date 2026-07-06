import type { CardTagTab, ConditionTagId, TimeFocus } from '@/domains/schedule/model';

export type RepeatOrigin = 'new' | 'edit';

export type CardCreateSheetState =
  | { kind: 'none' }
  | { kind: 'dateTime'; focus: TimeFocus }
  | { kind: 'dueDuration' }
  | { kind: 'repeatPreset'; origin: RepeatOrigin }
  | { kind: 'repeatCustom'; origin: RepeatOrigin }
  | { kind: 'location' }
  | { kind: 'tagPicker'; tab: CardTagTab; selectedConditionTagId: ConditionTagId | null }
  | { kind: 'dateOnlyGuide' };

export type { CardCreateSheetState as SheetState };
