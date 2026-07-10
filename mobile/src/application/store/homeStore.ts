import { create } from 'zustand';
import { apiClient } from '../../infrastructure/api/client';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stockQty: number;
  images: string[];
  category?: string;
  supplier?: string;
}

interface HomeState {
  products: Product[];
  trending: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  products: [],
  trending: [],
  isLoading: false,
  error: null,
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/products');
      if (response.data.success) {
        set({ 
          products: response.data.data, 
          trending: response.data.data.slice(0, 5), // Just taking top 5 as trending for now
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch products', isLoading: false });
    }
  },
}));
