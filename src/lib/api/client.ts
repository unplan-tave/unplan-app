import axios from 'axios';

import { API_TIMEOUT } from '@/constants';
import { Config } from '@/constants/config';
import { tokenStorage } from '@/lib/auth/token-storage';

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

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);
