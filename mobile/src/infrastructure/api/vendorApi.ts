import axios from 'axios';

// Vendor / Supplier Production PHP Backend Endpoints at constigo.in
const VENDOR_API_BASE = 'https://constigo.in/app/vendor';

export const VENDOR_ENDPOINTS = {
  REGISTRATION: `${VENDOR_API_BASE}/registration.php`,
  CHECK_LOGIN: `${VENDOR_API_BASE}/checklogin.php`,
  FORGOT_SEND_OTP: `${VENDOR_API_BASE}/forgot_sendotp.php`,
  FORGOT_VERIFY_OTP: `${VENDOR_API_BASE}/forgot_verifyotp.php`,
  CHANGE_PASSWORD: `${VENDOR_API_BASE}/changepassword.php`,
  COMPANY_DETAILS_ADD: `${VENDOR_API_BASE}/companydetails.php`,
  COMPANY_DETAILS_FETCH: `${VENDOR_API_BASE}/companydetailsfetch.php`,
  COMPANY_DETAILS_UPDATE: `${VENDOR_API_BASE}/companydetailsupdate.php`,
  CHECK_COMPANY: `${VENDOR_API_BASE}/check-company.php`,
  PRODUCT_ADD: `${VENDOR_API_BASE}/product_add.php`,
  PRODUCT_UPDATE: `${VENDOR_API_BASE}/product_update.php`,
  PRODUCT_DELETE: `${VENDOR_API_BASE}/product_delete.php`,
  PRODUCTS_ALL_LIST: `${VENDOR_API_BASE}/products_all_list.php`,
  PRODUCTS_AVAILABLE_LIST: `${VENDOR_API_BASE}/product_available.php`,
  PRODUCTS_UNAVAILABLE_LIST: `${VENDOR_API_BASE}/product_unavailable.php`,
  SUPPORT: `${VENDOR_API_BASE}/support.php`,
  PROFILE: `${VENDOR_API_BASE}/profile.php`,
  PROFILE_UPDATE: `${VENDOR_API_BASE}/profile_update.php`,
};

// Generic helper to send POST requests as multipart/form-data to PHP endpoints
export const postVendorForm = async <T = any>(
  url: string,
  payload: Record<string, any>
): Promise<T> => {
  try {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && value.uri) {
          // File object for image upload in React Native
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

    console.log(`[VendorAPI Request] POST ${url}`, payload);

    const response = await axios.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    console.log(`[VendorAPI Response] POST ${url}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[VendorAPI Error] POST ${url}`, error);
    if (error.response) {
      console.error(`[VendorAPI Error Data]`, error.response.data);
    }
    const isNetworkError =
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message === 'Network Error' ||
      !error.response;

    if (isNetworkError) {
      throw new Error('Network connection issue or request timed out. Please check your internet connection and try again.');
    }

    const backendMessage =
      typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || error.response?.data?.error || error.message;

    throw new Error(backendMessage || 'An unexpected error occurred while communicating with the server.');
  }
};

// Type definitions for Vendor API
export interface VendorRegistrationPayload {
  fname: string;
  lname: string;
  dob: string;
  email: string;
  phone: string;
  password: string;
  confrimpassword: string; // Exact spelling as required by PHP endpoint
}

export interface VendorLoginPayload {
  phone: string;
  password: string;
}

export interface VendorForgotSendOtpPayload {
  phone: string;
}

export interface VendorForgotVerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface VendorChangePasswordPayload {
  phone: string;
  newpassword: string;
  confirmpassword: string;
}

export interface VendorCompanyDetailsPayload {
  vendorid: string;
  companyname: string;
  companyphone: string;
  companyemail: string;
  companyaddress: string;
  categories: string;
  gst: string;
  adhaar: string;
  pan: string;
  bankac: string;
  ifsc: string;
  emergencyphone: string;
  workinghours: string;
  maplatitude: string;
  maplongitude: string;
}

