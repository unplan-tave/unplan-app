import { type AxiosError, type AxiosRequestConfig } from 'axios';

import { apiClient } from '@/lib/api/client';

export const apiMutator = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return apiClient({
    ...config,
    ...options,
    headers: {
      // AxiosHeaders는 헤더를 own property로 저장하므로 객체 spread로 복사됩니다.
      // oxlint-disable-next-line typescript/no-misused-spread
      ...config.headers,
      // oxlint-disable-next-line typescript/no-misused-spread
      ...options?.headers,
    },
    params: {
      ...config.params,
      ...options?.params,
    },
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
