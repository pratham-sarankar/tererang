import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";
import SplitBanner from "../components/SplitBanner.jsx";

const LATEST_COLLECTION_LIMIT = 12;

const HomeProductCard = ({ product, onSelect = () => { } }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group relative">
    {/* Discount Badge */}
    {product.discount > 0 && (
      <div className="absolute top-4 left-4 z-10 bg-[#b81582] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
        {product.discount}% OFF
      </div>
    )}

    <div className="relative overflow-hidden" onClick={() => onSelect(product)}>
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-80 object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Overlay with Centered Action */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm text-[#b81582] px-6 py-2.5 rounded-full font-bold shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300">
          Quick View
        </div>
      </div>
    </div>

    <div className="p-5">
      <div className="mb-2">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1 group-hover:text-[#b81582] transition-colors">
          {product.brand}
        </p>
        <h3 className="text-lg font-bold text-gray-900 truncate leading-tight mb-1">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-snug mb-3 opacity-80">
            {product.description}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between mt-2">
        <div className="flex flex-col">
          {product.displayOldPrice && (
            <span className="line-through text-gray-400 text-xs mb-0.5">
              {product.displayOldPrice}
            </span>
          )}
          <span className="text-xl font-extrabold text-[#b81582]">
            {product.displayPrice}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="bg-gray-100 text-[#b81582] p-2.5 rounded-full hover:bg-[#b81582] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          aria-label={`Add ${product.title} to cart`}
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const latestProductsEndpoint = useMemo(
    () => apiUrl(`/api/products?limit=${LATEST_COLLECTION_LIMIT}&page=${currentPage}`),
    [currentPage]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      // Only set loading to true for the initial load
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      try {
        const response = await fetch(latestProductsEndpoint);
        if (!response.ok) {
          throw new Error(
            "Failed to load latest collection. Please try again."
          );
        }
        const data = await response.json();
        if (isMounted) {
          const products = Array.isArray(data) ? data : data?.products || [];
          const pagination = data?.pagination;
          
          // Append products if loading more, otherwise replace
          if (currentPage === 1) {
            setLatestProducts(products);
          } else {
            setLatestProducts(prev => [...prev, ...products]);
          }
          
          // Determine if there are more products to load
          if (pagination) {
            setHasMore(pagination.current < pagination.pages);
          } else {
            // If pagination info not available, check if we got fewer products than limit
            setHasMore(products.length >= LATEST_COLLECTION_LIMIT);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to fetch products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [latestProductsEndpoint, reloadFlag, currentPage]);

  const enrichedProducts = useMemo(
    () => latestProducts.map((product) => mapProductForDisplay(product)),
    [latestProducts]
  );

  const handleReload = () => {
    setCurrentPage(1);
    setHasMore(true);
    setReloadFlag((flag) => flag + 1);
  };

  const handleLoadMore = () => {
    setCurrentPage((page) => page + 1);
  };

  const handleSelectProduct = (product) => {
    if (!product?.id) return;
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Banner */}
      <SplitBanner />

      {/* Latest Collection */}
      <section
        id="latest-collection"
        className="py-16 bg-gradient-to-b from-pink-50/50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <div className="inline-flex items-center bg-pink-100/50 rounded-full px-3 py-1 mb-2 border border-pink-100">
                <Sparkles className="w-3.5 h-3.5 text-[#b81582] mr-1.5" />
                <span className="text-[#b81582] uppercase tracking-wider text-xs font-bold">
                  New Arrivals
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
                Latest Collection
              </h3>
              <p className="text-gray-600 text-base">
                Fresh styles added daily
              </p>
            </div>
            <button
              type="button"
              className="flex items-center border-2 border-pink-100 px-4 py-2 rounded-full text-[#b81582] hover:bg-[#b81582] hover:text-white hover:border-[#b81582] transition-colors duration-300 font-semibold text-sm"
              onClick={handleReload}
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 8 }, (_, index) => index + 1).map(
                (item) => (
                  <div
                    key={`skeleton-${item}`}
                    className="bg-white rounded-2xl shadow-lg p-6 h-96"
                  />
                )
              )}
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-red-100">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-3">
                <svg
                  className="w-7 h-7 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                Unable to load collection
              </h3>
              <p className="text-gray-600 mb-4 text-sm">{error}</p>
              <button
                type="button"
                className="px-6 py-2 bg-[#b81582] text-white rounded-full font-semibold hover:bg-[#a01270] transition shadow-lg text-sm"
                onClick={handleReload}
              >
                Try Again
              </button>
            </div>
          )}

          {!error && !loading && enrichedProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No products available yet
              </h3>
              <p className="text-gray-500 text-sm">
                Check back soon for our latest collection!
              </p>
            </div>
          )}

          {!error && enrichedProducts.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {enrichedProducts.map((product) => (
                  <HomeProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                  />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold text-base hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-xl inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loadingMore ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Products
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-[#b81582] to-pink-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Transform Your Wardrobe?
          </h2>
          <p className="text-base sm:text-lg text-pink-100 mb-6 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied customers who trust Tererang for
            authentic, high-quality ethnic wear delivered in 7-9 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => {
                const latestSection =
                  document.getElementById("latest-collection");
                latestSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group bg-white text-[#b81582] px-8 py-3 rounded-full font-bold text-base hover:bg-pink-50 transition transform hover:scale-105 shadow-2xl inline-flex items-center"
            >
              View Collection
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-base hover:bg-white hover:text-[#b81582] transition transform hover:scale-105 inline-flex items-center"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>{" "}
      <Footer />
    </div>
  );
};

export default Home;
