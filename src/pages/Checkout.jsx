import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, CheckCircle, Wallet, Loader2, MapPin, Plus, Pencil, Star, Clock3, Mail, CreditCard } from 'lucide-react';
import { useCart } from '../context/cartContextStore.js';
import { apiUrl, GST_RATE, GST_RATE_LABEL } from '../config/env.js';
import AddressForm from '../components/AddressForm.jsx';
import { createAddress, listAddresses, setDefaultAddress, updateAddress } from '../utils/addressApi.js';
import { useRazorpay } from '../hooks/useRazorpay.js';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => formatter.format(Math.max(0, value || 0));

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to parse stored user profile', error);
    return null;
  }
};

const persistUserProfile = (user) => {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem('user');
    return;
  }
  localStorage.setItem('user', JSON.stringify(user));
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, loading, refreshCart } = useCart();
  const { loadRazorpay } = useRazorpay();

  const initialStoredUser = useMemo(() => readStoredUser(), []);
  const [paymentReference, setPaymentReference] = useState(''); // Kept for legacy compatibility if needed
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [userProfile, setUserProfile] = useState(initialStoredUser);
  const [userLoading, setUserLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [emailInput, setEmailInput] = useState(initialStoredUser?.email || '');
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const expectedDelivery = useMemo(() => {
    const eta = new Date();
    eta.setDate(eta.getDate() + 6);
    return {
      dateLabel: eta.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }),
      timeLabel: eta.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }, []);

  const updateAddressList = useCallback((nextAddresses) => {
    setAddresses(nextAddresses);
    setSelectedAddressId((prev) => {
      if (prev && nextAddresses.some((addr) => addr.id === prev)) {
        return prev;
      }
      const fallback = nextAddresses.find((addr) => addr.isDefault) || nextAddresses[0];
      return fallback ? fallback.id : null;
    });
  }, []);

  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setAddressLoading(true);
    try {
      const data = await listAddresses();
      updateAddressList(data);
      setAddressError(null);
      if (data.length === 0) {
        setShowAddressForm(true);
      }
    } catch (error) {
      setAddressError(error.message);
    } finally {
      setAddressLoading(false);
    }
  }, [token, updateAddressList]);

  const handleSaveAddress = useCallback(
    async (payload) => {
      try {
        setSavingAddress(true);
        setAddressError(null);
        const data = editingAddress ? await updateAddress(editingAddress.id, payload) : await createAddress(payload);
        updateAddressList(data);
        setEditingAddress(null);
        setShowAddressForm(false);
      } catch (error) {
        setAddressError(error.message);
      } finally {
        setSavingAddress(false);
      }
    },
    [editingAddress, updateAddressList]
  );

  const handleSetDefaultAddress = useCallback(
    async (addressId) => {
      try {
        setSavingAddress(true);
        const data = await setDefaultAddress(addressId);
        updateAddressList(data);
        setSelectedAddressId(addressId);
      } catch (error) {
        setAddressError(error.message);
      } finally {
        setSavingAddress(false);
      }
    },
    [updateAddressList]
  );

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleCancelAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const openCreateAddressForm = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setUserProfile(null);
      setEmailInput('');
      persistUserProfile(null);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    setProfileError(null);
    try {
      const response = await fetch(apiUrl('/api/auth/user'), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile');
      }
      setUserProfile(data.user);
      setEmailInput(data.user?.email || '');
      setEditingEmail(false);
      setEmailStatus(null);
      persistUserProfile(data.user);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setUserLoading(false);
    }
  }, [token]);

  const handleSaveEmail = useCallback(async () => {
    const normalized = (emailInput || '').trim().toLowerCase();
    if (!normalized) {
      setEmailStatus({ type: 'error', text: 'Email address is required' });
      return;
    }
    if (!emailRegex.test(normalized)) {
      setEmailStatus({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    if (!token) {
      setEmailStatus({ type: 'error', text: 'Please log in again to continue' });
      return;
    }

    setEmailSaving(true);
    setEmailStatus(null);
    try {
      const response = await fetch(apiUrl('/api/auth/user'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save email');
      }
      setUserProfile(data.user);
      setEmailInput(data.user?.email || '');
      persistUserProfile(data.user);
      setEditingEmail(false);
      setEmailStatus({ type: 'success', text: 'Email saved for order updates' });
    } catch (error) {
      setEmailStatus({ type: 'error', text: error.message });
    } finally {
      setEmailSaving(false);
    }
  }, [emailInput, token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!token) return;
    loadAddresses();
  }, [token, loadAddresses]);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);


  const verifyPayment = async (razorpayData, orderDetails) => {
    try {
      const response = await fetch(apiUrl('/api/orders/verify-payment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayData.razorpay_order_id,
          razorpay_payment_id: razorpayData.razorpay_payment_id,
          razorpay_signature: razorpayData.razorpay_signature,
          addressId: selectedAddressId,
          notes,
          paymentType: paymentMethod === 'cod' ? 'cod_advance' : 'full'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      setStatusMessage({ type: 'success', text: 'Payment successful! Order placed.' });
      await refreshCart();
      setTimeout(() => navigate('/MyOrder'), 1500);

    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
      setSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!cartItems?.length) {
      setStatusMessage({ type: 'error', text: 'Your cart is empty.' });
      return;
    }

    if (!selectedAddressId) {
      setStatusMessage({ type: 'error', text: 'Please add or select a delivery address.' });
      return;
    }

    if (userLoading) {
      setStatusMessage({ type: 'error', text: 'Please wait, syncing profile...' });
      return;
    }

    if (!userProfile?.email) {
      setStatusMessage({ type: 'error', text: 'Please add your email address.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    // Load script
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      setStatusMessage({ type: 'error', text: 'Failed to load Razorpay SDK. Check connection.' });
      setSubmitting(false);
      return;
    }

    try {
      // 1. Create Order
      const response = await fetch(apiUrl('/api/orders/create-razorpay-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          addressId: selectedAddressId,
          paymentType: paymentMethod === 'cod' ? 'cod_advance' : 'full'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      // 2. Open Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "TereRang",
        description: paymentMethod === 'cod' 
          ? "Pay ₹199 advance for Cash on Delivery"
          : "Complete your purchase",
        order_id: data.id,
        image: "https://tererang.in/logo.png",
        handler: function (response) {
          verifyPayment(response, data);
        },
        prefill: data.prefill,
        theme: {
          color: "#14B8A6"
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setStatusMessage({ type: 'error', text: 'Payment cancelled' });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
      setSubmitting(false);
    }
  };


  const subtotalAmount = useMemo(() => Number(cartTotal || 0), [cartTotal]);
  const gstAmount = useMemo(() => Number((subtotalAmount * GST_RATE).toFixed(2)), [subtotalAmount]);
  const payableWithGst = useMemo(() => subtotalAmount + gstAmount, [subtotalAmount, gstAmount]);

  const resolveImage = (product) => {
    if (!product) return null;
    const source =
      (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
      product.image ||
      (Array.isArray(product.images) ? product.images[0] : null);
    if (!source) return null;
    if (/^https?:/i.test(source)) return source;
    return imageUrl(source);
  };

  const hasEmail = Boolean(userProfile?.email);
  const requiresEmail = !hasEmail;
  const showEmailForm = requiresEmail || editingEmail;

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 shadow-2xl p-8">
          <p className="uppercase tracking-[0.35em] text-sm text-teal-300 mb-2">Checkout</p>
          <h1 className="text-4xl font-black mb-6">Complete Your Purchase</h1>

          <div className="bg-gradient-to-br from-teal-900/20 to-black rounded-2xl p-8 border border-teal-800/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <CreditCard size={32} className="text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Secure Payment</h3>
                <p className="text-gray-400 text-sm">Powered by Razorpay</p>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-400 shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Accepts UPI, Cards, Netbanking, and Wallets.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-teal-400 shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">100% Secure & Encrypted transaction.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-400 shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Instant confirmation & invoice via email.</span>
              </li>
            </ul>

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div>
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-3xl font-bold text-white mt-1">{formatCurrency(payableWithGst)}</p>
              </div>
              <Wallet size={32} className="text-gray-600" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="font-semibold mb-1 text-teal-200">Fast Refund</p>
              <p className="text-xs text-gray-400">Instant refund for failed transactions.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="font-semibold mb-1 text-teal-200">Buyer Protection</p>
              <p className="text-xs text-gray-400">Secure payment coverage.</p>
            </div>
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur rounded-3xl border border-white/10 shadow-2xl p-8 flex flex-col">
          <div className="pb-8 border-b border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-teal-300">
                  <MapPin size={16} /> Shipping
                </div>
                <h2 className="text-2xl font-bold mt-2">Delivery address</h2>
                <Link to="/addresses" className="text-xs text-teal-200 underline-offset-4 hover:underline">
                  Manage from profile →
                </Link>
              </div>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={showAddressForm ? handleCancelAddress : openCreateAddressForm}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:border-teal-400"
                >
                  <Plus size={16} /> {showAddressForm ? 'Close form' : 'Add address'}
                </button>
              )}
            </div>

            {addressError && (
              <div className="mb-4 rounded-2xl border border-red-800/60 bg-red-900/30 px-4 py-3 text-sm text-red-100">
                {addressError}
              </div>
            )}

            {addressLoading ? (
              <div className="flex h-32 items-center justify-center text-gray-400">
                <Loader2 className="mr-2 animate-spin" size={18} /> Fetching saved addresses...
              </div>
            ) : addresses.length ? (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;
                  return (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`flex cursor-pointer gap-4 rounded-2xl border px-4 py-4 transition ${isSelected ? 'border-teal-400 bg-teal-400/10 shadow-lg' : 'border-white/10 bg-black/30 hover:border-teal-400/40'}`}
                    >
                      <div className={`mt-1 h-5 w-5 rounded-full border-2 ${isSelected ? 'border-teal-300' : 'border-white/30'} flex items-center justify-center`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-teal-300' : 'bg-transparent'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{address.contactName}</p>
                          <span className="text-xs text-gray-400">{address.phoneNumber}</span>
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] text-teal-100">
                              <Star size={12} /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}
                          {address.landmark ? `, ${address.landmark}` : ''}, {address.city}, {address.state} {address.postalCode}, {address.country}
                        </p>
                        {address.label && <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mt-1">{address.label}</p>}
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="inline-flex items-center justify-end gap-1 text-teal-200 hover:text-teal-100"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        {!address.isDefault && (
                          <button
                            type="button"
                            disabled={savingAddress}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefaultAddress(address.id);
                            }}
                            className="inline-flex items-center justify-end gap-1 text-gray-300 hover:text-teal-200 disabled:opacity-50"
                          >
                            Make default
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-5 text-sm text-gray-300">
                No delivery address saved yet. Add one below to continue.
              </div>
            )}

            {showAddressForm && (
              <div className="mt-4">
                <AddressForm
                  initialValue={editingAddress}
                  onSubmit={handleSaveAddress}
                  onCancel={addresses.length ? handleCancelAddress : undefined}
                  submitting={savingAddress}
                  submitLabel={editingAddress ? 'Update address' : 'Save address'}
                  variant="dark"
                />
              </div>
            )}

            {!showAddressForm && !addressLoading && addresses.length === 0 && (
              <button
                type="button"
                onClick={openCreateAddressForm}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-teal-400"
              >
                <Plus size={16} /> Add address
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col mt-8">
            <div className={`mb-6 rounded-2xl border px-4 py-4 ${requiresEmail ? 'border-red-500/40 bg-red-900/10' : 'border-white/15 bg-black/30'}`}>
              <div className="flex items-start gap-3">
                <Mail size={20} className={`${requiresEmail ? 'text-red-300' : 'text-teal-300'}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Email for order updates</p>
                  <p className="text-xs text-gray-400">We share invoices, dispatch alerts, and support updates on this email.</p>
                  {userLoading ? (
                    <div className="flex items-center text-gray-400 text-xs mt-3">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking your profile...
                    </div>
                  ) : showEmailForm ? (
                    <div className="mt-4 space-y-3">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="you@example.com"
                        disabled={emailSaving}
                      />
                      {emailStatus && (
                        <p className={`text-xs ${emailStatus.type === 'error' ? 'text-red-300' : 'text-teal-200'}`}>
                          {emailStatus.text}
                        </p>
                      )}
                      {profileError && (
                        <p className="text-xs text-red-300">{profileError}</p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleSaveEmail}
                          disabled={emailSaving}
                          className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                        >
                          {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={16} />}
                          {emailSaving ? 'Saving...' : 'Save email'}
                        </button>
                        {hasEmail && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmail(false);
                              setEmailInput(userProfile?.email || '');
                              setEmailStatus(null);
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-200">{userProfile?.email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmail(true);
                          setEmailStatus(null);
                        }}
                        className="text-xs text-teal-200 underline-offset-4 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Order Summary</h2>
              {selectedAddressId ? (
                <span className="text-xs text-teal-200">Delivering to selected address</span>
              ) : (
                <span className="text-xs text-red-200">Select an address to continue</span>
              )}
            </div>

            {statusMessage && (
              <div className={`mb-4 rounded-2xl px-4 py-3 text-sm ${statusMessage.type === 'error' ? 'bg-red-900/40 text-red-100 border border-red-800/60' : 'bg-teal-900/40 text-teal-100 border border-teal-800/60'}`}>
                {statusMessage.text}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <Loader2 className="animate-spin mr-2" size={18} />
                Loading your bag...
              </div>
            ) : cartItems?.length ? (
              <>
                <div className="mb-4 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 flex items-center gap-3">
                  <Clock3 size={20} className="text-teal-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">Expected delivery by {expectedDelivery.dateLabel}</p>
                  </div>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 bg-black/40 rounded-2xl p-4 border border-white/5">
                      {resolveImage(item.product) ? (
                        <img src={resolveImage(item.product)} alt={item.product?.name} className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-gray-800 flex items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{item.product?.name || 'Product'}</p>
                        <p className="text-xs text-gray-400">Qty {item.quantity} • {item.size || 'Free Size'}{item.height ? ` • ${item.height}` : ''}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(subtotalAmount)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">Notes for designer (optional)</label>
                    <textarea
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Color preferences, delivery instructions..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 block mb-3">Payment Method</label>
                    <div className="space-y-3">
                      <div 
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          paymentMethod === 'razorpay' 
                            ? 'border-teal-400 bg-teal-400/10 shadow-lg' 
                            : 'border-white/10 bg-black/30 hover:border-teal-400/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'razorpay' ? 'border-teal-300' : 'border-white/30'
                          }`}>
                            <span className={`h-2.5 w-2.5 rounded-full ${
                              paymentMethod === 'razorpay' ? 'bg-teal-300' : 'bg-transparent'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CreditCard size={18} className="text-teal-400" />
                              <p className="font-semibold text-white">Pay Full Amount Online</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Pay {formatCurrency(payableWithGst)} now via UPI, Cards, or Wallets
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => setPaymentMethod('cod')}
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          paymentMethod === 'cod' 
                            ? 'border-teal-400 bg-teal-400/10 shadow-lg' 
                            : 'border-white/10 bg-black/30 hover:border-teal-400/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'cod' ? 'border-teal-300' : 'border-white/30'
                          }`}>
                            <span className={`h-2.5 w-2.5 rounded-full ${
                              paymentMethod === 'cod' ? 'bg-teal-300' : 'bg-transparent'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Wallet size={18} className="text-teal-400" />
                              <p className="font-semibold text-white">Cash on Delivery (COD)</p>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 space-y-1">
                              <p>• Pay ₹199 advance now (non-refundable)</p>
                              <p>• Pay remaining {formatCurrency(payableWithGst - 199)} on delivery</p>
                            </div>
                            <div className="mt-2 bg-yellow-900/30 border border-yellow-700/40 rounded-xl px-3 py-2 text-xs text-yellow-200">
                              <strong>Note:</strong> ₹199 advance payment is mandatory and non-refundable for COD orders.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRazorpayPayment}
                  disabled={submitting || !selectedAddressId || userLoading || !userProfile?.email}
                  title={!userProfile?.email ? 'Add your email to continue' : undefined}
                  className="mt-6 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-400 to-blue-500 text-black font-extrabold py-4 rounded-2xl shadow-[0_10px_40px_rgba(20,184,166,0.35)] hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={20} />}
                  {submitting ? 'Processing...' : paymentMethod === 'cod' ? 'Pay ₹199 Advance' : `Pay ${formatCurrency(payableWithGst)}`}
                </button>

                <p className="text-xs text-center text-gray-400 mt-3">
                  <ShieldCheck size={14} className="inline mr-1" />
                  Transactions are 100% Secure and Encrypted.
                </p>
              </>
            ) : (
              <div className="text-center flex flex-col items-center justify-center flex-1">
                <p className="text-lg font-semibold mb-4">Your cart is empty.</p>
                <Link to="/shop" className="px-6 py-3 rounded-full bg-teal-500 text-black font-semibold">Browse collection</Link>
              </div>
            )}
          </div>
        </section>
      </div >
      <div className="max-w-6xl mx-auto mt-8 text-center text-xs text-gray-400">
        <span>Read our </span>
        <Link to="/TermsPage" className="text-teal-300 font-semibold hover:underline underline-offset-4">
          Terms and Conditions
        </Link>
        <span> to learn how we protect your data.</span>
      </div>
    </div >
  );
};

export default Checkout;
