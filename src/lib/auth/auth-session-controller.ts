import { tokenStorage } from './token-storage';

export interface AuthSessionTokens {
  accessToken: string;
  refreshToken?: string | null;
}

interface AuthSessionHandlers {
  setSession: (session: AuthSessionTokens) => Promise<void>;
  clearSession: () => Promise<void>;
}

let handlers: AuthSessionHandlers | null = null;

export function registerAuthSessionHandlers(nextHandlers: AuthSessionHandlers) {
  handlers = nextHandlers;
}

export async function applyAuthSession(session: AuthSessionTokens): Promise<void> {
  if (handlers) {
    await handlers.setSession(session);
    return;
  }

  await tokenStorage.setTokens(session);
}

export async function clearAuthSession(): Promise<void> {
  if (handlers) {
    await handlers.clearSession();
    return;
  }

  await tokenStorage.clearTokens();
}
