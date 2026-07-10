import { create } from 'zustand';
import { apiClient } from '../../infrastructure/api/client';
import { Product } from './homeStore';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  wishlist: Product[];
  addresses: any[];
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/users/me');
      if (response.data.success) {
        set({ profile: response.data.data, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch profile', isLoading: false });
    }
  },
  
  toggleWishlist: async (productId: string) => {
    try {
      const response = await apiClient.post(`/users/me/wishlist/${productId}`);
      if (response.data.success) {
        // Optimistically update or refetch. Since wishlist populates full objects on fetch but only returns IDs on toggle, we refetch to be safe.
        get().fetchProfile();
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to toggle wishlist' });
    }
  }
}));
