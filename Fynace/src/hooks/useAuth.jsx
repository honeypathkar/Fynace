import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  apiClient,
  parseApiError,
  setAuthToken,
  setUnauthorizedHandler,
} from '../api/client';
import axios from 'axios';

const AuthContext = createContext(undefined);

const ACCESS_TOKEN_KEY = '@spendo/access-token';
const REFRESH_TOKEN_KEY = '@spendo/refresh-token';
const USER_KEY = '@spendo/user-data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [token, setTokenState] = useState();
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState();

  const refreshProfileInternal = useCallback(async activeToken => {
    try {
      setLoading(true);
      if (activeToken) {
        setAuthToken(activeToken);
      }
      const response = await apiClient.get('/auth/profile');
      const userData = response.data.user;
      setUser(userData);
      if (userData) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      const apiError = parseApiError(error);
      console.warn('Failed to refresh profile', apiError.message);
      throw error; // Propagate error for bootstrap or other callers
    } finally {
      setLoading(false);
    }
  }, []);

  const persistAuth = useCallback(
    async (accessToken, refreshToken, userData) => {
      try {
        if (!accessToken) {
          await Promise.all([
            AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
            AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
            AsyncStorage.removeItem(USER_KEY),
          ]);
          setAuthToken(undefined);
          setTokenState(undefined);
          setUser(undefined);
          return;
        }

        const storageTasks = [
          AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
        ];
        if (refreshToken) {
          storageTasks.push(
            AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
          );
        }
        if (userData) {
          storageTasks.push(
            AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
          );
        }

        await Promise.all(storageTasks);
        setAuthToken(accessToken);
        setTokenState(accessToken);
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to persist auth', err);
      }
    },
    [],
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedToken, storedRefresh, storedUser] = await Promise.all([
          AsyncStorage.getItem(ACCESS_TOKEN_KEY),
          AsyncStorage.getItem(REFRESH_TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (storedToken) {
          setTokenState(storedToken);
          setAuthToken(storedToken);

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Silent refresh if online
          refreshProfileInternal(storedToken).catch(err => {
            console.log(
              'Bootstrap silent refresh failed (likely offline):',
              err.message,
            );
            // We keep the stored user data if refresh fails
          });
        }
      } catch (error) {
        console.error('Auth bootstrap error', error);
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [refreshProfileInternal]);

  const checkUser = useCallback(async email => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/check-user', { email });
      return response.data.exists;
    } catch (error) {
      const apiError = parseApiError(error);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestOtp = useCallback(async ({ email, fullName }) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/otp/send', {
        email,
        fullName,
      });
      const requestedUserId = response.data?.userId;
      setOtpRequestId(requestedUserId);
      return { userId: requestedUserId };
    } catch (error) {
      const apiError = parseApiError(error);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async ({ otp, email }) => {
      try {
        setLoading(true);
        const response = await apiClient.post('/auth/otp/verify', {
          otp,
          email,
        });

        const accessToken = response.data?.token || response.data?.accessToken;
        const refreshToken = response.data?.refreshToken;
        const userData = response.data?.user;

        if (accessToken) {
          await persistAuth(accessToken, refreshToken, userData);
          setOtpRequestId(undefined);
        }
      } catch (error) {
        const apiError = parseApiError(error);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [persistAuth],
  );

  const googleLogin = useCallback(
    async idToken => {
      try {
        setLoading(true);
        const response = await apiClient.post('/auth/google', { idToken });

        const accessToken = response.data?.token || response.data?.accessToken;
        const refreshToken = response.data?.refreshToken;
        const userData = response.data?.user;

        if (accessToken) {
          await persistAuth(accessToken, refreshToken, userData);
        }
      } catch (error) {
        const apiError = parseApiError(error);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [persistAuth],
  );

  const logout = useCallback(async () => {
    try {
      await persistAuth(undefined);
      setOtpRequestId(undefined);
    } catch (err) {
      console.error('Logout failed', err);
    }
  }, [persistAuth]);

  const performTokenRefresh = useCallback(async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) throw new Error('No refresh token');

      // Use a separate axios call to avoid the interceptor loop
      const response = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        {
          refreshToken: storedRefreshToken,
        },
      );

      const accessToken = response.data?.token || response.data?.accessToken;
      const refreshToken = response.data?.refreshToken;
      const userData = response.data?.user;

      if (accessToken) {
        await persistAuth(accessToken, refreshToken, userData);
        return accessToken;
      }
      throw new Error('Refresh failed - no access token');
    } catch (error) {
      console.warn('Token refresh failed:', error.message);
      await logout();
      throw error;
    }
  }, [persistAuth, logout]);

  useEffect(() => {
    setUnauthorizedHandler(async originalError => {
      // Don't refresh if the error happened during a refresh or auth request
      if (
        originalError.config.url.includes('/auth/refresh') ||
        originalError.config.url.includes('/auth/otp') ||
        originalError.config.url.includes('/auth/google')
      ) {
        return Promise.reject(originalError);
      }

      try {
        const newToken = await performTokenRefresh();
        // Retry original request with new token
        originalError.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(originalError.config);
      } catch (err) {
        return Promise.reject(originalError);
      }
    });

    return () => setUnauthorizedHandler(null);
  }, [performTokenRefresh]);

  const refreshProfile = useCallback(async () => {
    await refreshProfileInternal();
  }, [refreshProfileInternal]);

  const updateProfile = useCallback(async payload => {
    try {
      setLoading(true);
      const response = await apiClient.put('/auth/profile', payload);
      const userData = response.data?.user;
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      const apiError = parseApiError(error);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      loading,
      otpRequestId,
      checkUser,
      requestOtp,
      verifyOtp,
      googleLogin,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      token,
      initializing,
      loading,
      otpRequestId,
      checkUser,
      requestOtp,
      verifyOtp,
      googleLogin,
      logout,
      refreshProfile,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
