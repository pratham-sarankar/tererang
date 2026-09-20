import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const {
    settings,
    setSettings,
    saveSettings,
    settingsSaving,
  } = useOutletContext();

  return (
    <form onSubmit={saveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
      <div className="surface" style={{ padding: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Storewide Promotion</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20, margin: '0 0 16px' }}>
          Global Discount
        </h2>
        <div className="admin-form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.globalDiscountEnabled}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, globalDiscountEnabled: e.target.checked }))
              }
            />
            <span>Enable Global Promotional Display</span>
          </label>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
            Displays striking discounted pricing across the storefront while preserving database rates.
          </p>
        </div>
        <div className="admin-form-group">
          <label>Discount Percentage (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="admin-form-input"
            value={settings.globalDiscountPercentage}
            disabled={!settings.globalDiscountEnabled}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                globalDiscountPercentage: Number(e.target.value) || 0,
              }))
            }
          />
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 14, borderRadius: 8, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Sample Product Base:</span>
            <strong>₹1,000</strong>
          </div>
          {settings.globalDiscountEnabled && settings.globalDiscountPercentage > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pink)' }}>
              <span>Shown Crossed Price:</span>
              <strong>
                ₹{Math.round(1000 / (1 - Number(settings.globalDiscountPercentage) / 100))}
              </strong>
            </div>
          )}
        </div>
      </div>

      <div className="surface" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Announcement Header</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20, margin: '0 0 16px' }}>
          Promotional Banner
        </h2>
        <div className="admin-form-group">
          <label>Banner Text Message</label>
          <input
            className="admin-form-input"
            value={settings.promotionalText || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, promotionalText: e.target.value }))
            }
            placeholder="FREE DELIVERY ABOVE ₹999"
          />
        </div>
        <div
          style={{
            background: 'var(--ink)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '.1em',
            textAlign: 'center',
            textTransform: 'uppercase',
            marginTop: 'auto',
          }}
        >
          {settings.promotionalText || 'FREE DELIVERY ON ALL ORDERS TODAY'}
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button type="submit" className="primary-btn" disabled={settingsSaving}>
            {settingsSaving ? <Loader2 size={14} className="animate-spin" /> : null}
            Save Storefront Settings
          </button>
        </div>
      </div>
    </form>
  );
}
