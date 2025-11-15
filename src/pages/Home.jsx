import React, { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import banner from "../components/Banner.png";
import { apiUrl, imageUrl } from "../config/env.js";

const LATEST_COLLECTION_LIMIT = 12;
const FALLBACK_IMAGE = "https://via.placeholder.com/400x600?text=Tererang";

const resolveImageSrc = (productImage, images = []) => {
  const candidate = productImage || images?.[0];
  if (!candidate) return FALLBACK_IMAGE;
  return /^https?:\/\//i.test(candidate) ? candidate : imageUrl(candidate);
};

const titleCase = (value) => {
  if (!value) return "Tererang";
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const latestProductsEndpoint = useMemo(
    () => apiUrl(`/api/products?limit=${LATEST_COLLECTION_LIMIT}`),
    []
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

  return (
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

          {!loading && !error && latestProducts.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No products have been added yet. Check back soon!
            </div>
          )}

          {!error && latestProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {latestProducts.map((product) => (
                <Card
                  key={product._id || product.id}
                  image={resolveImageSrc(product.image, product.images)}
                  brand={titleCase(product.category)}
                  title={product.name}
                  description={product.description}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  discount={product.discount}
                />
              ))}
            </div>
          )}
        </section>
      </div>
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
