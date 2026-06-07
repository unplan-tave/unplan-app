import { SafeAreaView, StyleSheet } from 'react-native';

import { Typography } from '@/components/ui/Typography';

export function ScheduleScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="titleL">일정</Typography>
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
