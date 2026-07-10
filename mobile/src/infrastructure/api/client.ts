import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL as ENV_API_URL } from '@env';

// Use 10.0.2.2 for Android emulator to access localhost
// Use localhost for iOS simulator
const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';
const API_URL = ENV_API_URL || LOCAL_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  // Render free-tier services spin down when idle and take 20-50s to cold-start.
  // A short timeout made the first request (register/login) fail every time.
  timeout: 60000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@constigo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Retry once on timeout / network error to survive backend cold starts.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message === 'Network Error';
    if (config && isTimeout && !config._retried) {
      config._retried = true;
      return apiClient(config);
    }
    return Promise.reject(error);
  }
);
