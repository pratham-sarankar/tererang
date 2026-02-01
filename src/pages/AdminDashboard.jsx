import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminDashboard.css';
import { apiUrl, imageUrl } from '../config/env.js';
import Sidebar from '../components/Sidebar.jsx';
import ProductsTable from '../components/ProductsTable.jsx';
import { Plus } from 'lucide-react';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid'];
const DEFAULT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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

const resolveImagePath = (path) => {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return imageUrl(path);
};

const defaultOrderForm = {
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    paymentReference: '',
    notes: '',
};

const buildDefaultSizeStock = () => DEFAULT_SIZE_OPTIONS.map((size) => ({ size, quantity: 0 }));

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productLoading, setProductLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: 'kurti',
        inStock: true,
        images: [],
        sizeStock: buildDefaultSizeStock(),
    });
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [orderForm, setOrderForm] = useState(defaultOrderForm);
    const [orderSubmittingId, setOrderSubmittingId] = useState(null);
    const [orderActionState, setOrderActionState] = useState({ id: null, type: null });
    const [settings, setSettings] = useState({
        globalDiscountPercentage: 0,
        globalDiscountEnabled: false,
        promotionalText: 'FREE DELIVERY ABOVE ₹999',
    });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();

    const logoutAndRedirect = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            logoutAndRedirect();
        }
        return token;
    };

    const fetchProducts = async () => {
        setProductLoading(true);
        try {
            const response = await fetch(apiUrl('/api/products'));
            const data = await response.json();

            if (response.ok) {
                setProducts(data.products);
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok) {
                setOrders(data.orders || []);
            } else {
                setError(data.message || 'Failed to fetch orders');
                if (response.status === 401) {
                    logoutAndRedirect();
                }
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

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else if (type === 'file') {
            setFormData((prev) => ({
                ...prev,
                [name]: Array.from(files),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const updateSizeStockValue = (index, field, value) => {
        setFormData((prev) => {
            const nextSizeStock = prev.sizeStock.map((row, rowIndex) => {
                if (rowIndex !== index) return row;
                if (field === 'quantity') {
                    const numericValue = Number(value);
                    const safeValue = Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : 0;
                    return { ...row, quantity: safeValue };
                }
                return { ...row, [field]: String(value || '').toUpperCase() };
            });
            return {
                ...prev,
                sizeStock: nextSizeStock,
            };
        });
    };

    const addSizeStockRow = () => {
        setFormData((prev) => ({
            ...prev,
            sizeStock: [...prev.sizeStock, { size: '', quantity: 0 }],
        }));
    };

    const removeSizeStockRow = (index) => {
        setFormData((prev) => {
            if (prev.sizeStock.length <= 1) return prev;
            return {
                ...prev,
                sizeStock: prev.sizeStock.filter((_, rowIndex) => rowIndex !== index),
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = checkAuth();
        if (!token) return;

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('price', formData.price);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('inStock', formData.inStock);
        const serializedSizeStock = (formData.sizeStock || [])
            .map((entry) => ({
                size: String(entry.size || '').trim().toUpperCase(),
                quantity: Number.isFinite(Number(entry.quantity)) ? Math.max(0, Math.floor(Number(entry.quantity))) : 0,
            }))
            .filter((entry) => entry.size.length > 0);
        submitData.append('sizeStock', JSON.stringify(serializedSizeStock));

        if (formData.images && formData.images.length > 0) {
            formData.images.forEach((file) => submitData.append('images', file));
        }

        try {
            const url = editingProduct
                ? apiUrl(`/api/products/${editingProduct._id}`)
                : apiUrl('/api/products');

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: submitData,
            });

            const data = await response.json();

            if (response.ok) {
                await fetchProducts();
                resetProductForm();
                setError('');
            } else {
                setError(data.message || 'Operation failed');
            }
        } catch (submitError) {
            console.error('Submit error:', submitError);
            setError('Network error. Please try again.');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            category: product.category,
            inStock: product.inStock,
            images: [],
            sizeStock: Array.isArray(product.sizeStock) && product.sizeStock.length > 0
                ? product.sizeStock.map((entry) => ({
                    size: entry.size,
                    quantity: entry.quantity ?? 0,
                }))
                : buildDefaultSizeStock(),
        });
        setShowAddForm(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        const token = checkAuth();
        if (!token) return;

        try {
            const response = await fetch(apiUrl(`/api/products/${productId}`), {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchProducts();
                setError('');
            } else {
                const data = await response.json();
                setError(data.message || 'Delete failed');
            }
        } catch (deleteError) {
            console.error('Delete error:', deleteError);
            setError('Network error. Please try again.');
        }
    };

    const resetProductForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            category: 'kurti',
            inStock: true,
            images: [],
            sizeStock: buildDefaultSizeStock(),
        });
        setEditingProduct(null);
        setShowAddForm(false);
    };

    const handleOrderEdit = (order) => {
        setEditingOrderId(order.id);
        setOrderForm({
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            paymentReference: order.paymentReference || '',
            notes: order.notes || '',
        });
    };

    const cancelOrderEdit = () => {
        setEditingOrderId(null);
        setOrderSubmittingId(null);
        setOrderForm(defaultOrderForm);
    };

    const handleOrderFormChange = (e) => {
        const { name, value } = e.target;
        setOrderForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const submitOrderUpdate = async (orderId) => {
        const token = checkAuth();
        if (!token) return;

        setOrderSubmittingId(orderId);
        try {
            const response = await fetch(apiUrl(`/api/admin/orders/${orderId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderForm),
            });

            const data = await response.json();

            if (response.ok) {
                setOrders((prev) => prev.map((order) => (order.id === orderId ? data.order : order)));
                cancelOrderEdit();
                setError('');
            } else {
                setError(data.message || 'Failed to update order');
                if (response.status === 401) {
                    logoutAndRedirect();
                }
            }
        } catch (updateError) {
            console.error('Update order error:', updateError);
            setError('Network error. Please try again.');
        } finally {
            setOrderSubmittingId(null);
        }
    };

    const handleOrderDelete = async (orderId) => {
        if (!window.confirm('Delete this order permanently?')) {
            return;
        }

        const token = checkAuth();
        if (!token) return;

        try {
            const response = await fetch(apiUrl(`/api/admin/orders/${orderId}`), {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setOrders((prev) => prev.filter((order) => order.id !== orderId));
                setError('');
                if (editingOrderId === orderId) {
                    cancelOrderEdit();
                }
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete order');
            }
        } catch (deleteError) {
            console.error('Delete order error:', deleteError);
            setError('Network error. Please try again.');
        }
    };

    const isOrderActionInFlight = (orderId, action) =>
        orderActionState.id === orderId && orderActionState.type === action;

    const triggerOrderAction = async (orderId, action) => {
        const token = checkAuth();
        if (!token) return;

        const requestInit = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        let payload = null;
        if (action === 'cancel') {
            const reason = window.prompt('Add a short message for the customer (optional):', 'Due to unforeseen circumstances, we had to cancel this order.');
            if (reason) {
                payload = { reason };
            }
        }

        if (payload) {
            requestInit.headers['Content-Type'] = 'application/json';
            requestInit.body = JSON.stringify(payload);
        }

        setOrderActionState({ id: orderId, type: action });
        try {
            const response = await fetch(apiUrl(`/api/admin/orders/${orderId}/${action}`), requestInit);
            const data = await response.json();
            if (response.ok) {
                setOrders((prev) => prev.map((order) => (order.id === orderId ? data.order : order)));
                setError('');
            } else {
                setError(data.message || `Failed to ${action} order`);
                if (response.status === 401) {
                    logoutAndRedirect();
                }
            }
        } catch (actionError) {
            console.error(`${action} order error:`, actionError);
            setError('Network error. Please try again.');
        } finally {
            setOrderActionState({ id: null, type: null });
        }
    };

    const handleLogout = () => {
        logoutAndRedirect();
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));
    };

    const saveSettings = async () => {
        const token = checkAuth();
        if (!token) return;

        setSettingsSaving(true);
        setError('');
        try {
            const response = await fetch(apiUrl('/api/settings'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (response.ok) {
                setSettings(data.settings);
                alert('Settings saved successfully!');
            } else {
                setError(data.message || 'Failed to save settings');
                if (response.status === 401) {
                    logoutAndRedirect();
                }
            }
        } catch (saveError) {
            console.error('Save settings error:', saveError);
            setError('Network error. Please try again.');
        } finally {
            setSettingsSaving(false);
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
        if (activeTab === 'orders') {
            setShowAddForm(false);
        }
    }, [activeTab]);

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    const renderProductSection = () => (
        <>
            {showAddForm && (
                <div className="product-form">
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Product Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="price">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="kurti">Kurti</option>
                                    <option value="suit">Suit</option>
                                    <option value="skirt">Skirt</option>
                                    <option value="coat">Coat</option>
                                    <option value="ethnicWear">Ethnic Wear</option>
                                    <option value="wedding">Wedding Collection</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="inStock"
                                        checked={formData.inStock}
                                        onChange={handleInputChange}
                                    />
                                    In Stock
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Size-wise stock</label>
                            <div className="size-stock-grid">
                                {formData.sizeStock.map((row, index) => (
                                    <div className="size-stock-row" key={`size-row-${index}`}>
                                        <input
                                            type="text"
                                            placeholder="Size (e.g. M)"
                                            value={row.size}
                                            onChange={(e) => updateSizeStockValue(index, 'size', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            value={row.quantity}
                                            onChange={(e) => updateSizeStockValue(index, 'quantity', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            aria-label="Remove size"
                                            onClick={() => removeSizeStockRow(index)}
                                            disabled={formData.sizeStock.length <= 1}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="size-stock-actions">
                                <button type="button" className="add-size-btn" onClick={addSizeStockRow}>
                                    + Add custom size
                                </button>
                            </div>
                            <p className="size-stock-hint">
                                We will automatically deduct one unit for the selected size whenever an order is confirmed.
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="images">Product Images</label>
                            <input
                                type="file"
                                id="images"
                                name="images"
                                onChange={handleInputChange}
                                accept="image/*"
                                multiple
                                required={!editingProduct}
                            />
                            {editingProduct && Array.isArray(editingProduct.imageUrls) && editingProduct.imageUrls.length > 0 && (
                                <div className="current-images">
                                    {editingProduct.imageUrls.map((imgUrl) => (
                                        <img
                                            key={imgUrl}
                                            src={imgUrl}
                                            alt="preview"
                                            className="current-image"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={resetProductForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {productLoading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <div className="products-section">
                    <div className="section-header">
                        <h2>Products ({products.length})</h2>
                    </div>
                    {products.length === 0 ? (
                        <div className="no-products">
                            <p>No products found. Add some products to get started!</p>
                        </div>
                    ) : (
                        <ProductsTable
                            products={products}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            imageUrl={resolveImagePath}
                        />
                    )}
                </div>
            )}
        </>
    );

    const renderOrderSection = () => (
        <div className="orders-section">
            <div className="orders-header">
                <h2>Orders ({orders.length})</h2>
                <div className="orders-header-actions">
                    <button className="refresh-btn" onClick={fetchOrders} disabled={orderLoading}>
                        {orderLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>

            {orderLoading ? (
                <div className="loading">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="no-orders">
                    <p>No orders yet. They will appear here as soon as customers check out.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div className="order-card" key={order.id}>
                            <div className="order-meta">
                                <div>
                                    <span className="order-label">Order ID</span>
                                    <p className="order-value">{order.id}</p>
                                </div>
                                <div>
                                    <span className="order-label">Customer</span>
                                    <p className="order-value">{order.user?.name || 'Guest'}</p>
                                    <span className="order-subtext">{order.user?.phoneNumber || order.user?.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="order-label">Subtotal</span>
                                    <p className="order-value">{formatCurrency(order.subtotal)}</p>
                                </div>
                                <div>
                                    <span className="order-label">Status</span>
                                    <p className={`status-chip status-${order.status}`}>{order.status}</p>
                                </div>
                                <div>
                                    <span className="order-label">Payment</span>
                                    <p className={`status-chip payment-${order.paymentStatus}`}>{order.paymentStatus}</p>
                                    {order.paymentReference && (
                                        <span className="order-subtext">Ref: {order.paymentReference}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="order-label">Placed</span>
                                    <p className="order-value">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>

                            <div className="order-items">
                                {(order.items || []).map((item, index) => (
                                    <div className="order-item" key={`${order.id}-${index}`}>
                                        <div className="order-item-image">
                                            {item.image ? (
                                                <img src={resolveImagePath(item.image)} alt={item.name} />
                                            ) : (
                                                <span className="order-placeholder">No image</span>
                                            )}
                                        </div>
                                        <div className="order-item-info">
                                            <h4>{item.name}</h4>
                                            <div className="order-subtext">
                                                Qty: {item.quantity}
                                                {item.size && ` • Size: ${item.size}`}
                                            </div>
                                        </div>
                                        <div className="order-item-price">
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-actions">
                                {editingOrderId === order.id ? (
                                    <form
                                        className="order-edit-form"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitOrderUpdate(order.id);
                                        }}
                                    >
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor={`status-${order.id}`}>Status</label>
                                                <select
                                                    id={`status-${order.id}`}
                                                    name="status"
                                                    value={orderForm.status}
                                                    onChange={handleOrderFormChange}
                                                >
                                                    {ORDER_STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor={`paymentStatus-${order.id}`}>Payment Status</label>
                                                <select
                                                    id={`paymentStatus-${order.id}`}
                                                    name="paymentStatus"
                                                    value={orderForm.paymentStatus}
                                                    onChange={handleOrderFormChange}
                                                >
                                                    {PAYMENT_STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor={`paymentMethod-${order.id}`}>Payment Method</label>
                                                <input
                                                    type="text"
                                                    id={`paymentMethod-${order.id}`}
                                                    name="paymentMethod"
                                                    value={orderForm.paymentMethod}
                                                    onChange={handleOrderFormChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor={`paymentReference-${order.id}`}>Payment Reference</label>
                                                <input
                                                    type="text"
                                                    id={`paymentReference-${order.id}`}
                                                    name="paymentReference"
                                                    value={orderForm.paymentReference}
                                                    onChange={handleOrderFormChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={`notes-${order.id}`}>Notes</label>
                                            <textarea
                                                id={`notes-${order.id}`}
                                                name="notes"
                                                rows="3"
                                                value={orderForm.notes}
                                                onChange={handleOrderFormChange}
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="submit-btn"
                                                disabled={orderSubmittingId === order.id}
                                            >
                                                {orderSubmittingId === order.id ? 'Saving…' : 'Save Changes'}
                                            </button>
                                            <button type="button" className="cancel-btn" onClick={cancelOrderEdit}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="order-buttons">
                                        <button
                                            className="order-action-btn confirm"
                                            disabled={['confirmed', 'completed', 'cancelled'].includes(order.status) || isOrderActionInFlight(order.id, 'confirm')}
                                            onClick={() => triggerOrderAction(order.id, 'confirm')}
                                        >
                                            {isOrderActionInFlight(order.id, 'confirm') ? 'Confirming…' : 'Confirm order'}
                                        </button>
                                        <button
                                            className="order-action-btn cancel"
                                            disabled={order.status === 'cancelled' || isOrderActionInFlight(order.id, 'cancel')}
                                            onClick={() => triggerOrderAction(order.id, 'cancel')}
                                        >
                                            {isOrderActionInFlight(order.id, 'cancel') ? 'Cancelling…' : 'Cancel order'}
                                        </button>
                                        <button className="edit-btn" onClick={() => handleOrderEdit(order)}>
                                            Edit
                                        </button>
                                        <button className="delete-btn" onClick={() => handleOrderDelete(order.id)}>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSettingsSection = () => (
        <div className="settings-section">
            <h2>Global Settings</h2>
            {settingsLoading ? (
                <div className="loading">Loading settings...</div>
            ) : (
                <div className="settings-container">
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <h3>Global Discount</h3>
                            <p className="settings-card-subtitle">
                                Show a marked-up "original price" to create discount perception. Customers pay the database price.
                            </p>
                        </div>
                        <div className="settings-card-body">
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="globalDiscountEnabled"
                                        checked={settings.globalDiscountEnabled}
                                        onChange={handleSettingsChange}
                                    />
                                    <span>Enable Global Discount Display</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label htmlFor="globalDiscountPercentage">
                                    Discount Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    id="globalDiscountPercentage"
                                    name="globalDiscountPercentage"
                                    value={settings.globalDiscountPercentage}
                                    onChange={handleSettingsChange}
                                    min="0"
                                    max="100"
                                    step="1"
                                    disabled={!settings.globalDiscountEnabled}
                                    className="discount-input"
                                />
                                <p className="help-text">
                                    {settings.globalDiscountEnabled
                                        ? `Products will show a higher "original price" with ${settings.globalDiscountPercentage}% off, but customers pay the database price`
                                        : 'Enable to show promotional pricing on all products'}
                                </p>
                            </div>
                            <div className="settings-preview">
                                <h4>Preview</h4>
                                <p className="help-text" style={{ marginBottom: '15px' }}>
                                    Example: Product stored in database at ₹1,000
                                </p>
                                <div className="preview-item">
                                    <span className="preview-label">Database Price (What customer pays):</span>
                                    <span className="preview-value">₹1,000</span>
                                </div>
                                {settings.globalDiscountEnabled && settings.globalDiscountPercentage > 0 && (
                                    <>
                                        <div className="preview-item">
                                            <span className="preview-label">Shown as "Original Price":</span>
                                            <span className="preview-value">
                                                ₹{Math.round(1000 / (1 - settings.globalDiscountPercentage / 100))}
                                            </span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Discount Display:</span>
                                            <span className="preview-value discount">
                                                -{settings.globalDiscountPercentage}%
                                            </span>
                                        </div>
                                        <div className="preview-item final">
                                            <span className="preview-label">Customer Pays (Same as DB):</span>
                                            <span className="preview-value">
                                                ₹1,000
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="settings-actions">
                                <button
                                    type="button"
                                    className="save-settings-btn"
                                    onClick={saveSettings}
                                    disabled={settingsSaving}
                                >
                                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <h3>Promotional Banner</h3>
                            <p className="settings-card-subtitle">
                                Configure the promotional text displayed in the navbar banner at the top of the website.
                            </p>
                        </div>
                        <div className="settings-card-body">
                            <div className="form-group">
                                <label htmlFor="promotionalText">
                                    Promotional Text
                                </label>
                                <input
                                    type="text"
                                    id="promotionalText"
                                    name="promotionalText"
                                    value={settings.promotionalText}
                                    onChange={handleSettingsChange}
                                    placeholder="e.g., FREE DELIVERY ABOVE ₹999"
                                    className="discount-input"
                                />
                                <p className="help-text">
                                    This text will be displayed at the top of every page. Leave blank to hide the banner.
                                </p>
                            </div>
                            <div className="settings-preview">
                                <h4>Preview</h4>
                                <div className="promo-banner-preview" style={{ 
                                    backgroundColor: '#b81582', 
                                    color: 'white',
                                    textAlign: 'center',
                                    padding: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderRadius: '4px',
                                    marginTop: '10px'
                                }}>
                                    {settings.promotionalText || 'No promotional text set'}
                                </div>
                            </div>
                            <div className="settings-actions">
                                <button
                                    type="button"
                                    className="save-settings-btn"
                                    onClick={saveSettings}
                                    disabled={settingsSaving}
                                >
                                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const getPageTitle = () => {
        const titles = {
            products: 'Products',
            orders: 'Orders',
            settings: 'Settings'
        };
        return titles[activeTab] || 'Dashboard';
    };

    return (
        <div className="admin-layout">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            <div className="admin-main-content">
                <div className="admin-dashboard">
                    <div className="dashboard-header">
                        <div>
                            <h1>{getPageTitle()}</h1>
                        </div>
                        <div className="header-actions">
                            {activeTab === 'products' && (
                                <button
                                    className="add-btn"
                                    onClick={() => setShowAddForm((prev) => !prev)}
                                >
                                    <Plus size={18} />
                                    {showAddForm ? 'Cancel' : 'Add Product'}
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {activeTab === 'products' && renderProductSection()}
                    {activeTab === 'orders' && renderOrderSection()}
                    {activeTab === 'settings' && renderSettingsSection()}
                </div>
            </div>
        </div>
    );
}