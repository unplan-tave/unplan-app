import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { Config } from '@/constants/config';
import { colors, spacing } from '@/constants/theme';

import { useDemoLogin } from './hooks/use-demo-login';

export function DemoLoginScreen() {
  const demo = useDemoLogin();
  if (!Config.isDemo) return <Redirect href="/" />;

  return (
    <ScreenLayout contentStyle={styles.container}>
      <Typography variant="titleL" color={colors.primary}>
        Unplan Demo
      </Typography>
      <Typography variant="bodyM">말로 정리하는 하루</Typography>
      <Card style={styles.info} accessibilityRole="text">
        <Typography variant="titleS">AI 일정 비서 · 로컬 데모</Typography>
        <Typography variant="bodyS" color={colors.text.secondary}>
          데모 전용 계정으로 로그인합니다. 일정과 대화는 데모 서버를 사용합니다.
        </Typography>
        <Typography variant="caption" color={colors.text.secondary}>
          {Config.apiUrl}
        </Typography>
      </Card>
      <View style={styles.actions}>
        <Button
          label="데모 사용자 1로 시작"
          variant="primary"
          disabled={demo.isPending}
          onPress={() => void demo.login(1)}
        />
        <Button
          label="데모 사용자 2로 시작"
          disabled={demo.isPending}
          onPress={() => void demo.login(2)}
        />
      </View>
      {demo.isPending ? (
        <ActivityIndicator
          accessibilityLabel="데모 서버 확인 및 로그인 중"
          color={colors.primary}
        />
      ) : null}
      {demo.error ? (
        <Typography accessibilityRole="alert" color={colors.secondary}>
          {demo.error}
        </Typography>
      ) : null}
      <Typography variant="caption" color={colors.text.secondary}>
        반복 없는 단일 일정 · Asia/Seoul
      </Typography>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    padding: spacing[6],
    gap: spacing[4],
  },
  info: { padding: spacing[5], gap: spacing[3] },
  actions: { gap: spacing[3] },
});
