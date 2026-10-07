import { z } from 'zod';

export const phoneValidator = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .refine(
    (val) => {
      const clean = val.replace(/\D/g, '');
      return clean.length >= 10 && clean.length <= 13;
    },
    { message: 'Enter a valid 10-digit mobile number' }
  );

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
  phone: phoneValidator,
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
        const clean = val.replace(/\D/g, '');
        const isPhone = clean.length >= 10 && clean.length <= 13;
        const isEmail = z.string().email().safeParse(val.trim()).success;
        return isPhone || isEmail;
      },
      { message: 'Enter a valid 10-digit phone number or email address' }
    ),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotSendOtpSchema = z.object({
  phone: phoneValidator,
});

export const forgotVerifyOtpSchema = z.object({
  phone: phoneValidator,
  otp: z.string().trim().regex(/^\d{4}$/, 'Enter a valid 4-digit OTP'),
});

export const changePasswordSchema = z.object({
  phone: phoneValidator,
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Name should contain only letters and spaces'),
  phone: phoneValidator,
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
  phone: phoneValidator,
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
  phoneNumber: phoneValidator,
  message: z.string().trim().min(1, 'Message is required'),
});
