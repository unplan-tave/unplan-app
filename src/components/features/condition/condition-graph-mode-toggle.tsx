import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

const TOGGLE_HEIGHT = 28;

/** 컨디션 그래프 상단 라벨. 흐름 보기는 미출시라 평균 보기만 노출합니다. */
export function ConditionGraphModeToggle() {
  return (
    <View style={styles.container}>
      <Typography variant="caption" color={colors.gray[800]}>
        평균 보기
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: TOGGLE_HEIGHT,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
});
