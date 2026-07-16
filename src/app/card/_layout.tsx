import { Stack } from 'expo-router';

export default function CardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="card-detail" />
      <Stack.Screen name="view" />
      <Stack.Screen name="new" />
      <Stack.Screen name="search" />
    </Stack>
  );
}
