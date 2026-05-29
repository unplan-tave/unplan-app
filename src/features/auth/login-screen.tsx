import { SafeAreaView, StyleSheet } from 'react-native';

import { Typography } from '@/components/ui/Typography';

export function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="titleL">로그인</Typography>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
