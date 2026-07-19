import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

/** 카드 상세의 로딩·오류 상태를 전용 화면으로 표시합니다. */
export function CardViewStatus({ message }: { message: string }) {
  return (
    <ScreenLayout backgroundColor={colors.surface} contentStyle={styles.screenContent}>
      <StatusBar style="dark" />
      <View style={styles.status}>
        <Typography variant="bodyM" color={colors.gray[700]} align="center">
          {message}
        </Typography>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenContent: { flex: 1 },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
});
