import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

/** 카드 목록의 로딩·오류 문구를 표시합니다. */
export function CardListStatusMessage({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Typography variant="bodyM" color={colors.gray.white} align="center">
        {message}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[4],
  },
});
