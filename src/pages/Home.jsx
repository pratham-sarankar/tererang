import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw, Shield, Truck, RotateCcw, Package } from "lucide-react";
import { apiUrl } from "../config/env.js";
import { mapProductForDisplay } from "../utils/productPresentation.js";
import { Footer } from "../components/Footer.jsx";
import StorefrontProductCard from "../components/StorefrontProductCard.jsx";

import bannerMain from "../assets/banner_1.jpeg";
import bannerFloat from "../assets/banner_2.jpeg";
import tailoringImage from "../assets/traditional_ethnic_wear.png";
import modernEthnicImg from "../assets/modern_ethnic_fusion.png";
import "../css/Home.css";

const LATEST_COLLECTION_LIMIT = 12;

/* ---------- Marquee Strip ---------- */
const MARQUEE_ITEMS = [
  "New Arrivals",
  "●",
  "Handcrafted Silhouettes",
  "●",
  "Bespoke Tailoring",
  "●",
  "Occasion Couture",
  "●",
  "Free Shipping ₹1,999+",
  "●",
  "New Arrivals",
  "●",
  "Handcrafted Silhouettes",
  "●",
  "Bespoke Tailoring",
  "●",
  "Occasion Couture",
  "●",
  "Free Shipping ₹1,999+",
  "●",
];

/* ---------- Trust items (exact from reference) ---------- */
const TRUST_ITEMS = [
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 3 4 6v6c0 4.6 3.2 7.9 8 9 4.8-1.1 8-4.4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Premium quality",
    desc: "Considered fabrics & finishing.",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
    title: "Secure payments",
    desc: "Protected checkout experience.",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 7h11v10H4zM15 10h3l2 3v4h-5z" />
      </svg>
    ),
    title: "Fast shipping",
    desc: "Free over ₹1,999.",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M7 8H4V5" />
        <path d="M4.5 8A8 8 0 1 1 4 15" />
        <path d="M9 12h6" />
      </svg>
    ),
    title: "Easy returns",
    desc: "Simple 7-day returns.",
  },
];

/* ---------- Customer Reviews (exact from reference) ---------- */
const REVIEWS = [
  {
    stars: "★★★★★",
    quote: "“The fit is so clean, but the colour still makes it feel special. I wore it once and immediately ordered another.”",
    person: "Aarohi M. — Hyderabad",
  },
  {
    stars: "★★★★★",
    quote: "“It feels premium without trying too hard. The details are even better in person.”",
    person: "Riya K. — Bengaluru",
  },
  {
    stars: "★★★★★",
    quote: "“Finally a brand that understands colour and restraint at the same time.”",
    person: "Naina S. — Pune",
  },
];

/* ---------- Community / Styled by you images (editorial fashion) ---------- */
const COMMUNITY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86",
    fallback: bannerMain,
    alt: "Tere Rang community style",
    large: true,
  },
  {
    src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=700&q=86",
    fallback: modernEthnicImg,
    alt: "Lifestyle detail",
  },
  {
    src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=700&q=86",
    fallback: tailoringImage,
    alt: "Editorial portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1542295661-3fd8d8c25ca8?auto=format&fit=crop&w=700&q=86",
    fallback: bannerFloat,
    alt: "Fashion detail",
  },
  {
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=86",
    fallback: modernEthnicImg,
    alt: "Wardrobe styling",
  },
];

