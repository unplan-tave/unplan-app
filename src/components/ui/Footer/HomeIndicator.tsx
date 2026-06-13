import { Platform, StyleSheet, View } from 'react-native';

export function HomeIndicator() {
  if (Platform.OS === 'ios') {
    return null;
  }

  return <View style={styles.androidSpace} />;
}

const styles = StyleSheet.create({
  androidSpace: {
    height: 16,
  },
});
