import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import banner from "../components/Banner.png";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";

const LATEST_COLLECTION_LIMIT = 12;

const HomeProductCard = ({ product, onSelect = () => {} }) => (
  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 group border border-gray-100">
    <div className="relative overflow-hidden" onClick={() => onSelect(product)}>
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
          onClick={() => onSelect(product)}
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

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const navigate = useNavigate();

  const latestProductsEndpoint = useMemo(
    () => apiUrl(`/api/products?limit=${LATEST_COLLECTION_LIMIT}`),
    []
  );

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(latestProductsEndpoint);
        if (!response.ok) {
          throw new Error("Failed to load latest collection. Please try again.");
        }
        const data = await response.json();
        if (isMounted) {
          setLatestProducts(Array.isArray(data) ? data : data?.products || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to fetch products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [latestProductsEndpoint, reloadFlag]);

  const enrichedProducts = useMemo(
    () => latestProducts.map((product) => mapProductForDisplay(product)),
    [latestProducts]
  );

  const handleReload = () => setReloadFlag((flag) => flag + 1);

  const handleSelectProduct = (product) => {
    if (!product?.id) return;
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white text-gray-900">
      {/* Banner Section */}
      <div className="w-full h-64 sm:h-80 md:h-[420px] mt-4 overflow-hidden relative">
        <img
          src={banner}
          alt="Tererang Festive Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="uppercase tracking-[0.4em] text-sm">New Arrivals</p>
          <h1 className="text-4xl sm:text-5xl font-bold mt-2 tracking-wide">Luxury Festive Edit</h1>
          <p className="mt-2 text-lg font-medium">Handcrafted elegance, delivered to your doorstep in 72 hours.</p>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Welcome to Tererang
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
          We bring artisanal craftsmanship to modern wardrobes. Discover limited-edition pieces inspired by Indian heritage, tailored to perfection, and delivered with love.
        </p>
        <div className="mt-6 inline-flex items-center space-x-6 text-sm text-gray-500">
          <span>✨ Handpicked by stylists</span>
          <span>🚚 Free express shipping</span>
          <span>♻️ Sustainable packaging</span>
        </div>
      </div>

      {/* Latest Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <p className="text-purple-600 uppercase tracking-[0.3em] text-xs font-semibold">
              Latest Collection
            </p>
            <h3 className="text-4xl font-bold text-gray-900">Freshly Curated Styles</h3>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Direct from our atelier. Limited drops updated daily.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center border border-purple-200 px-4 py-2 rounded-full text-purple-600 hover:bg-purple-50 transition text-sm font-semibold"
            onClick={handleReload}
          >
            Refresh Feed
          </button>
        </div>

        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-pulse">
            {Array.from({ length: 4 }, (_, index) => index + 1).map((item) => (
              <div key={`skeleton-${item}`} className="bg-white rounded-2xl shadow p-6 h-96" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-red-100">
            <h3 className="text-xl font-bold text-red-600 mb-2">Unable to load collection</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              type="button"
              className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition"
              onClick={handleReload}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && !loading && enrichedProducts.length === 0 && (
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
  );
};

export default Home;
