import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Sparkles,
  Truck,
  Shield,
  ArrowRight,
  Shirt,
  Package,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";

const LATEST_COLLECTION_LIMIT = 12;

const HomeProductCard = ({ product, onSelect = () => { } }) => (
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
      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
        {product.title}
      </h3>
      <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">
        {product.brand}
      </p>
      <div className="flex items-center justify-between">
        <div>
          {product.displayOldPrice && (
            <span className="line-through text-gray-400 text-base mr-2">
              {product.displayOldPrice}
            </span>
          )}
          <span className="text-2xl font-extrabold text-purple-600">
            {product.displayPrice}
          </span>
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-semibold tracking-wide">
                PREMIUM ETHNIC WEAR
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
              Elegance Meets
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
                Tradition
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto mb-6 leading-relaxed">
              Handcrafted ethnic wear delivered in 7-9 days
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => {
                  const latestSection =
                    document.getElementById("latest-collection");
                  latestSection?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group bg-white text-purple-600 px-6 py-3 rounded-full font-bold text-base hover:bg-purple-50 transition transform hover:scale-105 shadow-xl flex items-center"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
              <button
                onClick={() => {
                  const categoriesSection =
                    document.getElementById("shop-categories");
                  categoriesSection?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-bold text-base hover:bg-white hover:text-purple-600 transition transform hover:scale-105"
              >
                Browse Categories
              </button>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-16 sm:h-20"
          >
            <path
              d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"
              fill="white"
            ></path>
          </svg>
        </div>
      </div>
      {/* Features Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group p-4 rounded-xl hover:bg-white transition duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-600 transition">
                <Truck className="w-7 h-7 text-purple-600 group-hover:text-white transition" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Fast Delivery
              </h3>
              <p className="text-sm text-gray-600">Delivered in 7-9 days</p>
            </div>

            <div className="text-center group p-4 rounded-xl hover:bg-white transition duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-600 transition">
                <Shield className="w-7 h-7 text-purple-600 group-hover:text-white transition" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Premium Quality
              </h3>
              <p className="text-sm text-gray-600">Authentic craftsmanship</p>
            </div>

            <div className="text-center group p-4 rounded-xl hover:bg-white transition duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-600 transition">
                <Sparkles className="w-7 h-7 text-purple-600 group-hover:text-white transition" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Curated Selection
              </h3>
              <p className="text-sm text-gray-600">Handpicked by stylists</p>
            </div>
          </div>
        </div>
      </section>{" "}
      {/* Shop by Category */}
      <section id="shop-categories" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-purple-100 rounded-full px-3 py-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
              <span className="text-purple-600 uppercase tracking-wider text-xs font-bold">
                Shop by Style
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Explore Collections
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Find the perfect ethnic wear for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Kurtis",
                icon: Shirt,
                path: "/products/Kurti",
                color: "from-purple-500 to-pink-500",
                desc: "Elegant & versatile",
              },
              {
                name: "Suits",
                icon: Package,
                path: "/products/Suit",
                color: "from-blue-500 to-purple-500",
                desc: "Traditional charm",
              },
              {
                name: "Coats",
                path: "/products/Coat",
                icon: Sparkles,
                color: "from-yellow-500 to-orange-500",
                desc: "Modern elegance",
              },
              {
                name: "Winter Ethnic Wear",
                icon: Crown,
                path: "/products/EthnicWear",
                color: "from-indigo-500 to-purple-600",
                desc: "Cozy & festive",
              },
            ].map((category, index) => (
              <div
                key={index}
                onClick={() => navigate(category.path)}
                className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-2 transition duration-300 shadow-lg hover:shadow-2xl border border-gray-200 hover:border-transparent"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-90 transition duration-300`}
                ></div>
                <div className="relative p-5 flex flex-col items-center justify-center h-36">
                  <category.icon className="w-10 h-10 text-gray-700 group-hover:text-white transition mb-2" />
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-white transition mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600 group-hover:text-white/90 transition">
                    {category.desc}
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-white mt-1 opacity-0 group-hover:opacity-100 transition transform translate-x-0 group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Latest Collection */}
      <section
        id="latest-collection"
        className="py-10 bg-gradient-to-b from-purple-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <div className="inline-flex items-center bg-purple-100 rounded-full px-3 py-1 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                <span className="text-purple-600 uppercase tracking-wider text-xs font-bold">
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
              className="flex items-center border-2 border-purple-200 px-4 py-2 rounded-full text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition font-semibold text-sm"
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
                className="px-6 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition shadow-lg text-sm"
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
      <section className="py-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Transform Your Wardrobe?
          </h2>
          <p className="text-base sm:text-lg text-purple-100 mb-6 max-w-3xl mx-auto leading-relaxed">
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
              className="group bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-base hover:bg-purple-50 transition transform hover:scale-105 shadow-2xl inline-flex items-center"
            >
              View Collection
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-base hover:bg-white hover:text-purple-600 transition transform hover:scale-105 inline-flex items-center"
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
