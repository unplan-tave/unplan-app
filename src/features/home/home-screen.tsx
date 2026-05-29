import { SafeAreaView, StyleSheet } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="titleL" style={styles.title}>
        AI 스마트 스케줄러
      </Typography>
      <Typography variant="bodyM" color={colors.text.secondary}>
        오늘의 일정을 관리하세요
      </Typography>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
});
