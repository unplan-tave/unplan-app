import { DateTimeSheet } from '@/components/domain/schedule/date-time-editor';

import type { DateTimeDraft } from '@/domains/schedule/model';

/** 카드 목록 조회 기간과 시간을 선택하는 Figma 날짜/시간 바텀시트입니다. */
export function CardListDateRangeSheet({
  visible,
  value,
  onClose,
  onDone,
}: {
  visible: boolean;
  value: DateTimeDraft;
  onClose: () => void;
  onDone: (value: DateTimeDraft) => void;
}) {
  return (
    <DateTimeSheet
      visible={visible}
      focus="start"
      value={value}
      onClose={onClose}
      onDone={onDone}
    />
  );
}
