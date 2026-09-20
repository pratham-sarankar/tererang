import React from 'react';

export default function AdminAnalytics() {
  return (
    <div className="surface" style={{ padding: 24 }}>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, margin: '0 0 12px' }}>Detailed Store Analytics</h2>
      <p style={{ color: 'var(--muted)', fontSize: 12 }}>Comprehensive revenue breakdown by channel, payment gateway, and region.</p>
      <div style={{ marginTop: 20 }}>
        <div className="stock-stats">
          <div className="stock-stat"><span>UPI Revenue</span><strong>68%</strong></div>
          <div className="stock-stat"><span>Razorpay Card</span><strong>24%</strong></div>
          <div className="stock-stat"><span>Cash on Delivery</span><strong>8%</strong></div>
        </div>
      </div>
    </div>
  );
}
