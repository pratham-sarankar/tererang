import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Package,
  Layers,
  Image as ImageIcon,
  UploadCloud,
  ExternalLink,
  LayoutGrid,
  List,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { apiUrl } from '../../config/env.js';
import { formatDate } from './adminUtils.js';
import '../../css/AdminCategories.css';

export default function AdminCategories() {
  const { pushToast, fetchProducts } = useOutletContext();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = create mode
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // File input ref
  const fileInputRef = useRef(null);

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/categories'));
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      if (pushToast) {
        pushToast({ type: 'error', message: 'Failed to load categories.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        (cat.title && cat.title.toLowerCase().includes(q)) ||
        (cat.slug && cat.slug.toLowerCase().includes(q)) ||
        (cat.description && cat.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Total products stats
  const totalProducts = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  }, [categories]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ title: '', slug: '', description: '' });
    setSelectedFile(null);
    setFilePreview('');
    setFormError('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title || category.name || '',
      slug: category.slug || '',
      description: category.description || '',
    });
    setSelectedFile(null);
    setFilePreview(category.coverImage || '');
    setFormError('');
    setModalOpen(true);
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit.');
      return;
    }

    setFormError('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  // Auto-slugify title if slug not manually typed
  const handleTitleChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingCategory ? autoSlug : prev.slug,
    }));
  };

  // Save (Create or Update) Category
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Category title is required.');
      return;
    }

    if (!editingCategory && !selectedFile) {
      setFormError('Cover image is required when creating a category.');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setFormError('Authentication required. Please login again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      if (formData.slug.trim()) payload.append('slug', formData.slug.trim());
      payload.append('description', formData.description.trim());

      if (selectedFile) {
        payload.append('coverImage', selectedFile);
      }

      const endpoint = editingCategory
        ? apiUrl(`/api/categories/${editingCategory._id}`)
        : apiUrl('/api/categories');

      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      if (pushToast) {
        pushToast({
          type: 'success',
          message: editingCategory
            ? `Category "${formData.title}" updated successfully.`
            : `Category "${formData.title}" created successfully.`,
        });
      }

      setModalOpen(false);
      fetchCategories();
      if (fetchProducts) fetchProducts();
    } catch (err) {
      console.error('Category save error:', err);
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      if (pushToast) pushToast({ type: 'error', message: 'Authentication required.' });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/categories/${categoryToDelete._id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      if (pushToast) {
        pushToast({
          type: 'success',
          message: `Category "${categoryToDelete.title || categoryToDelete.name}" and its cover image were deleted from cloud storage.`,
        });
      }

      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
      if (fetchProducts) fetchProducts();
    } catch (err) {
      console.error('Delete category error:', err);
      if (pushToast) {
        pushToast({ type: 'error', message: err.message || 'Failed to delete category.' });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick navigation to view products in this category
  const handleViewProducts = (cat) => {
    const term = cat.slug || cat.title || cat.name;
    navigate(`/admin/dashboard/products?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="admin-categories-wrap">
      {/* Category Stats Overview */}
      <div className="category-stats-row">
        <div className="category-stat-card">
          <div className="category-stat-icon">
            <Layers size={22} />
          </div>
          <div className="category-stat-info">
            <h4>Total Categories</h4>
            <div className="stat-val">{categories.length}</div>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="category-stat-icon icon-blue">
            <Package size={22} />
          </div>
          <div className="category-stat-info">
            <h4>Total Catalog Products</h4>
            <div className="stat-val">{totalProducts}</div>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="category-stat-icon icon-green">
            <CheckCircle size={22} />
          </div>
          <div className="category-stat-info">
            <h4>Active Collections</h4>
            <div className="stat-val">{categories.filter((c) => (c.productCount || 0) > 0).length}</div>
          </div>
        </div>
      </div>

      {/* Main Catalog View Card */}
      <div className="admin-view-card surface">
        <div className="section-head product-catalog-head">
          <div className="section-title">
            <h2>Category Management ({categories.length})</h2>
            <p>Create and customize store collections with cloud-hosted cover photos and live product tracking.</p>
          </div>

          <div className="product-header-actions">
            {/* Search Bar */}
            <div className="product-search-box">
              <Search className="product-search-icon" size={15} />
              <input
                type="text"
                className="admin-input-pill product-search-input"
                placeholder="Search categories by title, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="product-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="category-view-toggle">
              <button
                type="button"
                className={`category-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                className={`category-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table view"
              >
                <List size={15} />
              </button>
            </div>

            {/* Add Category Button */}
            <button type="button" className="primary-btn product-add-btn" onClick={handleOpenCreate}>
              <Plus size={15} /> <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            <Loader2 size={32} className="spin" style={{ margin: 'auto', marginBottom: 12 }} />
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            <Layers size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            {searchQuery ? (
              <>
                <p style={{ fontWeight: 600, color: 'var(--ink)' }}>No categories match "{searchQuery}"</p>
                <button
                  type="button"
                  className="pill-btn"
                  style={{ height: 32, margin: '10px auto' }}
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, color: 'var(--ink)' }}>No categories found in store.</p>
                <button
                  type="button"
                  className="primary-btn"
                  style={{ margin: '14px auto' }}
                  onClick={handleOpenCreate}
                >
                  <Plus size={14} /> Add First Category
                </button>
              </>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="category-grid" style={{ padding: '20px 0' }}>
            {filteredCategories.map((cat) => {
              const displayTitle = cat.title || cat.name;
              const productCount = cat.productCount || 0;

              return (
                <div key={cat._id} className="category-card">
                  <div className="category-cover-wrap">
                    {cat.coverImage ? (
                      <img
                        src={cat.coverImage}
                        alt={displayTitle}
                        className="category-cover-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--muted)',
                        }}
                      >
                        <ImageIcon size={32} style={{ opacity: 0.4 }} />
                      </div>
                    )}
                    <div className="category-cover-overlay">
                      <span className={`category-product-badge ${productCount > 0 ? 'has-products' : ''}`}>
                        <Package size={12} /> {productCount} {productCount === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                  </div>

                  <div className="category-card-body">
                    <div className="category-card-head">
                      <h3 className="category-card-title">{displayTitle}</h3>
                      <span className="category-card-slug">{cat.slug}</span>
                    </div>

                    <p className="category-card-desc">
                      {cat.description || 'No description provided for this category.'}
                    </p>

                    <div className="category-card-footer">
                      <button
                        type="button"
                        className="category-view-products-link"
                        onClick={() => handleViewProducts(cat)}
                        title="View products in this category"
                      >
                        <span>View Products</span>
                        <ExternalLink size={12} />
                      </button>

                      <div className="category-card-actions">
                        <button
                          type="button"
                          className="action-btn"
                          title="Edit Category"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="action-btn danger"
                          title="Delete Category & Cover Image"
                          onClick={() => handleOpenDelete(cat)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Cover</th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const displayTitle = cat.title || cat.name;
                  const productCount = cat.productCount || 0;

                  return (
                    <tr key={cat._id}>
                      <td>
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 8,
                            overflow: 'hidden',
                            background: '#f0eaf2',
                          }}
                        >
                          <img
                            src={cat.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200'}
                            alt={displayTitle}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--ink)' }}>{displayTitle}</strong>
                      </td>
                      <td>
                        <span className="category-card-slug">{cat.slug}</span>
                      </td>
                      <td style={{ maxWidth: 260, color: 'var(--muted)', fontSize: 12 }}>
                        <span
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {cat.description || '--'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${productCount > 0 ? 'paid' : ''}`}>
                          <Package size={12} style={{ marginRight: 4, display: 'inline' }} />
                          {productCount} {productCount === 1 ? 'product' : 'products'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {formatDate(cat.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="action-btn"
                            title="Edit category"
                            onClick={() => handleOpenEdit(cat)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-btn danger"
                            title="Delete category"
                            onClick={() => handleOpenDelete(cat)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="category-modal-overlay" onClick={() => !isSubmitting && setModalOpen(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="category-modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Create Custom Category'}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => !isSubmitting && setModalOpen(false)}
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="category-modal-body">
                {formError && (
                  <div className="category-danger-box">
                    <AlertTriangle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Title */}
                <div className="admin-form-group">
                  <label htmlFor="cat-title">
                    Category Title <span className="req-star">*</span>
                  </label>
                  <input
                    id="cat-title"
                    type="text"
                    required
                    className="admin-form-input"
                    placeholder="e.g., Anarkali Suits, Silk Sarees"
                    value={formData.title}
                    onChange={handleTitleChange}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Slug */}
                <div className="admin-form-group">
                  <label htmlFor="cat-slug">
                    Category Identifier (Slug)
                  </label>
                  <input
                    id="cat-slug"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g., anarkali-suits"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    Unique URL-safe key used to assign products to this category.
                  </span>
                </div>

                {/* Description */}
                <div className="admin-form-group">
                  <label htmlFor="cat-desc">Description</label>
                  <textarea
                    id="cat-desc"
                    rows={3}
                    className="admin-form-textarea"
                    placeholder="Describe the fabric, styling, or seasonal story for this collection..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="admin-form-group">
                  <label>
                    Cover Image <span className="req-star">{!editingCategory ? '*' : ''}</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  {filePreview ? (
                    <div className="category-image-preview-wrap">
                      <img src={filePreview} alt="Cover Preview" className="category-image-preview" />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          display: 'flex',
                          gap: 6,
                        }}
                      >
                        <button
                          type="button"
                          className="category-change-image-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          <UploadCloud size={13} /> Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="category-image-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="category-dropzone-empty">
                        <UploadCloud size={30} className="category-dropzone-icon" />
                        <strong>Click or drag to upload category cover image</strong>
                        <span className="category-dropzone-hint">
                          PNG, JPG, or WebP up to 5MB. Stored in Google Cloud Storage.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="category-modal-footer">
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      <span>Uploading to Cloud...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && categoryToDelete && (
        <div className="category-modal-overlay" onClick={() => !isDeleting && setDeleteDialogOpen(false)}>
          <div className="category-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="category-modal-header">
              <h3 style={{ color: 'var(--red)' }}>Delete Category</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => !isDeleting && setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                <X size={16} />
              </button>
            </div>

            <div className="category-modal-body">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {categoryToDelete.coverImage && (
                  <img
                    src={categoryToDelete.coverImage}
                    alt={categoryToDelete.title}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      objectFit: 'cover',
                      border: '1px solid var(--line)',
                    }}
                  />
                )}
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--ink)' }}>
                    {categoryToDelete.title || categoryToDelete.name}
                  </h4>
                  <span className="category-card-slug">{categoryToDelete.slug}</span>
                </div>
              </div>

              <div className="category-danger-box">
                <AlertTriangle size={18} />
                <div>
                  <strong>Cover image will be deleted from Cloud Storage.</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              {(categoryToDelete.productCount || 0) > 0 && (
                <div
                  style={{
                    background: 'rgba(184, 116, 16, 0.08)',
                    border: '1px solid rgba(184, 116, 16, 0.25)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 12,
                    color: 'var(--amber)',
                  }}
                >
                  Notice: There are <strong>{categoryToDelete.productCount}</strong> product(s) assigned to this category. Deleting it will leave those products with this tag unassociated.
                </div>
              )}
            </div>

            <div className="category-modal-footer">
              <button
                type="button"
                className="pill-btn"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    <span>Deleting from Storage...</span>
                  </>
                ) : (
                  <span>Delete Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
