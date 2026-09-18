import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Edit,
    Eye,
    Inbox,
    LayoutDashboard,
    Loader2,
    LogOut,
    Menu,
    Package,
    Plus,
    RefreshCw,
    Search,
    Settings,
    ShoppingCart,
    Trash2,
    UploadCloud,
    User,
    X,
} from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Select, Switch, Textarea } from '@/components/ui/form-controls';
import { Dialog, Sheet } from '@/components/ui/overlay';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToastViewport } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import '../css/AdminDashboard.css';
import { apiUrl, imageUrl } from '../config/env.js';

/* ─── Inline SVG Icons (lightweight, no extra dep) ────────────────────────── */
const IcoGrid = () => <svg className="ad-nav-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const IcoBag = () => <svg className="ad-nav-icon" viewBox="0 0 24 24"><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
const IcoBox = () => <svg className="ad-nav-icon" viewBox="0 0 24 24"><path d="M4 7l8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></svg>;
const IcoTag = () => <svg className="ad-nav-icon" viewBox="0 0 24 24"><path d="M20.6 13.6 11 23l-9-9V2h12l6.6 6.6a3.5 3.5 0 0 1 0 5Z" /><circle cx="7" cy="7" r="1.5" /></svg>;
const IcoSettings = () => <svg className="ad-nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg>;
const IcoLog = () => <svg className="ad-nav-icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IcoSearch = () => <svg className="ad-search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.4-4.4" /></svg>;
const IcoCalendar = () => <svg className="ad-ico" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
const IcoBell = () => <svg className="ad-ico" viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
const IcoPlus = () => <svg className="ad-ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>;
const IcoChevron = () => <svg className="ad-ico" style={{width:12}} viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>;
const IcoTrend = () => <svg className="ad-ico" viewBox="0 0 24 24"><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>;
const IcoUsers = () => <svg className="ad-ico" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IcoLayers = () => <svg className="ad-ico" viewBox="0 0 24 24"><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></svg>;
const IcoMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
const IcoMore = () => <svg className="ad-ico" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;

/* ─── Reveal animation hook ───────────────────────────────────────────────── */
function useRevealAndCount() {
    useEffect(() => {
        const revealEls = document.querySelectorAll('.ad-reveal');
        const countEls = document.querySelectorAll('.ad-count');
        if (!revealEls.length && !countEls.length) return;

        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
            }),
            { threshold: 0.08 }
        );
        revealEls.forEach((el) => io.observe(el));

        const cio = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const target = +el.dataset.target;
                const prefix = el.dataset.prefix || '';
                const suffix = el.dataset.suffix || '';
                const start = performance.now();
                const tick = (now) => {
                    const p = Math.min(1, (now - start) / 800);
                    const v = target * (1 - Math.pow(1 - p, 3));
                    const formatted = el.dataset.format === 'indian'
                        ? Math.round(v).toLocaleString('en-IN')
                        : Math.round(v).toLocaleString('en-IN');
                    el.textContent = prefix + formatted + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                cio.unobserve(el);
            }),
            { threshold: 0.5 }
        );
        countEls.forEach((el) => cio.observe(el));

        return () => { io.disconnect(); cio.disconnect(); };
    });
}

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid'];
const PAYMENT_METHODS = ['upi', 'razorpay', 'cod'];
const DEFAULT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const LOW_STOCK_THRESHOLD = 5;
const PAGE_SIZE = 10;

const PRODUCT_CATEGORIES = [
    { value: 'kurti', label: 'Kurti' },
    { value: 'suit', label: 'Suit' },
    { value: 'skirt', label: 'Skirt' },
    { value: 'coat', label: 'Coat' },
    { value: 'ethnicWear', label: 'Ethnic Wear' },
    { value: 'wedding', label: 'Wedding Collection' },
];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const titleCase = (value) => String(value || '--').replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

const resolveImagePath = (path) => {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return imageUrl(path);
};

const getPrimaryProductImage = (product) => {
    if (Array.isArray(product?.imageUrls) && product.imageUrls.length > 0) return product.imageUrls[0];
    if (Array.isArray(product?.images) && product.images.length > 0) return resolveImagePath(product.images[0]);
    if (product?.image) return resolveImagePath(product.image);
    return '';
};

const getTotalStock = (sizeStock) => {
    if (!Array.isArray(sizeStock)) return 0;
    return sizeStock.reduce((sum, entry) => sum + (Number(entry?.quantity) || 0), 0);
};

const getStockState = (product) => {
    const total = getTotalStock(product.sizeStock);
    if (!product.inStock || total <= 0) return { label: 'Out of stock', variant: 'destructive', progress: 0 };
    if (total <= LOW_STOCK_THRESHOLD) return { label: 'Low stock', variant: 'warning', progress: 35 };
    return { label: 'In stock', variant: 'success', progress: 100 };
};

const blankProductForm = () => ({
    name: '',
    price: '',
    description: '',
    category: 'kurti',
    inStock: true,
    sizeStock: DEFAULT_SIZE_OPTIONS.map((size) => ({ size, quantity: 0 })),
});

const getAdminData = () => {
    try {
        return JSON.parse(localStorage.getItem('adminData') || '{}');
    } catch {
        return {};
    }
};

function ProductThumb({ product, src, alt }) {
    const imageSrc = src || getPrimaryProductImage(product);
    return <ProductImage src={imageSrc} alt={alt || product?.name || 'Product'} className="admin-product-image" />;
}

function EmptyState({ title, description }) {
    return (
        <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm font-medium">{title}</p>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
    );
}

function StatusBadge({ status }) {
    const variants = {
        pending: 'warning',
        confirmed: 'info',
        processing: 'secondary',
        completed: 'success',
        cancelled: 'destructive',
        paid: 'success',
    };
    return <Badge variant={variants[status] || 'outline'}>{titleCase(status)}</Badge>;
}

