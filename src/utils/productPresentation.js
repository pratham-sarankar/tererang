import { imageUrl } from '../config/env.js';

export const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="none">
  <rect width="400" height="600" fill="#F3F4F6"/>
  <g opacity="0.4" transform="translate(160, 240)">
    <rect x="0" y="0" width="80" height="80" rx="16" fill="#9CA3AF"/>
    <path d="M24 54L38 38L56 56M48 48L56 40L68 52" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="34" cy="28" r="6" fill="#FFFFFF"/>
  </g>
  <text x="200" y="360" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#6B7280" letter-spacing="2">TERERANG</text>
  <text x="200" y="385" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#9CA3AF">Image unavailable</text>
</svg>
`).replace(/%20/g, ' ')}`;

export const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
export const DEFAULT_HEIGHTS = ["Up to 5'3''", "5'4''-5'6''", "5'6'' and above"];
export const DEFAULT_HIGHLIGHTS = [
    { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
    { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
    // { icon: 'Ruler', text: 'Custom Fitting Available' },
];

export const toAbsoluteImage = (pathValue) => {
    if (!pathValue) return FALLBACK_IMAGE;
    return /^https?:\/\//i.test(pathValue) ? pathValue : imageUrl(pathValue);
};

const stripCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    const numeric = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isNaN(numeric) ? null : numeric;
};

export const formatCurrency = (value) => {
    if (value === null || value === undefined) return null;
    const numeric = typeof value === 'number' ? value : stripCurrency(value);
    if (numeric === null) return null;
    return numeric.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    });
};

export const computeDiscount = (current, previous) => {
    if (!current || !previous || previous <= current) return null;
    return Math.round(((previous - current) / previous) * 100);
};

export const mapProductForDisplay = (rawProduct = {}, options = {}) => {
    const fallbackBrand = options.fallbackBrand || 'Tererang';
    const backendId = rawProduct.backendId || rawProduct._id || rawProduct.id;

    const gallerySources = [
        ...(Array.isArray(rawProduct.gallery) ? rawProduct.gallery : []),
        // Use imageUrls as primary source (images field no longer exposed in API)
        ...(Array.isArray(rawProduct.imageUrls) ? rawProduct.imageUrls : []),
        rawProduct.image,
        ...(Array.isArray(rawProduct.additionalImages) ? rawProduct.additionalImages : []),
    ].filter(Boolean);

    const gallery = [...new Set(gallerySources)].map((img) => toAbsoluteImage(img));
    if (gallery.length === 0) {
        gallery.push(FALLBACK_IMAGE);
    }

    const priceValue =
        rawProduct.price ??
        rawProduct.newPrice ??
        rawProduct.displayPrice ??
        rawProduct.numericPrice ??
        null;
    const compareAtValue =
        rawProduct.oldPrice ??
        rawProduct.compareAtPrice ??
        rawProduct.displayOldPrice ??
        rawProduct.mrp ??
        null;

    const numericPrice = stripCurrency(priceValue) ?? 0;
    const numericOldPrice = stripCurrency(compareAtValue);

    const displayPrice =
        (typeof rawProduct.displayPrice === 'string' && rawProduct.displayPrice) ||
        (typeof rawProduct.newPrice === 'string' && rawProduct.newPrice) ||
        formatCurrency(numericPrice) ||
        '₹0';

    const displayOldPrice =
        (typeof rawProduct.displayOldPrice === 'string' && rawProduct.displayOldPrice) ||
        (typeof rawProduct.oldPrice === 'string' && rawProduct.oldPrice) ||
        (numericOldPrice ? formatCurrency(numericOldPrice) : null);

    const discount =
        rawProduct.discount ??
        computeDiscount(
            stripCurrency(displayPrice) ?? numericPrice,
            stripCurrency(displayOldPrice) ?? numericOldPrice,
        );

    return {
        id: rawProduct.id || rawProduct._id || backendId,
        backendId,
        title: rawProduct.title || rawProduct.name || 'Tererang Exclusive',
        description: rawProduct.description || '',
        brand: rawProduct.brand || fallbackBrand,
        price: numericPrice, // Add numeric price for calculations
        displayPrice,
        displayOldPrice,
        discount,
        image: gallery[0],
        gallery,
        additionalImages: gallery.slice(1),
        sizes: rawProduct.sizes?.length ? rawProduct.sizes : DEFAULT_SIZES,
        heightOptions: rawProduct.heightOptions?.length
            ? rawProduct.heightOptions
            : DEFAULT_HEIGHTS,
        highlights: rawProduct.highlights?.length ? rawProduct.highlights : DEFAULT_HIGHLIGHTS,
        raw: rawProduct,
    };
};
