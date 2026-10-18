export interface User {
  _id: string;
  vendorid?: string;
  vendorId?: string;
  buyerid?: string;
  buyerId?: string;
  workerid?: string;
  workerId?: string;
  firstName?: string;
  lastName?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  skill?: string;
  location?: string;
  service_charge?: string;
  visit_charge?: string;
  hasCompany?: boolean;
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN' | 'WORKER';
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
