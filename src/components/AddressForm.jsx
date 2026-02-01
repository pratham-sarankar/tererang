import React, { useEffect, useMemo, useState } from 'react';

const defaultAddress = {
  label: 'Home',
  contactName: '',
  phoneNumber: '',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

const requiredFields = ['contactName', 'phoneNumber', 'line1', 'city', 'state', 'postalCode'];

const AddressForm = ({ initialValue, onSubmit, onCancel, submitting = false, submitLabel = 'Save address', variant = 'dark' }) => {
  const [values, setValues] = useState(defaultAddress);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues((prev) => ({ ...prev, ...defaultAddress, ...initialValue }));
  }, [initialValue]);

  const disableSubmit = useMemo(() => submitting, [submitting]);

  const validate = () => {
    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!values[field] || !String(values[field]).trim()) {
        nextErrors[field] = 'Required';
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(values);
  };

  const isDark = variant === 'dark';
  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const formClass = isDark
    ? 'bg-white/5 border-white/10 text-white'
    : 'bg-white border-gray-200 text-gray-900 shadow-sm';
  const inputBase = isDark
    ? 'border bg-black/30 border-white/10 text-white placeholder-gray-400'
    : 'border bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const secondaryButtonClass = isDark
    ? 'border-white/20 text-gray-200'
    : 'border-gray-300 text-gray-700';

  return (
    <form onSubmit={handleSubmit} className={`rounded-2xl border p-4 md:p-6 space-y-4 ${formClass}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`text-sm ${labelClass}`}>Label</label>
          <input
            type="text"
            name="label"
            value={values.label}
            onChange={handleChange}
            className={`mt-1 w-full rounded-xl px-3 py-2 ${inputBase}`}
            placeholder="Home, Studio, etc."
          />
        </div>
        <div>
          <label className={`text-sm ${labelClass}`}>Recipient name *</label>
          <input
            type="text"
            name="contactName"
            value={values.contactName}
            onChange={handleChange}
            className={`mt-1 w-full rounded-xl px-3 py-2 ${errors.contactName ? 'border border-red-500 bg-red-50 text-red-900' : inputBase}`}
            placeholder="Full name"
            required
          />
          {errors.contactName && <p className="text-xs text-red-400 mt-1">{errors.contactName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`text-sm ${labelClass}`}>Phone number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={values.phoneNumber}
            onChange={handleChange}
            inputMode="numeric"
            className={`mt-1 w-full rounded-xl px-3 py-2 ${errors.phoneNumber ? 'border border-red-500 bg-red-50 text-red-900' : inputBase}`}
            placeholder="10-digit"
            required
          />
          {errors.phoneNumber && <p className="text-xs text-red-400 mt-1">{errors.phoneNumber}</p>}
        </div>
        <div>
          <label className={`text-sm ${labelClass}`}>Postal code *</label>
          <input
            type="text"
            name="postalCode"
            value={values.postalCode}
            onChange={handleChange}
            inputMode="numeric"
            className={`mt-1 w-full rounded-xl px-3 py-2 ${errors.postalCode ? 'border border-red-500 bg-red-50 text-red-900' : inputBase}`}
            placeholder="e.g. 400001"
            required
          />
          {errors.postalCode && <p className="text-xs text-red-400 mt-1">{errors.postalCode}</p>}
        </div>
      </div>

      <div>
        <label className={`text-sm ${labelClass}`}>Address line 1 *</label>
        <input
          type="text"
          name="line1"
          value={values.line1}
          onChange={handleChange}
          className={`mt-1 w-full rounded-xl px-3 py-2 ${errors.line1 ? 'border border-red-500 bg-red-50 text-red-900' : inputBase}`}
          placeholder="House number, street"
          required
        />
        {errors.line1 && <p className="text-xs text-red-400 mt-1">{errors.line1}</p>}
      </div>

      <div>
        <label className={`text-sm ${labelClass}`}>Address line 2</label>
        <input
          type="text"
          name="line2"
          value={values.line2}
          onChange={handleChange}
          className={`mt-1 w-full rounded-xl px-3 py-2 ${inputBase}`}
          placeholder="Apartment, floor, etc."
        />
      </div>

      <div>
        <label className={`text-sm ${labelClass}`}>Landmark</label>
        <input
          type="text"
          name="landmark"
          value={values.landmark}
          onChange={handleChange}
          className={`mt-1 w-full rounded-xl px-3 py-2 ${inputBase}`}
          placeholder="Near..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={`text-sm ${labelClass}`}>City *</label>
          <input
            type="text"
            name="city"
            value={values.city}
            onChange={handleChange}
            className={`mt-1 w-full rounded-xl px-3 py-2 ${errors.city ? 'border border-red-500 bg-red-50 text-red-900' : inputBase}`}
            placeholder="City"
            required
          />
          {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className={`text-sm ${labelClass}`}>State *</label>
          <input
            type="text"
            name="state"
            value={values.state}
            onChange={handleChange}
            className={`mt-1 w-full rounded-xl px-3 py-2 ${errors.state ? 'border border-red-500 bg-red-50 text-red-900' : inputBase}`}
            placeholder="State"
            required
          />
          {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state}</p>}
        </div>
        <div>
          <label className={`text-sm ${labelClass}`}>Country *</label>
          <input
            type="text"
            name="country"
            value={values.country}
            onChange={handleChange}
            className={`mt-1 w-full rounded-xl px-3 py-2 ${errors.country ? 'border border-red-500 bg-red-50 text-red-900' : inputBase}`}
            placeholder="Country"
            required
          />
          {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
        </div>
      </div>

      <label className={`inline-flex items-center gap-2 text-sm ${labelClass}`}>
        <input
          type="checkbox"
          name="isDefault"
          checked={values.isDefault}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-[#b81582] focus:ring-[#b81582]"
        />
        Set as default shipping address
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={disableSubmit}
          className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-bold text-white disabled:opacity-50 hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-xl disabled:transform-none"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={disableSubmit}
            className={`rounded-full border px-5 py-3 text-sm font-bold ${secondaryButtonClass} hover:bg-gray-100 transition`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
