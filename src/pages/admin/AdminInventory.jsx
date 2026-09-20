import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PAGE_SIZE,
  LOW_STOCK_THRESHOLD,
  titleCase,
  getPrimaryProductImage,
  getTotalStock,
} from './adminUtils.js';

export default function AdminInventory() {
  const {
    filteredProducts,
    inventoryPage,
    setInventoryPage,
    searchQuery,
    setSearchQuery,
    openEditProduct,
  } = useOutletContext();

  const paginated = filteredProducts.slice((inventoryPage - 1) * PAGE_SIZE, inventoryPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  return (
    <div className="admin-view-card surface">
      <div className="section-head">
        <div className="section-title">
          <h2>Inventory Health & Sizes</h2>
          <p>Track real-time quantities allocated per size variant across your collection.</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <input
          className="admin-input-pill"
          style={{ width: 300 }}
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Stock</th>
              <th>Size Variants</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Quick Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                  No inventory records found.
                </td>
              </tr>
            ) : (
              paginated.map((prod) => {
                const total = getTotalStock(prod.sizeStock);
                return (
                  <tr key={prod._id}>
                    <td>
                      <div className="customer-cell">
                        <div className="thumb">
                          {getPrimaryProductImage(prod) ? (
                            <img src={getPrimaryProductImage(prod)} alt={prod.name} />
                          ) : (
                            <div className="avatar">TR</div>
                          )}
                        </div>
                        <div>
                          <strong>{prod.name}</strong>
                          <div style={{ fontSize: 9, color: 'var(--muted)' }}>{titleCase(prod.category)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{total}</strong> units
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(prod.sizeStock || []).map((s) => (
                          <span
                            key={s.size}
                            style={{
                              background: '#f8eff4',
                              border: '1px solid var(--line)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9px',
                            }}
                          >
                            {s.size}: <b>{s.quantity}</b>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {total <= 0 ? (
                        <span className="status-pill cancelled">Depleted</span>
                      ) : total <= LOW_STOCK_THRESHOLD ? (
                        <span className="status-pill processing">Critical Low</span>
                      ) : (
                        <span className="status-pill">Healthy</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="pill-btn"
                        style={{ height: 28, fontSize: 10 }}
                        onClick={() => openEditProduct(prod)}
                      >
                        Adjust Stock
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
        <span>Page {inventoryPage} of {totalPages}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="pill-btn"
            style={{ height: 32 }}
            disabled={inventoryPage <= 1}
            onClick={() => setInventoryPage(inventoryPage - 1)}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            type="button"
            className="pill-btn"
            style={{ height: 32 }}
            disabled={inventoryPage >= totalPages}
            onClick={() => setInventoryPage(inventoryPage + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
