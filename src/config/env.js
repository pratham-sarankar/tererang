// Centralized environment-derived configuration for API & asset URLs
// Vite exposes variables prefixed with VITE_ via import.meta.env

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || BACKEND_URL;

if (!BACKEND_URL) {
    // eslint-disable-next-line no-console
    console.warn('[env] VITE_BACKEND_URL is not defined. API calls will fail.');
}

export const API_BASE_URL = BACKEND_URL?.replace(/\/$/, '');
export const IMAGE_BASE_URL = ASSET_BASE_URL?.replace(/\/$/, '');

export const apiUrl = (path = '') => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
export const imageUrl = (filename) => `${IMAGE_BASE_URL}/uploads/${filename}`;
