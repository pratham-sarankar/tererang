import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../config/env.js';
import { subscribeCartAuthChange } from './cartEvents.js';
import { CartContext } from './cartContextStore.js';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const withAuthHeaders = (headers = {}) => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  const cartEndpoint = useMemo(() => apiUrl('/api/cart'), []);

  const syncFromResponse = (data) => {
    if (!data) return;
    if (Array.isArray(data.items)) {
      setCartItems(data.items);
    }
    if (typeof data.subtotal === 'number') {
      // no-op; subtotal is derived locally, but keeping hook for future use
    }
    setError(null);
  };

  const fetchCart = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setCartItems([]);
      setInitializing(false);
      setError(null);
      return { items: [] };
    }

    setLoading(true);
    try {
      const response = await fetch(cartEndpoint, {
        headers: withAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }
      syncFromResponse(data);
      return data;
    } catch (err) {
      setError(err.message || 'Unable to load cart');
      if (err.message?.toLowerCase().includes('not authorized')) {
        setCartItems([]);
      }
      throw err;
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }, [cartEndpoint]);

  const authedRequest = useCallback(
    async (endpoint = '', options = {}) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Please log in to manage your cart');
      }

      const response = await fetch(`${cartEndpoint}${endpoint}`, {
        method: 'GET',
        ...options,
        headers: withAuthHeaders(options.headers),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Cart request failed');
      }
      syncFromResponse(data);
      return data;
    },
    [cartEndpoint]
  );

  const addToCart = useCallback(
    async ({ productId, quantity = 1, size, height }) => {
      if (!productId) {
        throw new Error('Missing product identifier');
      }
      return authedRequest('', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, size, height }),
      });
    },
    [authedRequest]
  );

  const updateCartItem = useCallback(
    async (itemId, payload) => {
      if (!itemId) {
        throw new Error('Cart item ID is required');
      }
      return authedRequest(`/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload || {}),
      });
    },
    [authedRequest]
  );

  const removeCartItem = useCallback(
    async (itemId) => {
      if (!itemId) {
        throw new Error('Cart item ID is required');
      }
      return authedRequest(`/${itemId}`, {
        method: 'DELETE',
      });
    },
    [authedRequest]
  );

  const clearCart = useCallback(() => authedRequest('', { method: 'DELETE' }), [authedRequest]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0), [cartItems]);
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0),
    [cartItems]
  );

  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);

  useEffect(() => {
    const handleAuthChange = () => {
      fetchCart().catch(() => {});
    };
    return subscribeCartAuthChange(handleAuthChange);
  }, [fetchCart]);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartTotal,
      loading: loading || initializing,
      error,
      refreshCart: fetchCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
    }),
    [cartItems, cartCount, cartTotal, loading, initializing, error, fetchCart, addToCart, updateCartItem, removeCartItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
