import 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { fontFamilyWeight } from '@/constants/typography';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { initializeKakaoAuthSDK } from '@/lib/auth/kakao-sdk';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const suitFonts = {
  [fontFamilyWeight.extraLight]: require('@sun-typeface/suit/fonts/static/ttf/SUIT-ExtraLight.ttf'),
  [fontFamilyWeight.light]: require('@sun-typeface/suit/fonts/static/ttf/SUIT-Light.ttf'),
  [fontFamilyWeight.regular]: require('@sun-typeface/suit/fonts/static/ttf/SUIT-Regular.ttf'),
  [fontFamilyWeight.medium]: require('@sun-typeface/suit/fonts/static/ttf/SUIT-Medium.ttf'),
  [fontFamilyWeight.semiBold]: require('@sun-typeface/suit/fonts/static/ttf/SUIT-SemiBold.ttf'),
  [fontFamilyWeight.bold]: require('@sun-typeface/suit/fonts/static/ttf/SUIT-Bold.ttf'),
  [fontFamilyWeight.extraBold]: require('@sun-typeface/suit/fonts/static/ttf/SUIT-ExtraBold.ttf'),
};

export default function RootLayout() {
  const [loaded, error] = useFonts(suitFonts);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([initializeKakaoAuthSDK(), useAuthStore.getState().hydrateSession()]);
      } catch (appInitError: unknown) {
        console.error('Failed to initialize app session.', appInitError);
      }
    };

    void initializeApp();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
