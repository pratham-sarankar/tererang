import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { useCart } from "../context/cartContextStore.js";
import tailoringImage from "../assets/traditional_ethnic_wear.png";
import bannerImage from "../assets/banner_1.jpeg";
import modernImage from "../assets/banner_2.jpeg";
import ethnicImage from "../assets/modern_ethnic_fusion.png";
import "../css/Home.css";

const MARQUEE_WORDS = [
  "New season, new", "rang", "✦", "Made for movement", "✦",
  "Colour-led essentials", "✦", "Modern Indian spirit", "✦",
  "New season, new", "rang", "✦", "Made for movement", "✦",
  "Colour-led essentials", "✦", "Modern Indian spirit", "✦",
];

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
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
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

const REVIEWS = [
  {
    stars: "★★★★★",
    quote: "The fit is so clean, but the colour still makes it feel special. I wore it once and immediately ordered another.",
    person: "Aarohi M. — Hyderabad",
  },
  {
    stars: "★★★★★",
    quote: "It feels premium without trying too hard. The details are even better in person.",
    person: "Riya K. — Bengaluru",
  },
  {
    stars: "★★★★★",
    quote: "Finally a brand that understands colour and restraint at the same time.",
    person: "Naina S. — Pune",
  },
];

/* ─── Category grid data from reference ─────────────────────────── */
const CATEGORIES = [
  {
    title: "Rang Bloom",
    kicker: "01 / Statement",
    to: "/products/wedding",
    img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=86",
    fallbackImg: bannerImage,
    large: true,
  },
  {
    title: "Soft Structure",
    kicker: "02 / Everyday",
    to: "/products/Suit",
    img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=86",
    fallbackImg: ethnicImage,
  },
  {
    title: "Finishing Touches",
    kicker: "03 / Details",
    to: "/products/Coat",
    img: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=86",
    fallbackImg: modernImage,
  },
];

/* ─── Community tiles from reference ────────────────────────────── */
const COMMUNITY_TILES = [
  {
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86",
    fallbackImg: bannerImage,
    alt: "Tere Rang community style",
    hasSvg: true,
  },
  {
    img: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=700&q=86",
    fallbackImg: ethnicImage,
    alt: "Lifestyle detail",
  },
  {
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=700&q=86",
    fallbackImg: modernImage,
    alt: "Editorial portrait",
  },
  {
    img: "https://images.unsplash.com/photo-1542295661-3fd8d8c25ca8?auto=format&fit=crop&w=700&q=86",
    fallbackImg: tailoringImage,
    alt: "Fashion detail",
  },
  {
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=86",
    fallbackImg: bannerImage,
    alt: "Wardrobe styling",
  },
];

/* ─── Curated Reference Products ────────────────────────────────── */
const REFERENCE_PRODUCTS = [
  {
    id: "ref-1",
    name: "Gulabi Drape Dress",
    category: "Dresses",
    tag: "Bestseller",
    meta: "Signature / Rose",
    price: 2899,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=86",
    swatches: ["pink", "black"],
  },
  {
    id: "ref-2",
    name: "Noor Co-ord Set",
    category: "Sets",
    tag: "New",
    meta: "Co-ords / Ivory",
    price: 3499,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=86",
    swatches: ["cream", "pink"],
  },
  {
    id: "ref-3",
    name: "Midnight Wrap Jacket",
    category: "Sets",
    tag: "-20%",
    meta: "Layering / Black",
    price: 2399,
    originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=86",
    swatches: ["black", "blue"],
  },
  {
    id: "ref-4",
    name: "Meher Midi Dress",
    category: "Dresses",
    meta: "Dresses / Sky",
    price: 2699,
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=86",
    swatches: ["blue", "cream"],
  },
  {
    id: "ref-5",
    name: "Zari Silk Potli Bag",
    category: "Accessories",
    tag: "Handcrafted",
    meta: "Accessories / Rose Gold",
    price: 1899,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=86",
    swatches: ["cream", "pink"],
  },
  {
    id: "ref-6",
    name: "Chanderi Embroidered Stole",
    category: "Accessories",
    tag: "Bestseller",
    meta: "Accessories / Ivory",
    price: 1499,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=86",
    swatches: ["cream", "blue"],
  },
];

