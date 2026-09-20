import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import {
  PAGE_SIZE,
  LOW_STOCK_THRESHOLD,
  formatCurrency,
  formatDate,
  titleCase,
  getPrimaryProductImage,
  getTotalStock,
} from './adminUtils.js';

export default function AdminProducts() {
  const {
    filteredProducts,
    productPage,
    setProductPage,
    searchQuery,
    setSearchQuery,
    openCreateProduct,
    openEditProduct,
    setDeleteDialog,
  } = useOutletContext();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setProductPage(1);
  };

  const paginatedProducts = filteredProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  return (
    <div className="admin-view-card surface">
      <div className="section-head product-catalog-head">
        <div className="section-title">
          <h2>Product Catalog ({filteredProducts.length})</h2>
          <p>Manage product listings, pricing, image sets, and size-specific stock.</p>
        </div>

        <div className="product-header-actions">
          <div className="product-search-box">
            <Search className="product-search-icon" size={15} />
            <input
              type="text"
              className="admin-input-pill product-search-input"
              placeholder="Search products by title, category, price..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                type="button"
                className="product-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setProductPage(1);
                }}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button type="button" className="primary-btn product-add-btn" onClick={openCreateProduct}>
            <Plus size={15} /> <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Total Stock</th>
              <th>Status</th>
              <th>Last Modified</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                  {searchQuery ? (
                    <div>
                      <p style={{ margin: '0 0 8px', fontWeight: 600 }}>No products matched "{searchQuery}"</p>
                      <button
                        type="button"
                        className="pill-btn"
                        style={{ height: 30, margin: 'auto', fontSize: 11 }}
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search filter
                      </button>
                    </div>
                  ) : (
                    'No products found in catalog.'
                  )}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((prod) => {
                const img = getPrimaryProductImage(prod);
                const total = getTotalStock(prod.sizeStock);
                let stockPill = <span className="status-pill">In stock</span>;
                if (!prod.inStock || total <= 0) {
                  stockPill = <span className="status-pill cancelled">Out of stock</span>;
                } else if (total <= LOW_STOCK_THRESHOLD) {
                  stockPill = <span className="status-pill processing">Low stock</span>;
                }

                return (
                  <tr key={prod._id}>
                    <td>
                      <div className="customer-cell">
                        <div className="thumb">
                          {img ? <img src={img} alt={prod.name} /> : <div className="avatar">TR</div>}
                        </div>
                        <div>
                          <strong>{prod.name}</strong>
                          <div style={{ fontSize: 9, color: 'var(--muted)' }}>
                            {titleCase(prod.category)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatCurrency(prod.price)}</td>
                    <td>
                      <strong>{total} units</strong>
                    </td>
                    <td>{stockPill}</td>
                    <td>{formatDate(prod.updatedAt || prod.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-action-btn"
                        title="Edit product"
                        onClick={() => openEditProduct(prod)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn danger"
                        title="Delete product"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: 'product',
                            id: prod._id,
                            label: prod.name,
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
        <span>Page {productPage} of {totalPages} ({filteredProducts.length} total)</span>
        <div className="pagination-nav">
          <button
            type="button"
            className="pill-btn pagination-btn"
            disabled={productPage <= 1}
            onClick={() => setProductPage(productPage - 1)}
          >
            <ChevronLeft size={14} /> <span>Prev</span>
          </button>
          <button
            type="button"
            className="pill-btn pagination-btn"
            disabled={productPage >= totalPages}
            onClick={() => setProductPage(productPage + 1)}
          >
            <span>Next</span> <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
