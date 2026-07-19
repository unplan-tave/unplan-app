import axios, { AxiosHeaders } from 'axios';

import { Config } from '@/constants/config';
import { applyAuthSession, clearAuthSession } from '@/lib/auth/auth-session-controller';
import { tokenStorage } from '@/lib/auth/token-storage';
import { getDeviceId } from '@/lib/device/device-id';

import { logApiRequest, logApiResponse } from './dev-logger';

import type { TokenReissueResponseDto } from './model';
import type { AxiosError, AxiosRequestConfig } from 'axios';

interface RetriableRequestConfig extends AxiosRequestConfig {
  _authRetry?: boolean;
}

type AxiosHeadersInput = Parameters<typeof AxiosHeaders.from>[0];

const AUTH_REISSUE_PATH = '/auth/reissue';
const AUTH_REFRESH_STATUS_CODES = new Set([401, 403]);
const API_TIMEOUT_MS = 60_000;

/** 모바일 네트워크에서 요청이 무한 대기하지 않도록 충분한 timeout을 둡니다. */
export const apiClient = axios.create({
  baseURL: Config.apiUrl,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

let reissuePromise: Promise<TokenReissueResponseDto> | null = null;

function isAuthEndpoint(url?: string): boolean {
  return Boolean(url?.startsWith('/auth/'));
}

function isReissueEndpoint(url?: string): boolean {
  return url === AUTH_REISSUE_PATH;
}

function toAxiosHeaders(headers: AxiosRequestConfig['headers']) {
  return AxiosHeaders.from(headers as AxiosHeadersInput);
}

function shouldReissue(
  error: AxiosError,
): error is AxiosError & { config: RetriableRequestConfig } {
  const status = error.response?.status;
  const config = error.config as RetriableRequestConfig | undefined;
  const headers = toAxiosHeaders(config?.headers);

  return Boolean(
    config &&
    status &&
    AUTH_REFRESH_STATUS_CODES.has(status) &&
    !config._authRetry &&
    !isAuthEndpoint(config.url) &&
    headers.has('Authorization'),
  );
}

async function reissueTokens(): Promise<TokenReissueResponseDto> {
  if (!reissuePromise) {
    reissuePromise = Promise.all([getDeviceId(), tokenStorage.getRefreshToken()])
      .then(([deviceId, refreshToken]) => {
        if (!refreshToken) {
          throw new Error('Missing refresh token.');
        }

        return { deviceId, refreshToken };
      })
      .then(({ deviceId, refreshToken }) =>
        axios.post<TokenReissueResponseDto>(
          `${Config.apiUrl}${AUTH_REISSUE_PATH}`,
          { device_id: deviceId },
          {
            timeout: API_TIMEOUT_MS,
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      )
      .then((response) => response.data)
      .finally(() => {
        reissuePromise = null;
      });
  }

  return reissuePromise;
}

apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await tokenStorage.getAccessToken();
    const headers = toAxiosHeaders(config.headers);
    const hasAuthorization = headers.has('Authorization');

    if (accessToken && !hasAuthorization && !isReissueEndpoint(config.url)) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    config.headers = headers;

    logApiRequest(config.method, config.url, config.data, headers.has('Authorization'));

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    logApiResponse(response.status, response.config.method, response.config.url, response.data);

    return response;
  },
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      logApiResponse(
        error.response?.status,
        error.config?.method,
        error.config?.url,
        error.response?.data,
      );

      if (shouldReissue(error)) {
        const originalRequest = error.config;

        originalRequest._authRetry = true;

        try {
          const session = await reissueTokens();

          await applyAuthSession({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          });

          originalRequest.headers = toAxiosHeaders(originalRequest.headers);
          originalRequest.headers.set('Authorization', `Bearer ${session.access_token}`);

          return apiClient(originalRequest);
        } catch (reissueError) {
          await clearAuthSession();

          return Promise.reject(reissueError);
        }
      }
    }

    return Promise.reject(error);
  },
);
