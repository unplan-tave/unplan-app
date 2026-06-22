import axios from 'axios';

import { API_TIMEOUT } from '@/constants';
import { Config } from '@/constants/config';
import { tokenStorage } from '@/lib/auth/token-storage';

import { logApiRequest, logApiResponse } from './dev-logger';

export const apiClient = axios.create({
  baseURL: Config.apiUrl,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    logApiRequest(config.method, config.url, config.data, Boolean(config.headers.Authorization));

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    logApiResponse(response.status, response.config.method, response.config.url, response.data);

    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      logApiResponse(
        error.response?.status,
        error.config?.method,
        error.config?.url,
        error.response?.data,
      );
    }

    // TODO: Add 401 refresh-token retry handling once the backend refresh endpoint is finalized.
    return Promise.reject(error);
  },
);
