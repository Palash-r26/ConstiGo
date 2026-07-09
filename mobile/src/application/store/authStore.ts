import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  login: async (userData, token) => {
    await AsyncStorage.setItem('@constigo_token', token);
    await AsyncStorage.setItem('@constigo_user', JSON.stringify(userData));
    set({ user: userData, token, isLoading: false });
  },
  logout: async () => {
    await AsyncStorage.removeItem('@constigo_token');
    await AsyncStorage.removeItem('@constigo_user');
    set({ user: null, token: null, isLoading: false });
  },
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('@constigo_token');
      const userStr = await AsyncStorage.getItem('@constigo_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));
