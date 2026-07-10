import { create } from 'zustand';
import { apiClient } from '../../infrastructure/api/client';
import { Product } from './homeStore';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subTotal: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subTotal: 0,
  isLoading: false,
  error: null,
  
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/cart');
      if (response.data.success) {
        const items = response.data.data.items || [];
        const subTotal = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        set({ items, subTotal, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch cart', isLoading: false });
    }
  },
  
  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/cart', { productId, quantity });
      if (response.data.success) {
        const items = response.data.data.items || [];
        const subTotal = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        set({ items, subTotal, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to add to cart', isLoading: false });
    }
  },
  
  updateQuantity: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch('/cart', { productId, quantity });
      if (response.data.success) {
        const items = response.data.data.items || [];
        const subTotal = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        set({ items, subTotal, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update quantity', isLoading: false });
    }
  },
  
  removeItem: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete(`/cart/${productId}`);
      if (response.data.success) {
        const items = response.data.data.items || [];
        const subTotal = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        set({ items, subTotal, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove item', isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete('/cart');
      if (response.data.success) {
        set({ items: [], subTotal: 0, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to clear cart', isLoading: false });
    }
  }
}));
