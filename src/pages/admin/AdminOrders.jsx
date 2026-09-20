import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Eye,
  CheckCircle2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ORDER_STATUSES,
  PAGE_SIZE,
  formatCurrency,
  formatDate,
  titleCase,
} from './adminUtils.js';

export default function AdminOrders() {
  const {
    filteredOrders,
    orderPage,
    setOrderPage,
    fetchOrders,
    orderLoading,
    searchQuery,
    setSearchQuery,
    orderStatusFilter,
    setOrderStatusFilter,
    orderStartDate,
    setOrderStartDate,
    orderEndDate,
    setOrderEndDate,
    openOrderSheet,
    triggerOrderAction,
    orderActionState,
    setDeleteDialog,
  } = useOutletContext();

  const paginatedOrders = filteredOrders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  return (
    <div className="admin-view-card surface">
      <div className="section-head">
        <div className="section-title">
          <h2>All Orders ({filteredOrders.length})</h2>
          <p>Manage fulfillment, customer tracking, and order statuses.</p>
        </div>
        <button type="button" className="pill-btn" onClick={fetchOrders} disabled={orderLoading}>
          <Loader2 className={`h-3.5 w-3.5 ${orderLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="admin-filter-bar">
        <input
          className="admin-input-pill"
          style={{ width: 280 }}
          placeholder="Search by order ID, customer, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="admin-select-pill"
          value={orderStatusFilter}
          onChange={(e) => setOrderStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
        <input
          type="date"
          className="admin-input-pill"
          value={orderStartDate}
          onChange={(e) => setOrderStartDate(e.target.value)}
          title="Start date"
        />
        <input
          type="date"
          className="admin-input-pill"
          value={orderEndDate}
          onChange={(e) => setOrderEndDate(e.target.value)}
          title="End date"
        />
      </div>

      <div className="table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date Placed</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                  No matching orders found.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const custName = order.user?.name || 'Guest Customer';
                const initials = custName.slice(0, 2).toUpperCase();
                return (
                  <tr key={order.id}>
                    <td className="order-id">#{String(order.id).slice(-8)}</td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">{initials}</div>
                        <div>
                          <strong>{custName}</strong>
                          <div style={{ fontSize: 9, color: 'var(--muted)' }}>
                            {order.user?.phoneNumber || order.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatCurrency(order.grandTotal || order.subtotal)}</td>
                    <td>
                      <span className={`payment ${order.paymentStatus === 'paid' ? '' : 'pending'}`}>
                        {titleCase(order.paymentStatus)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${order.status}`}>
                        {titleCase(order.status)}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-action-btn"
                        title="View order details"
                        onClick={() => openOrderSheet(order)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn"
                        title="Confirm order"
                        disabled={['confirmed', 'completed', 'cancelled'].includes(order.status) || orderActionState?.id === order.id}
                        onClick={() => triggerOrderAction(order.id, 'confirm')}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn danger"
                        title="Delete record"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: 'order',
                            id: order.id,
                            label: `Order #${String(order.id).slice(-8)}`,
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <span>Page {orderPage} of {totalPages} ({filteredOrders.length} total)</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="pill-btn"
            style={{ height: 32 }}
            disabled={orderPage <= 1}
            onClick={() => setOrderPage(orderPage - 1)}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            type="button"
            className="pill-btn"
            style={{ height: 32 }}
            disabled={orderPage >= totalPages}
            onClick={() => setOrderPage(orderPage + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
