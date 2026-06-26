import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="intro" options={{ headerShown: false }} />
      <Stack.Screen name="recovery" options={{ headerShown: false }} />
      <Stack.Screen name="sleep" options={{ headerShown: false }} />
      <Stack.Screen name="activity" options={{ headerShown: false }} />
      <Stack.Screen name="transport" options={{ headerShown: false }} />
    </Stack>
  );
}
