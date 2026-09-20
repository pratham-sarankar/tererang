import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AdminCustomers() {
  const { metrics } = useOutletContext();

  return (
    <div className="surface" style={{ padding: 24 }}>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, margin: '0 0 12px' }}>Customer Insights & Database</h2>
      <p style={{ color: 'var(--muted)', fontSize: 12 }}>3,847 registered shoppers across India. 66.7% repeat order rate.</p>
      <div style={{ marginTop: 20 }}>
        <div className="customer-grid">
          <div className="customer-kpi"><span>Total Profiles</span><strong>{metrics.customers}</strong></div>
          <div className="customer-kpi"><span>Repeat Buyers</span><strong>2,563</strong></div>
          <div className="customer-kpi"><span>Average LTV</span><strong>₹12,450</strong></div>
          <div className="customer-kpi"><span>NPS Score</span><strong>4.9 / 5</strong></div>
        </div>
      </div>
    </div>
  );
}
