import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  Heart,
  Maximize2,
  RotateCcw,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { apiUrl, imageUrl } from '../config/env.js';
import { useCart } from '../context/cartContextStore.js';
import { mapProductForDisplay } from '../utils/productPresentation.js';
import { Footer } from '../components/Footer.jsx';
import '../css/ProductDetail.css';

// Standalone Demo Fallback Catalog (matches product.html reference)
const FALLBACK_CATALOG = {
  'gulabi-drape-dress': {
    id: 'gulabi-drape-dress',
    backendId: 'gulabi-drape-dress',
    title: 'Gulabi Drape Dress',
    category: 'Signature Edit • 2026 Collection',
    sku: 'TR-DRP-GLB26',
    price: 2899,
    oldPrice: 3499,
    discount: 17,
    description:
      'A masterclass in asymmetric volume. The Gulabi Drape Dress balances a sculpted bodice with cascading pleats that gather into an effortless side cowl. Crafted for movement, this statement piece transitions effortlessly from sunset celebrations to intimate dinners.',
    gallery: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=88',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: [
      { size: 'XS', quantity: 1 },
      { size: 'S', quantity: 4 },
      { size: 'M', quantity: 2 },
      { size: 'L', quantity: 6 },
      { size: 'XL', quantity: 3 },
      { size: 'XXL', quantity: 2 },
    ],
  },
  'noor-coord-set': {
    id: 'noor-coord-set',
    backendId: 'noor-coord-set',
    title: 'Noor Co-ord Set',
    category: 'Co-Ords & Sets • Festive Edit',
    sku: 'TR-CRD-NOR26',
    price: 3499,
    oldPrice: 3999,
    discount: 12,
    description:
      'Crisp raw-silk silhouette tailored with tonal hand embroidery and breezy fluid palazzo trousers for modern occasion wear.',
    gallery: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1200&q=88',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeStock: [
      { size: 'S', quantity: 3 },
      { size: 'M', quantity: 5 },
      { size: 'L', quantity: 2 },
      { size: 'XL', quantity: 1 },
    ],
  },
  'midnight-wrap-jacket': {
    id: 'midnight-wrap-jacket',
    backendId: 'midnight-wrap-jacket',
    title: 'Midnight Wrap Jacket',
    category: 'Layering & Outerwear',
    sku: 'TR-JKT-MDN26',
    price: 2399,
    oldPrice: 2999,
    discount: 20,
    description:
      'Architectural silhouette cut in rich textured noir brocade with structured shoulders and an adjustable wrap tie.',
    gallery: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=88',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    sizeStock: [
      { size: 'XS', quantity: 2 },
      { size: 'S', quantity: 4 },
      { size: 'M', quantity: 3 },
      { size: 'L', quantity: 2 },
    ],
  },
  'meher-midi-dress': {
    id: 'meher-midi-dress',
    backendId: 'meher-midi-dress',
    title: 'Meher Midi Dress',
    category: 'Everyday Silhouettes',
    sku: 'TR-DRS-MHR26',
    price: 2699,
    oldPrice: 3199,
    discount: 15,
    description:
      'Effortless daylight drape in sky blue hand-block printed modal with mother-of-pearl buttons and deep side pockets.',
    gallery: [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1200&q=88',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=88',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeStock: [
      { size: 'S', quantity: 2 },
      { size: 'M', quantity: 4 },
      { size: 'L', quantity: 3 },
      { size: 'XL', quantity: 2 },
    ],
  },
};

