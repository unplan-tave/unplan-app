import { StyleSheet, View } from 'react-native';

export function HomeIndicator() {
  return (
    <View style={styles.container}>
      <View style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  bar: {
    width: 144,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#000000',
  },
});
