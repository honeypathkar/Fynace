import axios from 'axios';
import axiosRetry from 'axios-retry';
import { BASE_URL } from '../utils/BASE_URL';

const DEFAULT_BASE_URL = BASE_URL;

const resolveBaseUrl = () => {
  const envFromProcess =
    (typeof process !== 'undefined' &&
      (process.env?.SPENDO_API_URL ||
        process.env?.EXPO_PUBLIC_API_URL ||
        process.env?.API_URL)) ||
    '';

  const envFromGlobal =
    typeof global !== 'undefined' && global.SPENDO_API_URL
      ? global.SPENDO_API_URL
      : '';

  return envFromProcess || envFromGlobal || DEFAULT_BASE_URL;
};

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure retry with exponential backoff
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: error => {
    // Retry on network errors or 5xx server errors
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status >= 500
    );
  },
});

let unauthorizedHandler = null;

export const setUnauthorizedHandler = handler => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      return unauthorizedHandler(error);
    }
    return Promise.reject(error);
  },
);

export const setAuthToken = token => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const parseApiError = error => {
  if (axios.isAxiosError(error)) {
    return {
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong',
      status: error.response?.status,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'Unexpected error occurred',
  };
};
