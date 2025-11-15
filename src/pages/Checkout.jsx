import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, CheckCircle, Wallet, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { apiUrl, imageUrl } from '../config/env.js';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => formatter.format(Math.max(0, value || 0));

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, loading, refreshCart } = useCart();
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleConfirmPayment = async () => {
    if (!cartItems?.length) {
      setStatusMessage({ type: 'error', text: 'Your cart is empty.' });
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage(null);
      const response = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentReference: paymentReference.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment');
      }

      setStatusMessage({ type: 'success', text: 'Payment confirmed! Your order is being processed.' });
      setPaymentReference('');
      setNotes('');
      await refreshCart();
      setTimeout(() => navigate('/MyOrder'), 1500);
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return null;
  }

  const qrPlaceholder = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=tererang@upi&pn=Tere%20Rang&cu=INR&mode=02';
  const resolveImage = (product) => {
    if (!product) return null;
    const source = product.image || (Array.isArray(product.images) ? product.images[0] : null);
    if (!source) return null;
    if (/^https?:/i.test(source)) return source;
    return imageUrl(source);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 shadow-2xl p-8">
          <p className="uppercase tracking-[0.35em] text-sm text-teal-300 mb-2">Checkout</p>
          <h1 className="text-4xl font-black mb-6">Complete Your Purchase</h1>
          <p className="text-gray-300 mb-8">
            Scan the QR code below using any UPI-enabled app. Once the payment is complete, share the reference ID so we can match it with your order.
          </p>

          <div className="bg-black/60 rounded-2xl p-6 flex flex-col items-center border border-teal-900/40">
            <div className="rounded-2xl bg-white p-4 mb-4 shadow-xl">
              <img src={qrPlaceholder} alt="UPI QR" className="h-48 w-48 object-contain" />
            </div>
            <p className="text-lg font-semibold">UPI ID: <span className="text-teal-300">tererang@upi</span></p>
            <p className="text-sm text-gray-400">Reference message: TERERANG + your name</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[{ icon: ShieldCheck, title: 'Secure checkout', body: 'UPI transaction validation' }, { icon: Smartphone, title: 'UPI ready', body: 'Works with all apps' }, { icon: Wallet, title: 'No hidden fees', body: 'Pay only what you see' }].map((card) => (
              <div key={card.title} className="bg-white/5 rounded-2xl border border-white/10 p-4 flex items-start gap-3">
                <card.icon size={20} className="text-teal-300 mt-1" />
                <div>
                  <p className="font-semibold">{card.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur rounded-3xl border border-white/10 shadow-2xl p-8 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

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
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Shipping</span>
                  <span className="text-teal-300">Free Express</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Payment reference / UPI transaction ID</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. UPI1234ABCD"
                  />
                </div>
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
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={submitting}
                className="mt-6 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-400 to-blue-500 text-black font-extrabold py-4 rounded-2xl shadow-[0_10px_40px_rgba(20,184,166,0.35)] hover:scale-[1.01] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={20} />}
                {submitting ? 'Confirming Payment...' : 'I have paid' }
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                Need help? <a href="/contact" className="text-teal-300 font-semibold">Chat with concierge</a>
              </p>
            </>
          ) : (
            <div className="text-center flex flex-col items-center justify-center flex-1">
              <p className="text-lg font-semibold mb-4">Your cart is empty.</p>
              <Link to="/shop" className="px-6 py-3 rounded-full bg-teal-500 text-black font-semibold">Browse collection</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Checkout;
