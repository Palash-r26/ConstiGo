import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

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

  // Specifically capture residential sector (e.g. "Sector 70"), neighbourhood, or landmark
  const sectorOrArea = addr.residential || addr.neighbourhood || (data.name && data.name !== addr.road && data.name !== addr.suburb ? data.name : '');
  const roadOrBuilding = addr.road || addr.building || '';
  const suburb = addr.suburb && addr.suburb !== sectorOrArea ? addr.suburb : '';
  const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || '';
  const state = addr.state || '';
  const postcode = addr.postcode || '';

  const components = [
    sectorOrArea,
    roadOrBuilding,
    suburb,
    city,
    state,
    postcode,
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
  // Primary & Ultra-fast: ip-api.com (works reliably across Indian carriers/Wi-Fi)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('http://ip-api.com/json/?fields=status,message,country,regionName,city,zip,lat,lon', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.lat && data.lon) {
        return {
          latitude: String(data.lat),
          longitude: String(data.lon),
          city: data.city || '',
          state: data.regionName || '',
          pincode: data.zip || '',
          address: [data.city, data.regionName, data.zip, data.country].filter(Boolean).join(', '),
        };
      }
    }
  } catch (e) {
    console.warn('[LocationService] ip-api.com live lookup failed, trying backup:', e);
  }

  // Backup 1: ipwho.is
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
    console.warn('[LocationService] ipwho.is live lookup failed, trying backup 2:', e);
  }

  // Backup 2: ipapi.co
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
    console.warn('[LocationService] ipapi live lookup failed:', e);
  }

  return null;
};

/**
 * Direct Hardware GPS Lookup via Native Android FusedLocationProvider / GPS Chip
 */
export const getNativeDeviceGPS = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    try {
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
        locationProvider: 'auto',
      });

      // 1. Highest Accuracy: True Hardware GPS Chip (Satellites)
      Geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords && pos.coords.latitude && pos.coords.longitude) {
            console.log(
              '[LocationService] Native GPS High Accuracy Success:',
              pos.coords.latitude,
              pos.coords.longitude,
              `accuracy: ${pos.coords.accuracy}m`
            );
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          } else {
            resolve(null);
          }
        },
        (err) => {
          console.warn('[LocationService] High accuracy GPS failed, falling back to network provider:', err);
          // 2. Fused Network Triangulation (Local Sector Cell Tower / Wi-Fi)
          Geolocation.getCurrentPosition(
            (pos2) => {
              if (pos2 && pos2.coords && pos2.coords.latitude && pos2.coords.longitude) {
                console.log(
                  '[LocationService] Native GPS Network Provider Success:',
                  pos2.coords.latitude,
                  pos2.coords.longitude
                );
                resolve({
                  latitude: pos2.coords.latitude,
                  longitude: pos2.coords.longitude,
                });
              } else {
                resolve(null);
              }
            },
            (err2) => {
              console.warn('[LocationService] Network provider GPS also failed:', err2);
              resolve(null);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
      );
    } catch (e) {
      console.warn('[LocationService] Geolocation invocation error:', e);
      resolve(null);
    }
  });
};

/**
 * Fetch Current Dynamic Device GPS Location using Hardware / Geolocation / IP Geocoding
 */
export const getCurrentDeviceLocation = async (): Promise<LocationResult> => {
  await requestLocationPermission();

  // 1. HIGHEST PRIORITY: Real Device Hardware GPS (e.g. Sector 70 Noida exact coordinates)
  try {
    const nativeCoords = await getNativeDeviceGPS();
    if (nativeCoords && nativeCoords.latitude && nativeCoords.longitude) {
      const geo = await reverseGeocode(nativeCoords.latitude, nativeCoords.longitude);
      return {
        latitude: String(nativeCoords.latitude),
        longitude: String(nativeCoords.longitude),
        city: geo.city || 'Noida',
        state: geo.state || 'Uttar Pradesh',
        address: geo.address || `${nativeCoords.latitude.toFixed(5)}, ${nativeCoords.longitude.toFixed(5)}`,
        pincode: geo.pincode || '',
      };
    }
  } catch (err) {
    console.warn('[LocationService] Native GPS error, falling back:', err);
  }

  // 2. Fallback: navigator.geolocation if available
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

  // 3. Fallback: Live IP Geolocation
  const liveIp = await fetchLiveIpLocation();
  if (liveIp) {
    try {
      const latNum = parseFloat(liveIp.latitude);
      const lngNum = parseFloat(liveIp.longitude);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        const geo = await reverseGeocode(latNum, lngNum);
        if (geo.address && geo.address !== `${latNum}, ${lngNum}`) {
          return {
            latitude: liveIp.latitude,
            longitude: liveIp.longitude,
            city: geo.city || liveIp.city,
            state: geo.state || liveIp.state,
            pincode: geo.pincode || liveIp.pincode,
            address: geo.address,
          };
        }
      }
    } catch {
      // return liveIp
    }
    return liveIp;
  }

  // 4. Default: Sector 70, Noida Hub
  return {
    latitude: '28.5976',
    longitude: '77.3842',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    address: 'Sector 70, Noida, Uttar Pradesh',
  };
};
