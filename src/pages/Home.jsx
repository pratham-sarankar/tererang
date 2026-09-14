import { createElement, useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Package, RefreshCw, Ruler, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";
import SplitBanner from "../components/SplitBanner.jsx";
import StorefrontProductCard from "../components/StorefrontProductCard.jsx";
import { collections } from "../components/storefrontData.js";

const LATEST_COLLECTION_LIMIT = 12;

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
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Failed to load latest collection. Please try again.");
        }
        if (isMounted) {
          const products = Array.isArray(data) ? data : data?.products || [];
          const pagination = data?.pagination;

          setLatestProducts((previous) => (currentPage === 1 ? products : [...previous, ...products]));
          setHasMore(pagination ? pagination.current < pagination.pages : products.length >= LATEST_COLLECTION_LIMIT);
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

  const handleSelectProduct = (product) => {
    const targetId = product?.backendId || product?.id;
    if (!targetId) return;
    navigate(`/product/${targetId}`, { state: { product } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SplitBanner />

      <section className="border-b border-border bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-accent">Curated closets</p>
              <h2 className="mt-2 font-serif text-5xl lowercase leading-none text-foreground sm:text-6xl">shop by collection</h2>
            </div>
            <Link
              to="/products/Kurti"
              className="inline-flex items-center gap-2 self-start border border-primary px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-white sm:self-auto"
            >
              shop all collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            {collections.map((collection, index) => (
              <Link
                key={collection.to}
                to={collection.to}
                className={`group relative min-h-[360px] overflow-hidden border border-border bg-card ${
                  index === 0 ? "lg:col-span-2" : ""
                }`}
              >
                <img
                  src={collection.img}
                  alt={collection.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs font-semibold tracking-[0.08em] text-accent">{collection.eyebrow}</p>
                  <h3 className="mt-2 font-serif text-3xl lowercase leading-none">{collection.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/85">{collection.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                    explore collection
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="latest-collection" className="bg-secondary/60 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-accent">Highly coveted</p>
              <h2 className="mt-2 font-serif text-5xl lowercase leading-none text-foreground sm:text-6xl">the bestsellers shelf</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              Fresh arrivals and customer favorites, custom-finished for graceful everyday and occasion wear.
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
                className="mt-6 border border-primary px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-white"
                onClick={handleReload}
              >
                try again
              </button>
            </div>
          ) : null}

          {!error && !loading && enrichedProducts.length === 0 ? (
            <div className="mx-auto max-w-md py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl lowercase text-foreground">no products available yet</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">Check back soon for our latest collection.</p>
            </div>
          ) : null}

          {!error && enrichedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {enrichedProducts.map((product) => (
                  <StorefrontProductCard key={product.id} product={product} onSelect={handleSelectProduct} />
                ))}
              </div>

              {hasMore ? (
                <div className="mt-14 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 border border-primary px-9 py-3.5 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingMore ? "loading..." : "load more pieces"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="border border-border bg-secondary p-8 sm:p-10">
            <p className="text-sm font-semibold tracking-[0.08em] text-accent">Bespoke services</p>
            <h2 className="mt-3 font-serif text-5xl lowercase leading-none text-foreground sm:text-6xl">
              personal styling & custom tailoring
            </h2>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              Tererang pieces are shaped around your rhythm: complimentary size guidance, length adjustments, and direct designer consultation for outfits that fit beautifully.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://wa.me/919548971147"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" />
                chat with designer
              </a>
              <Link
                to="/products/Kurti"
                className="inline-flex items-center justify-center gap-2 border border-primary px-7 py-3 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-white"
              >
                explore catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["made to measure", "Fit refinements and length guidance for every selected silhouette.", Ruler],
              ["designer desk", "A direct WhatsApp line for styling, occasion, and sizing questions.", MessageCircle],
              ["crafted slowly", "Soft textiles, embroidery detail, and wearable Indian occasion dressing.", Sparkles],
            ].map(([title, text, ServiceIcon]) => (
              <div key={title} className="border border-border bg-card p-6">
                {createElement(ServiceIcon, { className: "mb-8 h-7 w-7 text-primary" })}
                <h3 className="font-serif text-2xl lowercase leading-none text-foreground">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
