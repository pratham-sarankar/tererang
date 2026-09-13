import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductImage from "../components/ProductImage.jsx";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";
import SplitBanner from "../components/SplitBanner.jsx";

const LATEST_COLLECTION_LIMIT = 12;

const HomeProductCard = ({ product, onSelect = () => {} }) => (
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

          if (currentPage === 1) {
            setLatestProducts(products);
          } else {
            setLatestProducts(prev => [...prev, ...products]);
          }

          if (pagination) {
            setHasMore(pagination.current < pagination.pages);
          } else {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      <SplitBanner />

      {/* Latest Collection */}
      <section
        id="latest-collection"
        className="py-20 bg-background"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-accent uppercase tracking-[0.3em] text-xs mb-3 font-medium">
              new arrivals
            </p>
            <h2 className="text-4xl sm:text-5xl font-serif lowercase text-foreground mb-4 tracking-wide">
              latest collection
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
              handcrafted pieces designed to become part of your story. each silhouette curated with love and precision.
            </p>
          </div>

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

          {!error && !loading && enrichedProducts.length === 0 && (
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

          {!error && enrichedProducts.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {enrichedProducts.map((product) => (
                  <HomeProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-14">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="group border-2 border-primary text-foreground hover:bg-primary hover:text-white px-10 py-3.5 text-xs lowercase tracking-widest font-medium transition-all duration-300 inline-flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                            strokeWidth="3"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        loading...
                      </>
                    ) : (
                      <>
                        <span>load more pieces</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Bespoke Tailoring CTA */}
      <section className="py-20 bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent uppercase tracking-[0.3em] text-xs mb-3 font-medium">
              personal styling
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif lowercase text-foreground mb-5 tracking-wide">
              bespoke custom tailoring
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-2xl mx-auto">
              at tererang, we believe in perfect silhouettes that fit you flawlessly. enjoy complimentary size customization, length adjustments, and direct styling consultations with our designers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/919548971147"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-primary text-foreground hover:bg-primary hover:text-white px-8 py-3.5 lowercase tracking-widest text-xs font-medium transition-all duration-300 inline-flex items-center gap-2"
              >
                <span>💬</span>
                <span>chat with designer</span>
              </a>
              <button
                onClick={() => navigate("/products/Kurti")}
                className="text-muted-foreground hover:text-foreground px-8 py-3.5 lowercase tracking-widest text-xs underline transition-colors duration-300"
              >
                explore catalog
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