export interface VendorAddProductPayload {
  vendorid: string;
  productname: string;
  productcategory: string;
  stock: string;
  product_description: string;
  product_price: string;
  discount_price?: string;
  productimage?: any;
  warranty_details?: string;
  delivery_available?: string; // 'yes' | 'no'
  product_status?: string; // 'available' | 'unavailable'
  productStatus?: 'in_stock' | 'out_of_stock' | string;
}

export interface VendorUpdateProductPayload extends VendorAddProductPayload {
  productid: string;
}

export interface VendorDeleteProductPayload {
  vendorid: string;
  productid: string;
}

export interface VendorSupportPayload {
  vendorid: string;
  name: string;
  phone: string;
  message: string;
}

export interface VendorProfileUpdatePayload {
  vendorid: string;
  fname: string;
  lname: string;
  dob: string;
  email: string;
  phone: string;
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * 1. Registration API
 * POST https://constigo.in/app/vendor/registration.php
 */
export const registerVendor = async (data: VendorRegistrationPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.REGISTRATION, {
    fname: data.fname,
    lname: data.lname,
    dob: data.dob,
    email: data.email,
    phone: data.phone,
    password: data.password,
    confrimpassword: data.confrimpassword,
  });
  return result;
};

/**
 * 2. Check Login API
 * POST https://constigo.in/app/vendor/checklogin.php
 */
export const checkVendorLogin = async (data: VendorLoginPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.CHECK_LOGIN, {
    phone: data.phone,
    password: data.password,
  });
  return result;
};

/**
 * 3. Forgot Send OTP
 * POST https://constigo.in/app/vendor/forgot_sendotp.php
 */
export const sendForgotOtp = async (phone: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.FORGOT_SEND_OTP, {
    phone,
  });
  return result;
};

/**
 * 4. Forgot Verify OTP
 * POST https://constigo.in/app/vendor/forgot_verifyotp.php
 */
export const verifyForgotOtp = async (phone: string, otp: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.FORGOT_VERIFY_OTP, {
    phone,
    otp,
  });
  return result;
};

/**
 * 5. Change Password
 * POST https://constigo.in/app/vendor/changepassword.php
 */
export const changeVendorPassword = async (data: VendorChangePasswordPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.CHANGE_PASSWORD, {
    phone: data.phone,
    newpassword: data.newpassword,
    confirmpassword: data.confirmpassword,
  });
  return result;
};

/**
 * 6. Company Details Add
 * POST https://constigo.in/app/vendor/companydetails.php
 */
export const addCompanyDetails = async (data: VendorCompanyDetailsPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.COMPANY_DETAILS_ADD, {
    vendorid: data.vendorid,
    companyname: data.companyname,
    companyphone: data.companyphone,
    companyemail: data.companyemail,
    companyaddress: data.companyaddress,
    categories: data.categories,
    gst: data.gst,
    adhaar: data.adhaar,
    pan: data.pan,
    bankac: data.bankac,
    ifsc: data.ifsc,
    emergencyphone: data.emergencyphone,
    workinghours: data.workinghours,
    maplatitude: data.maplatitude,
    maplongitude: data.maplongitude,
  });
  return result;
};

/**
 * 7. Company Details Fetch
 * POST https://constigo.in/app/vendor/companydetailsfetch.php
 */
export const fetchCompanyDetails = async (vendorid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.COMPANY_DETAILS_FETCH, {
    vendorid,
  });
  return result;
};

/**
 * 8. Company Details Update
 * POST https://constigo.in/app/vendor/companydetailsupdate.php
 */
export const updateCompanyDetails = async (data: VendorCompanyDetailsPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.COMPANY_DETAILS_UPDATE, {
    vendorid: data.vendorid,
    companyname: data.companyname,
    companyphone: data.companyphone,
    companyemail: data.companyemail,
    companyaddress: data.companyaddress,
    categories: data.categories,
    gst: data.gst,
    adhaar: data.adhaar,
    pan: data.pan,
    bankac: data.bankac,
    ifsc: data.ifsc,
    emergencyphone: data.emergencyphone,
    workinghours: data.workinghours,
    maplatitude: data.maplatitude,
    maplongitude: data.maplongitude,
  });
  return result;
};

/**
 * 9. Check Company
 * POST https://constigo.in/app/vendor/check-company.php
 */
