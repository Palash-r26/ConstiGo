import axios from 'axios';

// Buyer Production PHP Backend Endpoints at constigo.in
export const BUYER_API_BASE = 'https://constigo.in/app/buyer';

export const BUYER_ENDPOINTS = {
  REGISTRATION: `${BUYER_API_BASE}/registration.php`,
  CHECK_LOGIN: `${BUYER_API_BASE}/checklogin.php`,
  FORGOT_SEND_OTP: `${BUYER_API_BASE}/forgot_sendotp.php`,
  FORGOT_VERIFY_OTP: `${BUYER_API_BASE}/forgot_verifyotp.php`,
  CHANGE_PASSWORD: `${BUYER_API_BASE}/changepassword.php`,
  PRODUCT_CATEGORIES: `https://constigo.in/app/vendor/product_categories_fetch.php`,
  PRODUCT_LIST: `${BUYER_API_BASE}/product_list.php`,
  WORKERS: `${BUYER_API_BASE}/workers.php`,
  PRODUCT_DETAILS: `${BUYER_API_BASE}/product_details.php`,
  ADDRESS_ADD: `${BUYER_API_BASE}/address_add.php`,
  ADDRESS_EDIT: `${BUYER_API_BASE}/address_edit.php`,
  ADDRESS_UPDATE: `${BUYER_API_BASE}/address_update.php`,
  ADDRESS_DELETE: `${BUYER_API_BASE}/address_delete.php`,
  ADDRESS_LIST: `${BUYER_API_BASE}/address_list.php`,
  ADD_TO_CART: `${BUYER_API_BASE}/add_to_cart.php`,
  SHOPPING_CART: `${BUYER_API_BASE}/shopping_cart.php`,
  PLACE_ORDER: `${BUYER_API_BASE}/place_order.php`,
  WISHLIST: `${BUYER_API_BASE}/wishlist.php`,
  WISHLIST_REMOVE: `${BUYER_API_BASE}/wishlist_remove.php`,
  PROFILE: `${BUYER_API_BASE}/profile.php`,
  PROFILE_UPDATE: `${BUYER_API_BASE}/profile_update.php`,
};

// Generic helper to send POST requests to PHP buyer endpoints reliably
export const postBuyerForm = async <T = any>(
  url: string,
  payload: Record<string, any> = {}
): Promise<T> => {
  try {
    const hasFiles = Object.values(payload).some(
      (val) => val && typeof val === 'object' && val.uri
    );

    let data: any;
    const headers: Record<string, string> = {};

    if (hasFiles) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.uri) {
            formData.append(key, {
              uri: value.uri,
              type: value.type || 'image/jpeg',
              name: value.name || 'upload.jpg',
            } as any);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      data = formData;
    } else {
      const searchParams = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      data = searchParams.toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    console.log(`[BuyerAPI Request] POST ${url}`, payload);

    const response = await axios.post<T>(url, data, {
      headers,
      timeout: 30000,
    });

    console.log(`[BuyerAPI Response] POST ${url}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[BuyerAPI Error] POST ${url}`, error);
    if (error.response) {
      console.error(`[BuyerAPI Error Data]`, error.response.data);
    }
    const isNetworkError =
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message === 'Network Error' ||
      !error.response;

    if (isNetworkError) {
      throw new Error(
        'Network connection issue or request timed out. Please check your internet connection and try again.'
      );
    }

    const backendMessage =
      typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

    throw new Error(
      backendMessage || 'An unexpected error occurred while communicating with the server.'
    );
  }
};

// ==========================================
// TYPE DEFINITIONS FOR BUYER API
// ==========================================

export interface BuyerRegistrationPayload {
  fname: string;
  lname: string;
  dob: string;
  email: string;
  phone: string;
  password: string;
  confrimpassword: string; // Exact param name required by PHP endpoint
}

export interface BuyerLoginPayload {
  phone: string;
  password: string;
}

export interface BuyerForgotSendOtpPayload {
  phone: string;
}

