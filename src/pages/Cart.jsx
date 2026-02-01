import React, { useState, useEffect } from 'react';
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
      // Only show feedback on success if needed, error feedback is more important
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
      <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-[#b81582]" size={48} />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600 text-base">
            {cartHasItems ? `${cartCount} item${cartCount === 1 ? '' : 's'} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl ${
              feedback.type === 'error' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-pink-100 text-[#b81582] border border-pink-200'
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
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            alt={item.product?.name || 'Product image'}
                            className="w-full sm:w-32 h-48 sm:h-32 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <ShoppingBag size={40} />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {item.product?.name || 'Unavailable product'}
                          </h3>
                          <div className="text-sm text-gray-500 space-y-1">
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
                              className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition text-gray-900"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={isUpdating}
                              className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition text-gray-900"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <p className="text-xl font-extrabold text-[#b81582]">
                              {formatCurrency(item.lineTotal)}
                            </p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              className="text-gray-400 hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Remove item"
                            >
                              {isRemoving ? <Loader2 className="animate-spin text-[#b81582]" size={20} /> : <Trash2 size={20} />}
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
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 sticky top-24">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartCount} item{cartCount === 1 ? '' : 's'})</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-gray-900 font-bold">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-extrabold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-[#b81582]">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-xl"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/shop"
                    className="block w-full text-center border-2 border-pink-100 text-[#b81582] font-bold py-3 rounded-full hover:bg-[#b81582] hover:text-white hover:border-[#b81582] transition"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="mt-6 text-sm text-gray-500 text-center">
                  <p>Secure checkout guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart State
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-pink-100/50 border-2 border-pink-100 mb-6">
              <ShoppingCart size={48} className="text-[#b81582]" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Explore our collections to add something special.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-xl"
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
