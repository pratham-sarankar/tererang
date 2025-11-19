import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import AddressForm from '../components/AddressForm.jsx';
import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress } from '../utils/addressApi.js';

const AddressBook = () => {
  const navigate = useNavigate();
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listAddresses();
      setAddresses(data);
      setFeedback(null);
      if (!data.length) {
        setShowForm(true);
      }
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadAddresses();
  }, [token, loadAddresses]);

  const resetForm = () => {
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      const data = editingAddress ? await updateAddress(editingAddress.id, payload) : await createAddress(payload);
      setAddresses(data);
      setFeedback({ type: 'success', text: editingAddress ? 'Address updated' : 'Address added' });
      resetForm();
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSaving(true);
      const data = await setDefaultAddress(addressId);
      setAddresses(data);
      setFeedback({ type: 'success', text: 'Default address updated' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    try {
      setDeletingId(addressId);
      const data = await deleteAddress(addressId);
      setAddresses(data);
      setFeedback({ type: 'success', text: 'Address removed' });
      if (!data.length) {
        setShowForm(true);
      }
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <p className="uppercase tracking-[0.35em] text-xs text-gray-500">Profile</p>
          <h1 className="text-4xl font-black text-gray-900 mt-3">Manage delivery addresses</h1>
          <p className="text-gray-500 mt-3">Save multiple addresses to breeze through checkout without retyping details.</p>
        </header>

        {feedback && (
          <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {feedback.text}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.3em]">Saved addresses</span>
            </div>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setShowForm((prev) => !prev);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-gray-400"
              >
                <Plus size={16} /> {showForm ? 'Hide form' : 'Add address'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center text-gray-400">
              <Loader2 className="mr-2 animate-spin" size={20} />
              Loading addresses...
            </div>
          ) : addresses.length ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{address.contactName}</p>
                      <span className="text-sm text-gray-500">{address.phoneNumber}</span>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700">
                          <Star size={12} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      {address.landmark ? `, ${address.landmark}` : ''}, {address.city}, {address.state} {address.postalCode}, {address.country}
                    </p>
                    {address.label && <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mt-1">{address.label}</p>}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(address);
                        setShowForm(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 hover:border-gray-400"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 hover:border-gray-400 disabled:opacity-50"
                      >
                        Make default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1.5 text-red-600 hover:border-red-200 disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              No addresses yet. Use the form below to add your first delivery location.
            </div>
          )}

          {showForm && (
            <div className="mt-8">
              <AddressForm
                variant="light"
                initialValue={editingAddress}
                onSubmit={handleSave}
                onCancel={addresses.length ? resetForm : undefined}
                submitting={saving}
                submitLabel={editingAddress ? 'Update address' : 'Save address'}
              />
            </div>
          )}

          {!showForm && !addresses.length && (
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setShowForm(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-gray-400"
            >
              <Plus size={16} /> Add address
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressBook;
