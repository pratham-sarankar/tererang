import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Gift, Heart, Ruler, Share2, ShoppingCart, Zap } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { apiUrl } from '../config/env.js';
import { useCart } from '../context/cartContextStore.js';
import { mapProductForDisplay } from '../utils/productPresentation.js';

const ICON_MAP = { Zap, Gift, Ruler };

const HighlightItem = ({ icon, text }) => {
  const IconComponent = ICON_MAP[icon];
  if (!IconComponent) return null;
  return (
    <div className="flex items-center space-x-2 text-muted-foreground text-sm">
      <IconComponent className="w-5 h-5 text-primary" />
      <span>{text}</span>
    </div>
  );
};

const ProductDetailPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(() => {
    const initial = location.state?.product;
    return initial ? mapProductForDisplay(initial) : null;
  });
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [mainImage, setMainImage] = useState(product?.gallery[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const [globalDiscount, setGlobalDiscount] = useState({ percentage: 0, enabled: false });
  const [shareMessage, setShareMessage] = useState(null);

  const canFetchFromBackend = useMemo(() => Boolean(productId), [productId]);

  // Fetch global discount settings
  useEffect(() => {
    const fetchGlobalDiscount = async () => {
      try {
        const response = await fetch(apiUrl('/api/settings'));
        const data = await response.json();
        if (response.ok && data.settings) {
          setGlobalDiscount({
            percentage: data.settings.globalDiscountPercentage || 0,
            enabled: data.settings.globalDiscountEnabled || false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch global discount:', err);
      }
    };
    fetchGlobalDiscount();
  }, []);

  useEffect(() => {
    if (!canFetchFromBackend) return undefined;

    let active = true;
    const controller = new AbortController();

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl(`/api/products/${productId}`), {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Unable to load product');
        }
        if (active) {
          setProduct(mapProductForDisplay(data));
          setError(null);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (active) {
          setError(err.message || 'Unable to load product right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [canFetchFromBackend, productId]);

  const displaySizes = useMemo(() => {
    const normalized = Array.isArray(product?.sizes) ? product.sizes : [];
    const sanitized = normalized.map((size) => {
      if (!size || typeof size !== 'string') return size;
      const compact = size.replace(/\s+/g, '').toLowerCase();
      return compact === 'extrasmall' || compact === 'xs' ? 'XS' : size;
    });
    const hasExtraSmall = normalized.some((size) => {
      if (!size || typeof size !== 'string') return false;
      const compact = size.replace(/\s+/g, '').toLowerCase();
      return compact === 'extrasmall' || compact === 'xs';
    });

    if (sanitized.length === 0) {
      return ['XS'];
    }

    return hasExtraSmall ? sanitized : ['XS', ...sanitized];
  }, [product]);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(displaySizes[0] || '');
    setMainImage(product.gallery[0]);
  }, [product, displaySizes]);

  // Calculate displayed original price (marked up from database price)
  const calculateDisplayedOriginalPrice = (dbPrice) => {
    if (!globalDiscount.enabled || globalDiscount.percentage <= 0) {
      return null;
    }
    // Database price is the "discounted" price customers pay
    // Calculate what the "original" price should be to show the discount
    // Formula: originalPrice = dbPrice / (1 - discount/100)
    const originalPrice = dbPrice / (1 - globalDiscount.percentage / 100);
    return Math.round(originalPrice);
  };

  const actualPrice = product?.price || 0; // This is what customer pays (from DB)
  const displayedOriginalPrice = calculateDisplayedOriginalPrice(actualPrice);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedSize) {
      setCartMessage({ type: 'error', text: 'Please select a size.' });
      return;
    }
    try {
      setIsAdding(true);
      setCartMessage(null);
      await addToCart({
        productId: product.backendId || product.id,
        quantity: 1,
        size: selectedSize,
      });
      setIsAdded(true);
      setCartMessage({ type: 'success', text: 'Added to cart!' });
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      setCartMessage({ type: 'error', text: err.message || 'Failed to add to cart' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} on Tererang - ₹${actualPrice.toLocaleString('en-IN')}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        // Use Web Share API if available (mobile devices)
        await navigator.share(shareData);
        setShareMessage({ type: 'success', text: 'Shared successfully!' });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage({ type: 'success', text: 'Link copied to clipboard!' });
      }
      setTimeout(() => setShareMessage(null), 3000);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setShareMessage({ type: 'error', text: 'Failed to share' });
        setTimeout(() => setShareMessage(null), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading product...
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 text-foreground">
        <p className="mb-4">{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 border border-primary text-foreground hover:bg-primary hover:text-white text-xs lowercase tracking-widest font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background p-4 sm:p-10 lg:py-16">
      <button
        onClick={() => navigate(-1)}
        className="fixed z-10 top-4 left-4 lg:top-10 lg:left-10 bg-card p-2 rounded-full shadow-sm border border-border text-muted-foreground hover:text-primary transition flex items-center font-medium"
        type="button"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="hidden sm:inline">Back to Collection</span>
      </button>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row shadow-sm rounded-lg overflow-hidden bg-card border border-border">
        <div className="w-full lg:w-3/5 p-4 lg:p-8 flex flex-col items-center bg-secondary relative">
          {product.discount ? (
            <div className="absolute top-8 left-8 bg-card/90 backdrop-blur-xs border border-border text-foreground font-medium text-sm py-1 px-3 rounded-sm z-[5]">
              {product.discount}% off
            </div>
          ) : null}

          <ProductImage
            src={mainImage}
            alt={product.title}
            className="rounded-sm w-full max-w-lg h-[600px] object-cover mb-6"
          />

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {product.gallery.map((imgUrl) => (
              <ProductImage
                key={imgUrl}
                src={imgUrl}
                alt={`${product.title} thumbnail`}
                className={`w-20 h-20 object-cover rounded-sm border cursor-pointer transition duration-200 ${imgUrl === mainImage
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => setMainImage(imgUrl)}
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-2/5 p-6 sm:p-8 lg:p-10 relative">
          <span className="text-sm font-medium text-accent uppercase tracking-[0.2em]">
            {product.brand}
          </span>
          <h1 className="text-4xl font-serif lowercase text-foreground mb-2 mt-1 tracking-wide">{product.title}</h1>

          <div className="mb-6 border-b border-border pb-4">
            <div className="flex items-baseline mb-2">
              {displayedOriginalPrice && (
                <span className="line-through text-muted-foreground mr-3 text-xl">
                  ₹{displayedOriginalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-4xl font-medium text-foreground">
                ₹{actualPrice.toLocaleString('en-IN')}
              </span>
              <button
                className="ml-auto p-2 border border-border rounded-full text-muted-foreground hover:bg-secondary hover:text-primary transition"
                type="button"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            {displayedOriginalPrice && (
              <div className="flex items-center gap-2">
                <span className="inline-block bg-secondary text-foreground px-3 py-1 rounded-sm text-sm border border-border">
                  {globalDiscount.percentage}% off
                </span>
                <span className="text-primary text-sm font-medium">
                  Save ₹{(displayedOriginalPrice - actualPrice).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed text-base">{product.description}</p>

          <div className="mb-8 space-y-3 p-4 bg-secondary rounded-md border border-border">
            {product.highlights.map((item) => (
              <HighlightItem key={`${item.icon}-${item.text}`} icon={item.icon} text={item.text} />
            ))}
          </div>

          <h3 className="font-medium mb-3 text-foreground flex justify-between items-center text-sm tracking-wide">
            Select Size:
            <span className="text-primary font-medium text-lg">{selectedSize || 'Select'}</span>
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {displaySizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border px-6 py-2 rounded-sm font-medium transition duration-200 ${selectedSize === size
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground hover:border-primary hover:bg-secondary'
                  }`}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>

          <div className="mb-10" />

          <div className="lg:sticky lg:bottom-0 lg:left-0 lg:mt-8 pt-4 lg:bg-card lg:shadow-[0_-5px_15px_rgba(0,0,0,0.04)] flex gap-4 w-full">
            <button
              onClick={handleAddToCart}
              disabled={isAdded || isAdding || !selectedSize}
              className="flex-1 flex items-center justify-center bg-primary text-white font-medium text-lg py-3 rounded-sm hover:bg-primary/90 transition duration-300 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              type="button"
            >
              {isAdded ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2 animate-pulse" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6 mr-2" /> {isAdding ? 'Adding...' : 'Add to Cart'}
                </>
              )}
            </button>
            <button
              className="p-3 border border-border rounded-sm text-muted-foreground hover:bg-secondary hover:text-destructive transition duration-300"
              type="button"
            >
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {cartMessage?.text && (
            <p
              className={`mt-4 text-sm ${cartMessage.type === 'error' ? 'text-red-500' : 'text-green-500'
                }`}
            >
              {cartMessage.text}
            </p>
          )}

          {shareMessage?.text && (
            <p
              className={`mt-4 text-sm ${shareMessage.type === 'error' ? 'text-red-500' : 'text-green-500'
                }`}
            >
              {shareMessage.text}
            </p>
          )}

          {!selectedSize && (
            <p className="text-red-500 text-sm mt-3 text-center">Please select a Size before adding to cart.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