function Pager({ page, total, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function SortButton({ label, field, sort, onSort }) {
    return (
        <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort(field)}>
            {label}
            <ChevronsUpDown className={cn('h-3.5 w-3.5', sort.field === field && 'text-primary')} />
        </button>
    );
}

export default function AdminDashboard() {
    const [activeView, setActiveView] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [settings, setSettings] = useState({
        globalDiscountPercentage: 0,
        globalDiscountEnabled: false,
        promotionalText: 'FREE DELIVERY ABOVE ₹999',
    });
    const [loading, setLoading] = useState(true);
    const [productLoading, setProductLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [error, setError] = useState('');
    const [productSheetOpen, setProductSheetOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState(blankProductForm());
    const [productImages, setProductImages] = useState([]);
    const [productSubmitting, setProductSubmitting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderSheetOpen, setOrderSheetOpen] = useState(false);
    const [orderForm, setOrderForm] = useState({});
    const [orderSubmitting, setOrderSubmitting] = useState(false);
    const [orderActionState, setOrderActionState] = useState({ id: null, type: null });
    const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null, reason: 'Due to unforeseen circumstances, we had to cancel this order.' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null, label: '' });
    const [productSearch, setProductSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [inventorySearch, setInventorySearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('');
    const [orderStartDate, setOrderStartDate] = useState('');
    const [orderEndDate, setOrderEndDate] = useState('');
    const [productPage, setProductPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [inventoryPage, setInventoryPage] = useState(1);
    const [productSort, setProductSort] = useState({ field: 'name', direction: 'asc' });
    const [orderSort, setOrderSort] = useState({ field: 'createdAt', direction: 'desc' });
    const [inventorySort, setInventorySort] = useState({ field: 'stock', direction: 'asc' });
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categorySheetOpen, setCategorySheetOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [categorySubmitting, setCategorySubmitting] = useState(false);
    const [toasts, setToasts] = useState([]);
    const navigate = useNavigate();
    const adminData = getAdminData();

    const pushToast = (title, type = 'success', description = '') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, title, type, description }]);
        window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4500);
    };

    const logoutAndRedirect = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        if (!token) logoutAndRedirect();
        return token;
    };

    const fetchProducts = async () => {
        setProductLoading(true);
        try {
            const response = await fetch(apiUrl('/api/products?limit=500'));
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products || []);
            } else {
                setError(data.message || 'Failed to fetch products');
            }
        } catch (fetchError) {
            console.error('Fetch products error:', fetchError);
            setError('Network error. Please try again.');
        } finally {
            setProductLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrderLoading(true);
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setOrderLoading(false);
            logoutAndRedirect();
            return;
        }

        try {
            const response = await fetch(apiUrl('/api/admin/orders'), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setOrders(data.orders || []);
            } else {
                setError(data.message || 'Failed to fetch orders');
                if (response.status === 401) logoutAndRedirect();
            }
        } catch (fetchError) {
            console.error('Fetch orders error:', fetchError);
            setError('Network error. Please try again.');
        } finally {
            setOrderLoading(false);
        }
    };

    const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
            const response = await fetch(apiUrl('/api/settings'));
            const data = await response.json();
            if (response.ok) {
                setSettings(data.settings);
            } else {
                setError(data.message || 'Failed to fetch settings');
            }
        } catch (fetchError) {
            console.error('Fetch settings error:', fetchError);
            setError('Network error. Please try again.');
        } finally {
            setSettingsLoading(false);
        }
    };

    const fetchCategories = async () => {
        setCategoryLoading(true);
        try {
            const response = await fetch(apiUrl('/api/categories'));
            const data = await response.json();
            if (response.ok) {
                setCategories(data);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (fetchError) {
            console.error('Fetch categories error:', fetchError);
            setError('Network error. Please try again.');
        } finally {
            setCategoryLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
        const initialize = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchOrders(), fetchSettings(), fetchCategories()]);
            setLoading(false);
        };
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setProductPage(1);
    }, [productSearch]);

    useEffect(() => {
        setOrderPage(1);
    }, [orderSearch, orderStatusFilter, orderStartDate, orderEndDate]);

    useEffect(() => {
        setInventoryPage(1);
    }, [inventorySearch]);

    const metrics = useMemo(() => {
        const activeOrders = orders.filter((order) => order.status !== 'cancelled');
        const paidOrders = activeOrders.filter((order) => order.paymentStatus === 'paid');
        const revenue = paidOrders.reduce((sum, order) => sum + (Number(order.grandTotal || order.subtotal) || 0), 0);
        const lowStock = products.filter((product) => {
            const total = getTotalStock(product.sizeStock);
            return product.inStock && total > 0 && total <= LOW_STOCK_THRESHOLD;
        }).length;
        const outOfStock = products.filter((product) => !product.inStock || getTotalStock(product.sizeStock) <= 0).length;

        return {
            revenue,
            totalOrders: orders.length,
            totalProducts: products.length,
            pendingOrders: orders.filter((order) => order.status === 'pending').length,
            confirmedOrders: orders.filter((order) => order.status === 'confirmed').length,
            cancelledOrders: orders.filter((order) => order.status === 'cancelled').length,
            lowStock,
            outOfStock,
        };
    }, [orders, products]);

    const sortRows = (rows, sort, accessors) => {
        const accessor = accessors[sort.field];
        if (!accessor) return rows;
        return [...rows].sort((a, b) => {
            const aValue = accessor(a);
            const bValue = accessor(b);
            const result = typeof aValue === 'number' && typeof bValue === 'number'
                ? aValue - bValue
                : String(aValue || '').localeCompare(String(bValue || ''));
            return sort.direction === 'asc' ? result : -result;
        });
    };

    const toggleSort = (current, setter, field) => {
        setter({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    const filteredProducts = useMemo(() => {
        const search = productSearch.trim().toLowerCase();
        const rows = !search ? products : products.filter((product) =>
            [product.name, product.category, product.description].some((value) => String(value || '').toLowerCase().includes(search))
        );
        return sortRows(rows, productSort, {
            name: (product) => product.name,
            price: (product) => Number(product.price) || 0,
            stock: (product) => getTotalStock(product.sizeStock),
            updatedAt: (product) => new Date(product.updatedAt || product.createdAt).getTime(),
        });
    }, [productSearch, productSort, products]);

    const filteredOrders = useMemo(() => {
        const search = orderSearch.trim().toLowerCase();
        const start = orderStartDate ? new Date(`${orderStartDate}T00:00:00`) : null;
        const end = orderEndDate ? new Date(`${orderEndDate}T23:59:59`) : null;
        const rows = orders.filter((order) => {
            const matchesSearch = !search || [
                order.id,
                order.user?.name,
                order.user?.email,
                order.user?.phoneNumber,
                order.paymentReference,
            ].some((value) => String(value || '').toLowerCase().includes(search));
            const placed = new Date(order.createdAt);
            return matchesSearch
                && (!orderStatusFilter || order.status === orderStatusFilter)
                && (!start || placed >= start)
                && (!end || placed <= end);
        });
        return sortRows(rows, orderSort, {
            amount: (order) => Number(order.grandTotal || order.subtotal) || 0,
            createdAt: (order) => new Date(order.createdAt).getTime(),
            customer: (order) => order.user?.name || '',
        });
    }, [orderEndDate, orderSearch, orderSort, orderStartDate, orderStatusFilter, orders]);

    const filteredInventory = useMemo(() => {
        const search = inventorySearch.trim().toLowerCase();
        const rows = !search ? products : products.filter((product) =>
            [product.name, product.category].some((value) => String(value || '').toLowerCase().includes(search))
        );
        return sortRows(rows, inventorySort, {
            name: (product) => product.name,
            stock: (product) => getTotalStock(product.sizeStock),
            category: (product) => product.category,
        });
    }, [inventorySearch, inventorySort, products]);

    const paginate = (rows, page) => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openCreateProduct = () => {
        setEditingProduct(null);
        setProductForm(blankProductForm());
        setProductImages([]);
        setProductSheetOpen(true);
    };

    const openEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name || '',
            price: product.price ?? '',
            description: product.description || '',
            category: product.category || 'kurti',
            inStock: Boolean(product.inStock),
            sizeStock: Array.isArray(product.sizeStock) && product.sizeStock.length > 0
                ? product.sizeStock.map((entry) => ({ size: entry.size, quantity: entry.quantity ?? 0 }))
                : blankProductForm().sizeStock,
        });
        setProductImages([]);
        setProductSheetOpen(true);
    };

    const updateProductForm = (field, value) => {
        setProductForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateSizeStock = (index, field, value) => {
        setProductForm((prev) => ({
            ...prev,
            sizeStock: prev.sizeStock.map((row, rowIndex) => (
                rowIndex === index ? { ...row, [field]: field === 'quantity' ? Math.max(0, Number(value) || 0) : value } : row
            )),
        }));
    };

    const deleteProductImage = async (imageIndex) => {
        if (!editingProduct) return;

        const confirmed = window.confirm('Delete this image? This cannot be undone.');
        if (!confirmed) return;

        const token = checkAuth();
        if (!token) return;

        try {
            setProductSubmitting(true);
            const response = await fetch(
                apiUrl(`/api/products/${editingProduct._id}/images/${imageIndex}`),
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            const updatedProduct = await response.json();

            // Update local state
            setEditingProduct(updatedProduct);

            // Update products list
            setProducts(products.map(p =>
                p._id === updatedProduct._id ? updatedProduct : p
            ));

            pushToast('Image deleted successfully');
        } catch (error) {
            console.error('Delete image error:', error);
            pushToast('Failed to delete image. Please try again.', 'error');
        } finally {
            setProductSubmitting(false);
        }
    };

    const moveProductImage = async (fromIndex, direction) => {
        if (!editingProduct) return;

        const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= editingProduct.imageUrls.length) return;

        const token = checkAuth();
        if (!token) return;

        try {
            setProductSubmitting(true);

            // Calculate new order
            const newOrder = [...Array(editingProduct.imageUrls.length).keys()];
            [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];

            const response = await fetch(
                apiUrl(`/api/products/${editingProduct._id}/images/reorder`),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ newOrder })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to reorder images');
            }

            const updatedProduct = await response.json();

            // Update local state
            setEditingProduct(updatedProduct);

            // Update products list
            setProducts(products.map(p =>
                p._id === updatedProduct._id ? updatedProduct : p
            ));

            pushToast('Image reordered successfully');
        } catch (error) {
            console.error('Reorder image error:', error);
            pushToast('Failed to reorder image. Please try again.', 'error');
        } finally {
            setProductSubmitting(false);
        }
    };

    const addMoreImages = async (files) => {
        if (!editingProduct || !files || files.length === 0) return;

        const token = checkAuth();
        if (!token) return;

        try {
            setProductSubmitting(true);

            const formData = new FormData();
            files.forEach((file) => formData.append('images', file));

            const response = await fetch(
                apiUrl(`/api/products/${editingProduct._id}/images`),
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error('Failed to add images');
            }

            const updatedProduct = await response.json();

            // Update local state
            setEditingProduct(updatedProduct);

            // Update products list
            setProducts(products.map(p =>
                p._id === updatedProduct._id ? updatedProduct : p
            ));

            pushToast(`${files.length} image(s) added successfully`);
        } catch (error) {
            console.error('Add images error:', error);
            pushToast('Failed to add images. Please try again.', 'error');
        } finally {
            setProductSubmitting(false);
        }
    };

    const submitProduct = async (event) => {
        event.preventDefault();
        const token = checkAuth();
        if (!token) return;
        if (!editingProduct && productImages.length === 0) {
            pushToast('Add at least one product image.', 'error');
            return;
        }

        const submitData = new FormData();
        submitData.append('name', productForm.name);
        submitData.append('price', productForm.price);
        submitData.append('description', productForm.description || '');
        submitData.append('category', productForm.category || 'kurti');
        submitData.append('inStock', productForm.inStock);
        submitData.append('sizeStock', JSON.stringify(
            (productForm.sizeStock || [])
                .map((entry) => ({
                    size: String(entry.size || '').trim().toUpperCase(),
                    quantity: Number.isFinite(Number(entry.quantity)) ? Math.max(0, Math.floor(Number(entry.quantity))) : 0,
                }))
                .filter((entry) => entry.size.length > 0)
        ));
        productImages.forEach((file) => submitData.append('images', file));

        setProductSubmitting(true);
        try {
            const response = await fetch(editingProduct ? apiUrl(`/api/products/${editingProduct._id}`) : apiUrl('/api/products'), {
                method: editingProduct ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: submitData,
            });
            const data = await response.json();
            if (response.ok) {
                await fetchProducts();
                setProductSheetOpen(false);
                setError('');
                pushToast(editingProduct ? 'Product updated' : 'Product created');
            } else {
                setError(data.message || 'Operation failed');
                pushToast(data.message || 'Operation failed', 'error');
            }
        } catch (submitError) {
            console.error('Submit error:', submitError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setProductSubmitting(false);
        }
    };

    const deleteProduct = async (productId) => {
        const token = checkAuth();
        if (!token) return;
        try {
            const response = await fetch(apiUrl(`/api/products/${productId}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                await fetchProducts();
                setError('');
                pushToast('Product deleted');
            } else {
                const data = await response.json();
                setError(data.message || 'Delete failed');
                pushToast(data.message || 'Delete failed', 'error');
            }
        } catch (deleteError) {
            console.error('Delete error:', deleteError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setDeleteDialog({ open: false, type: null, id: null, label: '' });
        }
    };

    const openOrderSheet = (order) => {
        setSelectedOrder(order);
        setOrderForm({
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            paymentReference: order.paymentReference || '',
            notes: order.notes || '',
        });
        setOrderSheetOpen(true);
    };

    const submitOrderUpdate = async (event) => {
        event.preventDefault();
        if (!selectedOrder) return;
        const token = checkAuth();
        if (!token) return;

        setOrderSubmitting(true);
        try {
            const response = await fetch(apiUrl(`/api/admin/orders/${selectedOrder.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderForm),
            });
            const data = await response.json();
            if (response.ok) {
                setOrders((prev) => prev.map((order) => (order.id === selectedOrder.id ? data.order : order)));
                setSelectedOrder(data.order);
                setError('');
                pushToast('Order updated');
            } else {
                setError(data.message || 'Failed to update order');
                pushToast(data.message || 'Failed to update order', 'error');
                if (response.status === 401) logoutAndRedirect();
            }
        } catch (updateError) {
            console.error('Update order error:', updateError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setOrderSubmitting(false);
        }
    };

    const deleteOrder = async (orderId) => {
        const token = checkAuth();
        if (!token) return;
        try {
            const response = await fetch(apiUrl(`/api/admin/orders/${orderId}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setOrders((prev) => prev.filter((order) => order.id !== orderId));
                setOrderSheetOpen(false);
                setSelectedOrder(null);
                setError('');
                pushToast('Order deleted');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete order');
                pushToast(data.message || 'Failed to delete order', 'error');
            }
        } catch (deleteError) {
            console.error('Delete order error:', deleteError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setDeleteDialog({ open: false, type: null, id: null, label: '' });
        }
    };

    const openCategorySheet = (category = null) => {
        setEditingCategory(category);
        setCategoryForm(category ? { name: category.name, description: category.description } : { name: '', description: '' });
        setCategorySheetOpen(true);
    };

    const closeCategorySheet = () => {
        setCategorySheetOpen(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '' });
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        const token = checkAuth();
        if (!token) return;
        if (!categoryForm.name.trim()) {
            pushToast('Category name is required', 'error');
            return;
        }
        setCategorySubmitting(true);
        try {
            const method = editingCategory ? 'PUT' : 'POST';
            const url = editingCategory ? apiUrl(`/api/categories/${editingCategory._id}`) : apiUrl('/api/categories');
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: categoryForm.name.trim(),
                    description: categoryForm.description.trim(),
                }),
            });
            const data = await response.json();
            if (response.ok) {
                await fetchCategories();
                closeCategorySheet();
                pushToast(editingCategory ? 'Category updated' : 'Category created');
            } else {
                setError(data.message || 'Failed to save category');
                pushToast(data.message || 'Failed to save category', 'error');
                if (response.status === 401) logoutAndRedirect();
            }
        } catch (saveError) {
            console.error('Save category error:', saveError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setCategorySubmitting(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        const token = checkAuth();
        if (!token) return;
        try {
            const response = await fetch(apiUrl(`/api/categories/${id}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                await fetchCategories();
                pushToast('Category deleted');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete category');
                pushToast(data.message || 'Failed to delete category', 'error');
                if (response.status === 401) logoutAndRedirect();
            }
        } catch (deleteError) {
            console.error('Delete category error:', deleteError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setDeleteDialog({ open: false, type: null, id: null, label: '' });
        }
    };

    const triggerOrderAction = async (orderId, action, reason) => {
        const token = checkAuth();
        if (!token) return;
        const requestInit = {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        };
        if (reason) {
            requestInit.headers['Content-Type'] = 'application/json';
            requestInit.body = JSON.stringify({ reason });
        }

        setOrderActionState({ id: orderId, type: action });
        try {
            const response = await fetch(apiUrl(`/api/admin/orders/${orderId}/${action}`), requestInit);
            const data = await response.json();
            if (response.ok) {
                setOrders((prev) => prev.map((order) => (order.id === orderId ? data.order : order)));
                if (selectedOrder?.id === orderId) setSelectedOrder(data.order);
                setError('');
                pushToast(action === 'confirm' ? 'Order confirmed' : 'Order cancelled');
                if (action === 'confirm') await fetchProducts();
            } else {
                setError(data.message || `Failed to ${action} order`);
                pushToast(data.message || `Failed to ${action} order`, 'error');
                if (response.status === 401) logoutAndRedirect();
            }
        } catch (actionError) {
            console.error(`${action} order error:`, actionError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setOrderActionState({ id: null, type: null });
            setCancelDialog({ open: false, orderId: null, reason: 'Due to unforeseen circumstances, we had to cancel this order.' });
        }
    };

    const saveSettings = async (event) => {
        event.preventDefault();
        const token = checkAuth();
        if (!token) return;
        setSettingsSaving(true);
        setError('');
        try {
            const payload = {
                ...settings,
                globalDiscountPercentage: Number(settings.globalDiscountPercentage) || 0,
            };
            const response = await fetch(apiUrl('/api/settings'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
                setSettings(data.settings);
                pushToast('Settings saved');
            } else {
                setError(data.message || 'Failed to save settings');
                pushToast(data.message || 'Failed to save settings', 'error');
                if (response.status === 401) logoutAndRedirect();
            }
        } catch (saveError) {
            console.error('Save settings error:', saveError);
            setError('Network error. Please try again.');
            pushToast('Network error. Please try again.', 'error');
        } finally {
            setSettingsSaving(false);
        }
    };

    const adNavItems = [
        { id: 'dashboard', label: 'Dashboard', Icon: IcoGrid },
        { id: 'products', label: 'Products', Icon: IcoBag },
        { id: 'categories', label: 'Categories', Icon: IcoTag },
        { id: 'orders', label: 'Orders', Icon: IcoBox },
        { id: 'inventory', label: 'Inventory', Icon: IcoLayers },
        { id: 'settings', label: 'Settings', Icon: IcoSettings },
    ];
    const pageTitle = adNavItems.find((item) => item.id === activeView)?.label || 'Dashboard';

    useRevealAndCount();

    const renderDashboard = () => {
        const revenueDisplay = metrics.revenue;
        const topProducts = [...products]
            .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
            .slice(0, 5);
        const lowStockProducts = products
            .filter((p) => p.inStock && getTotalStock(p.sizeStock) > 0 && getTotalStock(p.sizeStock) <= LOW_STOCK_THRESHOLD)
            .slice(0, 4);

        /* Sparkline path: illustrative S-curve representing growth */
        const sparkPts = [0.55, 0.45, 0.52, 0.38, 0.48, 0.42, 0.6, 0.55, 0.7, 0.65, 0.75, 0.82, 0.78, 0.88, 0.84, 0.95, 0.9, 1];
        const W = 600, H = 48;
        const toX = (i) => (i / (sparkPts.length - 1)) * W;
        const toY = (v) => H - v * H * 0.92;
        const linePts = sparkPts.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
        const areaPath = `M0,${H} L${sparkPts.map((v, i) => `${toX(i)},${toY(v)}`).join(' L')} L${W},${H} Z`;

        /* Revenue chart: 18 weeks of illustrative data */
        const chartWeeks = ['Apr', 'Apr', 'May', 'May', 'May', 'Jun', 'Jun', 'Jul', 'Jul', 'Aug', 'Aug', 'Sep', 'Sep', 'Sep', 'Sep', 'Sep', 'Sep', 'Sep'];
        const chartCurrent = [32, 28, 41, 38, 45, 42, 55, 50, 62, 58, 71, 67, 78, 74, 82, 79, 88, 95];
        const chartPrev    = [28, 24, 35, 32, 39, 36, 48, 43, 54, 50, 61, 57, 66, 62, 70, 67, 74, 80];
        const CW = 800, CH = 240, pad = { top: 16, right: 12, bottom: 32, left: 36 };
        const innerW = CW - pad.left - pad.right;
        const innerH = CH - pad.top - pad.bottom;
        const xS = (i) => pad.left + (i / (chartCurrent.length - 1)) * innerW;
        const yS = (v) => pad.top + innerH - (v / 100) * innerH;
        const curPath = chartCurrent.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yS(v)}`).join(' ');
        const prevPath = chartPrev.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yS(v)}`).join(' ');
        const areaChartPath = `${curPath} L${xS(chartCurrent.length-1)},${pad.top+innerH} L${pad.left},${pad.top+innerH} Z`;
        const gridLines = [0, 25, 50, 75, 100];
        /* Customer split illustrative bars */
        const custBars = [{ n: 42, r: 58 }, { n: 38, r: 62 }, { n: 35, r: 65 }, { n: 40, r: 60 }, { n: 33, r: 67 }, { n: 37, r: 63 }, { n: 30, r: 70 }];

        return (
            <>
                {/* ── Hero Overview ── */}
                <div className="ad-hero-overview">
                    {/* Revenue Hero Card */}
                    <div className="ad-revenue-hero ad-reveal">
                        <div className="ad-revenue-head">
                            <div>
                                <div className="ad-eyebrow">Total Revenue</div>
                            </div>
                            <div className="ad-period-tabs" id="periodTabs">
                                <button type="button" className="ad-period-tab">7 days</button>
                                <button type="button" className="ad-period-tab">30 days</button>
                                <button type="button" className="ad-period-tab active">This period</button>
                            </div>
                        </div>
                        <div className="ad-metric-big">
                            <div className="ad-value">
                                ₹<span
                                    className="ad-count"
                                    data-target={revenueDisplay}
                                    data-format="indian"
                                >{Math.round(revenueDisplay).toLocaleString('en-IN')}</span>
                            </div>
                            {revenueDisplay > 0 && (
                                <div className="ad-trend">
                                    <IcoTrend />
                                    Live
                                </div>
                            )}
                        </div>
                        <div className="ad-metric-copy">From {metrics.totalOrders} orders · {metrics.pendingOrders} pending</div>
                        <div className="ad-hero-spark">
                            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#d4008a" stopOpacity="0.22" />
                                        <stop offset="100%" stopColor="#d4008a" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#sparkGrad)" />
                                <polyline points={linePts} fill="none" stroke="#d4008a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    {/* Mini Metrics 2×2 */}
                    <div className="ad-mini-metrics">
                        <div className="ad-mini-metric">
                            <div className="ad-metric-label">Total orders</div>
                            <div className="ad-metric-value ad-count" data-target={metrics.totalOrders}>{metrics.totalOrders}</div>
                            <div className="ad-metric-foot neutral">{metrics.pendingOrders} pending</div>
                        </div>
                        <div className="ad-mini-metric">
                            <div className="ad-metric-label">Products</div>
                            <div className="ad-metric-value ad-count" data-target={metrics.totalProducts}>{metrics.totalProducts}</div>
                            <div className="ad-metric-foot neutral">In catalog</div>
                        </div>
                        <div className="ad-mini-metric">
                            <div className="ad-metric-label">Confirmed</div>
                            <div className="ad-metric-value ad-count" data-target={metrics.confirmedOrders}>{metrics.confirmedOrders}</div>
                            <div className="ad-metric-foot">Ready to ship</div>
                        </div>
                        <div className="ad-mini-metric">
                            <div className="ad-metric-label">Low stock</div>
                            <div className="ad-metric-value">{metrics.lowStock}<span style={{fontSize:13,color:'#c64054',marginLeft:4}}>{metrics.outOfStock > 0 && `+${metrics.outOfStock} out`}</span></div>
                            <div className={`ad-metric-foot ${metrics.lowStock > 0 ? 'down' : 'neutral'}`}>{metrics.outOfStock} out of stock</div>
                        </div>
                    </div>
                </div>

                {/* ── Analytics + Products ── */}
                <div className="ad-grid-main">
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title">
                                <h2>Revenue analytics</h2>
                                <p>Weekly trend — illustrative shape, live totals above</p>
                            </div>
                            <select className="ad-tiny-select"><option>Revenue</option><option>Orders</option></select>
                        </div>
                        <div className="ad-analytics-body">
                            <div className="ad-chart-meta">
                                <strong>₹{Math.round(revenueDisplay).toLocaleString('en-IN')}</strong>
                                <div className="ad-legend">
                                    <span><i style={{background:'#d4008a'}} />This period</span>
                                    <span><i style={{background:'#bbb0b8'}} />Previous</span>
                                </div>
                            </div>
                            <svg className="ad-revenue-chart" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="xMidYMid meet">
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#d4008a" stopOpacity="0.13" />
                                        <stop offset="100%" stopColor="#d4008a" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid */}
                                {gridLines.map((v) => (
                                    <g key={v}>
                                        <line x1={pad.left} y1={yS(v)} x2={pad.left+innerW} y2={yS(v)} stroke="#eee5ea" strokeWidth="1" />
                                        <text x={pad.left-6} y={yS(v)+3} fill="#8f838d" fontSize="9" textAnchor="end">{v}%</text>
                                    </g>
                                ))}
                                {/* Month labels */}
                                {['Apr','May','Jun','Jul','Aug','Sep'].map((m, i) => (
                                    <text key={m} x={pad.left + (i / 5) * innerW} y={CH - 8} fill="#8f838d" fontSize="9" textAnchor="middle">{m}</text>
                                ))}
                                {/* Area fill */}
                                <path d={areaChartPath} fill="url(#areaGrad)" />
                                {/* Prev period dashed */}
                                <path d={prevPath} fill="none" stroke="#bbb0b8" strokeWidth="1.5" strokeDasharray="4 5" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Current period line */}
                                <path d={curPath} fill="none" stroke="#d4008a" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                                {/* End point dot */}
                                <circle cx={xS(chartCurrent.length-1)} cy={yS(chartCurrent[chartCurrent.length-1])} r="4" fill="#fff" stroke="#d4008a" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title"><h2>Top products</h2><p>By price, from catalog</p></div>
                        </div>
                        <div className="ad-product-list">
                            {topProducts.length === 0 && <p style={{padding:'16px 0',fontSize:11,color:'var(--muted)'}}>No products yet</p>}
                            {topProducts.map((p) => (
                                <div className="ad-product-row" key={p._id}>
                                    <div className="ad-thumb">
                                        {getPrimaryProductImage(p)
                                            ? <img src={getPrimaryProductImage(p)} alt={p.name} onError={(e) => { e.currentTarget.style.display='none'; }} />
                                            : null}
                                    </div>
                                    <div>
                                        <div className="ad-product-name">{p.name}</div>
                                        <div className="ad-product-cat">{titleCase(p.category)}</div>
                                    </div>
                                    <div className="ad-product-stat">
                                        <strong>₹{Number(p.price).toLocaleString('en-IN')}</strong>
                                        <span>{getTotalStock(p.sizeStock)} in stock</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Recent Orders ── */}
                <div className="ad-split">
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title"><h2>Recent orders</h2><p>Latest customer transactions</p></div>
                            <button className="ad-primary-btn" type="button" onClick={() => setActiveView('orders')}>
                                <span>View all</span>
                            </button>
                        </div>
                        <div className="ad-orders-body">
                            {orders.length === 0
                                ? <p style={{padding:'20px 22px',fontSize:11,color:'var(--muted)'}}>No orders yet.</p>
                                : (
                                    <table className="ad-orders-table" id="ordersTable">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 6).map((order) => (
                                                <tr key={order.id} onClick={() => openOrderSheet(order)} style={{cursor:'pointer'}}>
                                                    <td><span className="ad-order-id">#{String(order.id).slice(-8)}</span></td>
                                                    <td>
                                                        <div className="ad-customer-cell">
                                                            <div className="ad-customer-avatar">
                                                                {(order.user?.name || 'G').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{fontWeight:700,fontSize:10}}>{order.user?.name || 'Guest'}</div>
                                                                <div style={{fontSize:9,color:'var(--muted)'}}>{order.user?.phoneNumber || order.user?.email || ''}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{fontWeight:700}}>{formatCurrency(order.grandTotal || order.subtotal)}</td>
                                                    <td><span className={`ad-status-pill ${order.status}`}>{order.status}</span></td>
                                                    <td><span className={`ad-payment ${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                        </div>
                    </div>

                    {/* Order pipeline summary */}
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title"><h2>Order pipeline</h2><p>Current fulfilment state</p></div>
                        </div>
                        <div className="ad-widget-body">
                            <div className="ad-stock-stats">
                                <div className="ad-stock-stat"><span>Pending</span><strong className="ad-count" data-target={metrics.pendingOrders}>{metrics.pendingOrders}</strong></div>
                                <div className="ad-stock-stat"><span>Confirmed</span><strong className="ad-count" data-target={metrics.confirmedOrders}>{metrics.confirmedOrders}</strong></div>
                                <div className="ad-stock-stat"><span>Cancelled</span><strong className="ad-count" data-target={metrics.cancelledOrders}>{metrics.cancelledOrders}</strong></div>
                            </div>
                            <div className="ad-inventory-bar" style={{
                                background: `linear-gradient(90deg,
                                    var(--green) 0 ${metrics.totalOrders > 0 ? Math.round((metrics.confirmedOrders/metrics.totalOrders)*100) : 0}%,
                                    var(--amber) ${metrics.totalOrders > 0 ? Math.round((metrics.confirmedOrders/metrics.totalOrders)*100) : 0}% ${metrics.totalOrders > 0 ? Math.round(((metrics.confirmedOrders+metrics.pendingOrders)/metrics.totalOrders)*100) : 0}%,
                                    var(--red) ${metrics.totalOrders > 0 ? Math.round(((metrics.confirmedOrders+metrics.pendingOrders)/metrics.totalOrders)*100) : 0}% 100%)`
                            }} />
                            {metrics.pendingOrders > 0 && (
                                <div className="ad-warning">⚠ {metrics.pendingOrders} order{metrics.pendingOrders > 1 ? 's' : ''} waiting for confirmation</div>
                            )}
                            <div style={{fontSize:10,color:'var(--muted)',marginTop:8}}>Total: {metrics.totalOrders} orders</div>
                        </div>
                    </div>
                </div>

                {/* ── Triple Widgets ── */}
                <div className="ad-triple">
                    {/* Inventory Health */}
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title"><h2>Inventory health</h2><p>Live from product stock</p></div>
                        </div>
                        <div className="ad-widget-body">
                            <div className="ad-stock-stats">
                                <div className="ad-stock-stat"><span>In stock</span><strong className="ad-count" data-target={metrics.totalProducts - metrics.lowStock - metrics.outOfStock}>{metrics.totalProducts - metrics.lowStock - metrics.outOfStock}</strong></div>
                                <div className="ad-stock-stat"><span>Low stock</span><strong className="ad-count" data-target={metrics.lowStock}>{metrics.lowStock}</strong></div>
                                <div className="ad-stock-stat"><span>Out of stock</span><strong className="ad-count" data-target={metrics.outOfStock}>{metrics.outOfStock}</strong></div>
                            </div>
                            {lowStockProducts.length > 0 && (
                                <>
                                    <div className="ad-warning">⚠ Low stock items need restocking</div>
                                    {lowStockProducts.map((p) => (
                                        <div className="ad-low-item" key={p._id}>
                                            <span>{p.name}</span>
                                            <span className="ad-low-badge amber">{getTotalStock(p.sizeStock)} left</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            {metrics.outOfStock > 0 && (
                                <div className="ad-low-item">
                                    <span>{metrics.outOfStock} product{metrics.outOfStock > 1 ? 's' : ''} out of stock</span>
                                    <span className="ad-low-badge">Out</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer / New vs Returning (illustrative) */}
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title"><h2>Customer mix</h2><p>New vs returning (illustrative)</p></div>
                        </div>
                        <div className="ad-widget-body">
                            <div className="ad-customer-grid">
                                <div className="ad-customer-kpi"><span>New</span><strong>35%</strong></div>
                                <div className="ad-customer-kpi"><span>Returning</span><strong>65%</strong></div>
                            </div>
                            <div className="ad-customer-split">
                                {custBars.map((b, i) => (
                                    <div key={i} className="ad-bar-pair">
                                        <i style={{height: `${b.n}%`}} />
                                        <i style={{height: `${b.r}%`, opacity: 0.72}} />
                                    </div>
                                ))}
                            </div>
                            <div className="ad-customer-legend">
                                <span>■ New customers</span>
                                <span>■ Returning</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Performance */}
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title"><h2>Category split</h2><p>By product count</p></div>
                        </div>
                        <div className="ad-widget-body">
                            <div className="ad-category-list">
                                {(() => {
                                    const catCounts = products.reduce((acc, p) => {
                                        const k = p.category || 'Other';
                                        acc[k] = (acc[k] || 0) + 1;
                                        return acc;
                                    }, {});
                                    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
                                    const maxVal = sorted[0]?.[1] || 1;
                                    return sorted.map(([cat, count]) => (
                                        <div className="ad-category-row" key={cat}>
                                            <b>{titleCase(cat)}</b>
                                            <div className="ad-category-track">
                                                <i style={{width: `${(count/maxVal)*100}%`}} />
                                            </div>
                                            <span>{count}</span>
                                        </div>
                                    ));
                                })()}
                                {products.length === 0 && <p style={{fontSize:10,color:'var(--muted)'}}>No products yet</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Activity + Insight ── */}
                <div className="ad-bottom-grid">
                    {/* Live Activity */}
                    <div className="ad-surface ad-reveal">
                        <div className="ad-section-head">
                            <div className="ad-section-title">
                                <h2>Live store activity</h2>
                                <p>Recent order and product events</p>
                            </div>
                            <span style={{fontSize:8,color:'var(--green)',fontWeight:700}}>● LIVE</span>
                        </div>
                        <div className="ad-activity">
                            {orders.slice(0, 5).map((order, i) => (
                                <div className="ad-activity-item" key={order.id}>
                                    <div className="ad-activity-icon" style={order.status === 'pending' ? {color:'var(--amber)',background:'#fff8ec'} : {}}>
                                        {i % 2 === 0 ? <IcoBag /> : <IcoUsers />}
                                    </div>
                                    <div>
                                        <strong>Order #{String(order.id).slice(-8)} {order.status === 'pending' ? 'awaiting' : order.status}</strong>
                                        <span>{order.user?.name || 'Guest'} · {formatCurrency(order.grandTotal || order.subtotal)}</span>
                                    </div>
                                    <div className="ad-activity-time">{new Date(order.createdAt).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}</div>
                                </div>
                            ))}
                            {orders.length === 0 && <p style={{fontSize:11,color:'var(--muted)',padding:'10px 0'}}>No recent activity.</p>}
                        </div>
                    </div>

                    {/* Insight Panel */}
                    <div className="ad-insight-panel ad-reveal">
                        <div className="ad-insight-inner">
                            <div className="ad-eyebrow">Store overview</div>
                            <h3>Your catalog is <em>live</em> and ready to sell.</h3>
                            <p>Manage your products, confirm orders, and track inventory all from this dashboard.</p>
                            <div className="ad-insight-number">
                                <div><strong className="ad-count" data-target={metrics.totalOrders}>{metrics.totalOrders}</strong><span>Total orders</span></div>
                                <div><strong className="ad-count" data-target={metrics.totalProducts}>{metrics.totalProducts}</strong><span>Products</span></div>
                                <div><strong className="ad-count" data-target={metrics.confirmedOrders}>{metrics.confirmedOrders}</strong><span>Confirmed</span></div>
                            </div>
                            <button className="ad-text-link" type="button" onClick={() => setActiveView('orders')}>
                                Manage orders <IcoChevron />
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const renderProducts = () => {
        const rows = paginate(filteredProducts, productPage);
        return (
            <Card>
                <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>Manage catalog products, images, pricing, and size stock.</CardDescription>
                    </div>
                    <Button onClick={openCreateProduct}><Plus className="h-4 w-4" /> Add Product</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SearchBox value={productSearch} onChange={setProductSearch} placeholder="Search products by name, category, or description" />
                    <Table className="min-w-[920px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead><SortButton label="Product" field="name" sort={productSort} onSort={(field) => toggleSort(productSort, setProductSort, field)} /></TableHead>
                                <TableHead><SortButton label="Price" field="price" sort={productSort} onSort={(field) => toggleSort(productSort, setProductSort, field)} /></TableHead>
                                <TableHead><SortButton label="Stock" field="stock" sort={productSort} onSort={(field) => toggleSort(productSort, setProductSort, field)} /></TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><SortButton label="Updated" field="updatedAt" sort={productSort} onSort={(field) => toggleSort(productSort, setProductSort, field)} /></TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productLoading ? (
                                <LoadingRow colSpan={6} />
                            ) : rows.length === 0 ? (
                                <EmptyRow colSpan={6} title="No products found" />
                            ) : rows.map((product) => {
                                const state = getStockState(product);
                                return (
                                    <TableRow key={product._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <ProductThumb product={product} />
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{titleCase(product.category)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(product.price)}</TableCell>
                                        <TableCell>{getTotalStock(product.sizeStock)}</TableCell>
                                        <TableCell><Badge variant={state.variant}>{state.label}</Badge></TableCell>
                                        <TableCell>{formatDate(product.updatedAt || product.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => openEditProduct(product)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="destructive" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'product', id: product._id, label: product.name })}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Pager page={productPage} total={filteredProducts.length} onPageChange={setProductPage} />
                </CardContent>
            </Card>
        );
    };

    const renderOrders = () => {
        const rows = paginate(filteredOrders, orderPage);
        return (
            <Card>
                <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Search, filter, confirm, cancel, and update customer orders.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={fetchOrders} disabled={orderLoading}>
                        <RefreshCw className={cn('h-4 w-4', orderLoading && 'animate-spin')} /> Refresh
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_160px]">
                        <SearchBox value={orderSearch} onChange={setOrderSearch} placeholder="Search order, customer, phone, or ref" />
                        <Select value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)}>
                            <option value="">All statuses</option>
                            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                        </Select>
                        <Input type="date" value={orderStartDate} onChange={(event) => setOrderStartDate(event.target.value)} />
                        <Input type="date" value={orderEndDate} onChange={(event) => setOrderEndDate(event.target.value)} />
                    </div>
                    <OrdersTable
                        rows={rows}
                        loading={orderLoading}
                        sort={orderSort}
                        onSort={(field) => toggleSort(orderSort, setOrderSort, field)}
                        actionState={orderActionState}
                        onView={openOrderSheet}
                        onConfirm={(order) => triggerOrderAction(order.id, 'confirm')}
                    />
                    <Pager page={orderPage} total={filteredOrders.length} onPageChange={setOrderPage} />
                </CardContent>
            </Card>
        );
    };

    const renderInventory = () => {
        const rows = paginate(filteredInventory, inventoryPage);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Derived from product size stock. Low stock is {LOW_STOCK_THRESHOLD} units or fewer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>Confirming an order still deducts stock through the existing backend flow.</Alert>
                    <SearchBox value={inventorySearch} onChange={setInventorySearch} placeholder="Search inventory" />
                    <Table className="min-w-[860px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead><SortButton label="Product" field="name" sort={inventorySort} onSort={(field) => toggleSort(inventorySort, setInventorySort, field)} /></TableHead>
                                <TableHead><SortButton label="Total stock" field="stock" sort={inventorySort} onSort={(field) => toggleSort(inventorySort, setInventorySort, field)} /></TableHead>
                                <TableHead>Health</TableHead>
                                <TableHead>Size stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productLoading ? <LoadingRow colSpan={5} /> : rows.length === 0 ? <EmptyRow colSpan={5} title="No inventory records" /> : rows.map((product) => {
                                const state = getStockState(product);
                                return (
                                    <TableRow key={product._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <ProductThumb product={product} />
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{titleCase(product.category)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getTotalStock(product.sizeStock)}</TableCell>
                                        <TableCell>
                                            <div className="min-w-40 space-y-2">
                                                <Badge variant={state.variant}>{state.label}</Badge>
                                                <Progress value={state.progress} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(product.sizeStock || []).length > 0 ? product.sizeStock.map((entry) => (
                                                    <Badge key={`${product._id}-${entry.size}`} variant="outline">{entry.size}: {entry.quantity}</Badge>
                                                )) : <span className="text-sm text-muted-foreground">No variants</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => openEditProduct(product)}><Edit className="h-4 w-4" /> Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Pager page={inventoryPage} total={filteredInventory.length} onPageChange={setInventoryPage} />
                </CardContent>
            </Card>
        );
    };

    const renderSettings = () => (
        <form onSubmit={saveSettings} className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Discount</CardTitle>
                        <CardDescription>Show promotional pricing without changing the database price.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                            <div>
                                <Label>Enable Global Discount Display</Label>
                                <p className="text-sm text-muted-foreground">Customers still pay the stored database price.</p>
                            </div>
                            <Switch checked={settings.globalDiscountEnabled} onChange={(value) => setSettings((prev) => ({ ...prev, globalDiscountEnabled: value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="globalDiscountPercentage">Discount Percentage</Label>
                            <Input
                                id="globalDiscountPercentage"
                                type="number"
                                min="0"
                                max="100"
                                value={settings.globalDiscountPercentage}
                                disabled={!settings.globalDiscountEnabled}
                                onChange={(event) => setSettings((prev) => ({ ...prev, globalDiscountPercentage: Number(event.target.value) }))}
                            />
                        </div>
                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <div className="flex justify-between"><span>Customer pays</span><strong>₹1,000</strong></div>
                            {settings.globalDiscountEnabled && Number(settings.globalDiscountPercentage) > 0 && (
                                <>
                                    <div className="mt-2 flex justify-between"><span>Shown original price</span><span>₹{Math.round(1000 / (1 - Number(settings.globalDiscountPercentage) / 100))}</span></div>
                                    <div className="mt-2 flex justify-between"><span>Discount label</span><Badge variant="secondary">-{settings.globalDiscountPercentage}%</Badge></div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Promotional Banner</CardTitle>
                        <CardDescription>Configure the text shown at the top of the storefront.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="promotionalText">Promotional Text</Label>
                            <Input
                                id="promotionalText"
                                value={settings.promotionalText || ''}
                                onChange={(event) => setSettings((prev) => ({ ...prev, promotionalText: event.target.value }))}
                                placeholder="FREE DELIVERY ABOVE ₹999"
                            />
                        </div>
                        <div className="rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
                            {settings.promotionalText || 'No promotional text set'}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={settingsSaving || settingsLoading}>
                    {settingsSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save Settings
                </Button>
            </div>
        </form>
    );

    const renderCategories = () => (
        <div className="ad-view fade-in">
            <div className="ad-view-header">
                <div>
                    <h2 className="ad-title">Categories</h2>
                    <p className="ad-subtitle">Manage product categories</p>
                </div>
                <Button onClick={() => openCategorySheet()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>
            {categoryLoading ? (
                <div className="ad-loading-state"><Loader2 className="h-6 w-6 animate-spin" /> Loading categories…</div>
            ) : categories.length === 0 ? (
                <EmptyState title="No categories yet" description="Create your first category to organize products." />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category._id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{category.description || '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openCategorySheet(category)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'category', id: category._id, label: category.name })}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        if (activeView === 'dashboard') return renderDashboard();
        if (activeView === 'products') return renderProducts();
        if (activeView === 'categories') return renderCategories();
        if (activeView === 'orders') return renderOrders();
        if (activeView === 'inventory') return renderInventory();
        return renderSettings();
    };

    if (loading) {
        return (
            <div className="ad-root">
                <div className="ad-loading">
                    <div>
                        <div className="ad-spinner" />
                        <p style={{marginTop:16,fontSize:12,color:'var(--muted)',textAlign:'center'}}>Loading dashboard…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ad-root">
            <ToastViewport toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

            {/* Mobile backdrop */}
            <div
                id="backdrop"
                className={`ad-backdrop ${mobileMenuOpen ? 'show' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* ── Sidebar ── */}
            <nav className={`ad-sidebar ${mobileMenuOpen ? 'open' : ''}`} id="sidebar">
                <div className="ad-brand">
                    <div className="ad-brand-logo">TR</div>
                    <span className="ad-brand-name">Tere <em>Rang</em></span>
                </div>

                <div className="ad-nav-label">Main</div>
                <div className="ad-nav">
                    {adNavItems.map(({ id, label, Icon }) => (
                        <button
                            type="button"
                            key={id}
                            className={`ad-nav-link ${activeView === id ? 'active' : ''}`}
                            onClick={() => { setActiveView(id); setMobileMenuOpen(false); }}
                        >
                            <Icon />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="ad-nav-bottom">
                    <button type="button" className="ad-nav-link" onClick={logoutAndRedirect}>
                        <IcoLog />
                        Sign out
                    </button>
                    <div className="ad-store-mini">
                        <div className="ad-store-dot" />
                        <div>
                            <strong>{adminData.username || 'Admin'}</strong>
                            <span>Store admin</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Main ── */}
            <div className="ad-main">
                {/* Topbar */}
                <header className="ad-topbar">
                    <button
                        id="menuToggle"
                        type="button"
                        className="ad-mobile-toggle"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <IcoMenu />
                    </button>
                    <div className="ad-top-title">
                        <h1>{pageTitle}</h1>
                        <p>Tere Rang admin · {new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</p>
                    </div>
                    <div className="ad-top-actions">
                        <div className="ad-search">
                            <IcoSearch />
                            <input placeholder="Search orders, products…" aria-label="Global search" />
                        </div>
                        <button type="button" className="ad-pill-btn">
                            <IcoCalendar />
                            <span>{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                        </button>
                        <button type="button" className="ad-icon-btn" aria-label="Notifications">
                            <IcoBell />
                            {metrics.pendingOrders > 0 && <span className="ad-notif-dot" />}
                        </button>
                        <button type="button" className="ad-avatar-btn">
                            <div className="ad-avatar">{(adminData.username || 'A').charAt(0).toUpperCase()}</div>
                            <span>{adminData.username || 'Admin'}</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="ad-content">
                    {error && (
                        <div className="ad-error">
                            <span>{error}</span>
                            <button type="button" onClick={() => setError('')}>×</button>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>

            <ProductSheet
                open={productSheetOpen}
                editingProduct={editingProduct}
                productForm={productForm}
                productImages={productImages}
                submitting={productSubmitting}
                onClose={() => setProductSheetOpen(false)}
                onSubmit={submitProduct}
                onChange={updateProductForm}
                onImageChange={setProductImages}
                onSizeChange={updateSizeStock}
                onAddSize={() => setProductForm((prev) => ({ ...prev, sizeStock: [...prev.sizeStock, { size: '', quantity: 0 }] }))}
                onRemoveSize={(index) => setProductForm((prev) => ({ ...prev, sizeStock: prev.sizeStock.filter((_, rowIndex) => rowIndex !== index) }))}
                onDeleteImage={deleteProductImage}
                onMoveImage={moveProductImage}
                onAddMoreImages={addMoreImages}
            />

            <CategorySheet
                open={categorySheetOpen}
                editingCategory={editingCategory}
                categoryForm={categoryForm}
                submitting={categorySubmitting}
                onClose={closeCategorySheet}
                onSubmit={handleSaveCategory}
                onChange={(field, value) => setCategoryForm((prev) => ({ ...prev, [field]: value }))}
            />

            <OrderSheet
                open={orderSheetOpen}
                order={selectedOrder}
                orderForm={orderForm}
                submitting={orderSubmitting}
                actionState={orderActionState}
                onClose={() => setOrderSheetOpen(false)}
                onSubmit={submitOrderUpdate}
                onChange={(field, value) => setOrderForm((prev) => ({ ...prev, [field]: value }))}
                onConfirm={(orderId) => triggerOrderAction(orderId, 'confirm')}
                onCancel={(orderId) => setCancelDialog({ open: true, orderId, reason: 'Due to unforeseen circumstances, we had to cancel this order.' })}
                onDelete={(order) => setDeleteDialog({ open: true, type: 'order', id: order.id, label: String(order.id).slice(-10) })}
            />

            <Dialog
                open={cancelDialog.open}
                onClose={() => setCancelDialog({ open: false, orderId: null, reason: 'Due to unforeseen circumstances, we had to cancel this order.' })}
                title="Cancel order"
                description="Add an optional customer-facing message."
                footer={(
                    <>
                        <Button variant="outline" onClick={() => setCancelDialog({ open: false, orderId: null, reason: '' })}>Close</Button>
                        <Button variant="destructive" onClick={() => triggerOrderAction(cancelDialog.orderId, 'cancel', cancelDialog.reason)}>Cancel order</Button>
                    </>
                )}
            >
                <Textarea rows={4} value={cancelDialog.reason} onChange={(event) => setCancelDialog((prev) => ({ ...prev, reason: event.target.value }))} />
            </Dialog>

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, type: null, id: null, label: '' })}
                title={`Delete ${deleteDialog.type || 'item'}?`}
                description={`This permanently removes ${deleteDialog.label || 'this item'}.`}
                footer={(
                    <>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, type: null, id: null, label: '' })}>Close</Button>
                        <Button variant="destructive" onClick={() => {
                            if (deleteDialog.type === 'product') deleteProduct(deleteDialog.id);
                            else if (deleteDialog.type === 'category') handleDeleteCategory(deleteDialog.id);
                            else deleteOrder(deleteDialog.id);
                        }}>Delete</Button>
                    </>
                )}
            >
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            </Dialog>
        </div>
    );
}

function MetricCard({ title, value, icon }) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    {React.createElement(icon, { className: 'h-5 w-5' })}
                </div>
            </CardContent>
        </Card>
    );
}

function PipelineRow({ label, value, variant }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Badge variant={variant}>{value}</Badge>
        </div>
    );
}


function SearchBox({ value, onChange, placeholder }) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        </div>
    );
}

function LoadingRow({ colSpan }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="h-28 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
            </TableCell>
        </TableRow>
    );
}

function EmptyRow({ colSpan, title }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan}>
                <EmptyState title={title} />
            </TableCell>
        </TableRow>
    );
}

