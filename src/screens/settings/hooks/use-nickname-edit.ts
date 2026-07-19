import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { useUpdateMemberProfileMutation } from '@/domains/member/api/mutations';
import { useMemberProfileQuery } from '@/domains/member/api/queries';
import { t } from '@/lib/i18n';

const MAX_NICKNAME_LENGTH = 20;

/** 닉네임 편집 입력값과 저장 이벤트를 관리합니다. */
export function useNicknameEdit() {
  const router = useRouter();
  const profileQuery = useMemberProfileQuery();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const updateProfileMutation = useUpdateMemberProfileMutation({
    onSuccess: () => router.back(),
    onError: (error: Error) => {
      console.error('Failed to update nickname.', error);
      setErrorMessage(t('settings.nickname.updateError'));
    },
  });
  const [nickname, setNickname] = useState('');
  const trimmedNickname = nickname.trim();
  const hasLoadedProfile = !profileQuery.isLoading && profileQuery.data != null;
  const canSubmit = hasLoadedProfile && trimmedNickname.length > 0;

  const placeholder = useMemo(() => `1~${MAX_NICKNAME_LENGTH}자`, []);

  useEffect(() => {
    if (profileQuery.data?.nickname != null) {
      setNickname(profileQuery.data.nickname);
    }
  }, [profileQuery.data?.nickname]);

  const updateNickname = (value: string) => {
    setErrorMessage(null);
    setNickname(value.slice(0, MAX_NICKNAME_LENGTH));
  };

  const submit = () => {
    if (!canSubmit || updateProfileMutation.isPending) {
      return;
    }

    setErrorMessage(null);
    updateProfileMutation.mutate({ nickname: trimmedNickname });
  };

  return {
    nickname,
    placeholder,
    maxLength: MAX_NICKNAME_LENGTH,
    canSubmit: canSubmit && !updateProfileMutation.isPending,
    errorMessage,
    isLoading: profileQuery.isLoading,
    isSubmitting: updateProfileMutation.isPending,
    updateNickname,
    submit,
    cancel: router.back,
  };
}
