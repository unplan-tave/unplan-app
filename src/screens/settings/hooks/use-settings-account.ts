import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useWithdrawMutation } from '@/domains/auth/api/mutations';
import { useAuthStore } from '@/domains/auth/use-auth-store';
import { useMemberProfileQuery } from '@/domains/member/api/queries';

type AccountDialog = 'none' | 'logout' | 'deleteAccount';

/** 계정 화면의 탈퇴·로그아웃 이벤트를 관리합니다. */
export function useSettingsAccount() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const clearSession = useAuthStore((state) => state.clearSession);
  const profileQuery = useMemberProfileQuery();
  const withdrawMutation = useWithdrawMutation({
    onSuccess: () => {
      void clearSession().then(() => router.replace('/login'));
    },
  });
  const [activeDialog, setActiveDialog] = useState<AccountDialog>('none');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeDialog = () => setActiveDialog('none');

  const confirmLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      router.replace('/login');
    } catch (error: unknown) {
      console.error('Failed to logout.', error);
      setIsLoggingOut(false);
    }
  };

  const confirmDeleteAccount = () => {
    if (withdrawMutation.isPending) {
      return;
    }

    withdrawMutation.mutate();
  };

  return {
    activeDialog,
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    isLoggingOut,
    isDeletingAccount: withdrawMutation.isPending,
    openLogoutDialog: () => setActiveDialog('logout'),
    openDeleteAccountDialog: () => setActiveDialog('deleteAccount'),
    closeDialog,
    confirmLogout,
    confirmDeleteAccount,
  };
}
