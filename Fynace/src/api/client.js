import axios from 'axios';
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
  timeout: 8000, // Reduced from 15000 to 8000ms for faster failure detection
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const parseApiError = (error) => {
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