export const checkCompanyStatus = async (vendorid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.CHECK_COMPANY, {
    vendorid,
  });
  return result;
};

/**
 * 10. Add Product
 * POST https://constigo.in/app/vendor/product_add.php
 */
export const addVendorProduct = async (data: VendorAddProductPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PRODUCT_ADD, {
    vendorid: data.vendorid,
    productname: data.productname,
    productcategory: data.productcategory,
    stock: data.stock,
    product_description: data.product_description,
    product_price: data.product_price,
    discount_price: data.discount_price || '0',
    productimage: data.productimage,
    warranty_details: data.warranty_details || '1 Year Product Warranty',
    delivery_available: data.delivery_available || 'yes',
    product_status: data.product_status || (data.productStatus === 'out_of_stock' ? 'unavailable' : 'available'),
    productStatus: data.productStatus || (data.product_status === 'unavailable' ? 'out_of_stock' : 'in_stock'),
  });
  // TODO: Confirm exact success response schema from backend
  return result;
};

/**
 * 11. Update Product
 * POST https://constigo.in/app/vendor/product_update.php
 */
export const updateVendorProduct = async (data: VendorUpdateProductPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PRODUCT_UPDATE, {
    vendorid: data.vendorid,
    productid: data.productid,
    productname: data.productname,
    productcategory: data.productcategory,
    stock: data.stock,
    product_description: data.product_description,
    product_price: data.product_price,
    discount_price: data.discount_price || '0',
    productimage: data.productimage,
    warranty_details: data.warranty_details || '1 Year Product Warranty',
    delivery_available: data.delivery_available || 'yes',
    product_status: data.product_status || (data.productStatus === 'out_of_stock' ? 'unavailable' : 'available'),
    productStatus: data.productStatus || (data.product_status === 'unavailable' ? 'out_of_stock' : 'in_stock'),
  });
  // TODO: Confirm exact update response schema from backend
  return result;
};

/**
 * 12. Delete Product
 * POST https://constigo.in/app/vendor/product_delete.php
 */
export const deleteVendorProduct = async (vendorid: string, productid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PRODUCT_DELETE, {
    vendorid,
    productid,
  });
  // TODO: Confirm exact delete response schema from backend
  return result;
};

/**
 * 13. Products All List
 * POST https://constigo.in/app/vendor/products_all_list.php
 */
export const fetchVendorAllProducts = async (vendorid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PRODUCTS_ALL_LIST, {
    vendorid,
  });
  // TODO: Confirm exact response shape (e.g. array of products or { status: true, data: [...] })
  return result;
};

/**
 * 14. Products Available List
 * POST https://constigo.in/app/vendor/product_available.php
 */
export const fetchVendorAvailableProducts = async (vendorid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PRODUCTS_AVAILABLE_LIST, {
    vendorid,
  });
  return result;
};

/**
 * 15. Products Unavailable List
 * POST https://constigo.in/app/vendor/product_unavailable.php
 */
export const fetchVendorUnavailableProducts = async (vendorid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PRODUCTS_UNAVAILABLE_LIST, {
    vendorid,
  });
  return result;
};

/**
 * 16. Support API
 * POST https://constigo.in/app/vendor/support.php
 */
export const submitVendorSupport = async (data: VendorSupportPayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.SUPPORT, {
    vendorid: data.vendorid,
    name: data.name,
    phone: data.phone,
    message: data.message,
  });
  // TODO: Confirm exact response shape from support endpoint
  return result;
};

/**
 * 17. Profile API
 * POST https://constigo.in/app/vendor/profile.php
 */
export const fetchVendorProfile = async (vendorid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PROFILE, {
    vendorid,
  });
  return result;
};

/**
 * 18. Profile Update API
 * POST https://constigo.in/app/vendor/profile_update.php
 */
export const updateVendorProfile = async (data: VendorProfileUpdatePayload) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.PROFILE_UPDATE, {
    vendorid: data.vendorid,
    fname: data.fname,
    lname: data.lname,
    dob: data.dob,
    email: data.email,
    phone: data.phone,
  });
  return result;
};
