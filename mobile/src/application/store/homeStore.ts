import { create } from 'zustand';
import { fetchBuyerProductList } from '../../infrastructure/api/buyerApi';

export interface Product {
  _id: string;
  id?: string;
  productid?: string;
  name: string;
  productname?: string;
  description: string;
  product_description?: string;
  price: number;
  product_price?: string | number;
  discount_price?: string | number;
  unit: string;
  stockQty: number;
  stock?: string | number;
  images: string[];
  productimage?: string;
  category?: string;
  productcategory?: string;
  supplier?: string;
  warranty_details?: string;
  delivery_available?: string;
  product_status?: string;
}

interface HomeState {
  products: Product[];
  trending: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (category?: string) => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  products: [],
  trending: [],
  isLoading: false,
  error: null,
  fetchProducts: async (category?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchBuyerProductList(category || '');
      let rawList: any[] = [];
      if (Array.isArray(response)) {
        rawList = response;
      } else if (response && Array.isArray(response.data)) {
        rawList = response.data;
      } else if (response && Array.isArray(response.products)) {
        rawList = response.products;
      }

      const normalized: Product[] = rawList.map((item: any, idx: number) => ({
        _id: item.productid || item._id || item.id || `prod_${idx}`,
        id: item.productid || item._id || item.id || `prod_${idx}`,
        productid: item.productid || item._id || item.id || `prod_${idx}`,
        name: item.productname || item.name || 'Material Item',
        productname: item.productname || item.name || 'Material Item',
        description: item.product_description || item.description || '',
        product_description: item.product_description || item.description || '',
        price: Number(item.product_price || item.price || 0),
        product_price: item.product_price || item.price || 0,
        discount_price: item.discount_price || '0',
        unit: item.unit || 'unit',
        stockQty: Number(item.stock || item.stockQty || 0),
        stock: item.stock || item.stockQty || 0,
        images: item.productimage
          ? [item.productimage]
          : Array.isArray(item.images)
          ? item.images
          : [],
        productimage: item.productimage,
        category: item.productcategory || item.category || 'General',
        productcategory: item.productcategory || item.category || 'General',
        warranty_details: item.warranty_details,
        delivery_available: item.delivery_available,
        product_status: item.product_status,
      }));

      set({
        products: normalized,
        trending: normalized.slice(0, 10),
        isLoading: false,
      });
    } catch (error: any) {
      console.warn('[homeStore] Failed to fetch live products, error:', error);
      set({ error: error.message || 'Failed to fetch products', isLoading: false });
    }
  },
}));