function OrdersTable({ rows, loading, compact = false, sort, onSort, actionState, onView, onConfirm }) {
    if (!loading && rows.length === 0) {
        return <EmptyState title="No orders found" description="Orders will appear here as soon as customers check out." />;
    }

    return (
        <Table className={cn(!compact && 'min-w-[1040px]')}>
            <TableHeader>
                <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>{sort ? <SortButton label="Customer" field="customer" sort={sort} onSort={onSort} /> : 'Customer'}</TableHead>
                    <TableHead>{sort ? <SortButton label="Amount" field="amount" sort={sort} onSort={onSort} /> : 'Amount'}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>{sort ? <SortButton label="Placed" field="createdAt" sort={sort} onSort={onSort} /> : 'Placed'}</TableHead>
                    {!compact && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? <LoadingRow colSpan={compact ? 6 : 7} /> : rows.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell><span className="rounded bg-muted px-2 py-1 font-mono text-xs">{String(order.id).slice(-10)}</span></TableCell>
                        <TableCell>
                            <p className="font-medium">{order.user?.name || 'Guest'}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.phoneNumber || order.user?.email || 'N/A'}</p>
                        </TableCell>
                        <TableCell>{formatCurrency(order.grandTotal || order.subtotal)}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell><StatusBadge status={order.paymentStatus} /></TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        {!compact && (
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="icon" onClick={() => onView(order)}><Eye className="h-4 w-4" /></Button>
                                    <Button
                                        size="sm"
                                        disabled={['confirmed', 'completed', 'cancelled'].includes(order.status) || actionState?.id === order.id}
                                        onClick={() => onConfirm(order)}
                                    >
                                        {actionState?.id === order.id && actionState?.type === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        Confirm
                                    </Button>
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function ProductSheet({
    open,
    editingProduct,
    productForm,
    productImages,
    submitting,
    onClose,
    onSubmit,
    onChange,
    onImageChange,
    onSizeChange,
    onAddSize,
    onRemoveSize,
    onDeleteImage,
    onMoveImage,
    onAddMoreImages
}) {
    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={editingProduct ? 'Edit Product' : 'Add Product'}
            description="Manage product details, stock, images, and pricing."
            footer={<Button className="w-full" type="submit" form="product-form" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{editingProduct ? 'Update Product' : 'Create Product'}</Button>}
        >
            <form id="product-form" onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Product Name">
                        <Input required value={productForm.name} onChange={(event) => onChange('name', event.target.value)} />
                    </Field>
                    <Field label="Price">
                        <Input required type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => onChange('price', event.target.value)} />
                    </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category">
                        <Select value={productForm.category} onChange={(event) => onChange('category', event.target.value)}>
                            {PRODUCT_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                        </Select>
                    </Field>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>Available</Label>
                            <p className="text-xs text-muted-foreground">Stock is also derived from sizes.</p>
                        </div>
                        <Switch checked={productForm.inStock} onChange={(value) => onChange('inStock', value)} />
                    </div>
                </div>
                <Field label="Description">
                    <Textarea rows={4} value={productForm.description} onChange={(event) => onChange('description', event.target.value)} />
                </Field>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Size-wise stock</Label>
                        <Button variant="outline" size="sm" onClick={onAddSize}><Plus className="h-4 w-4" /> Add size</Button>
                    </div>
                    {productForm.sizeStock.map((row, index) => (
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={index}>
                            <Input placeholder="Size" value={row.size} onChange={(event) => onSizeChange(index, 'size', event.target.value)} />
                            <Input type="number" min="0" placeholder="Qty" value={row.quantity} onChange={(event) => onSizeChange(index, 'quantity', event.target.value)} />
                            <Button variant="destructive" size="icon" disabled={productForm.sizeStock.length <= 1} onClick={() => onRemoveSize(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>

                {/* Existing Images Management (Only for Editing) */}
                {editingProduct && Array.isArray(editingProduct.imageUrls) && editingProduct.imageUrls.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Current images ({editingProduct.imageUrls.length})</Label>
                            <span className="text-xs text-muted-foreground">Hover to reorder or delete</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {editingProduct.imageUrls.map((url, index) => (
                                <div key={url} className="group relative rounded-lg border bg-muted/30 p-1">
                                    <ProductImage
                                        src={url}
                                        alt={`${editingProduct.name} ${index + 1}`}
                                        className="h-20 w-16 rounded object-cover"
                                    />
                                    {/* Action Buttons Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center gap-1 rounded bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                        {/* Move Left */}
                                        <button
                                            type="button"
                                            disabled={index === 0 || submitting}
                                            onClick={() => onMoveImage(index, 'left')}
                                            className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                                            title="Move image left"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        {/* Delete */}
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={() => onDeleteImage(index)}
                                            className="rounded p-1 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                            title="Delete image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        {/* Move Right */}
                                        <button
                                            type="button"
                                            disabled={index === editingProduct.imageUrls.length - 1 || submitting}
                                            onClick={() => onMoveImage(index, 'right')}
                                            className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                                            title="Move image right"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {/* Primary Badge */}
                                    {index === 0 && (
                                        <span className="absolute -top-2 -left-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
                                            Cover
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload New / Add More Images */}
                <div className="space-y-2">
                    <Label>{editingProduct ? 'Add More Images' : 'Product Images'}</Label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/60">
                        <UploadCloud className="mb-2 h-7 w-7 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {editingProduct ? 'Click to add more images' : 'Click to choose images'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {editingProduct
                                ? 'Images selected here will be uploaded immediately and appended to current images.'
                                : 'Select one or more images for the product.'}
                        </span>
                        <input
                            className="sr-only"
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={submitting}
                            onChange={(event) => {
                                const files = Array.from(event.target.files || []);
                                if (editingProduct) {
                                    onAddMoreImages(files);
                                    event.target.value = ''; // Reset file input
                                } else {
                                    onImageChange(files);
                                }
                            }}
                        />
                    </label>
                    {!editingProduct && productImages.length > 0 && (
                        <p className="text-sm text-muted-foreground">{productImages.length} file(s) selected</p>
                    )}
                </div>
            </form>
        </Sheet>
    );
}

function Field({ label, children }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

function OrderSheet({ open, order, orderForm, submitting, actionState, onClose, onSubmit, onChange, onConfirm, onCancel, onDelete }) {
    if (!order) return null;
    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={`Order ${String(order.id).slice(-10)}`}
            description="View details and update the existing order fields."
            className="max-w-2xl"
        >
            <div className="space-y-5">
                <Card>
                    <CardContent className="space-y-3 p-4 text-sm">
                        <InfoRow label="Customer" value={order.user?.name || 'Guest'} />
                        <InfoRow label="Contact" value={order.user?.phoneNumber || order.user?.email || 'N/A'} />
                        <InfoRow label="Placed" value={formatDate(order.createdAt)} />
                        <InfoRow label="Amount" value={formatCurrency(order.grandTotal || order.subtotal)} />
                        <div className="flex justify-between gap-3"><span className="text-muted-foreground">Status</span><span className="flex gap-2"><StatusBadge status={order.status} /><StatusBadge status={order.paymentStatus} /></span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(order.items || []).map((item, index) => (
                            <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0" key={`${order.id}-${index}`}>
                                <div className="flex items-center gap-3">
                                    {item.image ? <ProductThumb src={resolveImagePath(item.image)} alt={item.name} /> : <div className="admin-image-placeholder">No image</div>}
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty {item.quantity}{item.size ? ` • Size ${item.size}` : ''}</p>
                                    </div>
                                </div>
                                <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                {order.shippingAddress && (
                    <Card>
                        <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {[order.shippingAddress.contactName, order.shippingAddress.phoneNumber, order.shippingAddress.line1, order.shippingAddress.line2, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode].filter(Boolean).join(', ')}
                        </CardContent>
                    </Card>
                )}
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Status">
                            <Select value={orderForm.status || ''} onChange={(event) => onChange('status', event.target.value)}>
                                {ORDER_STATUSES.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                            </Select>
                        </Field>
                        <Field label="Payment Status">
                            <Select value={orderForm.paymentStatus || ''} onChange={(event) => onChange('paymentStatus', event.target.value)}>
                                {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                            </Select>
                        </Field>
                        <Field label="Payment Method">
                            <Select value={orderForm.paymentMethod || ''} onChange={(event) => onChange('paymentMethod', event.target.value)}>
                                {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{titleCase(method)}</option>)}
                            </Select>
                        </Field>
                        <Field label="Payment Reference">
                            <Input value={orderForm.paymentReference || ''} onChange={(event) => onChange('paymentReference', event.target.value)} />
                        </Field>
                    </div>
                    <Field label="Notes">
                        <Textarea rows={3} value={orderForm.notes || ''} onChange={(event) => onChange('notes', event.target.value)} />
                    </Field>
                    <div className="flex flex-wrap justify-between gap-2">
                        <Button variant="destructive" onClick={() => onDelete(order)}><Trash2 className="h-4 w-4" /> Delete</Button>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" disabled={['confirmed', 'completed', 'cancelled'].includes(order.status) || actionState.id === order.id} onClick={() => onConfirm(order.id)}>
                                {actionState.id === order.id && actionState.type === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Confirm
                            </Button>
                            <Button variant="outline" disabled={order.status === 'cancelled'} onClick={() => onCancel(order.id)}>Cancel order</Button>
                            <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes</Button>
                        </div>
                    </div>
                </form>
            </div>
        </Sheet>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function CategorySheet({ open, editingCategory, categoryForm, submitting, onClose, onSubmit, onChange }) {
    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={editingCategory ? 'Edit Category' : 'Add Category'}
            description="Manage category name and description."
            footer={
                <Button className="w-full" type="submit" form="category-form" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
            }
        >
            <form id="category-form" onSubmit={onSubmit} className="space-y-5">
                <Field label="Category Name">
                    <Input
                        required
                        value={categoryForm.name}
                        onChange={(event) => onChange('name', event.target.value)}
                        placeholder="e.g. Sarees"
                    />
                </Field>
                <Field label="Description">
                    <Textarea
                        rows={4}
                        value={categoryForm.description}
                        onChange={(event) => onChange('description', event.target.value)}
                        placeholder="Brief description of this category (optional)"
                    />
                </Field>
            </form>
        </Sheet>
    );
}
