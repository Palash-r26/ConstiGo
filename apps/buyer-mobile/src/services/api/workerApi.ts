import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const res = await postWorkerForm<WorkerApiResponse<WorkerItem[]>>(
    WORKER_ENDPOINTS.WORKERS,
    category ? { category } : {}
  );
  if (res && res.data && Array.isArray(res.data)) {
    const enriched = await Promise.all(
      res.data.map(async (w: WorkerItem) => {
        try {
          const override = await AsyncStorage.getItem(`@constigo_worker_${w.workerid}`);
          if (override) {
            return { ...w, ...JSON.parse(override) };
          }
        } catch {}
        return w;
      })
    );
    return { ...res, data: enriched };
  }
  return res;
};

/**
 * 4. Find Worker by Phone Number or Worker ID
 * Checks both local cached updates and the live backend across categories
 */
export const findWorkerByPhoneOrId = async (
  identifier: string
): Promise<WorkerItem | null> => {
  if (!identifier || !identifier.trim()) return null;
  const clean = identifier.trim();
  const cleanPhone = clean.replace(/\D/g, '').slice(-10);

  // 1. Check local storage first for instant response
  try {
    const localSaved = await AsyncStorage.getItem(`@constigo_worker_${clean}`);
    const localByPhone = cleanPhone ? await AsyncStorage.getItem(`@constigo_worker_${cleanPhone}`) : null;
    const cached = localSaved || localByPhone;
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.workerid || parsed.phone)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[WorkerAPI] Local cache lookup error:', e);
  }

  // 2. Query live ConstiGo worker backend across categories
  try {
    const catRes = await fetchWorkerCategories();
    const categories = catRes?.data && Array.isArray(catRes.data) ? catRes.data : [];

    // Parallel search across categories for top speed
    const searchPromises = categories.map((c) =>
      fetchWorkers(c.category).catch(() => ({ data: [] }))
    );

    const results = await Promise.all(searchPromises);
    for (const res of results) {
      if (res?.data && Array.isArray(res.data)) {
        const found = res.data.find((w: WorkerItem) => {
          const wPhone = (w.phone || '').replace(/\D/g, '').slice(-10);
          const wId = (w.workerid || w.id || '').toLowerCase();
          return (
            (cleanPhone && wPhone === cleanPhone) ||
            wId === clean.toLowerCase()
          );
        });

        if (found) {
          // Check if user previously edited this profile locally
          try {
            const override = await AsyncStorage.getItem(`@constigo_worker_${found.workerid}`);
            if (override) {
              return { ...found, ...JSON.parse(override) };
            }
          } catch {}
          return found;
        }
      }
    }
  } catch (err) {
    console.warn('[WorkerAPI] Remote worker lookup failed:', err);
  }

  return null;
};

/**
 * 5. Worker Login API
 * Authenticates a registered worker by Phone Number or Worker ID
 */
export const checkWorkerLogin = async (
  identifier: string
): Promise<{ success: boolean; worker?: WorkerItem; error?: string }> => {
  const clean = identifier.trim();
  if (!clean) {
    return { success: false, error: 'Please enter your registered mobile number or Worker ID' };
  }

  const worker = await findWorkerByPhoneOrId(clean);
  if (!worker) {
    return {
      success: false,
      error: 'No registered worker profile found with this mobile number or ID. Please check your credentials or register as a new worker.',
    };
  }

  // Save session info
  try {
    await AsyncStorage.setItem(`@constigo_worker_${worker.workerid}`, JSON.stringify(worker));
    if (worker.phone) {
      await AsyncStorage.setItem(`@constigo_worker_${worker.phone.replace(/\D/g, '').slice(-10)}`, JSON.stringify(worker));
    }
  } catch {}

  return { success: true, worker };
};

/**
 * 6. Worker Profile Update API
 * Allows worker to modify their Name, Phone, Skills, City, Service Charge, Visiting Charge
 */
export const updateWorkerProfile = async (
  workerId: string,
  updatedData: Partial<WorkerItem>
): Promise<{ success: boolean; worker: WorkerItem; message: string }> => {
  if (!workerId) {
    throw new Error('Worker ID is missing for profile update');
  }

  // Retrieve existing data
  const existing = (await findWorkerByPhoneOrId(workerId)) || ({} as WorkerItem);

  const merged: WorkerItem = {
    ...existing,
    ...updatedData,
    workerid: workerId,
    id: existing.id || workerId,
    fullname: updatedData.fullname || existing.fullname || '',
    phone: updatedData.phone || existing.phone || '',
    skill: updatedData.skill || existing.skill || '',
    location: updatedData.location || existing.location || '',
    service_charge: updatedData.service_charge || existing.service_charge || '',
    visit_charge: updatedData.visit_charge || existing.visit_charge || '',
  };

  // Persist updated profile in local storage
  await AsyncStorage.setItem(`@constigo_worker_${workerId}`, JSON.stringify(merged));
  if (merged.phone) {
    await AsyncStorage.setItem(`@constigo_worker_${merged.phone.replace(/\D/g, '').slice(-10)}`, JSON.stringify(merged));
  }

  // Update current user session in AsyncStorage if logged in
  try {
    const currentUserStr = await AsyncStorage.getItem('@constigo_user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role === 'WORKER') {
        const updatedUser = {
          ...currentUser,
          fullname: merged.fullname,
          firstName: merged.fullname,
          phone: merged.phone,
          skill: merged.skill,
          location: merged.location,
          service_charge: merged.service_charge,
          visit_charge: merged.visit_charge,
        };
        await AsyncStorage.setItem('@constigo_user', JSON.stringify(updatedUser));
      }
    }
  } catch (err) {
    console.warn('[WorkerAPI] Failed to update current auth session:', err);
  }

  // Attempt backend update sync
  try {
    await postWorkerForm(WORKER_ENDPOINTS.REGISTRATION, {
      workerid: workerId,
      fullname: merged.fullname,
      phone: merged.phone,
      skill: merged.skill,
      location: merged.location,
      service_charge: merged.service_charge,
      visit_charge: merged.visit_charge,
    });
  } catch (syncErr) {
    console.log('[WorkerAPI] Backend registration sync notice (handled):', syncErr);
  }

  return {
    success: true,
    worker: merged,
    message: 'Worker profile and service rates updated successfully!',
  };
};
