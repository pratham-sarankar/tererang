import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Package, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "./Footer.jsx";
import StorefrontProductCard from "./StorefrontProductCard.jsx";

const StorefrontCategoryPage = ({ meta }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const navigate = useNavigate();

  const endpoint = useMemo(() => apiUrl(`/api/products?category=${meta.category}`), [meta.category]);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(endpoint);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.message || `Failed to fetch ${meta.title}`);
        }
        if (isMounted) {
          setProducts(Array.isArray(payload) ? payload : payload.products || []);
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
  }, [endpoint, meta.title, reloadFlag]);

  const formattedProducts = useMemo(
    () => products.map((item) => mapProductForDisplay({ ...item, category: item.category || meta.fallbackCategory })),
    [meta.fallbackCategory, products]
  );

  const handleSelectProduct = (product) => {
    const targetId = product?.backendId || product?.id;
    if (!targetId) return;
    navigate(`/product/${targetId}`, { state: { product } });
  };

  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <header className="relative overflow-hidden border-b border-border bg-secondary">
          <div className="absolute inset-0">
            <img src={meta.image} alt="" className="h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/55" />
          </div>
          <div className="relative mx-auto grid min-h-[360px] max-w-7xl items-end gap-10 px-6 py-16 sm:min-h-[430px] lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-20">
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-accent">{meta.eyebrow}</p>
              <h1 className="mt-4 max-w-2xl font-serif text-5xl lowercase leading-none text-foreground sm:text-6xl lg:text-7xl">
                {meta.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">{meta.desc}</p>
            </div>
            <div className="hidden justify-end lg:flex">
              <div className="border border-border bg-card/80 p-6 backdrop-blur-sm">
                <p className="font-serif text-2xl lowercase text-foreground">custom stitched to perfection</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Complimentary fit guidance and length adjustments are available through the designer desk.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-accent">Curated shelf</p>
              <h2 className="mt-2 font-serif text-4xl lowercase text-foreground">available pieces</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              Each product opens into the existing detail page, keeping size selection, sharing, and cart behavior intact.
            </p>
          </div>

          {loading && !error ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-[520px] animate-pulse border border-border bg-card" />
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="mx-auto max-w-md border border-border bg-card p-10 text-center">
              <RefreshCw className="mx-auto mb-4 h-9 w-9 text-primary" />
              <h3 className="font-serif text-2xl lowercase text-foreground">unable to load collection</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{error}</p>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 border border-primary px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-white"
                onClick={() => setReloadFlag((flag) => flag + 1)}
              >
                try again
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {!error && !loading && formattedProducts.length === 0 ? (
            <div className="mx-auto max-w-md py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl lowercase text-foreground">no products available yet</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">Check back soon for fresh arrivals from the atelier.</p>
            </div>
          ) : null}

          {!error && formattedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {formattedProducts.map((product) => (
                <StorefrontProductCard key={product.id} product={product} onSelect={handleSelectProduct} />
              ))}
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default StorefrontCategoryPage;