/* ─── Reveal hook ─────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal, .home-reveal");
    if (!elements.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

/* ─── Main Component ──────────────────────────────────────────────── */
const Home = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [wishlisted, setWishlisted] = useState({});
  const [quickAddedId, setQuickAddedId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToastBar, setShowToastBar] = useState(false);
  const [email, setEmail] = useState("");
  const [emailNote, setEmailNote] = useState("");
  const toastTimerRef = useRef(null);
  const quickTimerRef = useRef(null);
  const { addItemToCart } = useCart();

  useReveal();

  const filteredProducts = useMemo(() => {
    if (selectedFilter === "All") {
      return REFERENCE_PRODUCTS.slice(0, 4);
    }
    return REFERENCE_PRODUCTS.filter(
      (p) => p.category.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [selectedFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowToastBar(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowToastBar(false);
    }, 1800);
  };

  const handleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlisted((prev) => {
      const next = !prev[id];
      showToast(next ? "Saved to wishlist" : "Removed from wishlist");
      return { ...prev, [id]: next };
    });
  };

  const handleQuickAdd = async (e, product) => {
    e.stopPropagation();
    setQuickAddedId(product.id);
    if (quickTimerRef.current) clearTimeout(quickTimerRef.current);
    quickTimerRef.current = setTimeout(() => {
      setQuickAddedId(null);
    }, 1200);

    try {
      if (addItemToCart) {
        await addItemToCart(product.id, { quantity: 1 });
      }
    } catch {
      // fallback
    }
    showToast("Added to cart");
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailNote("Please enter a valid email address.");
      return;
    }
    setEmailNote("You’re in — welcome to the Tere Rang circle.");
    setEmail("");
  };

  return (
    <main className="home-page" id="top">
      {/* ── Toast notification ── */}
      <div className={`toast ${showToastBar ? "show" : ""}`} id="toast" role="alert">
        {toastMessage || "Added to cart"}
      </div>

      {/* ── Hero Section ── */}
      <section className="home-hero" id="new" aria-label="Tererang hero">
        <div className="home-container home-hero-grid">
          {/* Hero Copy */}
          <div className="home-hero-copy">
            <div className="home-hero-logomark home-hero-animate">
              <i aria-hidden="true" />
              expressive everyday wear
            </div>
            <h1 className="home-hero-animate d1">
              Wear your <em>rang.</em>
              <br />
              Own the room.
            </h1>
            <p className="home-hero-desc home-hero-animate d2">
              Modern silhouettes with a vivid point of view — designed for women who prefer elegance with personality.
            </p>
            <div className="home-hero-actions home-hero-animate d3">
              <a className="home-btn" href="#products">
                <span>Shop the collection</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M5 12h14M14 7l5 5-5 5" />
                </svg>
              </a>
              <a className="home-text-link" href="#categories">
                Explore new arrivals
              </a>
            </div>
          </div>

          {/* Hero Art Panel */}
          <div className="home-hero-art home-hero-animate d2" aria-hidden="true">
            <div className="home-hero-main">
              <img
                src={bannerImage}
                onError={(e) => {
                  e.currentTarget.src = bannerImage;
                }}
                alt="Fashion model in a refined editorial look"
                fetchpriority="high"
              />
            </div>
            <div className="home-hero-float">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=88"
                onError={(e) => {
                  e.currentTarget.src = tailoringImage;
                }}
                alt="Portrait detail"
              />
            </div>
            <div className="home-color-petals" aria-hidden="true">
              <span className="home-petal" />
              <span className="home-petal" />
              <span className="home-petal" />
              <span className="home-petal" />
              <span className="home-petal" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee Ticker ── */}
      <div className="home-marquee" aria-hidden="true">
        <div className="home-marquee-track">
          {MARQUEE_WORDS.map((word, i) => (
            <span key={i}>
              {word === "rang" ? <b>rang</b> : word}
            </span>
          ))}
        </div>
      </div>

      {/* ── Categories Section (Shop by mood) ── */}
      <section className="home-section" id="categories" aria-labelledby="categories-title">
        <div className="home-container">
          <div className="home-section-head home-reveal">
            <div>
              <p className="home-kicker">Curated edits</p>
              <h2 id="categories-title">Shop by mood.</h2>
            </div>
            <p style={{ maxWidth: "440px" }}>
              Not categories for the sake of categories — each edit is built around a feeling, a palette, and a moment.
            </p>
          </div>
          <div className="home-categories-grid">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.title}
                to={cat.to}
                className={`home-cat home-reveal${cat.large ? " large" : ""}`}
                data-delay={idx > 0 ? idx : undefined}
                aria-label={cat.title}
              >
                <img
                  src={cat.img}
                  onError={(e) => {
                    e.currentTarget.src = cat.fallbackImg;
                  }}
                  alt={cat.title}
                  loading="lazy"
                />
                <div className="home-cat-info">
                  <div>
                    <p className="home-cat-kicker">{cat.kicker}</p>
                    <h3>{cat.title}</h3>
                  </div>
                  <div className="home-round-arrow" aria-hidden="true">
                    ↗
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Section (Best sellers) ── */}
      <section className="section products-wrap" id="products">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="kicker">Best sellers</div>
              <h2>Most loved, right now.</h2>
            </div>
            <div className="product-toolbar" aria-label="Product filters">
              {["All", "Dresses", "Sets", "Accessories"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`chip ${selectedFilter === chip ? "active" : ""}`}
                  onClick={() => {
                    setSelectedFilter(chip);
                    showToast(`${chip} selected`);
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="products">
            {filteredProducts.map((product, idx) => {
              const pid = product.id;
              const isFav = !!wishlisted[pid];
              const isAdded = quickAddedId === pid;
              return (
                <article
                  key={pid}
                  className="product reveal"
                  data-delay={idx > 0 ? idx : undefined}
                >
                  <div className="product-media">
                    <img
                      src={product.image}
                      onError={(e) => {
                        e.currentTarget.src = bannerImage;
                      }}
                      alt={product.name}
                      loading="lazy"
                    />
                    {product.tag && <span className="product-tag">{product.tag}</span>}
                    <button
                      className={`wish ${isFav ? "active" : ""}`}
                      onClick={(e) => handleWishlist(e, pid)}
                      aria-label={`Add ${product.name} to wishlist`}
                      aria-pressed={isFav}
                      type="button"
                    >
                      <svg fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M20.8 4.9a5.2 5.2 0 0 0-7.4 0L12 6.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
                      </svg>
                    </button>
                    <button
                      className="quick"
                      onClick={(e) => handleQuickAdd(e, product)}
                      type="button"
                    >
                      {isAdded ? "Added ✓" : "Quick add"}
                    </button>
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <div>
                        <h3>{product.name}</h3>
                        <div className="meta">{product.meta}</div>
                      </div>
                      <div className="price">
                        ₹{product.price.toLocaleString("en-IN")}
                        {product.oldPrice && (
                          <span className="old">₹{product.oldPrice.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </div>
                    <div className="swatches" aria-hidden="true">
                      {product.swatches.map((s, i) => (
                        <i key={i} className={`swatch ${s}`} />
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Editorial Section ── */}
      <section className="home-editorial" id="editorial" aria-labelledby="editorial-title">
        <div className="home-editorial-grid">
          <div className="home-editorial-image home-reveal">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1500&q=88"
              onError={(e) => {
                e.currentTarget.src = tailoringImage;
              }}
              alt="Editorial fashion campaign"
              loading="lazy"
            />
          </div>
          <div className="home-editorial-copy home-reveal">
            <p className="home-kicker" style={{ color: "#ff6bb6" }}>New collection / 2026</p>
            <h2 id="editorial-title">Colour, with a quieter confidence.</h2>
            <p>
              Fluid tailoring, saturated accents, and pieces that move easily from daylight to dinner. The new collection
              keeps the drama in the details.
            </p>
            <a className="home-btn" href="#products">
              <span>Discover the edit</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path d="M5 12h14M14 7l5 5-5 5" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Story Section ── */}
      <section className="home-section home-story" id="story" aria-labelledby="story-title">
        <div className="home-container home-story-grid">
          <div className="home-kicker home-reveal">Our point of view</div>
          <div>
            <div className="home-story-quote home-reveal" id="story-title">
              Designed to feel <em>alive.</em>
              <br />
              Made to be remembered.
            </div>
            <div className="home-story-copy home-reveal" data-delay="1">
              <p>
                Tere Rang is built around expression — refined shapes, playful colour, and everyday pieces with enough
                personality to become yours.
              </p>
              <a className="home-text-link" href="#new">
                Read our story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <div className="home-trust" role="list" aria-label="Our promises">
        <div className="home-container home-trust-grid">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="home-trust-item" role="listitem">
              {item.icon}
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <section className="home-section home-reviews-wrap" aria-labelledby="reviews-title">
        <div className="home-container">
          <div className="home-section-head home-reveal">
            <div>
              <p className="home-kicker">The Tere Rang circle</p>
              <h2 id="reviews-title">Worn. Loved. Repeated.</h2>
            </div>
            <p>Real notes from customers who made the pieces their own.</p>
          </div>
          <div className="home-reviews" role="list">
            {REVIEWS.map((review, i) => (
              <article key={i} className="home-review home-reveal" data-delay={i > 0 ? i : undefined} role="listitem">
                <div className="home-stars">{review.stars}</div>
                <blockquote>“{review.quote}”</blockquote>
                <div className="home-person">{review.person}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community / Instagram Section ── */}
      <section className="home-section" aria-labelledby="community-title" style={{ paddingTop: "10px" }}>
        <div className="home-container">
          <div className="home-section-head home-reveal">
            <div>
              <p className="home-kicker">Follow our world</p>
              <h2 id="community-title">@tererang</h2>
            </div>
            <a
              className="home-text-link"
              href="https://www.instagram.com/tererang.official/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram ↗
            </a>
          </div>
          <div className="home-community-grid">
            {COMMUNITY_TILES.map((tile, i) => (
              <a
                key={i}
                className="home-community-tile home-reveal"
                data-delay={i % 2 === 1 ? 1 : i % 2 === 2 ? 2 : undefined}
                href="https://www.instagram.com/tererang.official/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tile.alt}
              >
                <img
                  src={tile.img}
                  onError={(e) => {
                    e.currentTarget.src = tile.fallbackImg;
                  }}
                  alt={tile.alt}
                  loading="lazy"
                />
                <div className="home-community-overlay">
                  {tile.hasSvg ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
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

      {/* ── Newsletter Section ── */}
      <section className="home-newsletter" aria-labelledby="newsletter-title">
        <div className="home-container">
          <div className="home-newsletter-grid">
            <div>
              <p className="home-kicker home-reveal">Stay in touch</p>
              <h2 id="newsletter-title" className="home-reveal" data-delay="1">
                Join the colour circle.
              </h2>
              <p className="home-reveal" data-delay="2" style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 0 }}>
                Be first to see new edits, boutique releases, and quiet stories behind our palette.
              </p>
            </div>
            <div className="home-reveal" data-delay="1">
              <form onSubmit={handleEmailSubmit} noValidate id="newsletterForm">
                <div className="home-signup">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address for newsletter"
                    autoComplete="email"
                  />
                  <button type="submit" aria-label="Subscribe">
                    Subscribe
                  </button>
                </div>
                <p className="home-form-note" role="status" aria-live="polite">
                  {emailNote}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer variant="home" />
    </main>
  );
};

export default Home;
