import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

export function CardListEmptyState({ hasActiveFilter }: { hasActiveFilter: boolean }) {
  return (
    <View style={styles.container}>
      <Typography variant="titleL" color={colors.gray[700]} align="center">
        {hasActiveFilter ? '검색 결과가 없어요!' : '표시할 카드가 없어요'}
      </Typography>
      <Typography variant="bodyM" color={colors.gray[600]} align="center">
        {hasActiveFilter
          ? '일정 제목에 포함되는 글자를 검색해 주세요'
          : '핀카드나 큐카드를 추가해 보세요.'}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2] + 2,
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[4],
  },
});
