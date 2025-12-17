// Centralized environment-derived configuration for API & asset URLs
// Vite exposes variables prefixed with VITE_ via import.meta.env

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || BACKEND_URL;

const DEFAULT_UPI_ID = import.meta.env.VITE_UPI_ID || 'tererang@upi';
const DEFAULT_UPI_PAYEE_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || 'Tere Rang';
const UPI_QR_BASE_URL = import.meta.env.VITE_UPI_QR_API || 'https://api.qrserver.com/v1/create-qr-code/';
const UPI_QR_SIZE = import.meta.env.VITE_UPI_QR_SIZE || '220x220';
const UPI_DEFAULT_CURRENCY = import.meta.env.VITE_UPI_CURRENCY || 'INR';
const UPI_DEFAULT_MODE = import.meta.env.VITE_UPI_MODE || '02';
const RAW_GST_RATE = Number(import.meta.env.VITE_GST_RATE ?? import.meta.env.VITE_GST_RATE_PERCENT ?? 0.05);
const GST_RATE_VALUE = 0;
const GST_RATE_PERCENT_LABEL = `${(GST_RATE_VALUE * 100).toFixed(2).replace(/\.00$/, '')}%`;

if (!BACKEND_URL) {
    console.warn('[env] VITE_BACKEND_URL is not defined. API calls will fail.');
}

export const API_BASE_URL = BACKEND_URL?.replace(/\/$/, '');
export const IMAGE_BASE_URL = ASSET_BASE_URL?.replace(/\/$/, '');

export const apiUrl = (path = '') => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
export const imageUrl = (filename) => `${IMAGE_BASE_URL}/uploads/${filename}`;

const buildUpiPayload = ({
    upiId = DEFAULT_UPI_ID,
    payeeName = DEFAULT_UPI_PAYEE_NAME,
    currency = UPI_DEFAULT_CURRENCY,
    mode = UPI_DEFAULT_MODE,
    amount,
    note,
    transactionRef,
} = {}) => {
    const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        cu: currency,
        mode,
    });

    const numericAmount = Number(amount);
    if (Number.isFinite(numericAmount) && numericAmount > 0) {
        params.set('am', numericAmount.toFixed(2));
    }

    if (note) {
        params.set('tn', note.slice(0, 40));
    }

    if (transactionRef) {
        params.set('tr', transactionRef);
    }

    return `upi://pay?${params.toString()}`;
};

export const UPI_ID = DEFAULT_UPI_ID;
export const UPI_PAYEE_NAME = DEFAULT_UPI_PAYEE_NAME;
export const GST_RATE = GST_RATE_VALUE;
export const GST_RATE_LABEL = GST_RATE_PERCENT_LABEL;

export const upiPaymentLink = (overrides) => buildUpiPayload(overrides);

export const upiQrUrl = ({ size = UPI_QR_SIZE, ...overrides } = {}) => {
    const payload = buildUpiPayload(overrides);
    const qrParams = new URLSearchParams({
        size,
        data: payload,
    });
    return `${UPI_QR_BASE_URL}?${qrParams.toString()}`;
};
