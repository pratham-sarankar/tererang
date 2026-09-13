import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, Wallet, Loader2, MapPin, Plus, Pencil, Star, Clock3, Mail, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/cartContextStore.js';
import { apiUrl, imageUrl, GST_RATE, COD_CHARGE } from '../config/env.js';
import AddressForm from '../components/AddressForm.jsx';
import ProductImage from '../components/ProductImage.jsx';
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
  // Kept for legacy compatibility if needed
  // const [paymentReference, setPaymentReference] = useState('');
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
  const [codAgreed, setCodAgreed] = useState(false);

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

  // Reset COD agreement when switching payment methods
  useEffect(() => {
    if (paymentMethod !== 'cod') {
      setCodAgreed(false);
    }
  }, [paymentMethod]);


  const verifyPayment = async (razorpayData) => {
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
          paymentMethod
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      const successMessage = paymentMethod === 'cod'
        ? 'COD fee paid! Order placed. Pay remaining amount on delivery.'
        : 'Payment successful! Order placed.';
      setStatusMessage({ type: 'success', text: successMessage });
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
        body: JSON.stringify({ addressId: selectedAddressId, paymentMethod: 'razorpay' })
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
        description: "Complete your purchase",
        order_id: data.id,
        image: "https://tererang.in/logo.png", // Fallback or use real logo if available
        handler: function (response) {
          verifyPayment(response);
        },
        prefill: data.prefill,
        theme: {
          color: "#14B8A6" // Teal-500
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

  const handleCodOrder = async () => {
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

    if (!codAgreed) {
      setStatusMessage({ type: 'error', text: 'Please agree to the COD terms to continue.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    // Load Razorpay script for COD fee payment
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      setStatusMessage({ type: 'error', text: 'Failed to load Razorpay SDK. Check connection.' });
      setSubmitting(false);
      return;
    }

    try {
      // 1. Create Razorpay order for ₹59 COD fee
      const response = await fetch(apiUrl('/api/orders/create-razorpay-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod: 'cod'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate COD fee payment');
      }

      // 2. Open Razorpay for ₹59 payment
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "TereRang",
        description: "COD Handling Fee",
        order_id: data.id,
        image: "https://tererang.in/logo.png",
        handler: function (response) {
          // After successful ₹59 payment, verify and place the COD order
          verifyPayment(response);
        },
        prefill: data.prefill,
        theme: {
          color: "#14B8A6"
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setStatusMessage({ type: 'error', text: 'COD fee payment cancelled' });
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
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-card rounded-sm shadow-sm border border-border p-8">
          <div className="inline-flex items-center bg-secondary rounded-sm px-3 py-1 mb-2 border border-border">
            <p className="text-accent uppercase tracking-[0.2em] text-xs">checkout</p>
          </div>
          <h1 className="text-4xl font-serif lowercase text-foreground mb-6 tracking-wide">complete your purchase</h1>

          <div className="bg-secondary rounded-sm p-8 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-card rounded-sm border border-border">
                <CreditCard size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-serif lowercase text-foreground">select payment method</h3>
                <p className="text-muted-foreground text-sm">Choose how you want to pay</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`cursor-pointer rounded-sm border p-4 transition ${paymentMethod === 'razorpay'
                    ? 'border-primary bg-secondary shadow-lg'
                    : 'border-border bg-card hover:border-border'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-primary' : 'border-border'
                      }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${paymentMethod === 'razorpay' ? 'bg-primary' : 'bg-transparent'
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={20} className="text-primary" />
                      <p className="font-medium text-foreground">Online Payment (Razorpay)</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">UPI, Cards, Netbanking, and Wallets</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`cursor-pointer rounded-sm border p-4 transition ${paymentMethod === 'cod'
                    ? 'border-primary bg-secondary shadow-lg'
                    : 'border-border bg-card hover:border-border'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-border'
                      }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${paymentMethod === 'cod' ? 'bg-primary' : 'bg-transparent'
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote size={20} className="text-primary" />
                      <p className="font-medium text-foreground">Cash on Delivery (COD)</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Pay ₹{COD_CHARGE} now, rest on delivery</p>
                    <p className="text-xs text-primary mt-1 font-bold">₹{COD_CHARGE} upfront fee (online payment required)</p>
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === 'razorpay' && (
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">Accepts UPI, Cards, Netbanking, and Wallets.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">100% Secure & Encrypted transaction.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">Instant confirmation & invoice via email.</span>
                </li>
              </ul>
            )}

            {paymentMethod === 'cod' && (
              <div className="mb-8 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                  <p className="text-sm text-amber-800 font-bold mb-2">Cash on Delivery Terms:</p>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Pay ₹{COD_CHARGE} upfront as COD handling fee via online payment (Razorpay).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>After successful payment, your order will be placed.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Pay the remaining order amount ({formatCurrency(payableWithGst)}) in cash when you receive the order.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Keep exact cash ready for payment on delivery.</span>
                    </li>
                  </ul>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codAgreed}
                    onChange={(e) => setCodAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">
                    I agree to pay ₹{COD_CHARGE} upfront as COD handling fee and the remaining amount ({formatCurrency(payableWithGst)}) on delivery.
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {paymentMethod === 'cod' ? 'Order Amount (Pay on Delivery)' : 'Total Amount'}
                </p>
                <p className="text-3xl font-medium text-foreground mt-1">{formatCurrency(payableWithGst)}</p>
                {paymentMethod === 'cod' && (
                  <p className="text-xs text-amber-600 mt-1 font-bold">+ ₹{COD_CHARGE} upfront fee (charged now)</p>
                )}
              </div>
              <Wallet size={32} className="text-muted-foreground" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-secondary rounded-sm p-4 border border-border">
              <p className="font-bold mb-1 text-primary">Fast Refund</p>
              <p className="text-xs text-muted-foreground">Instant refund for failed transactions.</p>
            </div>
            <div className="bg-secondary rounded-sm p-4 border border-border">
              <p className="font-bold mb-1 text-primary">Buyer Protection</p>
              <p className="text-xs text-muted-foreground">Secure payment coverage.</p>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-sm shadow-sm border border-border p-8 flex flex-col">
          <div className="pb-8 border-b border-border">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-bold">
                  <MapPin size={16} /> Shipping
                </div>
                <h2 className="text-2xl font-serif lowercase text-foreground mt-2 tracking-wide">delivery address</h2>
                <Link to="/addresses" className="text-xs text-primary underline-offset-4 hover:underline">
                  Manage from profile →
                </Link>
              </div>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={showAddressForm ? handleCancelAddress : openCreateAddressForm}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-border px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white hover:border-primary transition font-bold"
                >
                  <Plus size={16} /> {showAddressForm ? 'Close form' : 'Add address'}
                </button>
              )}
            </div>

            {addressError && (
              <div className="mb-4 rounded-sm border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-600">
                {addressError}
              </div>
            )}

            {addressLoading ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 animate-spin text-primary" size={18} /> Fetching saved addresses...
              </div>
            ) : addresses.length ? (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;
                  return (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`flex cursor-pointer gap-4 rounded-sm border px-4 py-4 transition ${isSelected ? 'border-primary bg-secondary shadow-lg' : 'border-border bg-card hover:border-border'}`}
                    >
                      <div className={`mt-1 h-5 w-5 rounded-full border-2 ${isSelected ? 'border-primary' : 'border-border'} flex items-center justify-center`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-transparent'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-foreground">{address.contactName}</p>
                          <span className="text-xs text-muted-foreground">{address.phoneNumber}</span>
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-primary font-bold">
                              <Star size={12} /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}
                          {address.landmark ? `, ${address.landmark}` : ''}, {address.city}, {address.state} {address.postalCode}, {address.country}
                        </p>
                        {address.label && <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mt-1">{address.label}</p>}
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="inline-flex items-center justify-end gap-1 text-primary hover:text-foreground"
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
                            className="inline-flex items-center justify-end gap-1 text-muted-foreground hover:text-primary disabled:opacity-50"
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
              <div className="rounded-sm border border-dashed border-border bg-secondary px-4 py-5 text-sm text-muted-foreground">
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
                  variant="light"
                />
              </div>
            )}

            {!showAddressForm && !addressLoading && addresses.length === 0 && (
              <button
                type="button"
                onClick={openCreateAddressForm}
                className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-border px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white hover:border-primary transition font-bold"
              >
                <Plus size={16} /> Add address
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col mt-8">
            <div className={`mb-6 rounded-sm border px-4 py-4 ${requiresEmail ? 'border-red-300 bg-red-50' : 'border-border bg-card'}`}>
              <div className="flex items-start gap-3">
                <Mail size={20} className={`${requiresEmail ? 'text-destructive' : 'text-primary'}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">Email for order updates</p>
                  <p className="text-xs text-muted-foreground">We share invoices, dispatch alerts, and support updates on this email.</p>
                  {userLoading ? (
                    <div className="flex items-center text-muted-foreground text-xs mt-3">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Checking your profile...
                    </div>
                  ) : showEmailForm ? (
                    <div className="mt-4 space-y-3">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-card border border-border rounded-sm px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="you@example.com"
                        disabled={emailSaving}
                      />
                      {emailStatus && (
                        <p className={`text-xs ${emailStatus.type === 'error' ? 'text-red-600' : 'text-primary'}`}>
                          {emailStatus.text}
                        </p>
                      )}
                      {profileError && (
                        <p className="text-xs text-red-600">{profileError}</p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleSaveEmail}
                          disabled={emailSaving}
                          className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-bold disabled:opacity-60 hover:bg-primary/90 transition"
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
                            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{userProfile?.email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmail(true);
                          setEmailStatus(null);
                        }}
                        className="text-xs text-primary underline-offset-4 hover:underline font-bold"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif lowercase text-foreground tracking-wide">order summary</h2>
              {selectedAddressId ? (
                <span className="text-xs text-primary font-bold">Delivering to selected address</span>
              ) : (
                <span className="text-xs text-red-600 font-bold">Select an address to continue</span>
              )}
            </div>

            {statusMessage && (
              <div className={`mb-4 rounded-sm px-4 py-3 text-sm ${statusMessage.type === 'error' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-secondary text-primary border border-border'}`}>
                {statusMessage.text}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="animate-spin mr-2 text-primary" size={18} />
                Loading your bag...
              </div>
            ) : cartItems?.length ? (
              <>
                <div className="mb-4 rounded-sm border border-border bg-secondary px-4 py-3 flex items-center gap-3">
                  <Clock3 size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Expected delivery by {expectedDelivery.dateLabel}</p>
                  </div>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 bg-card rounded-sm p-4 border border-border shadow-sm">
                      <ProductImage
                        src={resolveImage(item.product)}
                        alt={item.product?.name}
                        className="h-16 w-16 rounded-sm object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{item.product?.name || 'Product'}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity} • {item.size || 'Free Size'}{item.height ? ` • ${item.height}` : ''}</p>
                      </div>
                      <p className="font-bold text-foreground">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-bold">{formatCurrency(subtotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium border-t border-border pt-3">
                    <span className="text-foreground">{paymentMethod === 'cod' ? 'Amount on Delivery' : 'Total Amount'}</span>
                    <span className="text-primary">{formatCurrency(payableWithGst)}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-800">
                      <p className="font-bold mb-1">COD Payment Details:</p>
                      <p>• ₹{COD_CHARGE} upfront fee (charged now via Razorpay)</p>
                      <p>• {formatCurrency(payableWithGst)} to be paid on delivery in cash</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm text-foreground font-bold block mb-2">Notes for designer (optional)</label>
                    <textarea
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-card border border-border rounded-sm px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Color preferences, delivery instructions..."
                    />
                  </div>
                </div>

                <button
                  onClick={paymentMethod === 'cod' ? handleCodOrder : handleRazorpayPayment}
                  disabled={submitting || !selectedAddressId || userLoading || !userProfile?.email || (paymentMethod === 'cod' && !codAgreed)}
                  title={
                    !userProfile?.email
                      ? 'Add your email to continue'
                      : paymentMethod === 'cod' && !codAgreed
                        ? 'Please agree to COD terms to continue'
                        : undefined
                  }
                  className="mt-6 flex items-center justify-center gap-2 w-full bg-primary text-white font-medium py-4 rounded-sm hover:bg-primary/90 transition text-sm tracking-wide lowercase disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : paymentMethod === 'cod' ? (
                    <Banknote size={20} />
                  ) : (
                    <CreditCard size={20} />
                  )}
                  {submitting
                    ? 'Processing...'
                    : paymentMethod === 'cod'
                      ? `Pay ₹${COD_CHARGE} COD Fee`
                      : `Pay ${formatCurrency(payableWithGst)}`
                  }
                </button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  <ShieldCheck size={14} className="inline mr-1 text-primary" />
                  Transactions are 100% Secure and Encrypted.
                </p>
              </>
            ) : (
              <div className="text-center flex flex-col items-center justify-center flex-1">
                <p className="text-lg font-bold text-foreground mb-4">Your cart is empty.</p>
                <Link to="/shop" className="px-6 py-3 rounded-sm bg-primary text-white font-medium hover:bg-primary/90 transition text-sm tracking-wide lowercase">browse collection</Link>
              </div>
            )}
          </div>
        </section>
      </div >
      <div className="max-w-6xl mx-auto mt-8 text-center text-xs text-muted-foreground">
        <span>Read our </span>
        <Link to="/TermsPage" className="text-primary font-bold hover:underline underline-offset-4">
          Terms and Conditions
        </Link>
        <span> to learn how we protect your data.</span>
      </div>
    </div >
  );
};

export default Checkout;
