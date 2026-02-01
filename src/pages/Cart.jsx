import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../context/cartContextStore.js';
import { imageUrl } from '../config/env.js';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => currencyFormatter.format(Math.max(0, value));

const resolveProductImage = (product) => {
  if (!product) return null;
  const candidate =
    (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
    product.image ||
    (Array.isArray(product.images) && product.images[0]);
  if (!candidate) return null;
  if (/^https?:/i.test(candidate)) return candidate;
  return imageUrl(candidate);
};

const Cart = () => {
  const navigate = useNavigate();
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const { cartItems, cartCount, cartTotal, loading, removeCartItem, updateCartItem, refreshCart } = useCart();
  const [feedback, setFeedback] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const cartHasItems = cartItems && cartItems.length > 0;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleRemoveItem = async (itemId) => {
    try {
      setRemovingItemId(itemId);
      await removeCartItem(itemId);
      setFeedback({ type: 'success', text: 'Item removed from cart' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to remove item' });
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleUpdateQuantity = async (itemId, currentQuantity, delta) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    if (newQuantity === currentQuantity) return;

    try {
      setUpdatingItemId(itemId);
      await updateCartItem(itemId, { quantity: newQuantity });
      setFeedback({ type: 'success', text: 'Quantity updated' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to update quantity' });
      await refreshCart();
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-gray-400">
            {cartHasItems ? `${cartCount} item${cartCount === 1 ? '' : 's'} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              feedback.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-teal-900/40 text-teal-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {cartHasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const previewSrc = resolveProductImage(item.product);
                const isRemoving = removingItemId === item.id;
                const isUpdating = updatingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            alt={item.product?.name || 'Product image'}
                            className="w-full sm:w-32 h-48 sm:h-32 rounded-lg object-cover border border-gray-800"
                          />
                        ) : (
                          <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500">
                            <ShoppingBag size={40} />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {item.product?.name || 'Unavailable product'}
                          </h3>
                          <div className="text-sm text-gray-400 space-y-1">
                            {item.size && <p>Size: {item.size}</p>}
                            {item.height && <p>Height: {item.height}</p>}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-lg font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={isUpdating}
                              className="h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <p className="text-xl font-bold text-teal-400">
                              {formatCurrency(item.lineTotal)}
                            </p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              className="text-gray-400 hover:text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Remove item"
                            >
                              {isRemoving ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({cartCount} item{cartCount === 1 ? '' : 's'})</span>
                    <span className="text-white font-semibold">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-white font-semibold">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-teal-400">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    className="flex items-center justify-center gap-2 w-full bg-white text-black font-semibold py-3 rounded-full hover:bg-gray-200 transition"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/shop"
                    className="block w-full text-center bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-full transition"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="mt-6 text-sm text-gray-400 text-center">
                  <p>Secure checkout guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart State
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-900 border-2 border-gray-800 mb-6">
              <ShoppingCart size={48} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">
              Explore our collections to add something special.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8 py-3 rounded-full transition"
            >
              <ShoppingBag size={20} />
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
