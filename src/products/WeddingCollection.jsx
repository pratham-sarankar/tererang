import React, { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductImage from "../components/ProductImage.jsx";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";

const CategoryProductCard = ({ product, onSelect }) => (
  <div className="group bg-card rounded-md overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col justify-between">
    <div>
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary" onClick={() => onSelect(product)}>
        <ProductImage
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-xs text-foreground text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 border border-border">
            {product.discount}% off
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
          {product.brand || "tererang"}
        </span>
        <h3 className="font-serif text-base sm:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors lowercase">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>
    </div>

    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
      <div className="flex items-baseline gap-2 mb-3">
        {product.displayPrice && (
          <span className="text-base sm:text-lg font-medium text-foreground">{product.displayPrice}</span>
        )}
        {product.displayOldPrice && (
          <span className="text-xs line-through text-muted-foreground">{product.displayOldPrice}</span>
        )}
      </div>

      <button
        className="w-full border border-primary text-foreground hover:bg-primary hover:text-white py-2.5 px-4 text-xs lowercase tracking-wider font-medium transition-colors duration-300 flex items-center justify-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(product);
        }}
        type="button"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>view details</span>
      </button>
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
      <div className="min-h-screen bg-background text-foreground">
        {/* Page Header */}
        <div className="py-16 sm:py-20 text-center bg-secondary border-b border-border">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-accent uppercase tracking-[0.3em] text-xs font-medium mb-3">
              bespoke couture
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif lowercase text-foreground mb-4 tracking-wide">
              wedding collection
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              celebrate your special moments with handcrafted bridal and festive couture.
            </p>
          </div>
        </div>

        {/* Product Grid Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {Array.from({ length: 6 }, (_, index) => index + 1).map(
                  (item) => (
                    <div
                      key={`skeleton-${item}`}
                      className="bg-card rounded-md border border-border h-96 animate-pulse"
                    />
                  )
                )}
              </div>
            )}

            {error && (
              <div className="bg-card rounded-md border border-border p-10 text-center max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary rounded-full mb-4">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-serif lowercase text-foreground mb-2">
                  unable to load collection
                </h3>
                <p className="text-muted-foreground text-sm mb-6">{error}</p>
                <button
                  type="button"
                  className="border border-primary text-foreground hover:bg-primary hover:text-white px-6 py-2.5 text-xs lowercase tracking-wider font-medium transition-colors"
                  onClick={handleReload}
                >
                  try again
                </button>
              </div>
            )}

            {!error && !loading && formattedProducts.length === 0 && (
              <div className="text-center py-16 max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary rounded-full mb-5">
                  <Package className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-serif lowercase text-foreground mb-2">
                  no products available yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  check back soon for our latest collection.
                </p>
              </div>
            )}

            {!error && formattedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
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
        </section>
      </div>
      <Footer />
    </>
  );
};

export default WeddingCollection;
