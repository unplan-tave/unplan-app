import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

interface SleepConflictSheetProps {
  visible: boolean;
  /** 겹치는 기존 에너지 기록을 지우고 수면 기록을 저장합니다. */
  onOverwrite: () => void;
  /** 수면 기록 시간을 다시 조정하러 돌아갑니다. */
  onClose: () => void;
}

/** 수면 기록과 에너지 기록 시간이 겹칠 때 뜨는 확인 시트입니다. */
export function SleepConflictSheet({ visible, onOverwrite, onClose }: SleepConflictSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        </Pressable>
        <Typography variant="titleS" color={colors.gray[800]}>
          기록 충돌 확인
        </Typography>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onOverwrite}>
          <Typography variant="bodyM" color={colors.primary}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Icon name="warning" variant="badge" size={96} />
        <Typography variant="titleS" align="center" color={colors.secondary}>
          수면 기록과 에너지 기록이 겹쳐요!
        </Typography>
        <Typography variant="bodyS" align="center" color={colors.gray[500]}>
          입력한 수면 시간 중 일부가 기존 에너지 기록 시간과 겹쳐요{'\n'}하나의 시간대엔 한 가지
          기록만 남길 수 있어요
        </Typography>
      </View>

      <View style={styles.actions}>
        <ConflictActionButton label="기존 에너지 기록 삭제하고 저장" onPress={onOverwrite} />
        <ConflictActionButton label="수면 기록 시간 변경하기" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

function ConflictActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Typography variant="titleS" align="center" color={colors.gray[800]}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    borderRadius: radius['2xl'],
    backgroundColor: colors.alpha.white50,
  },
  actions: {
    gap: spacing[2],
  },
  actionButton: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.gray.white,
  },
  pressed: {
    opacity: 0.72,
  },
});
