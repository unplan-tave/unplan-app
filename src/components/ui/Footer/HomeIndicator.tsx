import { Platform, StyleSheet, View } from 'react-native';

export function HomeIndicator() {
  if (Platform.OS === 'android') {
    return <View style={styles.androidSpace} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.indicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  indicator: {
    width: 144,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#000000',
  },
  androidSpace: {
    height: 16,
  },
});
