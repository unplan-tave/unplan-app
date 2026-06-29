import { Stack } from 'expo-router';

export default function PinCardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="card-detail" />
      <Stack.Screen name="view" />
      <Stack.Screen name="new" />
    </Stack>
  );
}
