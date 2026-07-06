import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { useUpdateMemberProfileMutation } from '@/domains/member/api/mutations';
import { useMemberProfileQuery } from '@/domains/member/api/queries';

const MAX_NICKNAME_LENGTH = 20;

export function useNicknameEdit() {
  const router = useRouter();
  const profileQuery = useMemberProfileQuery();
  const updateProfileMutation = useUpdateMemberProfileMutation({
    onSuccess: () => router.back(),
  });
  const [nickname, setNickname] = useState('');
  const trimmedNickname = nickname.trim();
  const canSubmit = trimmedNickname.length > 0;

  const placeholder = useMemo(() => `1~${MAX_NICKNAME_LENGTH}자`, []);

  useEffect(() => {
    if (profileQuery.data?.nickname != null) {
      setNickname(profileQuery.data.nickname);
    }
  }, [profileQuery.data?.nickname]);

  const updateNickname = (value: string) => {
    setNickname(value.slice(0, MAX_NICKNAME_LENGTH));
  };

  const submit = () => {
    if (!canSubmit || updateProfileMutation.isPending) {
      return;
    }

    updateProfileMutation.mutate({ nickname: trimmedNickname });
  };

  return {
    nickname,
    placeholder,
    maxLength: MAX_NICKNAME_LENGTH,
    canSubmit: canSubmit && !updateProfileMutation.isPending,
    isLoading: profileQuery.isLoading,
    isSubmitting: updateProfileMutation.isPending,
    updateNickname,
    submit,
    cancel: router.back,
  };
}
