import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, parseApiError, setAuthToken } from '../api/client';

const AuthContext = createContext(undefined);

const STORAGE_KEY = '@spendo/auth-token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [token, setTokenState] = useState();
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState();

  const refreshProfileInternal = useCallback(async (activeToken) => {
    try {
      setLoading(true);
      if (activeToken) {
        setAuthToken(activeToken);
      }
      const response = await apiClient.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      const apiError = parseApiError(error);
      console.warn('Failed to refresh profile', apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedToken) {
          setTokenState(storedToken);
          setAuthToken(storedToken);
          await refreshProfileInternal(storedToken);
        }
      } catch (error) {
        console.error('Auth bootstrap error', error);
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [refreshProfileInternal]);

  const persistToken = useCallback(async (authToken) => {
    if (!authToken) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setAuthToken(undefined);
      setTokenState(undefined);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEY, authToken);
    setAuthToken(authToken);
    setTokenState(authToken);
  }, []);

  const requestOtp = useCallback(async ({ email }) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/otp/send', {
        email,
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
    async ({ otp, userId, email }) => {
      try {
        setLoading(true);
        const response = await apiClient.post('/auth/otp/verify', {
          otp,
          userId: userId || otpRequestId,
          email,
        });

        const authToken = response.data?.token;
        if (authToken) {
          await persistToken(authToken);
          setUser(response.data?.user);
          setOtpRequestId(undefined);
        }
      } catch (error) {
        const apiError = parseApiError(error);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [otpRequestId, persistToken]
  );

  const login = useCallback(
    async ({ email, password }) => {
      try {
        setLoading(true);
        const response = await apiClient.post('/auth/login', {
          email,
          password,
        });

        const authToken = response.data?.token;
        if (authToken) {
          await persistToken(authToken);
          setUser(response.data?.user);
        }
      } catch (error) {
        const apiError = parseApiError(error);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [persistToken]
  );

  const register = useCallback(
    async ({ name, email, password, phone }) => {
      try {
        setLoading(true);
        const response = await apiClient.post('/auth/register', {
          name,
          email,
          password,
          phone,
        });

        const authToken = response.data?.token;
        if (authToken) {
          await persistToken(authToken);
          setUser(response.data?.user);
        }
      } catch (error) {
        const apiError = parseApiError(error);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [persistToken]
  );

  const logout = useCallback(async () => {
    setUser(undefined);
    setOtpRequestId(undefined);
    await persistToken(undefined);
  }, [persistToken]);

  const refreshProfile = useCallback(async () => {
    await refreshProfileInternal();
  }, [refreshProfileInternal]);

  const updateProfile = useCallback(async (payload) => {
    try {
      setLoading(true);
      const response = await apiClient.put('/auth/profile', payload);
      setUser(response.data?.user);
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
      requestOtp,
      verifyOtp,
      login,
      register,
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
      requestOtp,
      verifyOtp,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
    ]
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

