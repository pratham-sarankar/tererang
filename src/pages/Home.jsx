import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Gift,
  Heart,
  Ruler,
  Share2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import banner from "../components/Banner.png";
import { apiUrl, imageUrl } from "../config/env.js";
import { useCart } from "../context/CartContext.jsx";

const LATEST_COLLECTION_LIMIT = 12;
const FALLBACK_IMAGE = "https://via.placeholder.com/400x600?text=Tererang";

const DEFAULT_SIZES = ["S", "M", "L", "XL"];
const DEFAULT_HEIGHTS = ["Up to 5'3''", "5'4''-5'6''", "5'6'' and above"];
const DEFAULT_HIGHLIGHTS = [
  { icon: "Zap", text: "Ready-to-Ship (2 days)" },
  { icon: "Gift", text: "Free Delivery & Gift Wrapping" },
  { icon: "Ruler", text: "Custom Fitting Available" },
];

const titleCase = (value) => {
  if (!value) return "Tererang";
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const toAbsoluteImage = (pathValue) => {
  if (!pathValue) return FALLBACK_IMAGE;
  return /^https?:\/\//i.test(pathValue) ? pathValue : imageUrl(pathValue);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return null;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return null;
  return numericValue.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const computeDiscount = (current, previous) => {
  if (!current || !previous || previous <= current) return null;
  return Math.round(((previous - current) / previous) * 100);
};

const mapBackendProduct = (rawProduct = {}) => {
  const backendId = rawProduct._id || rawProduct.id;
  const numericPrice = Number(rawProduct.price) || 0;
  const oldPriceValue = numericPrice ? Math.round(numericPrice * 1.15) : 0;

  const relativeImages = Array.isArray(rawProduct.images) ? [...rawProduct.images] : [];
  if (rawProduct.image && !relativeImages.includes(rawProduct.image)) {
    relativeImages.unshift(rawProduct.image);
  }

  const gallery = relativeImages
    .map((img) => toAbsoluteImage(img))
    .filter(Boolean);

  if (gallery.length === 0) {
    gallery.push(FALLBACK_IMAGE);
  }

  return {
    id: backendId,
    backendId,
    title: rawProduct.name || "Tererang Exclusive",
    description: rawProduct.description || "",
    brand: titleCase(rawProduct.category),
    displayPrice: formatCurrency(numericPrice) || "₹0",
    displayOldPrice: formatCurrency(oldPriceValue),
    numericPrice,
    discount: computeDiscount(numericPrice, oldPriceValue),
    image: gallery[0],
    gallery,
    additionalImages: gallery.slice(1),
    sizes: rawProduct.sizes?.length ? rawProduct.sizes : DEFAULT_SIZES,
    heightOptions: rawProduct.heightOptions?.length
      ? rawProduct.heightOptions
      : DEFAULT_HEIGHTS,
    highlights: rawProduct.highlights?.length ? rawProduct.highlights : DEFAULT_HIGHLIGHTS,
  };
};

const ICON_MAP = {
  Zap,
  Gift,
  Ruler,
};

const HighlightItem = ({ icon, text }) => {
  const IconComponent = ICON_MAP[icon];
  if (!IconComponent) return null;
  return (
    <div className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
      <IconComponent className="w-5 h-5 text-purple-600" />
      <span>{text}</span>
    </div>
  );
};

const HomeProductCard = ({ product, onSelect = () => {} }) => (
  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 group border border-gray-100">
    <div className="relative overflow-hidden" onClick={() => onSelect(product.id)}>
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-80 object-cover transition duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-4">
        <span className="text-white text-lg font-bold p-2 bg-purple-600/90 rounded-lg shadow-lg transform translate-y-full group-hover:translate-y-0 transition duration-300">
          Quick View
        </span>
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{product.title}</h3>
      <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">{product.brand}</p>
      <div className="flex items-center justify-between">
        <div>
          {product.displayOldPrice && (
            <span className="line-through text-gray-400 text-base mr-2">
              {product.displayOldPrice}
            </span>
          )}
          <span className="text-2xl font-extrabold text-purple-600">{product.displayPrice}</span>
        </div>
        <button
          onClick={() => onSelect(product.id)}
          className="text-white bg-purple-600 p-3 rounded-full shadow-lg hover:bg-purple-700 transition transform hover:scale-110"
          aria-label={`View ${product.title}`}
          type="button"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const ProductDetailView = ({ product, relatedProducts, onBack, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [selectedHeight, setSelectedHeight] = useState(product.heightOptions[0] || "");
  const [mainImage, setMainImage] = useState(product.gallery[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  useEffect(() => {
    setSelectedSize(product.sizes[0] || "");
    setSelectedHeight(product.heightOptions[0] || "");
    setMainImage(product.gallery[0]);
  }, [product]);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedHeight) {
      setCartMessage({ type: "error", text: "Please select size and height." });
      return;
    }
    try {
      setIsAdding(true);
      setCartMessage(null);
      await addToCart({
        productId: product.backendId,
        quantity: 1,
        size: selectedSize,
        height: selectedHeight,
      });
      setIsAdded(true);
      setCartMessage({ type: "success", text: "Added to cart!" });
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      setCartMessage({ type: "error", text: err.message || "Failed to add to cart" });
    } finally {
      setIsAdding(false);
    }
  };

  const related = relatedProducts.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 sm:p-10 lg:py-16">
      <button
        onClick={onBack}
        className="fixed z-10 top-4 left-4 lg:top-10 lg:left-10 bg-white p-2 rounded-full shadow-lg text-purple-600 hover:bg-purple-50 transition flex items-center font-medium"
        type="button"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="hidden sm:inline">Back to Collection</span>
      </button>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white">
        <div className="w-full lg:w-3/5 p-4 lg:p-8 flex flex-col items-center bg-gray-100 relative">
          {product.discount ? (
            <div className="absolute top-8 left-8 bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg z-[5]">
              {product.discount}% OFF
            </div>
          ) : null}

          <img
            src={mainImage}
            alt={product.title}
            className="rounded-xl w-full max-w-lg h-[600px] object-cover border border-gray-200 transition duration-500 hover:shadow-xl hover:scale-[1.01] mb-6"
          />

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {product.gallery.map((imgUrl) => (
              <img
                key={imgUrl}
                src={imgUrl}
                alt={`${product.title} thumbnail`}
                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition duration-200 ${
                  imgUrl === mainImage
                    ? "border-purple-600 shadow-md"
                    : "border-gray-200 hover:border-purple-300"
                }`}
                onClick={() => setMainImage(imgUrl)}
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-2/5 p-6 sm:p-8 lg:p-10 relative">
          <span className="text-sm font-medium text-purple-500 uppercase tracking-[0.2em]">
            {product.brand}
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 mt-1">{product.title}</h1>

          <div className="mb-6 border-b pb-4 flex items-baseline">
            {product.displayOldPrice && (
              <span className="line-through text-gray-400 mr-3 text-xl">
                {product.displayOldPrice}
              </span>
            )}
            <span className="text-4xl font-extrabold text-purple-600">{product.displayPrice}</span>
            <button
              className="ml-auto p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition"
              type="button"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed text-base">{product.description}</p>

          <div className="mb-8 space-y-3 p-4 bg-purple-50 rounded-xl">
            {product.highlights.map((item) => (
              <HighlightItem key={`${item.icon}-${item.text}`} icon={item.icon} text={item.text} />
            ))}
          </div>

          <h3 className="font-semibold mb-3 text-gray-800 flex justify-between items-center">
            Select Size:
            <span className="text-purple-600 font-bold text-lg">{selectedSize || "Select"}</span>
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border-2 px-6 py-2 rounded-full font-medium transition duration-200 shadow-sm ${
                  selectedSize === size
                    ? "bg-purple-600 text-white border-purple-600 shadow-md transform scale-105"
                    : "border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-600"
                }`}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>

          <h3 className="font-semibold mb-3 text-gray-800 flex justify-between items-center">
            Height Range:
            <span className="text-cyan-600 font-bold text-lg">{selectedHeight || "Select"}</span>
          </h3>
          <div className="flex flex-wrap gap-3 mb-10">
            {product.heightOptions.map((height) => (
              <button
                key={height}
                onClick={() => setSelectedHeight(height)}
                className={`border-2 px-4 py-2 rounded-full text-sm transition duration-200 shadow-sm ${
                  selectedHeight === height
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-md transform scale-105"
                    : "border-gray-300 text-gray-700 hover:bg-cyan-50 hover:border-cyan-600"
                }`}
                type="button"
              >
                {height}
              </button>
            ))}
          </div>

          <div className="lg:sticky lg:bottom-0 lg:left-0 lg:mt-8 pt-4 lg:bg-white lg:shadow-[0_-5px_15px_rgba(0,0,0,0.05)] flex gap-4 w-full">
            <button
              onClick={handleAddToCart}
              disabled={isAdded || isAdding || !selectedSize || !selectedHeight}
              className="flex-1 flex items-center justify-center bg-purple-600 text-white font-extrabold text-lg py-3 rounded-xl hover:bg-purple-700 transition duration-300 transform hover:scale-[1.01] shadow-xl shadow-purple-300/60 disabled:bg-gray-400 disabled:shadow-none"
              type="button"
            >
              {isAdded ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2 animate-pulse" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6 mr-2" /> {isAdding ? "Adding..." : "Add to Cart"}
                </>
              )}
            </button>
            <button
              className="p-3 border-2 border-gray-300 rounded-xl text-gray-500 hover:bg-red-100 hover:text-red-500 transition duration-300 shadow-sm"
              type="button"
            >
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {cartMessage?.text && (
            <p
              className={`mt-4 text-sm ${
                cartMessage.type === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {cartMessage.text}
            </p>
          )}

          {(!selectedSize || !selectedHeight) && (
            <p className="text-red-500 text-sm mt-3 text-center">
              Please select both Size and Height before adding to cart.
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="max-w-7xl mx-auto mt-16 p-6 sm:p-8 bg-white rounded-3xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((item) => (
              <HomeProductCard
                key={item.id}
                product={item}
                onSelect={(id) => {
                  if (id === product.id) return;
                  if (onSelectProduct) {
                    onSelectProduct(id);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [activeProductId, setActiveProductId] = useState(null);

  const latestProductsEndpoint = useMemo(
    () => apiUrl(`/api/products?limit=${LATEST_COLLECTION_LIMIT}`),
    []
  );

  const enrichedProducts = useMemo(
    () => latestProducts.map((product) => mapBackendProduct(product)),
    [latestProducts]
  );

  const activeProduct = useMemo(
    () => enrichedProducts.find((item) => item.id === activeProductId) || null,
    [enrichedProducts, activeProductId]
  );

  useEffect(() => {
    if (!latestProductsEndpoint) {
      setLoading(false);
      setError("Missing backend URL. Please configure VITE_BACKEND_URL.");
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();

    const fetchLatestProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(latestProductsEndpoint, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        if (isActive) {
          setLatestProducts(Array.isArray(data.products) ? data.products : []);
          setError(null);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        if (isActive) {
          setError(err.message || "Unable to load products right now.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchLatestProducts();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [latestProductsEndpoint, reloadFlag]);

  const handleReload = () => setReloadFlag((flag) => flag + 1);
  const handleSelectProduct = (productId) => setActiveProductId(productId);
  const handleBackToCollection = (nextProductId) => {
    if (nextProductId) {
      setActiveProductId(nextProductId);
      return;
    }
    setActiveProductId(null);
  };

  return (
    <>
      {activeProduct ? (
        <ProductDetailView
          product={activeProduct}
          relatedProducts={enrichedProducts}
          onBack={() => handleBackToCollection()}
          onSelectProduct={(id) => handleBackToCollection(id)}
        />
      ) : (
        <>
          {/* Banner Section */}
          <div className="w-full h-64 sm:h-80 md:h-[420px] mt-4 overflow-hidden relative">
            <img
              src={banner}
              alt="Banner"
              className="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Welcome Section */}
          <div className="text-center mt-8 mb-12 px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
              Welcome to <span className="text-pink-500">Tererang</span>
            </h1>
            <p className="mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
              Redefining ethnic fashion with elegance and style ✨ Explore our
              exclusive collections of Kurtis, Shararas, Suits, and more.
            </p>
          </div>

          {/* Main Product Sections */}
          <div className="max-w-7xl mx-auto px-6">
            <section className="mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 text-white py-3 rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-rose-500">
                🛍️ Latest Collection
              </h2>

              {loading && (
                <div className="text-center text-gray-500 py-10">
                  Fetching the freshest looks for you...
                </div>
              )}

              {!loading && error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={handleReload}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && enrichedProducts.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  No products have been added yet. Check back soon!
                </div>
              )}

              {!error && enrichedProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {enrichedProducts.map((product) => (
                    <HomeProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
      <footer className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 pt-16 pb-10 mt-16">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

    {/* Brand Info */}
    <div>
      <h2 className="text-4xl font-extrabold text-pink-500 mb-4 tracking-wide">Tererang</h2>
      <p className="italic text-lg mb-3 text-pink-200">“Elegance Woven with Love”</p>
      <p className="text-sm leading-relaxed text-gray-400">
        Born from passion and creativity, Tererang reimagines Indian wear with elegance and intention.
        Every piece is crafted with love, bringing beauty that feels personal and rooted.
      </p>
      <div className="flex space-x-4 mt-5">
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500 transition">
          <i className="fab fa-youtube"></i>
        </a>
      </div>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">
        Quick Links
      </h3>
      <ul className="space-y-3 text-gray-400">
        <li><a href="/products/Kurti" className="hover:text-pink-400 transition">Products</a></li>
        <li><a href="/Shipping" className="hover:text-pink-400 transition">Shipping Policy</a></li>
        <li><a href="/TermsPage" className="hover:text-pink-400 transition">Terms & Conditions</a></li>
        <li><a href="/ReturnPolicy" className="hover:text-pink-400 transition">Return & Exchange</a></li>
      </ul>
    </div>

    {/* Customer Care */}
    <div>
      <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">
        Customer Care
      </h3>
      <ul className="space-y-3 text-gray-400">
        <li><a href="/orders" className="hover:text-pink-400 transition">My Orders</a></li>
        <li><a href="/OrderTracker" className="hover:text-pink-400 transition">Track Order</a></li>
        <li><a href="/FaqPage" className="hover:text-pink-400 transition">FAQ</a></li>
        <li><a href="/HelpCenterPage" className="hover:text-pink-400 transition">Help Center</a></li>
      </ul>
    </div>

    {/* Contact Info */}
    <div>
      <h3 className="text-xl font-semibold text-white mb-5 border-b-2 border-pink-500 inline-block pb-1">
        Contact Us
      </h3>
      <ul className="space-y-3 text-gray-400 text-sm">
        <li>📍 Noida, Delhi, Muradabad , India</li>
        <li>📞 +91 9548971147</li>
        <li>✉️ support@tererang.com</li>
        {/* <li>🕒 Mon - Sat: 9:00 AM - 8:00 PM</li> */}
      </ul>
    </div>
  </div>

  {/* Divider */}
  <div className="mt-12 border-t border-gray-700"></div>

  {/* Bottom Bar */}
  <div className="mt-6 text-center text-sm text-gray-500">
    © 2025 <span className="text-pink-400 font-semibold">Tererang</span>. All rights reserved.
    <br />
    <span className="text-gray-400">Made with ❤️ in India</span>
  </div>
</footer>

     
    </>
  );
};

export default Home;