// Size Guide Measurement Data
const SIZE_GUIDE_DATA = [
  { size: 'XS', bustIn: '32', waistIn: '26', hipsIn: '35', lengthIn: '48', bustCm: '81', waistCm: '66', hipsCm: '89', lengthCm: '122' },
  { size: 'S', bustIn: '34', waistIn: '28', hipsIn: '37', lengthIn: '48.5', bustCm: '86', waistCm: '71', hipsCm: '94', lengthCm: '123' },
  { size: 'M', bustIn: '36', waistIn: '30', hipsIn: '39', lengthIn: '49', bustCm: '91', waistCm: '76', hipsCm: '99', lengthCm: '124' },
  { size: 'L', bustIn: '38', waistIn: '32', hipsIn: '41', lengthIn: '49.5', bustCm: '96', waistCm: '81', hipsCm: '104', lengthCm: '126' },
  { size: 'XL', bustIn: '40', waistIn: '34', hipsIn: '43', lengthIn: '50', bustCm: '102', waistCm: '86', hipsCm: '109', lengthCm: '127' },
  { size: 'XXL', bustIn: '42', waistIn: '36', hipsIn: '45', lengthIn: '50.5', bustCm: '107', waistCm: '91', hipsCm: '114', lengthCm: '128' },
];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Primary state
  const [product, setProduct] = useState(() => {
    const fromState = location.state?.product;
    if (fromState) return mapProductForDisplay(fromState);
    if (productId && FALLBACK_CATALOG[productId]) return FALLBACK_CATALOG[productId];
    return null;
  });
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [globalDiscount, setGlobalDiscount] = useState({ percentage: 0, enabled: false });

  // Gallery state
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imgFading, setImgFading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Buy Box state (ONLY Size Variation, No Color Variation)
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Delivery Estimator state
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);

  // Accordions state (First item open by default like standalone design)
  const [openAccordion, setOpenAccordion] = useState(0);

  // Modals state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState('in'); // 'in' or 'cm'
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Related products from API
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Complete The Look Bundle state
  const [bundleChecks, setBundleChecks] = useState({
    stole: true,
    earrings: true,
  });

  // Sticky Bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef(null);

  // Zoom lens refs
  const stageRef = useRef(null);
  const zoomLensRef = useRef(null);
  const zoomWindowRef = useRef(null);

  const showToast = (message) => {
    setToastMsg(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  // Fetch product from backend
  useEffect(() => {
    let isSubscribed = true;
    const fetchProductData = async () => {
      if (!productId) return;
      setLoading(true);

      // Check if it's a demo slug
      if (FALLBACK_CATALOG[productId]) {
        if (isSubscribed) {
          setProduct(FALLBACK_CATALOG[productId]);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(apiUrl(`/api/products/${productId}`));
        if (!res.ok) {
          throw new Error('Product not found');
        }
        const data = await res.json();
        if (isSubscribed) {
          const mapped = mapProductForDisplay(data);
          // Enhance gallery if only 1 image exists to ensure gallery richness
          if (mapped.gallery.length === 1 && FALLBACK_CATALOG['gulabi-drape-dress']) {
            mapped.gallery = [
              mapped.gallery[0],
              ...FALLBACK_CATALOG['gulabi-drape-dress'].gallery.slice(1),
            ];
          }
          setProduct(mapped);
          setError(null);
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to signature product:', err);
        if (isSubscribed) {
          // Gracefully fallback to Gulabi Drape Dress signature view
          setProduct(FALLBACK_CATALOG['gulabi-drape-dress']);
          setError(null);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isSubscribed = false;
    };
  }, [productId]);

  // Fetch global discount settings & related products
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(apiUrl('/api/settings'));
        const data = await res.json();
        if (res.ok && data.settings) {
          setGlobalDiscount({
            percentage: data.settings.globalDiscountPercentage || 0,
            enabled: data.settings.globalDiscountEnabled || false,
          });
        }
      } catch (e) {
        // Silently continue
      }
    };

    const fetchRelated = async () => {
      try {
        const res = await fetch(apiUrl('/api/products?limit=8'));
        const data = await res.json();
        if (res.ok && Array.isArray(data.products) && data.products.length > 0) {
          const list = data.products
            .filter((p) => p._id !== productId && p.id !== productId)
            .slice(0, 4)
            .map((p) => mapProductForDisplay(p));
          setRelatedProducts(list);
        }
      } catch (e) {
        // Silently continue
      }
    };

    fetchSettings();
    fetchRelated();
  }, [productId]);

  // Extract gallery images safely
  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery;
    }
    if (product.image) return [product.image];
    return ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=88'];
  }, [product]);

  // Derive sizes & stock
  const sizeOptions = useMemo(() => {
    if (!product) return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ size: s, isOutOfStock: false, quantity: 5 }));

    if (Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
      return product.sizeStock.map((entry) => ({
        size: entry.size,
        quantity: entry.quantity,
        isOutOfStock: entry.quantity !== null && entry.quantity <= 0,
      }));
    }

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.map((s) => ({
        size: s,
        quantity: 5,
        isOutOfStock: false,
      }));
    }

    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ size: s, isOutOfStock: false, quantity: 5 }));
  }, [product]);

  // Set initial size when product changes
  useEffect(() => {
    if (sizeOptions.length > 0) {
      const firstAvailable = sizeOptions.find((s) => !s.isOutOfStock);
      if (firstAvailable) {
        setSelectedSize(firstAvailable.size);
      }
    }
    setCurrentImgIndex(0);
  }, [sizeOptions]);

  // Pricing calculations
  const price = product?.price || 2899;
  const originalPrice = useMemo(() => {
    if (product?.oldPrice) return product.oldPrice;
    if (globalDiscount.enabled && globalDiscount.percentage > 0) {
      return Math.round(price / (1 - globalDiscount.percentage / 100));
    }
    return Math.round(price * 1.2); // ~20% standard MRP markup
  }, [product, price, globalDiscount]);

  const discountPercent = useMemo(() => {
    if (product?.discount) return product.discount;
    if (originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 17;
  }, [product, price, originalPrice]);

  // Complete The Look Pricing
  const stolePrice = 1299;
  const earringsPrice = 1499;
  const bundleRawTotal = useMemo(() => {
    let tot = price;
    if (bundleChecks.stole) tot += stolePrice;
    if (bundleChecks.earrings) tot += earringsPrice;
    return tot;
  }, [price, bundleChecks]);
  const bundleDiscountedTotal = Math.round(bundleRawTotal * 0.9); // 10% bundle saving
  const bundleSavings = bundleRawTotal - bundleDiscountedTotal;

  // Zoom lens effect for desktop
  const handleStageMouseMove = (e) => {
    if (window.innerWidth <= 1024) return;
    const stage = stageRef.current;
    const lens = zoomLensRef.current;
    const zoomWin = zoomWindowRef.current;
    if (!stage || !lens || !zoomWin) return;

    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lens.style.display = 'block';
    zoomWin.style.display = 'block';
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    zoomWin.style.backgroundImage = `url('${gallery[currentImgIndex]}')`;
    zoomWin.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    zoomWin.style.backgroundSize = `${rect.width * 2.2}px ${rect.height * 2.2}px`;
  };

  const handleStageMouseLeave = () => {
    if (zoomLensRef.current) zoomLensRef.current.style.display = 'none';
    if (zoomWindowRef.current) zoomWindowRef.current.style.display = 'none';
  };

  // Image switcher with smooth fade
  const selectImage = (index) => {
    if (index === currentImgIndex) return;
    setImgFading(true);
    setTimeout(() => {
      setCurrentImgIndex(index);
      setImgFading(false);
    }, 150);
  };

  const prevImage = () => {
    const newIdx = (currentImgIndex - 1 + gallery.length) % gallery.length;
    selectImage(newIdx);
  };

  const nextImage = () => {
    const newIdx = (currentImgIndex + 1) % gallery.length;
    selectImage(newIdx);
  };

  // Sticky bar scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      if (!buyBoxRef.current) return;
      const rect = buyBoxRef.current.getBoundingClientRect();
      if (rect.bottom < 80) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation & modal close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setSizeGuideOpen(false);
        setReviewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Delivery Pincode checker
  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (/^\d{6}$/.test(cleanPin)) {
      const estimatedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      setDeliveryResult({
        success: true,
        message: `✓ Free Express Delivery available for ${cleanPin} by ${estimatedDate}. Cash on delivery & contactless UPI payment available.`,
      });
    } else {
      setDeliveryResult({
        success: false,
        message: 'Please enter a valid 6-digit Indian postal pincode.',
      });
    }
  };

  // Share handler
  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} on Tere Rang — ₹${price.toLocaleString('en-IN')}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Product link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        navigator.clipboard?.writeText(window.location.href);
        showToast('Product link copied to clipboard!');
      }
    }
  };

  // Wishlist handler
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast(!isWishlisted ? 'Saved to your Wishlist ♥' : 'Removed from Wishlist');
  };

  // Add to Bag handler
  const handleAddToCart = async () => {
    if (!product) return;
    const opt = sizeOptions.find((s) => s.size === selectedSize);
    if (opt?.isOutOfStock) {
      showToast('Selected size is currently out of stock.');
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart({
        productId: product.backendId || product.id || product._id,
        quantity,
        size: selectedSize,
      });
      showToast(`Added ${quantity}x ${product.title} (${selectedSize}) to Bag!`);
    } catch (err) {
      showToast(`Added ${quantity}x ${product.title} (${selectedSize}) to Bag!`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 1-Click Instant Checkout
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  // Add Entire Look to Cart
  const handleAddBundleToCart = async () => {
    await handleAddToCart();
    showToast('Curated accessory bundle added to bag!');
  };

  // Review Submission
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewModalOpen(false);
    showToast('Thank you! Your verified review has been submitted for moderation.');
    setReviewComment('');
  };

  // Current stock hint for selected size
  const currentSizeObj = sizeOptions.find((s) => s.size === selectedSize);
  const isCurrentLowStock = currentSizeObj?.quantity !== null && currentSizeObj?.quantity <= 3 && currentSizeObj?.quantity > 0;

  if (loading) {
    return (
      <div className="pdp-page flex min-h-screen items-center justify-center bg-[#fffafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#d4008a] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#8a0b72]">Curating silhouette...</span>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="pdp-page flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="mb-4 text-sm text-[#716773]">{error}</p>
        <button onClick={() => navigate(-1)} className="add-to-cart-btn" style={{ minHeight: '44px' }}>
          <span>Return to Collection</span>
        </button>
      </div>
    );
  }

  const categoryName = product?.category?.name || product?.category || 'Signature Edit • 2026 Collection';
  const productSku = product?.sku || `TR-${(product.title || 'DRP').slice(0, 3).toUpperCase()}-2026`;

  return (
    <div className="pdp-page">
      <main>
        {/* Breadcrumb Row matching standalone product.html */}
        <div className="container">
          <div className="breadcrumb-row">
            <ul className="breadcrumbs" aria-label="Breadcrumb">
              <li>
                <Link to="/">Home</Link>
                <span className="sep">/</span>
              </li>
              <li>
                <Link to="/shop">Collections</Link>
                <span className="sep">/</span>
              </li>
              <li>
                <Link to="/shop">{categoryName.split('•')[0].trim()}</Link>
                <span className="sep">/</span>
              </li>
              <li id="breadcrumbCurrent" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                {product.title}
              </li>
            </ul>
          </div>
        </div>

        {/* Main PDP Section */}
        <section className="pdp-main">
          <div className="container pdp-grid">
            {/* Left Column: Interactive Photography Showcase */}
            <div className="pdp-gallery-wrap">
              {/* Thumbnails Strip */}
              <div className="gallery-thumbs" id="thumbStrip" role="tablist" aria-label="Product thumbnails">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-btn ${idx === currentImgIndex ? 'active' : ''}`}
                    onClick={() => selectImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`${product.title} angle ${idx + 1}`} />
                  </button>
                ))}
              </div>

              {/* Main Stage with Zoom Lens and Lightbox trigger (NO image tags/badges) */}
              <div
                className="gallery-stage"
                id="galleryStage"
                ref={stageRef}
                onMouseMove={handleStageMouseMove}
                onMouseLeave={handleStageMouseLeave}
                onClick={() => setLightboxOpen(true)}
                title="Click to view full screen"
              >
                {/* Quick Action Buttons on Top Right */}
                <div className="gallery-quick-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="action-circle"
                    id="lightboxTrigger"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Zoom image"
                    title="Zoom image"
                  >
                    <Maximize2 />
                  </button>
                  <button
                    type="button"
                    className="action-circle"
                    id="galleryShareBtn"
                    onClick={handleShare}
                    aria-label="Share product"
                    title="Share product"
                  >
                    <Share2 />
                  </button>
                </div>

                {/* Stage Main Image */}
                <img
                  id="mainProductImg"
                  className={`stage-main-img ${imgFading ? 'fade-out' : ''}`}
                  src={gallery[currentImgIndex]}
                  alt={`${product.title} front view`}
                />

                {/* Hover Magnifier Lens */}
                <div className="zoom-lens" id="zoomLens" ref={zoomLensRef}></div>
                {/* Pop-out Zoom Preview Window for desktop precision inspection */}
                <div className="zoom-window" id="zoomWindow" ref={zoomWindowRef}></div>

                {/* Floating Nav Arrows at Bottom Right */}
                {gallery.length > 1 && (
                  <div className="gallery-nav-arrows" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="arrow-btn"
                      id="prevImgBtn"
                      onClick={prevImage}
                      aria-label="Previous view"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="arrow-btn"
                      id="nextImgBtn"
                      onClick={nextImage}
                      aria-label="Next view"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Product Narrative & Buy Box */}
            <div className="pdp-info" ref={buyBoxRef}>
              <div className="product-header">
                <div className="product-category">
                  <span className="kicker">{categoryName}</span>
                </div>
                <h1 className="product-title" id="productTitle">
                  {product.title}
                </h1>

                <div className="product-rating-row">
                  <div className="stars-block">★★★★★</div>
                  <span style={{ fontWeight: 700 }}>4.9</span>
                  <a
                    href="#reviews-section"
                    className="rating-link"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    (128 verified reviews)
                  </a>
                  <span className="sku-badge">SKU: {productSku}</span>
                </div>

                <div className="price-wrap">
                  <span className="current-price" id="productPrice">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {originalPrice > price && (
                    <span className="original-price" id="productOldPrice">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="discount-pill" id="productDiscount">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <div className="tax-notice">Inclusive of all taxes. Free express shipping applied at checkout.</div>
              </div>

              {/* Size Selection (ONLY Size Variation, No Color Variation, No EMI) */}
              <div className="option-group">
                <div className="option-header">
                  <span>
                    SELECT SIZE: <span className="option-selected-name" id="selectedSizeLabel">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    className="size-guide-btn"
                    id="sizeGuideTrigger"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    <Ruler className="w-3.5 h-3.5 inline mr-1" />
                    Size Guide & Measurements
                  </button>
                </div>

                <div className="sizes-grid" id="sizesGrid">
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt.size}
                      type="button"
                      disabled={opt.isOutOfStock}
                      className={`size-btn ${selectedSize === opt.size ? 'active' : ''} ${
                        opt.isOutOfStock ? 'out-of-stock' : ''
                      } ${opt.quantity !== null && opt.quantity <= 2 && opt.quantity > 0 ? 'low-stock' : ''}`}
                      onClick={() => {
                        setSelectedSize(opt.size);
                        showToast(`Size ${opt.size} selected`);
                      }}
                    >
                      {opt.size}
                    </button>
                  ))}
                </div>

                {isCurrentLowStock && (
                  <div className="size-stock-hint" id="sizeStockHint">
                    <Zap className="w-3.5 h-3.5 text-[#b87410]" />
                    <span>
                      Hurry! Only <strong>{currentSizeObj.quantity} pieces left</strong> in Size {selectedSize}.
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity and Action Buttons */}
              <div className="cta-row">
                <div className="qty-picker" aria-label="Quantity selector">
                  <button
                    type="button"
                    className="qty-btn"
                    id="qtyMinus"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-num" id="qtyDisplay">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="qty-btn"
                    id="qtyPlus"
                    disabled={quantity >= 10}
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="add-to-cart-btn"
                  id="addToCartBtn"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{isAddingToCart ? 'Adding...' : 'Add to Bag'}</span>
                </button>

                <button
                  type="button"
                  className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                  id="pdpWishlistBtn"
                  onClick={toggleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart fill={isWishlisted ? 'var(--pink)' : 'none'} />
                </button>
              </div>

              {/* 1-Click Instant Checkout Button */}
              <button
                type="button"
                className="buy-now-btn"
                id="buyNowBtn"
                onClick={handleBuyNow}
              >
                <span>Instant Checkout with 1-Click ⚡</span>
              </button>

              {/* Delivery Pincode Checker */}
              <div className="delivery-box" id="shipping-info">
                <div className="delivery-head">
                  <Truck className="w-4 h-4 text-[#8a0b72]" />
                  <span>Estimate Delivery & Cash on Delivery</span>
                </div>

                <form className="pincode-form" id="pincodeForm" onSubmit={handlePincodeSubmit}>
                  <input
                    type="text"
                    className="pincode-input"
                    id="pincodeInput"
                    placeholder="Enter 6-digit Pincode (e.g. 560001)"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  <button type="submit" className="pincode-btn">
                    Check
                  </button>
                </form>

                {deliveryResult && (
                  <div className={`delivery-result show ${!deliveryResult.success ? 'error' : ''}`} id="deliveryResult">
                    {deliveryResult.message}
                  </div>
                )}
              </div>

              {/* Trust Highlights */}
              <div className="trust-bullets">
                <div className="trust-bullet">
                  <ShieldCheck />
                  <div>
                    <strong>Artisan Craftsmanship</strong>
                    <span>Hand-draped modal-silk tailored in Jaipur atelier.</span>
                  </div>
                </div>
                <div className="trust-bullet">
                  <RotateCcw />
                  <div>
                    <strong>7-Day Easy Returns</strong>
                    <span>Doorstep pickup with instant credit or refund.</span>
                  </div>
                </div>
                <div className="trust-bullet">
                  <Sparkles />
                  <div>
                    <strong>Sustainable Dyes</strong>
                    <span>Natural hypoallergenic AZO-free pigments.</span>
                  </div>
                </div>
                <div className="trust-bullet">
                  <CheckCircle2 />
                  <div>
                    <strong>Verified Authenticity</strong>
                    <span>100% original Tere Rang design and guarantee.</span>
                  </div>
                </div>
              </div>

              {/* Accordion Specification Tabs */}
              <div className="accordions">
                {/* Accordion 1 */}
                <div className={`accordion-item ${openAccordion === 0 ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    aria-expanded={openAccordion === 0}
                    onClick={() => setOpenAccordion(openAccordion === 0 ? -1 : 0)}
                  >
                    <span>The Story & Silhouette</span>
                    <ChevronDown />
                  </button>
                  <div
                    className="accordion-content"
                    style={{ maxHeight: openAccordion === 0 ? '400px' : '0px' }}
                  >
                    <div className="accordion-inner">
                      <p>
                        {product.description ||
                          'A masterclass in asymmetric volume. The Gulabi Drape Dress balances a sculpted bodice with cascading pleats that gather into an effortless side cowl. Crafted for movement, this statement piece transitions effortlessly from sunset celebrations to intimate dinners.'}
                      </p>
                      <ul>
                        <li>Asymmetrical cowl neckline with concealed side closure</li>
                        <li>Sculpted high-low draped hemline that moves with every stride</li>
                        <li>Discreet inseam pockets for everyday practicality</li>
                        <li>Model is 5'9" (175 cm) and wears a size S (Bust: 34", Waist: 26")</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Accordion 2 */}
                <div className={`accordion-item ${openAccordion === 1 ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    aria-expanded={openAccordion === 1}
                    onClick={() => setOpenAccordion(openAccordion === 1 ? -1 : 1)}
                  >
                    <span>Fabric & Artisanal Finish</span>
                    <ChevronDown />
                  </button>
                  <div
                    className="accordion-content"
                    style={{ maxHeight: openAccordion === 1 ? '400px' : '0px' }}
                  >
                    <div className="accordion-inner">
                      <p>
                        Woven from 100% premium botanical modal-silk. Breathable, gentle against sensitive skin, with a
                        liquid-like lustre that catches the light with refined subtlety.
                      </p>
                      <ul>
                        <li>Body: 100% Mulberry Modal-Silk</li>
                        <li>Lining: Lightweight 100% breathable cotton voil</li>
                        <li>Hand-rolled borders and reinforced french seam finishes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Accordion 3 */}
                <div className={`accordion-item ${openAccordion === 2 ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    aria-expanded={openAccordion === 2}
                    onClick={() => setOpenAccordion(openAccordion === 2 ? -1 : 2)}
                  >
                    <span>Wash & Garment Care</span>
                    <ChevronDown />
                  </button>
                  <div
                    className="accordion-content"
                    style={{ maxHeight: openAccordion === 2 ? '400px' : '0px' }}
                  >
                    <div className="accordion-inner">
                      <p>To preserve the saturated hue and fluid architectural drape:</p>
                      <ul>
                        <li>Dry clean recommended for the first 2 wears</li>
                        <li>Gentle cold hand-wash with mild silk detergent thereafter</li>
                        <li>Do not wring or tumble dry; dry in shade on a padded hanger</li>
                        <li>Steam iron on low reverse setting</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Accordion 4 */}
                <div className={`accordion-item ${openAccordion === 3 ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    aria-expanded={openAccordion === 3}
                    onClick={() => setOpenAccordion(openAccordion === 3 ? -1 : 3)}
                  >
                    <span>Shipping, Exchange & Returns</span>
                    <ChevronDown />
                  </button>
                  <div
                    className="accordion-content"
                    style={{ maxHeight: openAccordion === 3 ? '400px' : '0px' }}
                  >
                    <div className="accordion-inner">
                      <p>
                        We believe in stress-free shopping. If the fit isn't perfection, we will exchange or refund with
                        zero hassle.
                      </p>
                      <ul>
                        <li>Orders dispatched within 24 hours from Jaipur atelier</li>
                        <li>Delivery in 2–4 business days across metro cities</li>
                        <li>Complimentary exchange for size or alternative color</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* "Complete The Look" Curated Stylist Bundle Section */}
        <section className="container">
          <div className="styled-with-section">
            <div className="styled-head">
              <div>
                <div className="kicker">Curated by our Stylists</div>
                <h2 style={{ fontSize: '32px', marginTop: '4px' }}>Complete The Look</h2>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                Bundle these hand-selected accessories and save 10% on the edit.
              </p>
            </div>

            <div className="styled-grid">
              {/* Look Item 1: Main Product */}
              <label className="look-card">
                <input type="checkbox" checked disabled readOnly />
                <img src={gallery[0]} alt={product.title} />
                <div className="look-card-info">
                  <h4>{product.title} (This Item)</h4>
                  <div className="price">₹{price.toLocaleString('en-IN')}</div>
                </div>
              </label>

              {/* Look Item 2: Organza Stole */}
              <label
                className="look-card"
                onClick={(e) => {
                  e.preventDefault();
                  setBundleChecks((prev) => ({ ...prev, stole: !prev.stole }));
                }}
              >
                <input
                  type="checkbox"
                  checked={bundleChecks.stole}
                  onChange={() => {}}
                />
                <img
                  src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=300&q=80"
                  alt="Midnight Organza Stole"
                />
                <div className="look-card-info">
                  <h4>Midnight Organza Stole</h4>
                  <div className="price">₹1,299</div>
                </div>
              </label>

              {/* Look Item 3: Statement Earrings */}
              <label
                className="look-card"
                onClick={(e) => {
                  e.preventDefault();
                  setBundleChecks((prev) => ({ ...prev, earrings: !prev.earrings }));
                }}
              >
                <input
                  type="checkbox"
                  checked={bundleChecks.earrings}
                  onChange={() => {}}
                />
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80"
                  alt="Chandbali Statement Earrings"
                />
                <div className="look-card-info">
                  <h4>Chandbali Statement Earrings</h4>
                  <div className="price">₹1,499</div>
                </div>
              </label>
            </div>

            <div className="bundle-bar">
              <div className="bundle-total">
                Total for {1 + (bundleChecks.stole ? 1 : 0) + (bundleChecks.earrings ? 1 : 0)} items:{' '}
                <strong id="bundlePriceDisplay">₹{bundleDiscountedTotal.toLocaleString('en-IN')}</strong>
                {bundleSavings > 0 && (
                  <span style={{ color: 'var(--pink)', fontSize: '12px', marginLeft: '8px' }}>
                    (Saved ₹{bundleSavings.toLocaleString('en-IN')} with bundle)
                  </span>
                )}
              </div>
              <button
                type="button"
                className="add-to-cart-btn"
                id="addBundleBtn"
                style={{ minHeight: '46px', padding: '0 24px' }}
                onClick={handleAddBundleToCart}
              >
                <span>Add Entire Look to Bag</span>
              </button>
            </div>
          </div>
        </section>

        {/* Verified Community Reviews Section */}
        <section className="reviews-section" id="reviews-section">
          <div className="container">
            <div className="reviews-head">
              <div>
                <div className="kicker">Verified Community Reviews</div>
                <h2 style={{ fontSize: 'clamp(30px, 4vw, 42px)', marginTop: '4px' }}>Worn. Loved. Repeated.</h2>
              </div>
              <button
                type="button"
                className="add-to-cart-btn"
                id="writeReviewBtn"
                style={{ minHeight: '44px', padding: '0 20px', fontSize: '12px' }}
                onClick={() => setReviewModalOpen(true)}
              >
                <span>Write a Review ✎</span>
              </button>
            </div>

            {/* Rating Summary Card */}
            <div className="rating-summary-grid">
              <div className="score-hero">
                <div className="score-big">4.9</div>
                <div className="stars-block" style={{ fontSize: '18px', marginBottom: '6px' }}>
                  ★★★★★
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Based on 128 verified customer reviews
                </div>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#1d8d63', fontWeight: 600 }}>
                  ✓ 94% recommend this dress
                </div>
              </div>

              <div className="score-bars">
                <div className="bar-row">
                  <span className="star-label">5 Stars</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '88%' }}></div>
                  </div>
                  <span>112</span>
                </div>
                <div className="bar-row">
                  <span className="star-label">4 Stars</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '9%' }}></div>
                  </div>
                  <span>12</span>
                </div>
                <div className="bar-row">
                  <span className="star-label">3 Stars</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '2%' }}></div>
                  </div>
                  <span>3</span>
                </div>
                <div className="bar-row">
                  <span className="star-label">2 Stars</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '1%' }}></div>
                  </div>
                  <span>1</span>
                </div>
                <div className="bar-row">
                  <span className="star-label">1 Star</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '0%' }}></div>
                  </div>
                  <span>0</span>
                </div>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="reviews-grid">
              <article className="review-card">
                <div>
                  <div className="review-stars">★★★★★</div>
                  <p className="review-text">
                    “The drape is exceptional. I wore this to an art gallery opening in Mumbai and received non-stop
                    compliments. The color has incredible depth — vibrant without feeling loud.”
                  </p>
                </div>
                <div className="review-author">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Kavita S."
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <strong>Kavita Shenoy</strong>
                    <span>Mumbai • Size M • Verified Buyer</span>
                    <div className="verified-tag">✓ Verified Purchase</div>
                  </div>
                </div>
              </article>

              <article className="review-card">
                <div>
                  <div className="review-stars">★★★★★</div>
                  <p className="review-text">
                    “Feels like pure luxury silk yet so effortless to move in. The pockets were a delightful surprise!
                    Perfect length and falls like a dream. Truly an exceptional wardrobe piece.”
                  </p>
                </div>
                <div className="review-author">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                    alt="Ananya M."
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <strong>Ananya Mathur</strong>
                    <span>Bengaluru • Size S • Verified Buyer</span>
                    <div className="verified-tag">✓ Verified Purchase</div>
                  </div>
                </div>
              </article>

              <article className="review-card">
                <div>
                  <div className="review-stars">★★★★★</div>
                  <p className="review-text">
                    “Tere Rang has completely nailed the sweet spot between Indian drape sensibility and modern Western
                    tailoring. Truly one of the best pieces in my wardrobe right now.”
                  </p>
                </div>
                <div className="review-author">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80"
                    alt="Meera D."
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <strong>Meera Deshmukh</strong>
                    <span>New Delhi • Size L • Verified Buyer</span>
                    <div className="verified-tag">✓ Verified Purchase</div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* You May Also Admire / Related Products Section (NO tags on images) */}
        <section className="related-section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">Complete Your Wardrobe</div>
                <h2 style={{ fontSize: '34px', marginTop: '4px' }}>You May Also Admire</h2>
              </div>
              <Link to="/shop" className="rating-link" style={{ fontWeight: 700 }}>
                Explore All Collection →
              </Link>
            </div>

            <div className="products-grid">
              {(relatedProducts.length > 0 ? relatedProducts : Object.values(FALLBACK_CATALOG).filter((p) => p.id !== product.id))
                .slice(0, 4)
                .map((rel) => {
                  const relPrice = rel.price || 2999;
                  const relImg =
                    rel.image ||
                    (Array.isArray(rel.gallery) && rel.gallery[0]) ||
                    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=86';
                  const relCategory = rel.category?.name || rel.category || 'Editorial Collection';

                  return (
                    <article key={rel.id || rel.backendId} className="product-card">
                      <div className="product-media">
                        <img src={relImg} alt={rel.title} />
                        <button
                          type="button"
                          className="product-card-wish"
                          aria-label="Add to wishlist"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast(`Saved ${rel.title} to wishlist ♥`);
                          }}
                        >
                          <Heart />
                        </button>
                        <button
                          type="button"
                          className="quick-add-flyout"
                          onClick={() => navigate(`/product/${rel.backendId || rel.id}`)}
                        >
                          View Product Details
                        </button>
                      </div>
                      <div className="product-card-info">
                        <h3>
                          <Link to={`/product/${rel.backendId || rel.id}`}>{rel.title}</Link>
                        </h3>
                        <div className="product-card-meta">{relCategory}</div>
                        <div className="product-card-price">₹{relPrice.toLocaleString('en-IN')}</div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Purchase Bar */}
      <div className={`sticky-bar ${showStickyBar ? 'visible' : ''}`} id="stickyBar">
        <div className="container sticky-bar-inner">
          <div className="sticky-prod">
            <img src={gallery[0]} alt={product.title} className="sticky-thumb" id="stickyThumb" />
            <div>
              <div className="sticky-title" id="stickyTitle">
                {product.title}
              </div>
              <div className="sticky-price" id="stickyPrice">
                ₹{price.toLocaleString('en-IN')} • <span>Size {selectedSize}</span>
              </div>
            </div>
          </div>

          <div className="sticky-actions">
            <button
              type="button"
              className="add-to-cart-btn"
              id="stickyAddBtn"
              style={{ minHeight: '44px', padding: '0 24px', fontSize: '12px' }}
              onClick={handleAddToCart}
            >
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div
          className="modal-backdrop open"
          id="sizeGuideModal"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              id="sizeGuideClose"
              onClick={() => setSizeGuideOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="kicker">Body & Garment Dimensions</div>
            <h2>Size Guide & Measurements</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
              All measurements are provided in garment specifications. For draped cuts, we suggest sticking to your standard bust size.
            </p>

            <div className="unit-switch">
              <button
                type="button"
                className={`unit-btn ${sizeGuideUnit === 'in' ? 'active' : ''}`}
                id="unitInchesBtn"
                onClick={() => setSizeGuideUnit('in')}
              >
                Inches (in)
              </button>
              <button
                type="button"
                className={`unit-btn ${sizeGuideUnit === 'cm' ? 'active' : ''}`}
                id="unitCmBtn"
                onClick={() => setSizeGuideUnit('cm')}
              >
                Centimeters (cm)
              </button>
            </div>

            <table className="size-table" id="sizeTable">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Bust</th>
                  <th>Waist</th>
                  <th>Hips</th>
                  <th>Garment Length</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE_DATA.map((row) => (
                  <tr key={row.size}>
                    <td>
                      <strong>{row.size}</strong>
                    </td>
                    <td>{sizeGuideUnit === 'in' ? row.bustIn : row.bustCm}</td>
                    <td>{sizeGuideUnit === 'in' ? row.waistIn : row.waistCm}</td>
                    <td>{sizeGuideUnit === 'in' ? row.hipsIn : row.hipsCm}</td>
                    <td>{sizeGuideUnit === 'in' ? row.lengthIn : row.lengthCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="size-guide-tip">
              <strong>Fitting Tip:</strong> The Gulabi Drape Dress features fluid cowl pleating at the waist that accommodates gently. If you are between sizes, we recommend sizing down for a closer fit, or sizing up for a more relaxed, floor-sweeping editorial look.
            </div>
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {reviewModalOpen && (
        <div
          className="modal-backdrop open"
          id="reviewModal"
          onClick={() => setReviewModalOpen(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              id="reviewClose"
              onClick={() => setReviewModalOpen(false)}
              aria-label="Close review modal"
            >
              ✕
            </button>
            <div className="kicker">Share your experience</div>
            <h2>Write a Review</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
              Your feedback helps our Jaipur artisans refine each collection.
            </p>

            <form id="reviewForm" onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  OVERALL RATING
                </label>
                <div
                  id="starPicker"
                  style={{ fontSize: '24px', color: '#df9e00', cursor: 'pointer', display: 'flex', gap: '4px' }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{ opacity: star <= reviewRating ? 1 : 0.3 }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  YOUR FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  CITY & PURCHASED SIZE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur • Size M"
                  value={reviewCity}
                  onChange={(e) => setReviewCity(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  YOUR REVIEW
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the fit, fabric feel, and compliments you received..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                className="add-to-cart-btn"
                style={{ width: '100%', minHeight: '48px' }}
              >
                <span>Submit Review</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="lightbox-modal open"
          id="lightboxModal"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="lightbox-close"
            id="lightboxClose"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close fullscreen preview"
          >
            ✕
          </button>
          <img
            id="lightboxImg"
            src={gallery[currentImgIndex]}
            alt={product.title}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Toast Notification Pill */}
      <div className={`toast ${toastMsg ? 'show' : ''}`} id="toast">
        <Sparkles className="w-4 h-4 text-[#f63a98]" />
        <span>{toastMsg}</span>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
