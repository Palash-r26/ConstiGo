import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationResult {
  latitude: string;
  longitude: string;
  city: string;
  state?: string;
  address?: string;
  pincode?: string;
}

/**
 * Request runtime location permissions on Android
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    const fineGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const coarseGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    return fineGranted || coarseGranted;
  } catch (err) {
    console.warn('[LocationService] Error requesting location permission:', err);
    return false;
  }
};

/**
 * Clean & format OpenStreetMap address components into a readable string
 */
export const formatLocationAddress = (data: any): string => {
  if (!data) return '';
  const addr = data.address || {};

  const components = [
    data.name && data.name !== addr.road && data.name !== addr.suburb ? data.name : '',
    addr.road || addr.residential || addr.building,
    addr.suburb || addr.neighbourhood || addr.subdistrict,
    addr.city || addr.town || addr.village || addr.city_district || addr.county,
    addr.state,
    addr.postcode,
  ]
    .filter(Boolean)
    .filter((val, index, self) => self.indexOf(val) === index);

  if (components.length > 0) {
    return components.join(', ');
  }

  return data.display_name || `${data.lat || ''}, ${data.lon || ''}`;
};

/**
 * Dynamic Reverse Geocode: Converts GPS (lat, lng) -> Real City, State, Address
 * Uses live OpenStreetMap Nominatim reverse geocoding API
 */
export const reverseGeocode = async (
  latitude: number | string,
  longitude: number | string
): Promise<{ address: string; city: string; state?: string; pincode?: string }> => {
  try {
    const latNum = typeof latitude === 'number' ? latitude : parseFloat(latitude);
    const lngNum = typeof longitude === 'number' ? longitude : parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return { address: '', city: 'Delhi NCR' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ConstiGo-RoadDialMobileApp/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { address: `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`, city: 'Delhi NCR' };
    }

    const data = await res.json();
    const addr = data.address || {};
    const formatted = formatLocationAddress(data);

    return {
      address: formatted || data.display_name || `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`,
      city: addr.city || addr.town || addr.village || addr.city_district || addr.county || 'Delhi NCR',
      state: addr.state || '',
      pincode: addr.postcode || '',
    };
  } catch (error) {
    console.warn('[LocationService] reverseGeocode error:', error);
    return {
      address: `${latitude}, ${longitude}`,
      city: 'Delhi NCR',
    };
  }
};

/**
 * Search locations by user typed query using Nominatim OpenStreetMap
 */
export const searchLocationByQuery = async (
  query: string
): Promise<Array<{
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
}>> => {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&limit=8&addressdetails=1&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'ConstiGo-RoadDialMobileApp/1.0',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data || []).map((item: any) => {
      const addr = item.address || {};
      const formatted = formatLocationAddress(item);

      return {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: formatted || item.display_name,
        city: addr.city || addr.town || addr.village || addr.county || addr.city_district,
        state: addr.state,
        pincode: addr.postcode,
      };
    });
  } catch (error) {
    console.warn('[LocationService] searchLocationByQuery error:', error);
    return [];
  }
};

/**
 * Dynamic IP Geolocation: Fetches live real-time coordinates when GPS is not enabled or indoors
 */
export const fetchLiveIpLocation = async (): Promise<LocationResult | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          latitude: String(data.latitude),
          longitude: String(data.longitude),
          city: data.city || '',
          state: data.region || '',
          pincode: data.postal || '',
          address: [data.city, data.region, data.postal, data.country_name].filter(Boolean).join(', '),
        };
      }
    }
  } catch (e) {
    console.warn('[LocationService] ipapi live lookup failed, trying backup:', e);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.latitude && data.longitude) {
        return {
          latitude: String(data.latitude),
          longitude: String(data.longitude),
          city: data.city || '',
          state: data.region || '',
          pincode: data.postal || '',
          address: [data.city, data.region, data.postal, data.country].filter(Boolean).join(', '),
        };
      }
    }
  } catch (e) {
    console.warn('[LocationService] ipwho.is live lookup failed:', e);
  }

  return null;
};

/**
 * Fetch Current Dynamic Device GPS Location using Hardware / Geolocation / IP Geocoding
 */
export const getCurrentDeviceLocation = async (): Promise<LocationResult> => {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).geolocation) {
      const navResult = await new Promise<LocationResult | null>((resolve) => {
        (navigator as any).geolocation.getCurrentPosition(
          async (pos: any) => {
            try {
              const { latitude, longitude } = pos.coords;
              const geo = await reverseGeocode(latitude, longitude);
              resolve({
                latitude: String(latitude),
                longitude: String(longitude),
                city: geo.city || '',
                state: geo.state || '',
                address: geo.address || '',
                pincode: geo.pincode || '',
              });
            } catch {
              resolve(null);
            }
          },
          () => resolve(null),
          { timeout: 8000, enableHighAccuracy: true }
        );
      });

      if (navResult && navResult.latitude) {
        return navResult;
      }
    }
  } catch (e) {
    console.warn('[LocationService] navigator.geolocation fallback');
  }

  // Fallback to Live IP Geolocation if hardware unavailable/indoor
  const liveIp = await fetchLiveIpLocation();
  if (liveIp) {
    return liveIp;
  }

  // Regional Delhi NCR Default
  return {
    latitude: '28.5355',
    longitude: '77.3910',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    address: 'Sector 62, Noida, Uttar Pradesh',
  };
};
