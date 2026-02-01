import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";

const CategoryProductCard = ({ product, onSelect }) => (
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
          View Details
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

const WeddingCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const navigate = useNavigate();

  const endpoint = useMemo(() => apiUrl("/api/products?category=wedding"), []);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error("Failed to fetch wedding collection");
        }
        const payload = await res.json();
        if (isMounted) {
          const items = Array.isArray(payload) ? payload : payload.products || [];
          setProducts(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load products");
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
  }, [endpoint, reloadFlag]);

  const formattedProducts = useMemo(
    () => products.map((item) => mapProductForDisplay({ ...item, category: item.category || "Wedding Collection" })),
    [products]
  );

  const handleSelectProduct = (product) => {
    if (!product?.id) return;
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleReload = () => setReloadFlag((flag) => flag + 1);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 sm:p-10">
        <div className="text-center mb-16 pt-8">
          <div className="border-4 border-black inline-block p-2 rounded-xl shadow-2xl">
            <div className="bg-purple-700 p-6 rounded-lg text-white">
              <p className="uppercase tracking-[0.5em] text-sm text-purple-200">Exclusive Collection</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">The Tere Rang Wedding Collection</h1>
              <p className="text-lg text-purple-100 mt-2">
                Celebrate your special moments with elegant designs crafted for your perfect day.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-6 inline-flex items-center border border-purple-200 px-4 py-2 rounded-full text-purple-600 hover:bg-purple-50 transition text-sm font-semibold"
            onClick={handleReload}
          >
            Refresh Collection
          </button>
        </div>

        {loading && !error && (
          <div className="flex justify-center py-20">
            <span className="text-lg text-gray-500">Curating the latest looks for you...</span>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 text-center border border-red-100">
            <h2 className="text-2xl font-semibold text-red-500 mb-2">Unable to load wedding collection</h2>
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

        {!error && !loading && formattedProducts.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            We're stitching new designs. Check back in a bit!
          </div>
        )}

        {!error && formattedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {formattedProducts.map((product) => (
              <CategoryProductCard
                key={product.id}
                product={product}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
      <Footer></Footer>
    </>
  );
};

export default WeddingCollection;
