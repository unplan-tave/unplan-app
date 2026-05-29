import { SafeAreaView, StyleSheet, Text } from 'react-native';

export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>설정</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