export interface BuyerForgotVerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface BuyerChangePasswordPayload {
  phone: string;
  newpassword: string;
  confirmpassword: string;
}

export interface BuyerAddressAddPayload {
  buyerid: string;
  fullname: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  pincode: string;
  city: string;
  state: string;
  default_status: string | number;
}

export interface BuyerAddressUpdatePayload extends BuyerAddressAddPayload {
  id: string;
}

export interface BuyerAddToCartPayload {
  buyerid: string;
  vendorid: string;
  productid: string;
  productname: string;
  amount: string | number;
  quantity: string | number;
  product_category: string;
}

export interface BuyerShoppingCartPayload {
  buyerid: string;
}

export interface BuyerPlaceOrderPayload {
  buyerid: string;
  addressid: string | number;
}

export interface BuyerWishlistPayload {
  buyerid: string;
  vendorid: string;
  productid: string;
}

export interface BuyerWishlistRemovePayload {
  buyerid: string;
  vendorid: string;
  productid: string;
}

export interface BuyerProfilePayload {
  buyerid?: string;
  vendorid?: string;
}

export interface BuyerProfileUpdatePayload {
  buyerid?: string;
  vendorid?: string;
  fname: string;
  lname: string;
  dob?: string;
  email: string;
  phone: string;
}

export interface BuyerApiResponse<T = any> {
  status: string | boolean;
  error?: string;
  message?: string;
  data?: T;
  [key: string]: any;
}

// Helper to determine if an API response signifies success
export const isBuyerSuccess = (response: any): boolean => {
  if (!response) return false;
  const statusStr = String(response.status || '').toLowerCase();
  if (
    response.status === true ||
    statusStr === 'success' ||
    statusStr.includes('successfully') ||
    statusStr === 'true'
  ) {
    return true;
  }
  return false;
};

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * 1. Buyer Registration API
 * POST https://constigo.in/app/buyer/registration.php
 */
export const registerBuyer = async (data: BuyerRegistrationPayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.REGISTRATION, data);
};

/**
 * 2. Buyer Check Login API
 * POST https://constigo.in/app/buyer/checklogin.php
 */
export const checkBuyerLogin = async (data: BuyerLoginPayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.CHECK_LOGIN, data);
};

/**
 * 3. Buyer Forgot Send OTP API
 * POST https://constigo.in/app/buyer/forgot_sendotp.php
 */
export const sendBuyerForgotOtp = async (phone: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.FORGOT_SEND_OTP, { phone });
};

/**
 * 4. Buyer Forgot Verify OTP API
 * POST https://constigo.in/app/buyer/forgot_verifyotp.php
 */
export const verifyBuyerForgotOtp = async (phone: string, otp: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.FORGOT_VERIFY_OTP, { phone, otp });
};

/**
 * 5. Buyer Change Password API
 * POST https://constigo.in/app/buyer/changepassword.php
 */
export const changeBuyerPassword = async (data: BuyerChangePasswordPayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.CHANGE_PASSWORD, data);
};

/**
 * 6. Product Categories Fetch
 * POST https://constigo.in/app/vendor/product_categories_fetch.php
 */
export const fetchBuyerProductCategories = async () => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.PRODUCT_CATEGORIES, {});
};

/**
 * 7. Product List (Trending materials)
 * POST https://constigo.in/app/buyer/product_list.php
 * If category is 'All' or empty => ''
 * Otherwise => category name e.g. 'Bricks', 'Cement'
 */
export const fetchBuyerProductList = async (category: string = '') => {
  const categoryParam = !category || category.toLowerCase() === 'all' ? '' : category;
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.PRODUCT_LIST, {
    category: categoryParam,
  });
};

/**
 * 8. Worker List (Construction Services)
 * POST https://constigo.in/app/buyer/workers.php
 */
export const fetchBuyerWorkers = async (category?: string) => {
  return postBuyerForm<BuyerApiResponse>(
    BUYER_ENDPOINTS.WORKERS,
    category && category.toLowerCase() !== 'all' ? { category } : {}
  );
};

