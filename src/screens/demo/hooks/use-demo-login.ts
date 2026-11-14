import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { useAuthStore } from '@/domains/auth/use-auth-store';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { getChatError, loginToDemo } from '@/domains/schedule/chat/api/client';
import { useDemoSessionStore } from '@/domains/schedule/chat/use-demo-session-store';

export function useDemoLogin() {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);

  async function login(user: 1 | 2) {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError(null);
    try {
      const session = await loginToDemo(user);
      await useAuthStore.getState().setSession({ accessToken: session.accessToken });
      useOnboardingStore.getState().setOnboardingCompleted(true);
      useDemoSessionStore.getState().setSession(session.sessionId, session.nickname, session.today);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      setError(getChatError(error));
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return { login, isPending, error };
}
