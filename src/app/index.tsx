import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function IndexRoute() {
  const { hasHydratedSession, isAuthenticated } = useAuth();

  if (!hasHydratedSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator accessibilityLabel="로그인 상태 확인 중" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
