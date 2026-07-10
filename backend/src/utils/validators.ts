import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9]+$/, 'Phone number must contain only numbers'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['BUYER', 'SUPPLIER']).optional(),
});

export const loginSchema = z.object({
  identity: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['BUYER', 'SUPPLIER']).optional(),
});
