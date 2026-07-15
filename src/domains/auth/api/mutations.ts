/**
 * auth 도메인 mutation hook 모음입니다.
 * 현재는 계정 탈퇴처럼 설정 화면에서 직접 호출되는 서버 변경 작업을 제공합니다.
 */
import { useMutation } from '@tanstack/react-query';

import { submitWithdraw } from './client';

import type { UseMutationOptions } from '@tanstack/react-query';

type AuthMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>;

export function useWithdrawMutation(options?: AuthMutationOptions<void, void>) {
  return useMutation({
    mutationFn: submitWithdraw,
    ...options,
  });
}
