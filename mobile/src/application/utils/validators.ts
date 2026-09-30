import { z } from 'zod';

// ==========================================
// 1. AUTH SCHEMAS
// ==========================================

export const signUpSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .regex(/^[a-zA-Z\s]+$/, 'First name should contain only letters and spaces'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Last name should contain only letters and spaces'),
  dateOfBirth: z.string().trim().min(1, 'Date of birth is required'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  identity: z
    .string()
    .trim()
    .min(1, 'Email or phone number is required')
    .refine(
      (val) => {
        const clean = val.replace(/\s+/g, '');
        const isPhone = /^[6-9]\d{9}$/.test(clean);
        const isEmail = z.string().email().safeParse(val).success;
        return isPhone || isEmail;
      },
      { message: 'Enter a valid 10-digit phone number or email address' }
    ),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotSendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
});

export const forgotVerifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  otp: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit OTP'),
});

export const changePasswordSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ==========================================
// 2. COMPANY DETAILS & KYC SCHEMAS
// ==========================================

export const companyDetailsSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  emailId: z.string().trim().email('Enter a valid email address'),
  companyAddress: z.string().trim().min(1, 'Company address is required'),
  gstin: z
    .string()
    .trim()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5)'
    ),
  aadhaar: z
    .string()
    .trim()
    .regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhaar number'),
  pan: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid 10-character PAN (e.g. ABCDE1234F)'),
  bankAcc: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, 'Enter a valid Bank Account number (9-18 digits)'),
  ifsc: z
    .string()
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid 11-character IFSC code (e.g. ICIC0001010)'),
  emergencyContact: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit emergency phone number'),
  workingHrs: z.string().trim().min(1, 'Working hours are required'),
});

// ==========================================
// 3. PRODUCT & MATERIAL SCHEMAS
// ==========================================

export const addProductSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required'),
  productCategory: z.string().trim().min(1, 'Product category is required'),
  stockQuantity: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'Stock quantity must be a positive number'),
  productDescription: z.string().trim().min(1, 'Product description is required'),
  productPrice: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 1500 or 1500.50)')
    .refine((v) => parseFloat(v) > 0, 'Price must be greater than 0'),
  discountedPrice: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || (/^\d+(\.\d{1,2})?$/.test(v) && parseFloat(v) >= 0),
      'Enter a valid discounted price'
    ),
  warrantyDetails: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.discountedPrice && data.productPrice) {
      return parseFloat(data.discountedPrice) <= parseFloat(data.productPrice);
    }
    return true;
  },
  {
    message: 'Discounted price cannot be greater than original price',
    path: ['discountedPrice'],
  }
);

export const addMaterialSchema = z.object({
  name: z.string().trim().min(1, 'Material name is required'),
  stockQty: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'Quantity must be a positive integer'),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price')
    .refine((v) => parseFloat(v) > 0, 'Price must be greater than 0'),
  description: z.string().trim().min(1, 'Description is required'),
});

// ==========================================
// 4. BUYER & PROFILE SCHEMAS
// ==========================================

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Name should contain only letters and spaces'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().email('Enter a valid email address'),
  address: z.string().trim().min(1, 'Address is required'),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .regex(/^[a-zA-Z\s]+$/, 'City should contain only letters'),
  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .regex(/^[a-zA-Z\s]+$/, 'State should contain only letters'),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit Indian pincode'),
});

export const addressManagerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Name should contain only letters and spaces'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  flat: z.string().trim().min(1, 'House/Flat/Building details are required'),
  area: z.string().trim().min(1, 'Area/Street details are required'),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit Indian pincode'),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .regex(/^[a-zA-Z\s]+$/, 'City should contain only letters'),
  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .regex(/^[a-zA-Z\s]+$/, 'State should contain only letters'),
});

// ==========================================
// 5. CHECKOUT & SUPPORT SCHEMAS
// ==========================================

export const cardPaymentSchema = z.object({
  cardName: z
    .string()
    .trim()
    .min(1, 'Cardholder name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Cardholder name should contain only letters and spaces'),
  cardNumber: z
    .string()
    .trim()
    .regex(/^\d{15,16}$/, 'Enter a valid 15 or 16-digit card number'),
  cardType: z.string().trim().min(1, 'Card type is required'),
  validUpto: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Enter a valid expiry date (MM/YY)'),
});

export const supportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Name should contain only letters and spaces'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  message: z.string().trim().min(1, 'Message is required'),
});
