import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_LOCAL_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';

export const createApiClient = (baseURL?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: baseURL || DEFAULT_LOCAL_URL,
    timeout: 60000,
  });

  client.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('@constigo_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout') ||
        error.message === 'Network Error';
      if (config && isTimeout && !config._retried) {
        config._retried = true;
        return client(config);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();