/* ---------- Reference products from index.html ---------- */
const REFERENCE_FALLBACK_PRODUCTS = [
  {
    id: "ref-gulabi-dress",
    title: "Gulabi Drape Dress",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=86",
    displayPrice: "₹2,899",
    meta: "Signature / Rose",
    category: "Signature / Rose",
    badge: "Bestseller",
    swatches: ["pink", "black"],
  },
  {
    id: "ref-noor-set",
    title: "Noor Co-ord Set",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=86",
    displayPrice: "₹3,499",
    meta: "Co-ords / Ivory",
    category: "Co-ords / Ivory",
    badge: "New",
    swatches: ["cream", "pink"],
  },
  {
    id: "ref-midnight-jacket",
    title: "Midnight Wrap Jacket",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=86",
    displayPrice: "₹2,399",
    displayOldPrice: "₹2,999",
    discount: 20,
    meta: "Layering / Black",
    category: "Layering / Black",
    badge: "-20%",
    swatches: ["black", "blue"],
  },
  {
    id: "ref-meher-dress",
    title: "Meher Midi Dress",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=86",
    displayPrice: "₹2,699",
    meta: "Dresses / Sky",
    category: "Dresses / Sky",
    badge: "Bestseller",
    swatches: ["blue", "cream"],
  },
];

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [email, setEmail] = useState("");
  const [emailNote, setEmailNote] = useState("");
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
        if (!response.ok) throw new Error(data.message || "Failed to load latest collection.");
        if (isMounted) {
          const products = Array.isArray(data) ? data : data?.products || [];
          const pagination = data?.pagination;
          setLatestProducts((prev) =>
            currentPage === 1
              ? products
              : [...prev, ...products.filter((p) => !prev.some((item) => (item._id || item.id) === (p._id || p.id)))]
          );
          setHasMore(pagination ? pagination.current < pagination.pages : products.length >= LATEST_COLLECTION_LIMIT);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to fetch products");
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
    () => latestProducts.map((p) => mapProductForDisplay(p)),
    [latestProducts]
  );

  const allAvailableProducts = useMemo(() => {
    if (enrichedProducts.length === 0) {
      return REFERENCE_FALLBACK_PRODUCTS;
    }
    if (enrichedProducts.length < 4) {
      return [
        ...enrichedProducts,
        ...REFERENCE_FALLBACK_PRODUCTS.slice(0, 4 - enrichedProducts.length),
      ];
    }
    return enrichedProducts;
  }, [enrichedProducts]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All") return allAvailableProducts;
    const filterKey = activeFilter.toLowerCase();
    const result = allAvailableProducts.filter((product) => {
      const cat = String(product.raw?.category || product.category || product.meta || "").toLowerCase();
      const title = String(product.title || "").toLowerCase();
      if (filterKey === "dresses") {
        return cat.includes("kurti") || cat.includes("dress") || cat.includes("skirt") || title.includes("dress") || title.includes("kurti") || title.includes("skirt");
      }
      if (filterKey === "sets") {
        return cat.includes("suit") || cat.includes("set") || cat.includes("lehenga") || cat.includes("co-ord") || title.includes("set") || title.includes("suit") || title.includes("co-ord");
      }
      if (filterKey === "accessories") {
        return cat.includes("wedding") || cat.includes("accessory") || cat.includes("coat") || cat.includes("ethnic") || cat.includes("layering") || title.includes("jacket") || title.includes("wrap");
      }
      return cat.includes(filterKey) || title.includes(filterKey);
    });
    return result.length > 0 ? result : allAvailableProducts;
  }, [allAvailableProducts, activeFilter]);

  /* --- Scroll reveal observer --- */
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal:not(.show)");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredProducts]);

  const handleReload = () => {
    setCurrentPage(1);
    setHasMore(true);
    setReloadFlag((f) => f + 1);
  };

  const handleSelectProduct = (product) => {
    if (product?.id && String(product.id).startsWith("ref-")) {
      navigate("/shop");
      return;
    }
    const targetId = product?.backendId || product?.id;
    if (!targetId) return;
    navigate(`/product/${targetId}`, { state: { product } });
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailNote("Please enter your email address.");
      return;
    }
    setEmailNote("Thank you! You have been added to our early access list.");
    setEmail("");
  };

  return (
    <main className="hp-main-wrapper">
      {/* ======================================================
          SECTION 0: HERO BANNER (Matches reference 100%)
          ====================================================== */}
      <section className="hero" id="new">
        <div className="container hero-grid">
          {/* Hero Copy */}
          <div className="hero-copy">
            <div className="hero-logo-mark hero-animate">
              <i /> expressive everyday wear
            </div>
            <h1 className="hero-animate d1">
              Wear your <em>rang.</em>
              <br />
              Own the room.
            </h1>
            <p className="hero-animate d2">
              Modern silhouettes with a vivid point of view — designed for women who prefer
              elegance with personality.
            </p>
            <div className="hero-actions hero-animate d3">
              <Link className="btn" to="/shop">
                <span>Shop the collection</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 12h14M14 7l5 5-5 5" />
                </svg>
              </Link>
              <Link className="text-link" to="/shop">
                Explore new arrivals
              </Link>
            </div>
          </div>

          {/* Hero Art */}
          <div className="hero-art hero-animate d2">
            <div className="hero-main">
              <img
                src={bannerMain}
                alt="Fashion model in a refined editorial look"
                fetchPriority="high"
              />
            </div>
            <div className="hero-float">
              <img
                src={bannerFloat}
                alt="Portrait detail"
                loading="lazy"
              />
            </div>
            <div className="color-petals" aria-hidden="true">
              <span className="petal" />
              <span className="petal" />
              <span className="petal" />
              <span className="petal" />
              <span className="petal" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MARQUEE STRIP
          ====================================================== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i}>{item === "●" ? <b>●</b> : item}</span>
          ))}
        </div>
      </div>

      {/* ======================================================
          SECTION 1: CURATED EDITS / CATEGORIES
          ====================================================== */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="kicker">Curated edits</div>
              <h2>Shop by mood.</h2>
            </div>
            <p style={{ maxWidth: 460 }}>
              Not categories for the sake of categories — each edit is built around a feeling, a palette, and a moment.
            </p>
          </div>

          <div className="categories-grid">
            {/* Card 1: Large */}
            <Link className="cat large reveal" to="/products/Kurti">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=86"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = modernEthnicImg;
                }}
                alt="Rang Bloom collection"
                loading="lazy"
              />
              <div className="cat-info">
                <div className="kicker" style={{ color: "#fff" }}>01 / Statement</div>
                <h3>Rang Bloom</h3>
                <span className="round-arrow" aria-hidden="true">→</span>
              </div>
            </Link>

            {/* Card 2 */}
            <Link className="cat reveal" data-delay="1" to="/products/Suit">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=86"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = bannerMain;
                }}
                alt="Soft Structure collection"
                loading="lazy"
              />
              <div className="cat-info">
                <div className="kicker" style={{ color: "#fff" }}>02 / Everyday</div>
                <h3>Soft Structure</h3>
                <span className="round-arrow" aria-hidden="true">→</span>
              </div>
            </Link>

            {/* Card 3 */}
            <Link className="cat reveal" data-delay="2" to="/products/wedding">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=86"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = tailoringImage;
                }}
                alt="Finishing Touches collection"
                loading="lazy"
              />
              <div className="cat-info">
                <div className="kicker" style={{ color: "#fff" }}>03 / Details</div>
                <h3>Finishing Touches</h3>
                <span className="round-arrow" aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          SECTION 2: BEST SELLERS (Grid view matching index.html)
          ====================================================== */}
      <section className="section products-wrap" id="products">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="kicker">Best sellers</div>
              <h2>Most loved, right now.</h2>
            </div>
            <div className="product-toolbar" aria-label="Product filters">
              {["All", "Dresses", "Sets", "Accessories"].map((filter) => (
                <button
                  key={filter}
                  className={`chip ${activeFilter === filter ? "active" : ""}`}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading && !allAvailableProducts.length && !error ? (
            <div className="products">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} style={{ height: 420, background: "rgba(31,20,32,.05)", borderRadius: 2 }} />
              ))}
            </div>
          ) : null}

          {filteredProducts.length > 0 ? (
            <div className="products">
              {filteredProducts.map((product, index) => (
                <StorefrontProductCard
                  key={product.id || index}
                  product={product}
                  onSelect={handleSelectProduct}
                  variant="home"
                  index={index}
                  dataDelay={index % 4 || undefined}
                />
              ))}
            </div>
          ) : null}

          {hasMore && activeFilter === "All" && latestProducts.length > 0 ? (
            <div className="products-load-more reveal">
              <button
                className="btn"
                disabled={loadingMore || loading}
                onClick={() => (error ? setReloadFlag((f) => f + 1) : setCurrentPage((p) => p + 1))}
                type="button"
              >
                <span>{loadingMore || loading ? "Loading…" : error ? "Try again" : "Load more pieces"}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : null}

          {error && !allAvailableProducts.length ? (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", border: "1px solid var(--line)", margin: "20px 0" }}>
              <RefreshCw size={24} style={{ color: "var(--pink)", marginBottom: 12 }} />
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20 }}>Unable to load collection</h3>
              <p style={{ color: "var(--muted)", margin: "8px 0 18px" }}>{error}</p>
              <button className="btn" onClick={handleReload} type="button">
                <span>Try again</span>
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* ======================================================
          SECTION 3: EDITORIAL / NEW COLLECTION
          ====================================================== */}
      <section className="editorial">
        <div className="editorial-grid">
          <div className="editorial-image reveal">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1500&q=88"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = tailoringImage;
              }}
              alt="Editorial fashion campaign"
              loading="lazy"
            />
          </div>
          <div className="editorial-copy reveal">
            <div className="kicker" style={{ color: "#ff6bb6" }}>
              New collection / 2026
            </div>
            <h2>Colour, with a quieter confidence.</h2>
            <p>
              Fluid tailoring, saturated accents, and pieces that move easily from daylight to dinner.
              The new collection keeps the drama in the details.
            </p>
            <Link className="btn" to="/shop">
              <span>Discover the edit</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 12h14M14 7l5 5-5 5" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          SECTION 4: STORY / OUR POINT OF VIEW
          ====================================================== */}
      <section className="section story" id="story">
        <div className="container story-grid">
          <div className="kicker reveal">Our point of view</div>
          <div>
            <div className="story-quote reveal">
              Designed to feel <em>alive.</em>
              <br />
              Made to be remembered.
            </div>
            <div className="story-copy reveal" data-delay="1">
              <p>
                Tere Rang is built around expression — refined shapes, playful colour, and everyday pieces
                with enough personality to become yours.
              </p>
              <Link className="text-link" to="/contact">
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SECTION 5: TRUST PILLARS
          ====================================================== */}
      <div className="container">
        <div className="trust-grid">
          {TRUST_ITEMS.map((item, i) => (
            <div className="trust-item reveal" data-delay={i % 4} key={item.title}>
              {item.icon}
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================
          SECTION 6: REVIEWS / CUSTOMER LOVE
          ====================================================== */}
      <section className="section reviews-wrap">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="kicker">The Tere Rang circle</div>
              <h2>Worn. Loved. Repeated.</h2>
            </div>
            <p>Real notes from customers who made the pieces their own.</p>
          </div>
          <div className="reviews">
            {REVIEWS.map((r, i) => (
              <article className="review reveal" data-delay={i} key={r.person}>
                <div className="stars">{r.stars}</div>
                <blockquote>{r.quote}</blockquote>
                <div className="person">{r.person}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          SECTION 7: COMMUNITY / STYLED BY YOU (@tererang)
          CRITICAL: Model face visible with objectPosition: "top"
          ====================================================== */}
      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="kicker">Follow our world</div>
              <h2>@tererang</h2>
            </div>
            <a
              className="text-link"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram ↗
            </a>
          </div>

          <div className="community-grid">
            {COMMUNITY_IMAGES.map((img, i) => (
              <a
                className="community-tile reveal"
                data-delay={i % 3}
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                key={i}
              >
                <img
                  src={img.src}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = img.fallback;
                  }}
                  alt={img.alt}
                  loading="lazy"
                  style={{ objectPosition: "top" }}
                />
                <div className="community-overlay">
                  {i === 0 ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M17.5 6.5h.01" />
                    </svg>
                  ) : (
                    "♡"
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          SECTION 8: NEWSLETTER
          ====================================================== */}
      <section className="newsletter">
        <div className="container newsletter-grid">
          <div className="reveal">
            <div className="kicker">Early access starts here</div>
            <h2>Stay in the loop.</h2>
            <p>New drops, private edits, and first access to colour stories.</p>
          </div>
          <form className="signup reveal" id="newsletterForm" onSubmit={handleEmailSubmit}>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">
              Subscribe <span>↗</span>
            </button>
          </form>
          {emailNote ? (
            <div className="form-note" style={{ gridColumn: "1 / -1" }}>
              {emailNote}
            </div>
          ) : null}
        </div>
      </section>

      <Footer variant="home" />
    </main>
  );
};

export default Home;
