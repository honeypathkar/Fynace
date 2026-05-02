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
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import { syncManager } from '../sync/SyncManager';
import { database } from '../database';

const AuthContext = createContext(undefined);

const ACCESS_TOKEN_KEY = '@fynace/access-token';
const REFRESH_TOKEN_KEY = '@fynace/refresh-token';
const USER_KEY = '@fynace/user-data';

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

          // Try to get freshest data from local DB first
          const localUserRecord = await database.get('users').query().fetch();
          if (localUserRecord.length > 0) {
            const localUser = localUserRecord[0];
            setUser({
              fullName: localUser.name,
              email: localUser.email,
              userImage: localUser.userImage,
            });
          } else if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Silent refresh if online
          refreshProfileInternal(storedToken).catch(err => {
            console.log(
              'Bootstrap silent refresh failed (likely offline):',
              err.message,
            );
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

  // Subscribe to local User changes from SyncManager/WatermelonDB
  useEffect(() => {
    if (!token) return;

    const userCollection = database.get('users');
    const observable = userCollection.query().observe();
    
    const subscription = observable.subscribe(records => {
      if (records.length > 0) {
        const localUser = records[0];
        setUser(prev => ({
          ...prev,
          fullName: localUser.name,
          email: localUser.email,
          userImage: localUser.userImage,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [token]);

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
          // Trigger initial sync after login
          syncManager.sync(true).catch(err => console.error('Initial sync failed:', err));
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
          // Trigger initial sync after login
          syncManager.sync(true).catch(err => console.error('Initial sync failed:', err));
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
      // 1. Unregister FCM token from backend if possible
      try {
        const deviceId = await DeviceInfo.getUniqueId();
        await apiClient.delete(`/auth/fcm-token/${deviceId}`);
        console.log('🚀 FCM Token unregistered from backend');
      } catch (fcmErr) {
        console.warn('Failed to unregister FCM from backend:', fcmErr.message);
      }

      // 2. Clear Firebase token locally
      try {
        await messaging().deleteToken();
      } catch (fbErr) {
        console.warn('Failed to delete Firebase token:', fbErr.message);
      }

      await persistAuth(undefined);
      setOtpRequestId(undefined);
      
      // Clear local database on logout to prevent cross-account data leakage
      await database.write(async () => {
        await database.unsafeResetDatabase();
      });
      
      // Clear sync metadata so the next user starts fresh
      await Promise.all([
        AsyncStorage.removeItem('@fynace/last-sync-time'),
        AsyncStorage.removeItem('@fynace/last-sync-attempt'),
      ]);
    } catch (err) {
      console.error('Logout failed', err);
    }
  }, [persistAuth]);

  const refreshPromise = React.useRef(null);

  const performTokenRefresh = useCallback(async () => {
    // If a refresh is already in progress, return the existing promise
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    refreshPromise.current = (async () => {
      try {
        const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!storedRefreshToken) {
          console.warn('No refresh token available');
          // Don't logout immediately, just fail the refresh
          // The interceptor will then reject the original request
          throw new Error('No refresh token');
        }

        // Use a separate axios call to avoid the interceptor loop
        // Ensure no double slashes in URL
        const baseUrl = apiClient.defaults.baseURL.replace(/\/+$/, '');
        const response = await axios.post(
          `${baseUrl}/auth/refresh`,
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
        
        // ONLY logout if the server explicitly says the refresh token is invalid (401/403)
        // or if we have no refresh token at all.
        // For network errors (no response), we should NOT logout.
        if (!error.response || error.response.status === 401 || error.response.status === 403 || error.message === 'No refresh token') {
          console.log('Logging out due to unrecoverable auth error');
          await logout();
        }
        throw error;
      } finally {
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
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
        
        // Update local WatermelonDB record for offline persistence
        const userCollection = database.get('users');
        const existingUsers = await userCollection.query().fetch();
        
        await database.write(async () => {
          if (existingUsers.length > 0) {
            await existingUsers[0].update(record => {
              record.name = userData.fullName;
              record.userImage = userData.userImage;
              record.synced = true;
              record.updatedAt = Date.now();
            });
          } else {
            await userCollection.create(record => {
              record.name = userData.fullName;
              record.email = userData.email;
              record.userImage = userData.userImage;
              record.synced = true;
              record.updatedAt = Date.now();
            });
          }
        });
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
