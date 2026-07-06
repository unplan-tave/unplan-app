import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

const MAX_NICKNAME_LENGTH = 20;

export function useNicknameEdit(initialNickname: string) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initialNickname);
  const trimmedNickname = nickname.trim();
  const canSubmit = trimmedNickname.length > 0;

  const placeholder = useMemo(() => `1~${MAX_NICKNAME_LENGTH}자`, []);

  const updateNickname = (value: string) => {
    setNickname(value.slice(0, MAX_NICKNAME_LENGTH));
  };

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    router.back();
  };

  return {
    nickname,
    placeholder,
    maxLength: MAX_NICKNAME_LENGTH,
    canSubmit,
    updateNickname,
    submit,
    cancel: router.back,
  };
}
