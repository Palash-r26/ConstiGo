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
        formData.append(key, String(value));
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
    // Generic user-friendly error message fallback for network or timeout issues
    const isNetworkError =
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message === 'Network Error' ||
      !error.response;

    if (isNetworkError) {
      throw new Error('Network connection issue or request timed out. Please check your internet connection and try again.');
    }

    // Pass through backend message or error object
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

export interface VendorCompanyFetchPayload {
  vendorid: string;
}

export interface VendorCheckCompanyPayload {
  vendorid: string;
}

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
  // TODO: Confirm exact success & error JSON schema from production backend (e.g. status, vendorid, token)
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
  // TODO: Confirm exact success & error JSON schema from production backend (e.g. vendorid, token, user profile)
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
  // TODO: Confirm exact response shape (e.g. { status: true, otp: ... } or message)
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
  // TODO: Confirm exact response shape for successful OTP verification
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
  // TODO: Confirm exact response shape for change password
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
  // TODO: Confirm exact response shape for company details add
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
  // TODO: Confirm exact response shape for company details fetch
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
  // TODO: Confirm exact response shape for company details update
  return result;
};

/**
 * 9. Check Company
 * POST https://constigo.in/app/vendor/check-company.php
 * Note: if company data is present redirect to inventory page else company form page will display
 */
export const checkCompanyStatus = async (vendorid: string) => {
  const result = await postVendorForm(VENDOR_ENDPOINTS.CHECK_COMPANY, {
    vendorid,
  });
  // TODO: Confirm exact response format. Usually returns { status: true/false, data: ... } or company details object.
  return result;
};
