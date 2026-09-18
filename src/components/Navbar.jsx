import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, MapPin, Package, Trash2, User } from "lucide-react";
import { useCart } from "../context/cartContextStore.js";
import { notifyCartAuthChange } from "../context/cartEvents.js";
import { apiUrl, imageUrl } from "../config/env.js";
import ProductImage from "./ProductImage.jsx";
import "../css/Navbar.css";
import logo from "../assets/logo.png";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => currencyFormatter.format(Math.max(0, value));

const resolveProductImage = (product) => {
  if (!product) return null;
  const candidate =
    (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
    product.image ||
    (Array.isArray(product.images) && product.images[0]);
  if (!candidate) return null;
  if (/^https?:/i.test(candidate)) return candidate;
  return imageUrl(candidate);
};

const Navbar = () => {
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [promotionalText, setPromotionalText] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const loginRef = useRef(null);
  const cartRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, loading: cartLoading, removeCartItem, error: cartError } = useCart();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const fetchPromotionalText = async () => {
      try {
        const response = await fetch(apiUrl("/api/settings"));
        if (response.ok) {
          const data = await response.json();
          if (data.settings && "promotionalText" in data.settings) {
            setPromotionalText(data.settings.promotionalText);
          }
        }
      } catch (error) {
        console.error("Error fetching promotional text:", error);
      }
    };

    fetchPromotionalText();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setIsLoginMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMegaOpen(false);
    setIsLoginMenuOpen(false);
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(false);
  }, [location]);

  useEffect(() => {
    if (cartError) {
      setCartFeedback({ type: "error", text: cartError });
    }
  }, [cartError]);

  useEffect(() => {
    if (!cartFeedback) return undefined;
    const timer = setTimeout(() => setCartFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [cartFeedback]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen, isDrawerOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsDrawerOpen(false);
        setIsCartOpen(false);
        setIsLoginMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setIsLoginMenuOpen(false);
    setIsCartOpen(false);
    notifyCartAuthChange();
    window.location.href = "/";
  };

  const handleRemoveFromCart = async (itemId) => {
    if (!itemId) return;
    try {
      setRemovingItemId(itemId);
      setCartFeedback(null);
      await removeCartItem(itemId);
      setCartFeedback({ type: "success", text: "Item removed from cart" });
    } catch (error) {
      setCartFeedback({ type: "error", text: error.message || "Unable to remove cart item" });
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchTag = (tag) => {
    setSearchQuery(tag);
    setIsSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
  };

  const cartHasItems = Array.isArray(cartItems) && cartItems.length > 0;
  const cartBadge = cartCount > 99 ? "99+" : cartCount;
  const hasPromotionalText = promotionalText && promotionalText.trim() !== "";

  const cartPanel = (
    <div className="storefront-popup w-80 max-w-[calc(100vw-2rem)] p-5 text-foreground">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">My cart</p>
          <p className="font-serif text-lg lowercase text-foreground">
            {cartHasItems ? `${cartCount} item${cartCount === 1 ? "" : "s"}` : "no items yet"}
          </p>
        </div>
        {cartHasItems ? <span className="text-sm font-semibold text-foreground">{formatCurrency(cartTotal)}</span> : null}
      </div>

      {cartFeedback ? (
        <div className={`mb-3 border px-3 py-2 text-xs ${cartFeedback.type === "error" ? "border-red-200 bg-red-50 text-red-600" : "border-pink-200 bg-pink-50 text-pink-700"}`}>
          {cartFeedback.text}
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-4">Log in to view and save items to your bag.</p>
          <Link
            to="/login"
            onClick={() => setIsCartOpen(false)}
            className="inline-block bg-[var(--ink)] px-6 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-white transition hover:bg-[var(--pink)]"
          >
            Login to continue
          </Link>
        </div>
      ) : cartLoading ? (
        <p className="text-sm text-muted-foreground">Loading cart...</p>
      ) : cartHasItems ? (
        <>
          <div className="max-h-64 divide-y divide-border/60 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const previewSrc = resolveProductImage(item.product);
              return (
                <div key={item.id} className="flex items-start gap-3 py-3.5">
                  <ProductImage
                    src={previewSrc}
                    alt={item.product?.name || "Product image"}
                    className="h-16 w-16 border border-border/70 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight text-foreground">{item.product?.name || "Unavailable product"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {item.quantity}
                      {item.size ? ` · size ${item.size}` : ""}
                      {item.height ? ` · ${item.height}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--pink)]">{formatCurrency(item.lineTotal)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    disabled={removingItemId === item.id}
                    className={`text-muted-foreground transition hover:text-red-600 ${removingItemId === item.id ? "cursor-not-allowed opacity-50" : ""}`}
                    aria-label="Remove item"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border/70 pt-4 text-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="space-y-2">
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full bg-[var(--ink)] py-2.5 text-center text-xs font-semibold tracking-[0.14em] uppercase text-white transition hover:bg-[var(--pink)]"
              >
                Proceed to checkout
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="block w-full border border-border bg-transparent py-2 text-center text-xs font-semibold tracking-[0.14em] uppercase text-foreground transition hover:border-[var(--ink)]"
              >
                View cart
              </Link>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Your cart is empty. Explore our collection to add something special.</p>
      )}
    </div>
  );

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="announce">
        {hasPromotionalText ? (
          promotionalText
        ) : (
          <>
            Tere Rang Studio — Moradabad · Free shipping on orders above ₹1,999 ·{" "}
            <Link to="/#new">Explore new drop</Link>
          </>
        )}
      </div>

      {/* ── Header / Sticky Navigation ── */}
      <header
        className={`nav-wrap ${isScrolled ? "scrolled" : ""}`}
        id="siteHeader"
        onMouseLeave={() => setIsMegaOpen(false)}
      >
        <div className="nav">
          {/* Logo */}
          <Link to="/" className="logo" aria-label="Tere Rang home">
            <img
              src="https://images.squarespace-cdn.com/content/v1/6763fd2f4619d8544e3cbba9/e913a532-a521-4f16-8386-3f1fb890a5d4/TR+Logo.png?format=1500w"
              onError={(e) => {
                e.currentTarget.src = logo;
              }}
              alt="Tere Rang"
            />
          </Link>

          {/* Primary Navigation */}
          <nav className="nav-links" aria-label="Primary navigation">
            <a
              href="#new"
              className={`nav-link ${location.pathname === "/" && (!location.hash || location.hash === "#new") ? "active" : ""}`}
            >
              New Arrivals
            </a>

            <a
              href="#products"
              className={`nav-link ${isMegaOpen ? "active" : ""}`}
              id="shopTrigger"
              aria-expanded={isMegaOpen}
              onMouseEnter={() => setIsMegaOpen(true)}
            >
              Shop
            </a>

            <a
              href="#categories"
              className={`nav-link ${location.hash === "#categories" ? "active" : ""}`}
            >
              Collections
            </a>
            <a
              href="#products"
              className="nav-link"
            >
              Best Sellers
            </a>
            <a
              href="#story"
              className={`nav-link ${location.hash === "#story" ? "active" : ""}`}
            >
              About
            </a>
          </nav>

          {/* Action Icons */}
          <div className="nav-actions">
            {/* Search Button */}
            <button
              className="icon-btn"
              id="searchOpen"
              aria-label="Search"
              type="button"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </button>

            {/* Account Button (Desktop) */}
            <div className="relative desktop-only" ref={loginRef}>
              <button
                className="icon-btn"
                aria-label="Account"
                type="button"
                onClick={() => setIsLoginMenuOpen((s) => !s)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.3" />
                  <path d="M5.5 20c.8-4.2 3-6 6.5-6s5.7 1.8 6.5 6" />
                </svg>
              </button>

              {isLoginMenuOpen && (
                <div className="storefront-popup w-64 p-5 text-foreground">
                  {isAuthenticated ? (
                    <>
                      <div className="mb-3 flex items-center gap-3">
                        <User className="h-5 w-5 text-[var(--pink)]" />
                        <div>
                          <h4 className="font-serif text-base font-semibold lowercase text-foreground">{user?.name || "welcome"}</h4>
                          <p className="text-xs text-muted-foreground">{user?.phoneNumber}</p>
                        </div>
                      </div>
                      <hr className="mb-3" />
                      <ul className="space-y-2.5 text-sm">
                        <li>
                          <Link
                            to="/MyOrder"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-foreground transition-colors hover:text-[var(--pink)]"
                          >
                            <Package className="mr-2.5 h-4 w-4 text-[var(--pink)]" /> My orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/addresses"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-foreground transition-colors hover:text-[var(--pink)]"
                          >
                            <MapPin className="mr-2.5 h-4 w-4 text-[var(--pink)]" /> Addresses
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center text-left text-red-600 transition-colors hover:opacity-80"
                            type="button"
                          >
                            <LogOut className="mr-2.5 h-4 w-4" /> Logout
                          </button>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <h4 className="mb-1 font-serif text-base font-semibold lowercase text-foreground">welcome</h4>
                      <p className="mb-3 text-xs text-muted-foreground">Access your account and manage orders.</p>
                      <Link
                        to="/login"
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="block bg-[var(--ink)] py-2 text-center text-xs font-semibold tracking-[0.14em] uppercase text-white transition hover:bg-[var(--pink)]"
                      >
                        Login / signup
                      </Link>
                      <hr className="my-3" />
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link
                            to="/MyOrder"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-foreground transition-colors hover:text-[var(--pink)]"
                          >
                            <Package className="mr-2.5 h-4 w-4 text-[var(--pink)]" /> My orders
                          </Link>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button (Desktop) */}
            <Link
              to="/shop"
              className="icon-btn desktop-only"
              aria-label="Wishlist"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M20.8 4.9a5.2 5.2 0 0 0-7.4 0L12 6.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
              </svg>
            </Link>

            {/* Cart Button */}
            <div className="relative" ref={cartRef}>
              <button
                className="icon-btn"
                aria-label="Cart"
                type="button"
                onClick={() => setIsCartOpen((s) => !s)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 7h16l-1.3 13H5.3L4 7Z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
                {cartCount > 0 && <span className="badge" id="cartCount">{cartBadge}</span>}
              </button>
              {isCartOpen && cartPanel}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="icon-btn menu-btn"
              id="menuOpen"
              aria-label="Open menu"
              type="button"
              onClick={() => setIsDrawerOpen(true)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mega Menu (Full Width Under Header) ── */}
        <div className={`mega ${isMegaOpen ? "open" : ""}`} id="megaMenu">
          <div className="mega-inner">
            <div>
              <h4>Shop by edit</h4>
              <a href="#products" onClick={() => setIsMegaOpen(false)}>New Arrivals</a>
              <a href="#products" onClick={() => setIsMegaOpen(false)}>Best Sellers</a>
              <a href="#products" onClick={() => setIsMegaOpen(false)}>Occasion Wear</a>
              <a href="#products" onClick={() => setIsMegaOpen(false)}>Everyday Essentials</a>
            </div>
            <div>
              <h4>Collections</h4>
              <a href="#categories" onClick={() => setIsMegaOpen(false)}>Rang Bloom</a>
              <a href="#categories" onClick={() => setIsMegaOpen(false)}>Soft Structure</a>
              <a href="#categories" onClick={() => setIsMegaOpen(false)}>After Dark</a>
              <a href="#categories" onClick={() => setIsMegaOpen(false)}>Accessories</a>
            </div>
            <a className="mega-card" href="#new" onClick={() => setIsMegaOpen(false)}>
              <div>
                <span className="kicker" style={{ color: "#fff" }}>Featured edit</span>
                <h3 style={{ fontFamily: "Playfair Display, serif", margin: "6px 0 0", fontSize: "30px", color: "#fff" }}>
                  The Colour Story
                </h3>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* ── Search Slide-Down Panel ── */}
      <div className={`search-panel ${isSearchOpen ? "open" : ""}`} id="searchPanel" aria-hidden={!isSearchOpen}>
        <div className="search-backdrop" onClick={() => setIsSearchOpen(false)} />
        <div className="search-box">
          <div className="search-head">
            <div className="search-kicker">Search Tere Rang</div>
            <button
              className="icon-btn"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
              type="button"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSearchSubmit} className="search-line">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              ref={searchInputRef}
              id="searchInput"
              type="search"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="search-suggestions">
            <span>Try:</span>
            {["dress", "kurti", "suit", "co-ord", "new arrivals"].map((tag) => (
              <button
                key={tag}
                type="button"
                className="search-chip"
                onClick={() => handleSearchTag(tag)}
              >
                “{tag}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <div className={`drawer ${isDrawerOpen ? "open" : ""}`} id="drawer" aria-hidden={!isDrawerOpen}>
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} />
        <aside className="drawer-panel">
          <div className="drawer-head">
            <Link to="/" onClick={() => setIsDrawerOpen(false)} className="drawer-logo">
              <img src={logo} alt="Tere Rang" />
            </Link>
            <button
              className="icon-btn"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close menu"
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="drawer-links">
            <Link to="/#new" onClick={() => setIsDrawerOpen(false)}>New Arrivals</Link>
            <Link to="/shop" onClick={() => setIsDrawerOpen(false)}>Shop</Link>
            <Link to="/#categories" onClick={() => setIsDrawerOpen(false)}>Collections</Link>
            <Link to="/products/wedding" onClick={() => setIsDrawerOpen(false)}>Best Sellers</Link>
            <Link to="/#story" onClick={() => setIsDrawerOpen(false)}>About</Link>
          </div>
          <div className="drawer-footer-links">
            {isAuthenticated ? (
              <>
                <Link to="/MyOrder" onClick={() => setIsDrawerOpen(false)}>My Orders</Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleLogout();
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: "inherit" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsDrawerOpen(false)}>Account</Link>
            )}
            <Link to="/shop" onClick={() => setIsDrawerOpen(false)}>Wishlist</Link>
            <Link to="/cart" onClick={() => setIsDrawerOpen(false)}>Cart ({cartCount})</Link>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
