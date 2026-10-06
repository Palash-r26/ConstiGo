import { create } from 'zustand';
import { useAuthStore } from './authStore';
import {
  fetchBuyerProfile,
  updateBuyerProfile,
  addToBuyerWishlist,
  removeFromBuyerWishlist,
  isBuyerSuccess,
  BuyerProfileUpdatePayload,
} from '../../infrastructure/api/buyerApi';
import { apiClient } from '../../infrastructure/api/client';
import { Product } from './homeStore';

export interface UserProfile {
  _id: string;
  buyerid?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob?: string;
  profileImage?: string;
  wishlist: Product[];
  addresses: any[];
}

interface UserState {
  profile: UserProfile | null;
  wishlistIds: string[];
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<BuyerProfileUpdatePayload>) => Promise<boolean>;
  toggleWishlist: (productId: string, vendorId?: string) => Promise<void>;
  addToWishlist: (productId: string, vendorId?: string) => Promise<boolean>;
  removeFromWishlist: (productId: string, vendorId?: string) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  wishlistIds: [],
  isLoading: false,
  error: null,
  
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const authUser = useAuthStore.getState().user;
      const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';

      if (authUser?.role === 'BUYER' || buyerId) {
        try {
          const res = await fetchBuyerProfile(buyerId);
          if (isBuyerSuccess(res) || res?.fname || res?.email) {
            set({
              profile: {
                _id: String(buyerId),
                buyerid: String(buyerId),
                firstName: res.fname || authUser?.firstName || 'Buyer',
                lastName: res.lname || authUser?.lastName || '',
                email: res.email || authUser?.email || '',
                phone: res.phone || authUser?.phone || '',
                dob: res.dob || '',
                wishlist: [],
                addresses: [],
              },
              isLoading: false,
            });
            return;
          }
        } catch (buyerErr) {
          console.warn('[UserStore] Buyer profile fetch error:', buyerErr);
        }
      }

      const response = await apiClient.get('/users/me');
      if (response.data.success) {
        set({ profile: response.data.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch profile', isLoading: false });
    }
  },

  updateProfile: async (data: Partial<BuyerProfileUpdatePayload>) => {
    set({ isLoading: true, error: null });
    try {
      const authUser = useAuthStore.getState().user;
      const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';
      const current = get().profile;

      const payload: BuyerProfileUpdatePayload = {
        buyerid: buyerId,
        vendorid: buyerId,
        fname: data.fname || current?.firstName || '',
        lname: data.lname || current?.lastName || '',
        dob: data.dob || current?.dob || '',
        email: data.email || current?.email || '',
        phone: data.phone || current?.phone || '',
      };

      const res = await updateBuyerProfile(payload);
      if (isBuyerSuccess(res)) {
        set({
          profile: {
            ...(current || { _id: buyerId, wishlist: [], addresses: [] }),
            buyerid: buyerId,
            firstName: payload.fname,
            lastName: payload.lname,
            dob: payload.dob,
            email: payload.email,
            phone: payload.phone,
          },
          isLoading: false,
        });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update profile', isLoading: false });
      return false;
    }
  },
  
  toggleWishlist: async (productId: string, vendorId = 'CV290926162458') => {
    const authUser = useAuthStore.getState().user;
    const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';
    const currentList = get().wishlistIds;
    const isPresent = currentList.includes(productId);

    try {
      if (isPresent) {
        await removeFromBuyerWishlist({ buyerid: buyerId, vendorid: vendorId, productid: productId });
        set({ wishlistIds: currentList.filter((id) => id !== productId) });
      } else {
        await addToBuyerWishlist({ buyerid: buyerId, vendorid: vendorId, productid: productId });
        set({ wishlistIds: [...currentList, productId] });
      }
    } catch (err: any) {
      console.warn('[UserStore] toggleWishlist error:', err);
      if (isPresent) {
        set({ wishlistIds: currentList.filter((id) => id !== productId) });
      } else {
        set({ wishlistIds: [...currentList, productId] });
      }
    }
  },

  addToWishlist: async (productId: string, vendorId = 'CV290926162458') => {
    const authUser = useAuthStore.getState().user;
    const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';
    try {
      const res = await addToBuyerWishlist({ buyerid: buyerId, vendorid: vendorId, productid: productId });
      const currentList = get().wishlistIds;
      if (!currentList.includes(productId)) {
        set({ wishlistIds: [...currentList, productId] });
      }
      return isBuyerSuccess(res);
    } catch {
      return false;
    }
  },

  removeFromWishlist: async (productId: string, vendorId = 'CV290926162458') => {
    const authUser = useAuthStore.getState().user;
    const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';
    try {
      const res = await removeFromBuyerWishlist({ buyerid: buyerId, vendorid: vendorId, productid: productId });
      const currentList = get().wishlistIds;
      set({ wishlistIds: currentList.filter((id) => id !== productId) });
      return isBuyerSuccess(res);
    } catch {
      return false;
    }
  },
}));

