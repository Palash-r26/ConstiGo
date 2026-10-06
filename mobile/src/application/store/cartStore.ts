import { create } from 'zustand';
import { useAuthStore } from './authStore';
import {
  addToBuyerCart,
  fetchBuyerShoppingCart,
  placeBuyerOrder,
  BuyerAddToCartPayload,
} from '../../infrastructure/api/buyerApi';
import { Product } from './homeStore';

export interface CartItem {
  id?: string;
  _id?: string;
  buyerid?: string;
  vendorid?: string;
  productid?: string;
  productname?: string;
  name?: string;
  amount?: string | number;
  price?: number;
  quantity: number;
  product_category?: string;
  category?: string;
  type?: string;
  status?: string;
  product?: Product;
}

interface CartState {
  items: CartItem[];
  subTotal: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (
    paramOrId:
      | string
      | {
          productId: string;
          vendorId?: string;
          productName?: string;
          amount?: string | number;
          quantity?: number;
          category?: string;
        },
    maybeQty?: number
  ) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  placeOrder: (addressId: string | number) => Promise<any>;
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
      const authUser = useAuthStore.getState().user;
      const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';
      const response = await fetchBuyerShoppingCart(buyerId);
      
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        const items: CartItem[] = response.data.map((item: any) => ({
          id: item.id || item.productid,
          _id: item.id || item.productid,
          buyerid: item.buyerid,
          vendorid: item.vendorid,
          productid: item.productid,
          productname: item.productname,
          name: item.productname,
          amount: item.amount,
          price: Number(item.amount) || 0,
          quantity: Number(item.quantity) || 1,
          product_category: item.product_category,
          category: item.product_category,
          type: (item.product_category || '').toLowerCase(),
          status: item.status,
        }));
        const subTotal = items.reduce(
          (sum, it) => sum + (Number(it.amount || 0) * (Number(it.quantity) || 1)),
          0
        );
        set({ items, subTotal, isLoading: false });
      } else {
        set({ items: [], subTotal: 0, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch cart', isLoading: false });
    }
  },
  
  addToCart: async (paramOrId, maybeQty) => {
    set({ isLoading: true, error: null });
    try {
      const authUser = useAuthStore.getState().user;
      const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';

      let productId: string;
      let vendorId = 'CV290926162458';
      let productName = 'Material Item';
      let amount: string | number = 400;
      let quantity = 1;
      let category = 'General';

      if (typeof paramOrId === 'string') {
        productId = paramOrId;
        quantity = maybeQty || 1;
      } else {
        productId = paramOrId.productId;
        vendorId = paramOrId.vendorId || vendorId;
        productName = paramOrId.productName || productName;
        amount = paramOrId.amount || amount;
        quantity = paramOrId.quantity || quantity;
        category = paramOrId.category || category;
      }

      const payload: BuyerAddToCartPayload = {
        buyerid: buyerId,
        vendorid: vendorId,
        productid: productId,
        productname: productName,
        amount,
        quantity,
        product_category: category,
      };
      await addToBuyerCart(payload);
      await useCartStore.getState().fetchCart();
      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to add to cart', isLoading: false });
      return false;
    }
  },
  
  updateQuantity: async (productId: string, quantity: number) => {
    set((state) => {
      const updated = state.items.map((it) =>
        (it.productid === productId || it.id === productId || it._id === productId)
          ? { ...it, quantity }
          : it
      );
      const subTotal = updated.reduce(
        (sum, it) => sum + (Number(it.amount || 0) * (Number(it.quantity) || 1)),
        0
      );
      return { items: updated, subTotal };
    });
  },
  
  removeItem: async (productId: string) => {
    set((state) => {
      const updated = state.items.filter(
        (it) => it.productid !== productId && it.id !== productId && it._id !== productId
      );
      const subTotal = updated.reduce(
        (sum, it) => sum + (Number(it.amount || 0) * (Number(it.quantity) || 1)),
        0
      );
      return { items: updated, subTotal };
    });
  },

  placeOrder: async (addressId: string | number) => {
    set({ isLoading: true, error: null });
    try {
      const authUser = useAuthStore.getState().user;
      const buyerId = authUser?.buyerid || authUser?._id || 'CB051026162745';
      const res = await placeBuyerOrder({
        buyerid: buyerId,
        addressid: addressId,
      });
      set({ items: [], subTotal: 0, isLoading: false });
      return res;
    } catch (error: any) {
      set({ error: error.message || 'Failed to place order', isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ items: [], subTotal: 0 });
  },
}));

