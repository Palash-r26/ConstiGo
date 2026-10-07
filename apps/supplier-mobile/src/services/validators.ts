import { z } from 'zod';
import { phoneValidator, editProfileSchema, supportSchema } from '@constigo/shared';

export { editProfileSchema, supportSchema };

// ==========================================
// 1. COMPANY DETAILS & KYC SCHEMAS
// ==========================================

export const companyDetailsSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  mobileNumber: phoneValidator,
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
  emergencyContact: phoneValidator,
  workingHrs: z.string().trim().min(1, 'Working hours are required'),
});

// ==========================================
// 2. PRODUCT & MATERIAL SCHEMAS
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
  productStatus: z.enum(['in_stock', 'out_of_stock'], {
    message: 'Please select a product status (In Stock or Out of Stock)',
  }),
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
  productStatus: z.enum(['in_stock', 'out_of_stock']).optional(),
});
