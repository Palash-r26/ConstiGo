/**
 * Utility for robust image URL normalization and validation in ConstiGo.
 */

export const CONSTIGO_BASE_DOMAIN = 'https://constigo.in';

/**
 * Normalizes an image path or URL:
 * - Returns null for empty, null, undefined, or invalid inputs
 * - Prepends base domain to relative paths (e.g., '/uploads/products/xyz.jpg' -> 'https://constigo.in/uploads/products/xyz.jpg')
 * - Ensures valid HTTP/HTTPS scheme
 * - Gracefully filters placeholder strings
 */
export function normalizeImageUrl(
  rawUrl?: string | null,
  baseDomain: string = CONSTIGO_BASE_DOMAIN
): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (
    trimmed === '' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed.toLowerCase() === '[object object]'
  ) {
    return null;
  }

  // Already a full valid web URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If local file or file:// protocol on device
  if (trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
    return trimmed;
  }

  // Relative path - strip leading slashes and prepend domain
  const cleanBase = baseDomain.replace(/\/+$/, '');
  const cleanPath = trimmed.replace(/^\/+/, '');

  return `${cleanBase}/${cleanPath}`;
}
