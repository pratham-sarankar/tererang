import { imageUrl } from '../../config/env.js';

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
export const PAYMENT_STATUSES = ['pending', 'paid'];
export const PAYMENT_METHODS = ['upi', 'razorpay', 'cod'];
export const DEFAULT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const LOW_STOCK_THRESHOLD = 5;
export const PAGE_SIZE = 10;

export const PRODUCT_CATEGORIES = [
  { value: 'kurti', label: 'Kurti' },
  { value: 'suit', label: 'Suit' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'coat', label: 'Coat' },
  { value: 'ethnicWear', label: 'Ethnic Wear' },
  { value: 'wedding', label: 'Wedding Collection' },
];

export const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const titleCase = (value) =>
  String(value || '--').replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

export const resolveImagePath = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return imageUrl(path);
};

export const getPrimaryProductImage = (product) => {
  if (Array.isArray(product?.imageUrls) && product.imageUrls.length > 0) return product.imageUrls[0];
  if (Array.isArray(product?.images) && product.images.length > 0) return resolveImagePath(product.images[0]);
  if (product?.image) return resolveImagePath(product.image);
  return '';
};

export const getTotalStock = (sizeStock) => {
  if (!Array.isArray(sizeStock)) return 0;
  return sizeStock.reduce((sum, entry) => sum + (Number(entry?.quantity) || 0), 0);
};

export const blankProductForm = () => ({
  name: '',
  price: '',
  description: '',
  category: 'kurti',
  inStock: true,
  sizeStock: DEFAULT_SIZE_OPTIONS.map((size) => ({ size, quantity: 0 })),
});

export const getAdminData = () => {
  try {
    return JSON.parse(localStorage.getItem('adminData') || '{}');
  } catch {
    return {};
  }
};
