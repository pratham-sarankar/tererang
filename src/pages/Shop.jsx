import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Copy,
  Eye,
  Filter,
  Grid,
  Heart,
  LayoutGrid,
  RotateCcw,
  Search,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { apiUrl } from "../config/env.js";
import { formatCurrency, mapProductForDisplay } from "../utils/productPresentation.js";
import { useCart } from "../context/cartContextStore.js";
import { Footer } from "../components/Footer.jsx";
import ProductImage from "../components/ProductImage.jsx";
import "../css/Shop.css";

const DEFAULT_CATEGORIES = [
  { slug: "all", title: "All Pieces" },
  { slug: "kurti", title: "Kurtis" },
  { slug: "suit", title: "Suits" },
  { slug: "wedding", title: "Wedding Collection" },
  { slug: "coat", title: "Coat Sets" },
  { slug: "ethnicwear", title: "Ethnic Wear" },
  { slug: "skirt", title: "Skirts" },
];

const PRICE_PRESETS = [
  { label: "Under ₹1,500", min: "", max: "1500" },
  { label: "₹1,500 – ₹3,000", min: "1500", max: "3000" },
  { label: "₹3,000 – ₹5,000", min: "3000", max: "5000" },
  { label: "Above ₹5,000", min: "5000", max: "" },
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "CUSTOM"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "oldest", label: "Oldest First" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Read URL query parameters
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = (searchParams.get("category") || "all").toLowerCase();
  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentInStock = searchParams.get("inStock") || "";
  const currentSize = searchParams.get("size") || "";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // Local state
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [viewCols, setViewCols] = useState("4"); // '3' or '4'
  const [toastMessage, setToastMessage] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [quickAddingId, setQuickAddingId] = useState(null);

  const searchDebounceTimer = useRef(null);

  // Synchronize local search input if URL changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch Categories from API
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await fetch(apiUrl("/api/categories"));
        if (response.ok) {
          const data = await response.json();
          if (isMounted && Array.isArray(data.categories) && data.categories.length > 0) {
            const apiCats = data.categories.map((c) => ({
              slug: (c.slug || c.title || "").toLowerCase().trim(),
              title: c.title || c.name,
              productCount: c.productCount || 0,
            }));

            // Merge unique slugs
            const seen = new Set();
            const merged = [{ slug: "all", title: "All Pieces" }];
            apiCats.forEach((cat) => {
              if (cat.slug && !seen.has(cat.slug)) {
                seen.add(cat.slug);
                merged.push(cat);
              }
            });
            DEFAULT_CATEGORIES.forEach((cat) => {
              if (cat.slug !== "all" && !seen.has(cat.slug)) {
                seen.add(cat.slug);
                merged.push(cat);
              }
            });
            setCategories(merged);
          }
        }
      } catch (err) {
        console.warn("Could not load categories from API, using default list:", err);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Central Helper to update query parameters in URL
  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, val]) => {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        val === "all" ||
        (key === "page" && val === 1)
      ) {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });

    // Reset pagination to page 1 unless page is explicitly updated
    if (!("page" in updates)) {
      next.delete("page");
    }

    setSearchParams(next, { replace: true });
  };

  // Debounced search typing handler
  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

    searchDebounceTimer.current = setTimeout(() => {
      updateQuery({ search: value.trim() });
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateQuery({ search: "" });
  };

  // Helper to toggle size filter
  const handleToggleSize = (size) => {
    const currentSizes = currentSize
      ? currentSize.split(",").map((s) => s.trim().toUpperCase())
      : [];
    const targetSize = size.toUpperCase();
    let nextSizes;

    if (currentSizes.includes(targetSize)) {
      nextSizes = currentSizes.filter((s) => s !== targetSize);
    } else {
      nextSizes = [...currentSizes, targetSize];
    }

    updateQuery({ size: nextSizes.join(",") });
  };

  // Helper to toggle price preset
  const handlePricePreset = (preset) => {
    if (currentMinPrice === preset.min && currentMaxPrice === preset.max) {
      updateQuery({ minPrice: "", maxPrice: "" });
    } else {
      updateQuery({ minPrice: preset.min, maxPrice: preset.max });
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Copy customized link with filters to share with customers
  const handleCopyCustomLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setToastMessage("Custom link with filters copied to clipboard! Ready to share.");
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage("Failed to copy link. Please copy from browser address bar.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Fetch Products based on current query parameters
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      // Build API query string
      const apiParams = new URLSearchParams();
      if (currentSearch) apiParams.set("search", currentSearch);
      if (currentCategory && currentCategory !== "all") apiParams.set("category", currentCategory);
      if (currentSort) apiParams.set("sort", currentSort);
      if (currentMinPrice) apiParams.set("minPrice", currentMinPrice);
      if (currentMaxPrice) apiParams.set("maxPrice", currentMaxPrice);
      if (currentInStock) apiParams.set("inStock", currentInStock);
      if (currentSize) apiParams.set("size", currentSize);
      apiParams.set("page", String(currentPage));
      apiParams.set("limit", "24");

      try {
        const response = await fetch(apiUrl(`/api/products?${apiParams.toString()}`));
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        if (isMounted) {
          const apiList = Array.isArray(data) ? data : data.products || [];
          const pagination = data.pagination || {};

          const mapped = apiList.map((p) => mapProductForDisplay(p));

          setProducts(mapped);
          setTotalCount(pagination.total !== undefined ? pagination.total : mapped.length);
          setTotalPages(pagination.pages || Math.ceil(mapped.length / 24) || 1);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Product API failed:", err.message);
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [
    currentSearch,
    currentCategory,
    currentSort,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
    currentSize,
    currentPage,
  ]);

  // Count active filters (for badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentSearch) count += 1;
    if (currentCategory && currentCategory !== "all") count += 1;
    if (currentMinPrice || currentMaxPrice) count += 1;
    if (currentInStock) count += 1;
    if (currentSize) count += currentSize.split(",").length;
    if (currentSort && currentSort !== "newest") count += 1;
    return count;
  }, [currentSearch, currentCategory, currentMinPrice, currentMaxPrice, currentInStock, currentSize, currentSort]);

  // Wishlist toggle
  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  // Quick add to cart
  const handleQuickAdd = async (e, product) => {
    e.stopPropagation();
    const pid = product.backendId || product.id;
    if (!pid) return;

    try {
      setQuickAddingId(pid);
      if (addToCart && !String(pid).startsWith("ref-")) {
        await addToCart({
          productId: pid,
          quantity: 1,
          size: product.sizes?.[0] || "M",
        });
        setToastMessage(`Added "${product.title}" to cart`);
      } else {
        setToastMessage(`Added "${product.title}" to cart`);
      }
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      navigate(`/product/${pid}`, { state: { product } });
    } finally {
      setQuickAddingId(null);
    }
  };

  // Card click navigates to product detail
  const handleSelectProduct = (product) => {
    const targetId = product?.backendId || product?.id;
    if (!targetId) return;
    navigate(`/product/${targetId}`, { state: { product } });
  };

  // Reusable Sidebar Filter Content (for both Desktop & Mobile Drawer)
  const filterControls = (
    <>
      {/* Category Filter */}
      <div className="shop-filter-group">
        <div className="shop-filter-title">
          <span>Category</span>
          {currentCategory !== "all" && (
            <button
              className="shop-clear-all-btn"
              style={{ fontSize: 11, padding: 0 }}
              onClick={() => updateQuery({ category: "all" })}
              type="button"
            >
              Reset
            </button>
          )}
        </div>
        <div className="shop-filter-options">
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <div
                key={cat.slug}
                className={`shop-filter-item ${isSelected ? "active" : ""}`}
                onClick={() => updateQuery({ category: cat.slug })}
              >
                <div className="shop-filter-item-label">
                  <input
                    type="radio"
                    name="category"
                    checked={isSelected}
                    onChange={() => {}}
                    className="shop-filter-checkbox"
                  />
                  <span>{cat.title}</span>
                </div>
                {cat.productCount ? (
                  <span className="shop-filter-badge">{cat.productCount}</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="shop-filter-group">
        <div className="shop-filter-title">
          <span>Price (INR)</span>
          {(currentMinPrice || currentMaxPrice) && (
            <button
              className="shop-clear-all-btn"
              style={{ fontSize: 11, padding: 0 }}
              onClick={() => updateQuery({ minPrice: "", maxPrice: "" })}
              type="button"
            >
              Reset
            </button>
          )}
        </div>

        <div className="shop-price-inputs">
          <input
            type="number"
            placeholder="Min"
            className="shop-price-input"
            value={currentMinPrice}
            onChange={(e) => updateQuery({ minPrice: e.target.value })}
          />
          <span className="shop-price-separator">–</span>
          <input
            type="number"
            placeholder="Max"
            className="shop-price-input"
            value={currentMaxPrice}
            onChange={(e) => updateQuery({ maxPrice: e.target.value })}
          />
        </div>

        <div className="shop-price-presets">
          {PRICE_PRESETS.map((preset) => {
            const isPresetActive =
              currentMinPrice === preset.min && currentMaxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                className={`shop-price-chip ${isPresetActive ? "active" : ""}`}
                onClick={() => handlePricePreset(preset)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / In Stock */}
      <div className="shop-filter-group">
        <div className="shop-filter-title">Availability</div>
        <label className="shop-toggle-item">
          <span style={{ fontSize: 13, color: "var(--foreground)" }}>In Stock Only</span>
          <div className="shop-switch">
            <input
              type="checkbox"
              checked={currentInStock === "true"}
              onChange={(e) => updateQuery({ inStock: e.target.checked ? "true" : "" })}
            />
            <span className="shop-slider" />
          </div>
        </label>
      </div>

      {/* Sizes Filter */}
      <div className="shop-filter-group">
        <div className="shop-filter-title">
          <span>Sizes</span>
          {currentSize && (
            <button
              className="shop-clear-all-btn"
              style={{ fontSize: 11, padding: 0 }}
              onClick={() => updateQuery({ size: "" })}
              type="button"
            >
              Reset
            </button>
          )}
        </div>
        <div className="shop-size-chips">
          {AVAILABLE_SIZES.map((sz) => {
            const isSelected = currentSize
              .split(",")
              .map((s) => s.trim().toUpperCase())
              .includes(sz);
            return (
              <button
                key={sz}
                type="button"
                className={`shop-size-btn ${isSelected ? "active" : ""}`}
                onClick={() => handleToggleSize(sz)}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <>
      <main className="shop-page">
        {/* ======================================================
            HERO HEADER
            ====================================================== */}
        <section className="shop-hero">
          <div className="shop-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span style={{ color: "var(--primary)" }}>Shop</span>
          </div>

          <h1 className="shop-hero-title">The Tererang Collection</h1>
          <p className="shop-hero-subtitle">
            Search, filter, and discover handcrafted silhouettes designed for memorable moments.
            Share custom prefilled links directly with customers.
          </p>

          {/* Quick Category Strip */}
          <div className="shop-hero-categories">
            {categories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  className={`shop-category-pill ${isActive ? "active" : ""}`}
                  onClick={() => updateQuery({ category: cat.slug })}
                >
                  <span>{cat.title}</span>
                  {cat.productCount ? (
                    <span className="pill-count">{cat.productCount}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {/* ======================================================
            MAIN CATALOG CONTAINER
            ====================================================== */}
        <div className="shop-container">
          {/* Top Search & Controls Toolbar */}
          <div className="shop-toolbar">
            {/* Search Box */}
            <div className="shop-search-wrapper">
              <Search className="shop-search-icon" size={18} />
              <input
                type="search"
                className="shop-search-input"
                placeholder="Search by name, fabric, style, or color..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="shop-search-clear"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Actions Bar */}
            <div className="shop-toolbar-actions">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                className="shop-filter-toggle-btn lg:hidden"
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="badge-count">{activeFiltersCount}</span>
                )}
              </button>

              {/* Share Custom Prefilled Link */}
              <button
                type="button"
                className="shop-share-link-btn"
                onClick={handleCopyCustomLink}
                title="Copy URL with current search, filters, and sorting to share with customers"
              >
                <Share2 size={16} />
                <span>Share Custom Link</span>
              </button>

              {/* Sorting Dropdown */}
              <div className="shop-sort-select-wrapper">
                <select
                  className="shop-sort-select"
                  value={currentSort}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="shop-sort-arrow" />
              </div>

              {/* View Columns Toggle */}
              <div className="shop-view-toggle">
                <button
                  type="button"
                  className={`shop-view-btn ${viewCols === "3" ? "active" : ""}`}
                  onClick={() => setViewCols("3")}
                  title="Comfortable 3-column view"
                  aria-label="3-column view"
                >
                  <Grid size={16} />
                </button>
                <button
                  type="button"
                  className={`shop-view-btn ${viewCols === "4" ? "active" : ""}`}
                  onClick={() => setViewCols("4")}
                  title="Compact 4-column view"
                  aria-label="4-column view"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Strip */}
          {activeFiltersCount > 0 && (
            <div className="shop-active-filters">
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)" }}>
                Active filters:
              </span>

              {currentSearch && (
                <span className="shop-active-chip">
                  Search: &ldquo;{currentSearch}&rdquo;
                  <button type="button" onClick={handleClearSearch}>
                    <X size={13} />
                  </button>
                </span>
              )}

              {currentCategory && currentCategory !== "all" && (
                <span className="shop-active-chip">
                  Category:{" "}
                  {categories.find((c) => c.slug === currentCategory)?.title || currentCategory}
                  <button type="button" onClick={() => updateQuery({ category: "all" })}>
                    <X size={13} />
                  </button>
                </span>
              )}

              {(currentMinPrice || currentMaxPrice) && (
                <span className="shop-active-chip">
                  Price: ₹{currentMinPrice || "0"} – ₹{currentMaxPrice || "Any"}
                  <button type="button" onClick={() => updateQuery({ minPrice: "", maxPrice: "" })}>
                    <X size={13} />
                  </button>
                </span>
              )}

              {currentInStock === "true" && (
                <span className="shop-active-chip">
                  In Stock Only
                  <button type="button" onClick={() => updateQuery({ inStock: "" })}>
                    <X size={13} />
                  </button>
                </span>
              )}

              {currentSize &&
                currentSize.split(",").map((sz) => (
                  <span key={sz} className="shop-active-chip">
                    Size: {sz.trim().toUpperCase()}
                    <button type="button" onClick={() => handleToggleSize(sz)}>
                      <X size={13} />
                    </button>
                  </span>
                ))}

              {currentSort && currentSort !== "newest" && (
                <span className="shop-active-chip">
                  {SORT_OPTIONS.find((s) => s.value === currentSort)?.label}
                  <button type="button" onClick={() => updateQuery({ sort: "newest" })}>
                    <X size={13} />
                  </button>
                </span>
              )}

              <button
                type="button"
                className="shop-clear-all-btn"
                onClick={handleClearAllFilters}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Grid Layout: Sidebar + Products */}
          <div className="shop-content-grid">
            {/* Desktop Sticky Sidebar */}
            <aside className="shop-sidebar">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>
                  Filter Collection
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    className="shop-clear-all-btn"
                    style={{ fontSize: 12, padding: 0 }}
                    onClick={handleClearAllFilters}
                  >
                    Reset all
                  </button>
                )}
              </div>
              {filterControls}
            </aside>

            {/* Products Section */}
            <section className="shop-products-section">
              <div className="shop-products-header">
                <div className="shop-results-count">
                  Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> pieces
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className={`shop-grid ${viewCols === "3" ? "view-3-col" : "view-4-col"}`}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="shop-skeleton-card">
                      <div className="shop-skeleton-img" />
                      <div className="shop-skeleton-body">
                        <div className="shop-skeleton-line" style={{ width: "40%" }} />
                        <div className="shop-skeleton-line" style={{ width: "80%", height: 16 }} />
                        <div className="shop-skeleton-line" style={{ width: "50%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                /* Product Grid */
                <div className={`shop-grid ${viewCols === "3" ? "view-3-col" : "view-4-col"}`}>
                  {products.map((product) => {
                    const isWish = wishlist.has(product.id || product.backendId);
                    const isAdding = quickAddingId === (product.id || product.backendId);

                    return (
                      <article
                        key={product.id || product.backendId}
                        className="shop-product-card"
                        onClick={() => handleSelectProduct(product)}
                      >
                        {/* Media */}
                        <div className="shop-card-media">
                          <ProductImage
                            src={product.image}
                            alt={product.title}
                            className="shop-card-img"
                            loading="lazy"
                          />

                          {/* Badge */}
                          {(product.discount > 0 || product.badge) && (
                            <span className="shop-card-badge">
                              {product.discount > 0 ? `${product.discount}% OFF` : product.badge}
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            type="button"
                            className={`shop-card-wishlist ${isWish ? "active" : ""}`}
                            onClick={(e) => toggleWishlist(e, product.id || product.backendId)}
                            aria-label="Save to wishlist"
                          >
                            <Heart size={16} fill={isWish ? "currentColor" : "none"} />
                          </button>

                          {/* Quick Actions Hover Overlay */}
                          <div className="shop-card-quick-actions">
                            <button
                              type="button"
                              className="shop-card-quick-btn"
                              disabled={isAdding}
                              onClick={(e) => handleQuickAdd(e, product)}
                            >
                              <ShoppingBag size={14} />
                              <span>{isAdding ? "Adding…" : "Quick Add"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="shop-card-body">
                          <span className="shop-card-category">
                            {(typeof (product.raw?.category || product.category) === 'object'
                              ? (product.raw?.category?.title || product.category?.title || product.category?.name)
                              : (product.raw?.category || product.category)) || "Tere Rang Atelier"}
                          </span>
                          <h3 className="shop-card-title">{product.title}</h3>

                          <div className="shop-card-price-row">
                            <span className="shop-card-price">{product.displayPrice}</span>
                            {product.displayOldPrice && (
                              <span className="shop-card-old-price">{product.displayOldPrice}</span>
                            )}
                            {product.discount > 0 && (
                              <span className="shop-card-discount">{product.discount}% off</span>
                            )}
                          </div>

                          {/* Sizes Available */}
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="shop-card-sizes">
                              {product.sizes.slice(0, 5).map((sz) => (
                                <span key={sz} className="shop-card-size-tag">
                                  {sz}
                                </span>
                              ))}
                              {product.sizes.length > 5 && (
                                <span className="shop-card-size-tag">
                                  +{product.sizes.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="shop-empty-state">
                  <Sparkles className="shop-empty-icon" />
                  <h3 className="shop-empty-title">No matching pieces found</h3>
                  <p className="shop-empty-desc">
                    We couldn&apos;t find any items matching your active search, price, or size criteria.
                    Try resetting filters or adjusting your search term.
                  </p>
                  <button
                    type="button"
                    className="shop-empty-reset-btn"
                    onClick={handleClearAllFilters}
                  >
                    <RotateCcw size={15} />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="shop-pagination">
                  <button
                    type="button"
                    className="shop-page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => updateQuery({ page: currentPage - 1 })}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`shop-page-btn ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => updateQuery({ page: pageNum })}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="shop-page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateQuery({ page: currentPage + 1 })}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ======================================================
          MOBILE FILTER DRAWER
          ====================================================== */}
      <div
        className={`shop-drawer-overlay ${isMobileDrawerOpen ? "open" : ""}`}
        onClick={() => setIsMobileDrawerOpen(false)}
      />
      <div className={`shop-drawer ${isMobileDrawerOpen ? "open" : ""}`}>
        <div className="shop-drawer-header">
          <h2 className="shop-drawer-title">Filters ({activeFiltersCount})</h2>
          <button
            type="button"
            className="shop-drawer-close"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shop-drawer-body">{filterControls}</div>

        <div className="shop-drawer-footer">
          <button
            type="button"
            className="shop-drawer-reset-btn"
            onClick={handleClearAllFilters}
          >
            Reset
          </button>
          <button
            type="button"
            className="shop-drawer-apply-btn"
            onClick={() => setIsMobileDrawerOpen(false)}
          >
            Show {products.length} Results
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="shop-toast">
          <Check size={16} style={{ color: "#4ade80" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </>
  );
}
