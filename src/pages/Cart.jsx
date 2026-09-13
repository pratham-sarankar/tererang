import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif lowercase text-foreground mb-2 tracking-wide">Shopping Cart</h1>
          <p className="text-muted-foreground text-base">
            {cartHasItems ? `${cartCount} item${cartCount === 1 ? '' : 's'} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-sm border text-sm ${feedback.type === 'error'
              ? 'bg-red-50 text-destructive border-red-200'
              : 'bg-secondary text-primary border-border'
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
                    className="bg-card rounded-sm p-4 sm:p-6 border border-border transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <ProductImage
                          src={previewSrc}
                          alt={item.product?.name || 'Product image'}
                          className="w-full sm:w-32 h-48 sm:h-32 rounded-sm object-cover bg-secondary"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-serif lowercase text-foreground mb-2">
                            {item.product?.name || 'Unavailable product'}
                          </h3>
                          <div className="text-xs text-muted-foreground space-y-1 tracking-wide">
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
                              className="h-8 w-8 rounded-sm border border-border bg-card hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition text-foreground"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-base font-medium text-foreground min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={isUpdating}
                              className="h-8 w-8 rounded-sm border border-border bg-card hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition text-foreground"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <p className="text-lg font-medium text-foreground">
                              {formatCurrency(item.lineTotal)}
                            </p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              className="text-muted-foreground hover:text-destructive transition disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Remove item"
                            >
                              {isRemoving ? <Loader2 className="animate-spin text-primary" size={18} /> : <Trash2 size={18} />}
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
              <div className="bg-card rounded-sm p-6 border border-border sticky top-24">
                <h2 className="text-lg font-serif lowercase text-foreground mb-6 tracking-wide">order summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal ({cartCount} item{cartCount === 1 ? '' : 's'})</span>
                    <span className="text-foreground font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Shipping</span>
                    <span className="text-foreground font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-base font-medium">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    className="flex items-center justify-center gap-2 w-full bg-primary text-white font-medium py-3 rounded-sm hover:bg-primary/90 transition text-sm tracking-wide lowercase"
                  >
                    proceed to checkout
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/shop"
                    className="block w-full text-center border border-primary text-foreground font-medium py-3 rounded-sm hover:bg-primary hover:text-white transition text-sm tracking-wide lowercase"
                  >
                    continue shopping
                  </Link>
                </div>

                <div className="mt-6 text-xs text-muted-foreground text-center tracking-wide">
                  <p>Secure checkout guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart State
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-border mb-6">
              <ShoppingCart size={36} className="text-primary" />
            </div>
            <h2 className="text-xl font-serif lowercase text-foreground mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Explore our collections to add something special.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-sm hover:bg-primary/90 transition text-sm tracking-wide lowercase font-medium"
            >
              <ShoppingBag size={16} />
              start shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
