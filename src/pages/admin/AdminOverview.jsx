import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  formatCurrency,
  formatDate,
  titleCase,
  getTotalStock,
  getPrimaryProductImage,
} from './adminUtils.js';

export default function AdminOverview() {
  const navigate = useNavigate();
  const {
    orders,
    products,
    metrics,
    selectedPeriod,
    setSelectedPeriod,
    setRowMenuCoords,
    setRowMenuOpen,
  } = useOutletContext();

  const recentOrders = orders.slice(0, 5);
  const topProducts = products.slice(0, 5);

  return (
    <div id="overview">
      {/* Hero Section */}
      <section className="hero-overview reveal">
        <div className="revenue-hero">
          <div className="revenue-head">
            <div>
              <div className="eyebrow">Store performance</div>
            </div>
            <div className="period-tabs" id="periodTabs">
              {['7D', '30D', '90D', '1Y'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={selectedPeriod === tab ? 'active' : ''}
                  onClick={() => setSelectedPeriod(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="metric-big">
            <span className="value count">
              {formatCurrency(metrics.revenue)}
            </span>
            <span className="trend">
              <svg className="ico" style={{ width: 12 }}><use href="#i-trend" /></svg>
              12.4%
            </span>
          </div>
          <div className="metric-copy">Revenue this month · ₹92,580 above the previous period</div>
          <div className="hero-spark">
            <svg viewBox="0 0 700 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d4008a" stopOpacity=".18" />
                  <stop offset="1" stopColor="#d4008a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,41 C60,38 77,28 112,31 S168,39 210,25 279,28 319,18 378,23 425,13 490,21 535,9 610,16 700,3 L700,50 L0,50Z"
                fill="url(#sparkFill)"
              />
              <path
                d="M0,41 C60,38 77,28 112,31 S168,39 210,25 279,28 319,18 378,23 425,13 490,21 535,9 610,16 700,3"
                fill="none"
                stroke="#d4008a"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        <div className="mini-metrics">
          <div className="mini-metric">
            <div className="metric-label">Orders</div>
            <div className="metric-value count">{metrics.totalOrders.toLocaleString('en-IN')}</div>
            <div className="metric-foot">↑ 8.2% this month</div>
          </div>
          <div className="mini-metric">
            <div className="metric-label">Customers</div>
            <div className="metric-value count">{metrics.customers.toLocaleString('en-IN')}</div>
            <div className="metric-foot">↑ 6.8% this month</div>
          </div>
          <div className="mini-metric">
            <div className="metric-label">Conversion rate</div>
            <div className="metric-value">4.8%</div>
            <div className="metric-foot">↑ 0.6 pts</div>
          </div>
          <div className="mini-metric">
            <div className="metric-label">Avg. order value</div>
            <div className="metric-value">₹{metrics.aov.toLocaleString('en-IN')}</div>
            <div className="metric-foot neutral">₹140 above Aug</div>
          </div>
        </div>
      </section>

      {/* Main Grid: Performance Chart & Orders Donut */}
      <section className="grid-main" id="analytics">
        <div className="surface reveal">
          <div className="section-head">
            <div className="section-title">
              <h2>Sales performance</h2>
              <p>Revenue and previous-period comparison</p>
            </div>
            <select className="tiny-select">
              <option>Revenue</option>
              <option>Orders</option>
            </select>
          </div>
          <div className="analytics-body">
            <div className="chart-meta">
              <div>
                <strong>₹8.4L</strong>
                <div className="metric-foot">+12.4% vs previous period</div>
              </div>
              <div className="legend">
                <span><i style={{ background: '#d4008a' }} />Revenue</span>
                <span><i style={{ background: '#bbb0b8' }} />Previous</span>
              </div>
            </div>
            <svg className="revenue-chart" viewBox="0 0 760 250" role="img" aria-label="Revenue chart">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d4008a" stopOpacity=".18" />
                  <stop offset="1" stopColor="#d4008a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g>
                <line className="chart-grid" x1="45" y1="35" x2="742" y2="35" />
                <line className="chart-grid" x1="45" y1="88" x2="742" y2="88" />
                <line className="chart-grid" x1="45" y1="141" x2="742" y2="141" />
                <line className="chart-grid" x1="45" y1="194" x2="742" y2="194" />
                <text className="chart-label" x="4" y="38">₹9L</text>
                <text className="chart-label" x="4" y="91">₹7L</text>
                <text className="chart-label" x="4" y="144">₹5L</text>
                <text className="chart-label" x="4" y="197">₹3L</text>
              </g>
              <path
                className="chart-line-prev"
                d="M52 183 C94 177 122 170 150 166 S220 156 250 149 322 140 350 129 420 120 450 112 520 119 550 103 624 95 734 88"
              />
              <path
                className="chart-area"
                d="M52 172 C95 165 119 154 150 151 S220 140 250 137 320 121 350 114 420 96 450 88 520 72 550 76 624 65 734 39 L734 207 L52 207Z"
              />
              <path
                className="chart-line"
                d="M52 172 C95 165 119 154 150 151 S220 140 250 137 320 121 350 114 420 96 450 88 520 72 550 76 624 65 734 39"
              />
              <g>
                <circle className="chart-point" cx="52" cy="172" r="3" />
                <circle className="chart-point" cx="150" cy="151" r="3" />
                <circle className="chart-point" cx="250" cy="137" r="3" />
                <circle className="chart-point" cx="350" cy="114" r="3" />
                <circle className="chart-point" cx="450" cy="88" r="3" />
                <circle className="chart-point" cx="550" cy="76" r="3" />
                <circle className="chart-point" cx="642" cy="65" r="3" />
                <circle className="chart-point" cx="734" cy="39" r="4" />
              </g>
              <g className="chart-label">
                <text x="45" y="230">Jan</text>
                <text x="143" y="230">Feb</text>
                <text x="243" y="230">Mar</text>
                <text x="343" y="230">Apr</text>
                <text x="443" y="230">May</text>
                <text x="543" y="230">Jun</text>
                <text x="635" y="230">Jul</text>
                <text x="724" y="230">Aug</text>
              </g>
            </svg>
          </div>
        </div>

        <div className="surface orders-card reveal">
          <div className="section-head">
            <div className="section-title">
              <h2>Orders overview</h2>
              <p>{metrics.totalOrders} orders this month</p>
            </div>
            <button type="button" className="more-btn" onClick={() => navigate('/admin/dashboard/orders')}>
              <svg className="ico"><use href="#i-more" /></svg>
            </button>
          </div>
          <div className="orders-body">
            <div className="donut-wrap">
              <div className="donut">
                <div className="donut-center">
                  <strong>{metrics.totalOrders}</strong>
                  <span>Total orders</span>
                </div>
              </div>
              <div className="status-list">
                <div className="status-row">
                  <i style={{ background: '#d4008a' }} />
                  <span>Completed</span>
                  <b>{metrics.completed}</b>
                </div>
                <div className="status-row">
                  <i style={{ background: '#25a9e0' }} />
                  <span>Shipped</span>
                  <b>{metrics.shipped}</b>
                </div>
                <div className="status-row">
                  <i style={{ background: '#b87410' }} />
                  <span>Processing</span>
                  <b>{metrics.processing}</b>
                </div>
                <div className="status-row">
                  <i style={{ background: '#ded5db' }} />
                  <span>Cancelled</span>
                  <b>{metrics.cancelled}</b>
                </div>
              </div>
            </div>
            <div className="order-note">
              <span>Fulfilment rate</span>
              <strong>{metrics.fulfillmentRate}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section: Recent Orders & Top Products */}
      <section className="split" id="orders">
        <div className="surface reveal">
          <div className="section-head">
            <div className="section-title">
              <h2>Recent orders</h2>
              <p>Latest purchases across your storefront</p>
            </div>
            <button
              type="button"
              className="pill-btn"
              style={{ height: 32 }}
              onClick={() => navigate('/admin/dashboard/orders')}
            >
              View all <svg className="ico" style={{ width: 12 }}><use href="#i-chevron" /></svg>
            </button>
          </div>
          <div className="table-wrap">
            <table className="orders-table" id="ordersTable">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const firstItem = order.items?.[0]?.name || 'Fashion Apparel';
                    const custName = order.user?.name || 'Customer';
                    const initials = custName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'TR';

                    return (
                      <tr key={order.id}>
                        <td className="order-id">#{String(order.id).slice(-8)}</td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">{initials}</div>
                            {custName}
                          </div>
                        </td>
                        <td>{firstItem}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{formatCurrency(order.grandTotal || order.subtotal)}</td>
                        <td className={`payment ${order.paymentStatus === 'paid' ? '' : 'pending'}`}>
                          {titleCase(order.paymentStatus)}
                        </td>
                        <td>
                          <span className={`status-pill ${order.status}`}>
                            {titleCase(order.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="more-btn row-menu"
                            onClick={(e) => {
                              e.stopPropagation();
                              const r = e.currentTarget.getBoundingClientRect();
                              setRowMenuCoords({ top: r.bottom + 6, left: Math.max(12, r.right - 190) });
                              setRowMenuOpen(order.id);
                            }}
                          >
                            <svg className="ico"><use href="#i-more" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface reveal" id="products">
          <div className="section-head">
            <div className="section-title">
              <h2>Top products</h2>
              <p>Best sellers by revenue</p>
            </div>
            <button type="button" className="more-btn" onClick={() => navigate('/admin/dashboard/products')}>
              <svg className="ico"><use href="#i-more" /></svg>
            </button>
          </div>
          <div className="product-list">
            {topProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>
                No products added yet.
              </div>
            ) : (
              topProducts.map((prod, idx) => {
                const img = getPrimaryProductImage(prod);
                return (
                  <div className="product-row" key={prod._id || idx}>
                    <div className="thumb">
                      {img ? (
                        <img src={img} alt={prod.name} />
                      ) : (
                        <svg viewBox="0 0 52 64">
                          <rect width="52" height="64" fill="#ead7df" />
                          <path d="M16 9 22 5l6 4 6-4 6 4-5 9-4-2v27H17V16l-4 2-5-9 6-4 2 4Z" fill="#8a0b72" opacity=".88" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="product-name">{prod.name}</div>
                      <div className="product-cat">{titleCase(prod.category)}</div>
                    </div>
                    <div className="product-stat">
                      <strong>{formatCurrency(prod.price)}</strong>
                      <span>{getTotalStock(prod.sizeStock)} in stock</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Triple Section: Inventory, Customer Insights, Sales by Category */}
      <section className="triple">
        {/* Inventory status */}
        <div className="surface reveal" id="inventory">
          <div className="section-head">
            <div className="section-title">
              <h2>Inventory status</h2>
              <p>{products.length} active SKUs</p>
            </div>
            <svg className="ico" style={{ color: 'var(--muted)' }}><use href="#i-layers" /></svg>
          </div>
          <div className="widget-body">
            <div className="stock-stats">
              <div className="stock-stat">
                <span>In stock</span>
                <strong>{products.length - metrics.lowStock - metrics.outOfStock}</strong>
              </div>
              <div className="stock-stat">
                <span>Low stock</span>
                <strong>{metrics.lowStock}</strong>
              </div>
              <div className="stock-stat">
                <span>Out of stock</span>
                <strong>{metrics.outOfStock}</strong>
              </div>
            </div>
            <div className="inventory-bar" />
            <div className="warning-banner">{metrics.lowStock} products require attention today</div>
            <div className="low-item">
              <b>Leather Tote · Tan</b>
              <span>4 left</span>
            </div>
            <div className="low-item">
              <b>Ivory Cotton Dress</b>
              <span>6 left</span>
            </div>
            <div className="low-item">
              <b>Embroidered Kurta · M</b>
              <span>8 left</span>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="surface reveal" id="customers">
          <div className="section-head">
            <div className="section-title">
              <h2>Customer insights</h2>
              <p>Audience quality & retention</p>
            </div>
            <svg className="ico" style={{ color: 'var(--muted)' }}><use href="#i-users" /></svg>
          </div>
          <div className="widget-body">
            <div className="customer-grid">
              <div className="customer-kpi"><span>New</span><strong>1,284</strong></div>
              <div className="customer-kpi"><span>Returning</span><strong>2,563</strong></div>
              <div className="customer-kpi"><span>Retention</span><strong>66.7%</strong></div>
              <div className="customer-kpi"><span>AOV</span><strong>₹{metrics.aov}</strong></div>
            </div>
            <div className="customer-split">
              <div className="bar-pair"><i style={{ height: '35%' }} /><i style={{ height: '55%' }} /></div>
              <div className="bar-pair"><i style={{ height: '47%' }} /><i style={{ height: '62%' }} /></div>
              <div className="bar-pair"><i style={{ height: '42%' }} /><i style={{ height: '68%' }} /></div>
              <div className="bar-pair"><i style={{ height: '53%' }} /><i style={{ height: '72%' }} /></div>
              <div className="bar-pair"><i style={{ height: '48%' }} /><i style={{ height: '71%' }} /></div>
              <div className="bar-pair"><i style={{ height: '59%' }} /><i style={{ height: '79%' }} /></div>
              <div className="bar-pair"><i style={{ height: '55%' }} /><i style={{ height: '84%' }} /></div>
              <div className="bar-pair"><i style={{ height: '64%' }} /><i style={{ height: '88%' }} /></div>
              <div className="bar-pair"><i style={{ height: '61%' }} /><i style={{ height: '91%' }} /></div>
              <div className="bar-pair"><i style={{ height: '67%' }} /><i style={{ height: '95%' }} /></div>
            </div>
            <div className="customer-legend">
              <span>New customers</span>
              <span style={{ color: 'var(--pink)' }}>Returning</span>
            </div>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="surface reveal">
          <div className="section-head">
            <div className="section-title">
              <h2>Sales by category</h2>
              <p>Share of this month’s revenue</p>
            </div>
            <svg className="ico" style={{ color: 'var(--muted)' }}><use href="#i-chart" /></svg>
          </div>
          <div className="widget-body">
            <div className="category-list">
              <div className="category-row">
                <span>Women</span>
                <div className="category-track"><i style={{ width: '42%' }} /></div>
                <b>42%</b>
              </div>
              <div className="category-row">
                <span>Men</span>
                <div className="category-track"><i style={{ width: '34%' }} /></div>
                <b>34%</b>
              </div>
              <div className="category-row">
                <span>Accessories</span>
                <div className="category-track"><i style={{ width: '17%' }} /></div>
                <b>17%</b>
              </div>
              <div className="category-row">
                <span>Others</span>
                <div className="category-track"><i style={{ width: '7%' }} /></div>
                <b>7%</b>
              </div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 15, borderTop: '1px solid var(--line2)', fontSize: 9, color: 'var(--muted)' }}>
              Women’s edit contributed <b style={{ color: 'var(--ink)' }}>₹3.54L</b> this period.
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Grid: Live Store Activity & Insight Panel */}
      <section className="bottom-grid">
        <div className="surface reveal">
          <div className="section-head">
            <div className="section-title">
              <h2>Live store activity</h2>
              <p>Recent customer and operations events</p>
            </div>
            <span style={{ fontSize: 8, color: 'var(--green)', fontWeight: 700 }}>● LIVE</span>
          </div>
          <div className="activity">
            <div className="activity-item">
              <div className="activity-icon"><svg className="ico"><use href="#i-bag" /></svg></div>
              <div>
                <strong>New order #ORD-10248 received</strong>
                <span>Aarav Sharma · ₹4,899</span>
              </div>
              <div className="activity-time">2 min ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><svg className="ico"><use href="#i-layers" /></svg></div>
              <div>
                <strong>Inventory updated for Classic Linen Shirt</strong>
                <span>Stock changed from 28 to 42</span>
              </div>
              <div className="activity-time">12 min ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><svg className="ico"><use href="#i-users" /></svg></div>
              <div>
                <strong>Ananya Patel created an account</strong>
                <span>Acquired from organic search</span>
              </div>
              <div className="activity-time">24 min ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><svg className="ico"><use href="#i-trend" /></svg></div>
              <div>
                <strong>Payment of ₹8,499 received</strong>
                <span>Order #ORD-10247 · UPI</span>
              </div>
              <div className="activity-time">41 min ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{ color: 'var(--amber)', background: '#fff7e8' }}>
                <svg className="ico"><use href="#i-box" /></svg>
              </div>
              <div>
                <strong>Leather Tote is running low on stock</strong>
                <span>Tan variant has 4 units remaining</span>
              </div>
              <div className="activity-time">1 hr ago</div>
            </div>
          </div>
        </div>

        <div className="insight-panel reveal">
          <div className="insight-inner">
            <div className="eyebrow">Today’s pulse</div>
            <h3>Your store is converting <em>better</em> than last month.</h3>
            <p>
              Returning customers are driving the lift: they represent two-thirds of active buyers and are spending 11.8% more per order.
            </p>
            <div className="insight-number">
              <div>
                <strong>+18.2%</strong>
                <span>Repeat revenue</span>
              </div>
              <div>
                <strong>3.1x</strong>
                <span>Customer LTV / CAC</span>
              </div>
              <div>
                <strong>92.6%</strong>
                <span>Fulfilment</span>
              </div>
            </div>
            <button
              type="button"
              className="text-link"
              style={{ background: 'transparent', border: 0, padding: 0 }}
              onClick={() => navigate('/admin/dashboard/analytics')}
            >
              Explore analytics <svg className="ico" style={{ width: 12 }}><use href="#i-chevron" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
