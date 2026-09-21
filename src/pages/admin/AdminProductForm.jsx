import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Trash2,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Loader2,
  Package,
  Sparkles,
  Tag,
  Layers,
  Eye,
  X,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';
import { apiUrl } from '../../config/env.js';
import {
  PRODUCT_CATEGORIES,
  DEFAULT_SIZE_OPTIONS,
  formatCurrency,
  titleCase,
  getPrimaryProductImage,
  getTotalStock,
  blankProductForm,
} from './adminUtils.js';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { products = [], fetchProducts, pushToast, categories: outletCategories } = useOutletContext() || {};

  const fileInputRef = useRef(null);

  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState(outletCategories || PRODUCT_CATEGORIES);

  useEffect(() => {
    if (outletCategories && outletCategories.length > 0) {
      setCategories(outletCategories);
      return;
    }
    fetch(apiUrl('/api/categories'))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          const list = data.categories.map((c) => ({
            value: c.slug || (c.title || c.name || '').toLowerCase(),
            label: c.title || c.name,
          }));
          setCategories(list);
        }
      })
      .catch((err) => console.warn('Failed to load categories:', err));
  }, [outletCategories]);

  const [form, setForm] = useState(blankProductForm());
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Check auth helper
  const getAuthToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return null;
    }
    return token;
  };

  // Load product if editing
  useEffect(() => {
    if (!isEdit) {
      setForm(blankProductForm());
      setLoadingProduct(false);
      return;
    }

    let isMounted = true;

    // Check if product exists in loaded list
    const found = products.find((p) => String(p._id) === String(id));
    if (found) {
      populateProduct(found);
      setLoadingProduct(false);
      return;
    }

    // Otherwise fetch directly
    const loadFromApi = async () => {
      setLoadingProduct(true);
      try {
        const res = await fetch(apiUrl(`/api/products/${id}`));
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        if (isMounted) {
          populateProduct(data);
        }
      } catch (err) {
        console.error(err);
        if (pushToast) pushToast('Failed to load product details', 'error');
        navigate('/admin/dashboard/products');
      } finally {
        if (isMounted) setLoadingProduct(false);
      }
    };

    loadFromApi();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, products]);

  const populateProduct = (product) => {
    // Collect existing images
    let imgs = [];
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      imgs = product.imageUrls;
    } else if (Array.isArray(product.images) && product.images.length > 0) {
      imgs = product.images;
    } else if (product.image) {
      imgs = [product.image];
    }
    setExistingImages(imgs);

    // Populate sizes
    let sizes = DEFAULT_SIZE_OPTIONS.map((size) => ({ size, quantity: 0 }));
    if (Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
      const stockMap = {};
      product.sizeStock.forEach((s) => {
        if (s.size) stockMap[String(s.size).toUpperCase()] = s.quantity ?? 0;
      });
      sizes = DEFAULT_SIZE_OPTIONS.map((size) => ({
        size,
        quantity: stockMap[size] !== undefined ? stockMap[size] : 0,
      }));
    }

    setForm({
      name: product.name || '',
      price: product.price ?? '',
      description: product.description || '',
      category: product.category || 'kurti',
      inStock: Boolean(product.inStock),
      sizeStock: sizes,
    });
  };

  // Generate previews for newly selected files
  useEffect(() => {
    if (!selectedFiles.length) {
      setPreviewUrls([]);
      return;
    }

    const urls = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
    }));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedFiles]);

  // Handle file selection
  const handleFilesChosen = (incomingFiles) => {
    const valid = Array.from(incomingFiles).filter((f) => f.type.startsWith('image/'));
    if (!valid.length) {
      if (pushToast) pushToast('Please choose valid image files (JPG, PNG, WEBP)', 'error');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...valid].slice(0, 8));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChosen(e.dataTransfer.files);
    }
  };

  // Form updates
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSizeStockChange = (idx, value) => {
    const val = parseInt(value, 10);
    const updated = [...form.sizeStock];
    updated[idx] = { ...updated[idx], quantity: isNaN(val) || val < 0 ? 0 : val };
    setForm((prev) => ({ ...prev, sizeStock: updated }));
  };

  const adjustSizeQuantity = (idx, delta) => {
    const updated = [...form.sizeStock];
    const current = Number(updated[idx].quantity) || 0;
    updated[idx] = { ...updated[idx], quantity: Math.max(0, current + delta) };
    setForm((prev) => ({ ...prev, sizeStock: updated }));
  };

  const totalStockCount = getTotalStock(form.sizeStock);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    if (!form.name.trim()) {
      if (pushToast) pushToast('Product name is required', 'error');
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      if (pushToast) pushToast('Valid product price is required', 'error');
      return;
    }

    if (!isEdit && selectedFiles.length === 0) {
      if (pushToast) pushToast('Please upload at least one product image', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('price', String(form.price));
    formData.append('description', form.description.trim());
    formData.append('category', form.category);
    formData.append('inStock', String(form.inStock));

    // Clean sizeStock
    const cleanedSizes = (form.sizeStock || [])
      .map((entry) => ({
        size: String(entry.size || '').trim().toUpperCase(),
        quantity: Math.max(0, parseInt(entry.quantity, 10) || 0),
      }))
      .filter((entry) => entry.size);
    formData.append('sizeStock', JSON.stringify(cleanedSizes));

    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    setSubmitting(true);
    try {
      const url = isEdit ? apiUrl(`/api/products/${id}`) : apiUrl('/api/products');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (pushToast) {
          pushToast(isEdit ? 'Product updated successfully' : 'Product created successfully');
        }
        if (fetchProducts) fetchProducts();
        navigate('/admin/dashboard/products');
      } else {
        if (pushToast) pushToast(data.message || 'Failed to save product', 'error');
      }
    } catch (err) {
      console.error(err);
      if (pushToast) pushToast('Network error while saving product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="product-form-loading-state">
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--pink)', margin: 'auto' }} />
        <p>Loading product details...</p>
      </div>
    );
  }

  // Display image for preview card
  const displayPreviewImage =
    previewUrls.length > 0
      ? previewUrls[0].url
      : existingImages.length > 0
      ? existingImages[0]
      : null;

  return (
    <div className="product-form-page">
      {/* Top Header Bar */}
      <div className="product-form-top-bar">
        <div className="product-form-header-left">
          <Link to="/admin/dashboard/products" className="product-form-back-link">
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </Link>
          <div className="product-form-title-group">
            <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <p>
              {isEdit
                ? `Updating "${form.name || 'Catalog Item'}" — configure pricing, inventory, and images.`
                : 'Create and publish a new item into the Tere Rang storefront catalog.'}
            </p>
          </div>
        </div>

        <div className="product-form-header-actions">
          <button
            type="button"
            className="pill-btn product-form-cancel-btn"
            onClick={() => navigate('/admin/dashboard/products')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-editor-form"
            className="primary-btn product-form-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <form id="product-editor-form" onSubmit={handleSubmit} className="product-form-grid">
        {/* Left Column: Core Product Info */}
        <div className="product-form-left-col">
          {/* Card 1: Basic Information */}
          <div className="admin-view-card product-card-section">
            <div className="card-section-head">
              <div className="card-section-icon">
                <Tag size={16} />
              </div>
              <div>
                <h3>Basic Information</h3>
                <p>Provide the title, category, and descriptive details for customers.</p>
              </div>
            </div>

            <div className="card-section-body">
              <div className="admin-form-group">
                <label htmlFor="product-name">
                  Product Title <span className="req-star">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  required
                  className="admin-form-input product-title-input"
                  placeholder="e.g. Royal Embroidered Anarkali Kurti Set"
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>

              <div className="form-row-2col">
                <div className="admin-form-group">
                  <label htmlFor="product-category">Category</label>
                  <select
                    id="product-category"
                    className="admin-form-select"
                    value={form.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="product-price">
                    Price (₹) <span className="req-star">*</span>
                  </label>
                  <div className="price-input-wrap">
                    <span className="price-symbol">₹</span>
                    <input
                      id="product-price"
                      type="number"
                      min="1"
                      step="1"
                      required
                      className="admin-form-input price-input"
                      placeholder="2999"
                      value={form.price}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="product-description">Description & Craftsmanship</label>
                <textarea
                  id="product-description"
                  rows={4}
                  className="admin-form-textarea"
                  placeholder="Detail fabric specifications, embroidery style, occasion wear guidance, and wash care instructions..."
                  value={form.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Inventory & Sizing */}
          <div className="admin-view-card product-card-section">
            <div className="card-section-head">
              <div className="card-section-icon">
                <Layers size={16} />
              </div>
              <div className="card-section-head-title">
                <div>
                  <h3>Sizes & Variant Stock</h3>
                  <p>Assign inventory per size variant. Total stock automatically computes.</p>
                </div>
                <div className="total-stock-badge">
                  <span>Total Units:</span>
                  <strong>{totalStockCount}</strong>
                </div>
              </div>
            </div>

            <div className="card-section-body">
              <div className="size-variant-grid">
                {(form.sizeStock || []).map((entry, idx) => (
                  <div key={entry.size || idx} className="size-variant-card">
                    <div className="size-variant-header">
                      <span className="size-label-tag">Size {entry.size}</span>
                      <span className="size-sub-tag">
                        {entry.quantity > 0 ? `${entry.quantity} in stock` : '0 qty'}
                      </span>
                    </div>

                    <div className="size-stepper-control">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => adjustSizeQuantity(idx, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="admin-form-input size-stepper-input"
                        value={entry.quantity}
                        onChange={(e) => handleSizeStockChange(idx, e.target.value)}
                      />
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => adjustSizeQuantity(idx, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Visibility Checkbox */}
              <div className="product-status-switch-box">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => handleFieldChange('inStock', e.target.checked)}
                  />
                  <div className="checkbox-text">
                    <strong>Publish in Storefront (In Stock)</strong>
                    <p>When unchecked, product remains saved as a hidden/draft item in your admin catalog.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Imagery & Preview */}
        <div className="product-form-right-col">
          {/* Card 3: Visual Imagery */}
          <div className="admin-view-card product-card-section">
            <div className="card-section-head">
              <div className="card-section-icon">
                <UploadCloud size={16} />
              </div>
              <div>
                <h3>Product Imagery</h3>
                <p>Upload high-resolution editorial product shots (up to 8 images).</p>
              </div>
            </div>

            <div className="card-section-body">
              {/* Dropzone Container - Guaranteed bounded layout */}
              <div
                className={`product-upload-dropzone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Hidden File Input - Completely isolated from DOM layout */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesChosen(e.target.files);
                      // Clear value so the same file can be re-selected if removed
                      e.target.value = '';
                    }
                  }}
                  style={{ display: 'none' }}
                />

                <div className="upload-dropzone-icon">
                  <UploadCloud size={30} />
                </div>
                <div className="upload-dropzone-text">
                  <p className="upload-dropzone-title">
                    <span>Click to browse</span> or drag & drop files
                  </p>
                  <p className="upload-dropzone-subtitle">
                    Supports high-res JPEG, PNG, WEBP (Max 5MB each)
                  </p>
                </div>
                <button
                  type="button"
                  className="pill-btn upload-browse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </button>
              </div>

              {/* Newly Selected Images Preview Gallery */}
              {previewUrls.length > 0 && (
                <div className="selected-images-section">
                  <div className="selected-images-head">
                    <span className="selected-count">
                      {previewUrls.length} new image{previewUrls.length > 1 ? 's' : ''} selected
                    </span>
                    <button
                      type="button"
                      className="text-btn clear-all-btn"
                      onClick={() => setSelectedFiles([])}
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="preview-thumbnails-grid">
                    {previewUrls.map((item, idx) => (
                      <div key={idx} className="preview-thumb-item">
                        <img src={item.url} alt={item.name} />
                        <div className="preview-thumb-overlay">
                          <span className="thumb-order-badge">#{idx + 1}</span>
                          <button
                            type="button"
                            className="thumb-remove-btn"
                            title="Remove image"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelectedFile(idx);
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <span className="thumb-filename" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Images (Edit Mode) */}
              {isEdit && existingImages.length > 0 && (
                <div className="existing-images-section">
                  <div className="existing-images-head">
                    <span>Current Images in Storage ({existingImages.length})</span>
                    {previewUrls.length > 0 && (
                      <span className="replace-warning">
                        Uploading new images will replace existing photos.
                      </span>
                    )}
                  </div>
                  <div className="existing-thumbnails-row">
                    {existingImages.map((src, idx) => (
                      <div key={idx} className="existing-thumb">
                        <img src={src} alt={`Product shot ${idx + 1}`} />
                        {idx === 0 && <span className="primary-badge">Cover</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Storefront Mini-Preview Card */}
          <div className="admin-view-card product-card-section product-preview-card-wrap">
            <div className="card-section-head">
              <div className="card-section-icon">
                <Eye size={16} />
              </div>
              <div>
                <h3>Storefront Preview</h3>
                <p>Live glimpse of how shoppers see this item in your store.</p>
              </div>
            </div>

            <div className="card-section-body">
              <div className="mini-storefront-card">
                <div className="mini-card-thumb">
                  {displayPreviewImage ? (
                    <img src={displayPreviewImage} alt={form.name || 'Preview'} />
                  ) : (
                    <div className="mini-card-placeholder">
                      <Sparkles size={24} style={{ color: 'var(--pink)', opacity: 0.6 }} />
                      <span>Upload an image</span>
                    </div>
                  )}
                  <span className={`mini-card-status ${form.inStock ? 'live' : 'draft'}`}>
                    {form.inStock ? 'In Stock' : 'Draft'}
                  </span>
                </div>

                <div className="mini-card-details">
                  <span className="mini-card-category">{titleCase(form.category)}</span>
                  <h4 className="mini-card-title">{form.name || 'Untitled Product'}</h4>
                  <div className="mini-card-bottom">
                    <span className="mini-card-price">
                      {form.price ? formatCurrency(form.price) : '₹0'}
                    </span>
                    <span className="mini-card-stock">
                      {totalStockCount} units available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