/**
 * 9. Product Details
 * POST https://constigo.in/app/buyer/product_details.php
 * Variable: 'productid'
 */
export const fetchBuyerProductDetails = async (productid: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.PRODUCT_DETAILS, {
    productid,
  });
};

/**
 * 10. Address Add
 * POST https://constigo.in/app/buyer/address_add.php
 */
export const addBuyerAddress = async (data: BuyerAddressAddPayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.ADDRESS_ADD, data);
};

/**
 * 11. Address Edit (Fetch single address details)
 * POST https://constigo.in/app/buyer/address_edit.php
 * Variable: 'id'
 */
export const fetchBuyerAddressEdit = async (id: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.ADDRESS_EDIT, { id });
};

/**
 * 12. Address Update
 * POST https://constigo.in/app/buyer/address_update.php
 */
export const updateBuyerAddress = async (data: BuyerAddressUpdatePayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.ADDRESS_UPDATE, data);
};

/**
 * 13. Address Delete
 * POST https://constigo.in/app/buyer/address_delete.php
 * Variable: 'id'
 */
export const deleteBuyerAddress = async (id: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.ADDRESS_DELETE, { id });
};

/**
 * 14. Address List
 * POST https://constigo.in/app/buyer/address_list.php
 * Variable: 'buyerid'
 */
export const fetchBuyerAddressList = async (buyerid: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.ADDRESS_LIST, { buyerid });
};

/**
 * 15. Add To Cart API
 * POST https://constigo.in/app/buyer/add_to_cart.php
 * Variables: 'buyerid', 'vendorid', 'productid', 'productname', 'amount', 'quantity', 'product_category'
 */
export const addToBuyerCart = async (data: BuyerAddToCartPayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.ADD_TO_CART, data);
};

/**
 * 16. Shopping Cart API
 * POST https://constigo.in/app/buyer/shopping_cart.php
 * Variable: 'buyerid'
 */
export const fetchBuyerShoppingCart = async (buyerid: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.SHOPPING_CART, { buyerid });
};

/**
 * 17. Place Order API
 * POST https://constigo.in/app/buyer/place_order.php
 * Variables: 'buyerid', 'addressid'
 */
export const placeBuyerOrder = async (data: BuyerPlaceOrderPayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.PLACE_ORDER, data);
};

/**
 * 18. Wishlist (Add to Wishlist) API
 * POST https://constigo.in/app/buyer/wishlist.php
 * Variables: 'buyerid', 'vendorid', 'productid'
 */
export const addToBuyerWishlist = async (data: BuyerWishlistPayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.WISHLIST, data);
};

/**
 * 19. Wishlist Remove API
 * POST https://constigo.in/app/buyer/wishlist_remove.php
 * Variables: 'buyerid', 'vendorid', 'productid'
 */
export const removeFromBuyerWishlist = async (data: BuyerWishlistRemovePayload) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.WISHLIST_REMOVE, data);
};

/**
 * 20. Profile API
 * POST https://constigo.in/app/buyer/profile.php
 * Variables: 'buyerid', 'vendorid'
 */
export const fetchBuyerProfile = async (buyerOrVendorId: string) => {
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.PROFILE, {
    buyerid: buyerOrVendorId,
    vendorid: buyerOrVendorId,
  });
};

/**
 * 21. Profile Update API
 * POST https://constigo.in/app/buyer/profile_update.php
 * Variables: 'buyerid', 'vendorid', 'fname', 'lname', 'dob', 'email', 'phone'
 */
export const updateBuyerProfile = async (data: BuyerProfileUpdatePayload) => {
  const buyerId = data.buyerid || data.vendorid || '';
  return postBuyerForm<BuyerApiResponse>(BUYER_ENDPOINTS.PROFILE_UPDATE, {
    buyerid: buyerId,
    vendorid: buyerId,
    fname: data.fname,
    lname: data.lname,
    dob: data.dob || '',
    email: data.email,
    phone: data.phone,
  });
};


