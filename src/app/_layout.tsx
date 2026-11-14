import 'react-native-gesture-handler';

import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Config } from '@/constants/config';
import { fontFamilyWeight } from '@/constants/typography';
import { useAuthStore } from '@/domains/auth/use-auth-store';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { queryClient } from '@/lib/api/query-client';

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
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const initializeSocialSDKs = async () => {
          if (Config.isDemo) return;
          const { configureGoogleAuthSDK } = await import('@/lib/auth/google-sdk');
          const { initializeKakaoAuthSDK } = await import('@/lib/auth/kakao-sdk');
          configureGoogleAuthSDK();
          await initializeKakaoAuthSDK();
        };
        useOnboardingStore.getState().hydrateOnboarding();
        await Promise.all([initializeSocialSDKs(), useAuthStore.getState().hydrateSession()]);
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
          <Stack.Screen name="demo-login" options={{ headerShown: false }} />
          <Stack.Screen name="demo-chat" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="card" options={{ headerShown: false }} />
          <Stack.Screen name="sleep" options={{ headerShown: false }} />
          <Stack.Screen name="energy" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
