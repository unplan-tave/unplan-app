import { StyleSheet, View } from 'react-native';

import { Calendar } from '@/components/ui/Calendar';
import { Modal } from '@/components/ui/Modal';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import type { ConditionCalendarDay } from '@/domains/condition/period';

interface ConditionCalendarModalProps {
  visible: boolean;
  title: string;
  days: ConditionCalendarDay[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

/** 컨디션 탭 헤더의 날짜를 눌렀을 때 뜨는 날짜 선택 모달. */
export function ConditionCalendarModal({
  visible,
  title,
  days,
  selectedDate,
  onSelectDate,
  onClose,
}: ConditionCalendarModalProps) {
  return (
    <Modal visible={visible} contentStyle={styles.modal} onClose={onClose}>
      <View style={styles.header}>
        <Typography variant="titleS" color={colors.gray[800]}>
          {title}
        </Typography>
      </View>
      <Calendar
        days={days.map((day) => ({ date: day.date, disabled: day.disabled }))}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
  },
  header: {
    alignItems: 'center',
  },
});
