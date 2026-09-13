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
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <p className="uppercase tracking-[0.35em] text-xs text-accent">profile</p>
          <h1 className="text-4xl font-serif lowercase text-foreground mt-3">manage delivery addresses</h1>
          <p className="text-muted-foreground mt-3">Save multiple addresses to breeze through checkout without retyping details.</p>
        </header>

        {feedback && (
          <div className={`mb-4 rounded-sm border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-destructive' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {feedback.text}
          </div>
        )}

        <div className="bg-card rounded-sm border border-border shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={18} />
              <span className="text-xs font-medium uppercase tracking-[0.3em]">Saved addresses</span>
            </div>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setShowForm((prev) => !prev);
                }}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-foreground hover:border-primary hover:text-primary transition"
              >
                <Plus size={16} /> {showForm ? 'Hide form' : 'Add address'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 animate-spin" size={20} />
              Loading addresses...
            </div>
          ) : addresses.length ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-sm border border-border bg-card p-5 flex flex-col gap-3 md:flex-row md:items-center shadow-sm">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{address.contactName}</p>
                      <span className="text-sm text-muted-foreground">{address.phoneNumber}</span>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                          <Star size={12} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      {address.landmark ? `, ${address.landmark}` : ''}, {address.city}, {address.state} {address.postalCode}, {address.country}
                    </p>
                    {address.label && <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">{address.label}</p>}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(address);
                        setShowForm(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-foreground hover:border-primary hover:text-primary transition"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-foreground hover:border-primary hover:text-primary transition disabled:opacity-50"
                      >
                        Make default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="inline-flex items-center gap-1 rounded-sm border border-red-100 px-3 py-1.5 text-destructive hover:border-red-200 disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-border bg-secondary p-8 text-center text-muted-foreground">
              No addresses saved. Use the form below to add your first delivery location.
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
              className="mt-6 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-foreground hover:border-primary hover:text-primary transition"
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
