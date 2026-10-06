import axios from 'axios';

// Worker Production PHP Backend Endpoints at constigo.in
export const WORKER_API_BASE = 'https://constigo.in/app/worker';

export const WORKER_ENDPOINTS = {
  REGISTRATION: `${WORKER_API_BASE}/registration.php`,
  CATEGORIES_FETCH: `${WORKER_API_BASE}/categories_fetch.php`,
  WORKERS: `${WORKER_API_BASE}/workers.php`,
};

// Generic helper to send POST requests to PHP worker endpoints reliably
export const postWorkerForm = async <T = any>(
  url: string,
  payload: Record<string, any> = {}
): Promise<T> => {
  try {
    const searchParams = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    console.log(`[WorkerAPI Request] POST ${url}`, payload);

    const response = await axios.post<T>(url, searchParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    });

    console.log(`[WorkerAPI Response] POST ${url}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[WorkerAPI Error] POST ${url}`, error);
    if (error.response) {
      console.error(`[WorkerAPI Error Data]`, error.response.data);
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
// TYPE DEFINITIONS FOR WORKER API
// ==========================================

export interface WorkerRegistrationPayload {
  fullname: string;
  phone: string;
  skill: string;
  location: string;
  service_charge: string;
  visit_charge: string;
}

export interface WorkerCategory {
  id: string;
  category: string;
}

export interface WorkerItem {
  id: string;
  workerid: string;
  fullname: string;
  phone: string;
  skill: string;
  location: string;
  service_charge: string;
  visit_charge: string;
}

export interface WorkerApiResponse<T = any> {
  status: string | boolean;
  error?: string;
  message?: string;
  workerid?: string;
  data?: T;
  [key: string]: any;
}

export const isWorkerSuccess = (response: any): boolean => {
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
 * 1. Worker Registration API
 * POST https://constigo.in/app/worker/registration.php
 */
export const registerWorker = async (data: WorkerRegistrationPayload) => {
  return postWorkerForm<WorkerApiResponse>(WORKER_ENDPOINTS.REGISTRATION, data);
};

/**
 * 2. Worker Category Fetch API
 * POST https://constigo.in/app/worker/categories_fetch.php
 */
export const fetchWorkerCategories = async () => {
  return postWorkerForm<WorkerApiResponse<WorkerCategory[]>>(
    WORKER_ENDPOINTS.CATEGORIES_FETCH,
    {}
  );
};

/**
 * 3. Workers List API
 * POST https://constigo.in/app/worker/workers.php
 * Variable: category (e.g. 'plumber')
 */
export const fetchWorkers = async (category?: string) => {
  return postWorkerForm<WorkerApiResponse<WorkerItem[]>>(
    WORKER_ENDPOINTS.WORKERS,
    category ? { category } : {}
  );
};
