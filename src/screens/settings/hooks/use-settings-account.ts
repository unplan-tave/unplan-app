import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useAuthStore } from '@/domains/auth/use-auth-store';

type AccountDialog = 'none' | 'logout' | 'deleteAccount';

export function useSettingsAccount() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [activeDialog, setActiveDialog] = useState<AccountDialog>('none');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeDialog = () => setActiveDialog('none');

  const confirmLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await logout();
    router.replace('/login');
  };

  return {
    activeDialog,
    isLoggingOut,
    openLogoutDialog: () => setActiveDialog('logout'),
    openDeleteAccountDialog: () => setActiveDialog('deleteAccount'),
    closeDialog,
    confirmLogout,
  };
}
