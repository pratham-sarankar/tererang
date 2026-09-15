import React, { useEffect, useMemo, useState } from 'react';
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

    useEffect(() => {
        checkAuth();
        const initialize = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchOrders(), fetchSettings()]);
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

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'inventory', label: 'Inventory', icon: Inbox },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    const pageTitle = navItems.find((item) => item.id === activeView)?.label || 'Dashboard';

    const sidebar = (
        <div className="flex h-full flex-col border-r bg-background">
            <div className={cn('flex h-16 items-center gap-3 border-b px-4', collapsed && 'justify-center px-2')}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">TR</div>
                {!collapsed && <span className="text-lg font-semibold">TereRang</span>}
            </div>
            <nav className="flex-1 space-y-1 p-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id);
                                setMobileMenuOpen(false);
                            }}
                            className={cn(
                                'flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                                activeView === item.id && 'bg-accent text-accent-foreground',
                                collapsed && 'justify-center px-0'
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>
            <div className="border-t p-3">
                <Button variant="ghost" className={cn('w-full justify-start', collapsed && 'justify-center px-0')} onClick={logoutAndRedirect}>
                    <LogOut className="h-4 w-4" />
                    {!collapsed && 'Logout'}
                </Button>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Total Revenue" value={formatCurrency(metrics.revenue)} icon={ShoppingCart} />
                <MetricCard title="Total Orders" value={metrics.totalOrders} icon={ShoppingCart} />
                <MetricCard title="Total Products" value={metrics.totalProducts} icon={Package} />
                <MetricCard title="Low / Out Stock" value={`${metrics.lowStock}/${metrics.outOfStock}`} icon={Inbox} />
            </div>
            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Pipeline</CardTitle>
                        <CardDescription>Current state across real orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <PipelineRow label="Pending" value={metrics.pendingOrders} variant="warning" />
                        <PipelineRow label="Confirmed" value={metrics.confirmedOrders} variant="info" />
                        <PipelineRow label="Cancelled" value={metrics.cancelledOrders} variant="destructive" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>Latest orders from the existing API.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveView('orders')}>View all</Button>
                    </CardHeader>
                    <CardContent>
                        <OrdersTable rows={orders.slice(0, 5)} compact onView={openOrderSheet} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );

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

    const renderContent = () => {
        if (activeView === 'dashboard') return renderDashboard();
        if (activeView === 'products') return renderProducts();
        if (activeView === 'orders') return renderOrders();
        if (activeView === 'inventory') return renderInventory();
        return renderSettings();
    };

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <ToastViewport toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
            <Sheet open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} title="TereRang Admin" side="left" className="max-w-[280px]">
                <div className="-m-5 h-[calc(100vh-4rem)]">{sidebar}</div>
            </Sheet>
            <div className="flex min-h-screen">
                <aside className={cn('hidden shrink-0 transition-all duration-200 lg:block', collapsed ? 'w-[74px]' : 'w-64')}>
                    {sidebar}
                </aside>
                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                                <Menu className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed((prev) => !prev)}>
                                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                            </Button>
                            <div className="min-w-0">
                                <h1 className="truncate text-lg font-semibold">{pageTitle}</h1>
                                <p className="hidden text-sm text-muted-foreground sm:block">Admin / {pageTitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" aria-label="Notifications" className="relative">
                                <Bell className="h-4 w-4" />
                                {metrics.pendingOrders > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
                            </Button>
                            <div className="hidden items-center gap-2 rounded-md border bg-background px-3 py-2 sm:flex">
                                <div className="grid h-7 w-7 place-items-center rounded-full bg-muted"><User className="h-4 w-4" /></div>
                                <span className="text-sm font-medium">{adminData.username || 'Admin'}</span>
                            </div>
                        </div>
                    </header>
                    <main className="p-4 lg:p-6">
                        {error && (
                            <Alert variant="destructive" className="mb-4 flex items-center justify-between gap-3">
                                <span>{error}</span>
                                <button type="button" onClick={() => setError('')}><X className="h-4 w-4" /></button>
                            </Alert>
                        )}
                        {renderContent()}
                    </main>
                </div>
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
                        <Button variant="destructive" onClick={() => deleteDialog.type === 'product' ? deleteProduct(deleteDialog.id) : deleteOrder(deleteDialog.id)}>Delete</Button>
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
