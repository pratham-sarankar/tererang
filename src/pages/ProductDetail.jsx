import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Gift, Heart, Ruler, Share2, ShoppingCart, Zap } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { apiUrl } from '../config/env.js';
import { useCart } from '../context/cartContextStore.js';
import { mapProductForDisplay } from '../utils/productPresentation.js';
import { Footer } from '../components/Footer.jsx';

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
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading product...
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground">
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
    <>
    <main className="relative min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-10 lg:py-14">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-xs font-semibold lowercase tracking-[0.18em] text-muted-foreground transition hover:border-primary hover:text-primary"
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        back to collection
      </button>

      <div className="mx-auto grid max-w-7xl overflow-hidden border border-border bg-card lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative bg-secondary p-4 sm:p-6 lg:p-8">
          {product.discount ? (
            <div className="absolute left-8 top-8 z-[5] border border-border bg-card/90 px-3 py-1 text-sm font-semibold text-foreground backdrop-blur-sm">
              {product.discount}% off
            </div>
          ) : null}

          <ProductImage
            src={mainImage}
            alt={product.title}
            className="h-[430px] w-full object-cover sm:h-[620px] lg:h-[720px]"
          />

          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {product.gallery.map((imgUrl) => (
              <button
                key={imgUrl}
                onClick={() => setMainImage(imgUrl)}
                className={`aspect-square overflow-hidden border transition ${imgUrl === mainImage ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/60'}`}
                type="button"
              >
                <ProductImage
                  src={imgUrl}
                  alt={`${product.title} thumbnail`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <span className="text-sm font-semibold tracking-[0.08em] text-accent">
            {product.brand}
          </span>
          <h1 className="mt-3 font-serif text-5xl lowercase leading-none text-foreground sm:text-6xl">{product.title}</h1>

          <div className="my-7 border-y border-border py-5">
            <div className="flex items-center gap-3">
              {displayedOriginalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{displayedOriginalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="font-serif text-5xl leading-none text-foreground">
                ₹{actualPrice.toLocaleString('en-IN')}
              </span>
              <button
                className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-primary"
                type="button"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            {displayedOriginalPrice && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-block border border-border bg-secondary px-3 py-1 text-sm font-semibold text-foreground">
                  {globalDiscount.percentage}% off
                </span>
                <span className="text-primary text-sm font-medium">
                  Save ₹{(displayedOriginalPrice - actualPrice).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          <p className="mb-6 text-base leading-8 text-muted-foreground">
            {product.description || 'A Tererang atelier piece finished with thoughtful craft and elegant wearability.'}
          </p>

          <div className="mb-8 space-y-3 border border-border bg-secondary p-5">
            {product.highlights.map((item) => (
              <HighlightItem key={`${item.icon}-${item.text}`} icon={item.icon} text={item.text} />
            ))}
          </div>

          <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-foreground">
            select size
            <span className="text-sm text-primary">{selectedSize || 'select'}</span>
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {displaySizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-14 border px-5 py-3 text-sm font-semibold transition duration-200 ${selectedSize === size
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

          <div className="mt-8 flex w-full gap-3 border-t border-border pt-5">
            <button
              onClick={handleAddToCart}
              disabled={isAdded || isAdding || !selectedSize}
              className="flex flex-1 items-center justify-center bg-primary px-5 py-4 text-sm font-semibold lowercase tracking-[0.18em] text-white transition duration-300 hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
              type="button"
            >
              {isAdded ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5 animate-pulse" /> added to cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" /> {isAdding ? 'adding...' : 'add to cart'}
                </>
              )}
            </button>
            <button
              className="border border-border p-4 text-muted-foreground transition duration-300 hover:bg-secondary hover:text-destructive"
              type="button"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {cartMessage?.text && (
            <p className={`mt-4 text-sm ${cartMessage.type === 'error' ? 'text-destructive' : 'text-primary'}`}>
              {cartMessage.text}
            </p>
          )}

          {shareMessage?.text && (
            <p className={`mt-4 text-sm ${shareMessage.type === 'error' ? 'text-destructive' : 'text-primary'}`}>
              {shareMessage.text}
            </p>
          )}

          {!selectedSize && (
            <p className="mt-3 text-center text-sm text-destructive">Please select a size before adding to cart.</p>
          )}
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
};

export default ProductDetailPage;
