import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, PackageCheck, MapPin, ShoppingBag, Wallet } from 'lucide-react';
import { apiUrl, imageUrl } from '../config/env.js';

const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const statusClasses = {
    processing: 'bg-blue-100 text-blue-700 border-blue-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
};

const formatCurrency = (value) => formatter.format(Math.max(0, value || 0));

const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const resolveImage = (item) => {
    if (!item) return null;
    // Prioritize imageUrls over images field
    const source = 
        (Array.isArray(item.imageUrls) && item.imageUrls[0]) ||
        item.image || 
        (Array.isArray(item.images) && item.images[0]);
    if (!source) return null;
    if (/^https?:/i.test(source)) return source;
    return imageUrl(source);
};

const formatShippingAddress = (address) => {
    if (!address) {
        return 'Delivery details will be confirmed shortly.';
    }
    const chunks = [
        address.line1,
        address.line2,
        address.landmark,
        `${address.city}, ${address.state} ${address.postalCode}`.trim(),
        address.country,
    ].filter(Boolean);
    return chunks.join(', ');
};

const OrderCard = ({ order }) => (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap items-center gap-4 justify-between">
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Order ID</p>
                <p className="font-black text-lg text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <span className={`text-xs font-semibold px-4 py-2 rounded-full border ${statusClasses[order.status] || statusClasses.processing}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
        </div>

        <div className="p-6 space-y-4">
            {order.items.map((item, index) => (
                <div key={`${order.id}-${index}`} className="flex gap-4 items-center">
                    {resolveImage(item) ? (
                        <img src={resolveImage(item)} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                    ) : (
                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-500">No Image</div>
                    )}
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty {item.quantity} • {item.size || 'Free size'}{item.height ? ` • ${item.height}` : ''}</p>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
            ))}
        </div>

        <div className="bg-gray-50 p-6 flex flex-wrap gap-4 justify-between items-start text-sm text-gray-600">
            <div className="flex items-start gap-2 max-w-xl">
                <MapPin size={16} className="text-pink-500 mt-1" />
                <div>
                    <p className="font-semibold text-gray-900">Deliver to {order.shippingAddress?.contactName || 'Customer'}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{formatShippingAddress(order.shippingAddress)}</p>
                    {order.shippingAddress?.phoneNumber && (
                        <p className="text-xs text-gray-500 mt-1">Phone: {order.shippingAddress.phoneNumber}</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Total</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(order.subtotal)}</p>
            </div>
        </div>
    </div>
);

const MyOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const response = await fetch(apiUrl('/api/orders'), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to load orders');
                }
                setOrders(data.orders || []);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    if (!token) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <header className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white py-16 shadow-lg">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="uppercase tracking-[0.4em] text-xs text-white/70 mb-3">Tererang Studio</p>
                    <h1 className="text-4xl md:text-5xl font-black">Your bespoke orders</h1>
                    <p className="mt-3 text-white/80">Track every handcrafted piece you fell in love with.</p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[{ label: 'Total orders', value: orders.length, icon: ShoppingBag }, { label: 'Active orders', value: orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length, icon: PackageCheck }, { label: 'Lifetime spend', value: formatCurrency(orders.reduce((sum, order) => sum + (order.subtotal || 0), 0)), icon: Wallet }].map((card) => (
                        <div key={card.label} className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 flex items-center gap-4">
                            <card.icon size={32} className="text-pink-500" />
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{card.label}</p>
                                <p className="text-2xl font-black text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Latest updates</h2>
                        <Link to="/shop" className="text-sm font-semibold text-pink-500 hover:text-pink-600">Shop more →</Link>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-gray-500">
                            <Loader2 className="animate-spin mr-3" /> Loading your couture timeline...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center bg-white rounded-3xl border border-dashed border-gray-200 p-12">
                            <p className="text-xl font-semibold text-gray-900 mb-3">No orders yet</p>
                            <p className="text-gray-500 mb-6">Your upcoming favorites will appear here right after checkout.</p>
                            <Link to="/shop" className="inline-flex px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg">Discover the collection</Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MyOrder;
