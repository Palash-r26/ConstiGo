export interface User {
  _id: string;
  vendorid?: string;
  vendorId?: string;
  buyerid?: string;
  buyerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  hasCompany?: boolean;
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN';
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  status?: string | boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any;
}
