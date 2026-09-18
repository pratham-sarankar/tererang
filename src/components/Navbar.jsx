import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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
      if (loginRef.current && !loginRef.current.contains(event.target)) setIsLoginMenuOpen(false);
      if (cartRef.current && !cartRef.current.contains(event.target)) setIsCartOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMegaOpen(false);
    setIsSearchOpen(false);
    setIsLoginMenuOpen(false);
    setIsDrawerOpen(false);
    setIsCartOpen(false);
  }, [location]);

  useEffect(() => {
    if (cartError) setCartFeedback({ type: "error", text: cartError });
  }, [cartError]);

  useEffect(() => {
    if (!cartFeedback) return undefined;
    const timer = setTimeout(() => setCartFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [cartFeedback]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when search or mobile drawer is open
  useEffect(() => {
    if (isSearchOpen || isDrawerOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isSearchOpen, isDrawerOpen]);

  // Focus search input when search open
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsDrawerOpen(false);
        setIsMegaOpen(false);
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
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/shop");
    }
    setIsSearchOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const cartHasItems = Array.isArray(cartItems) && cartItems.length > 0;
  const cartBadge = cartCount > 99 ? "99+" : cartCount;
  const hasPromotionalText = promotionalText && promotionalText.trim() !== "";
  const announcementText = hasPromotionalText
    ? promotionalText
    : "Free shipping on orders over ₹1,999";

  /* ---- Cart panel popup ---- */
  const cartPanel = (
    <div className="nav-cart-popup is-open">
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>My cart</p>
          <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, margin: 0 }}>
            {cartHasItems ? `${cartCount} item${cartCount === 1 ? "" : "s"}` : "no items yet"}
          </p>
        </div>
        {cartHasItems ? <span style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(cartTotal)}</span> : null}
      </div>

      {cartFeedback ? (
        <div style={{ marginBottom: 12, padding: "8px 12px", fontSize: 12, background: cartFeedback.type === "error" ? "#fef2f2" : "#f9f0f6", border: `1px solid ${cartFeedback.type === "error" ? "#fca5a5" : "#ebcadd"}`, color: cartFeedback.type === "error" ? "#c22f2f" : "#8a0b72" }}>
          {cartFeedback.text}
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
          <p style={{ marginBottom: 16 }}>Log in to view your cart items and checkout quickly.</p>
          <Link to="/login" onClick={() => setIsCartOpen(false)} style={{ display: "inline-block", background: "var(--pink)", color: "#fff", padding: "10px 24px", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none" }}>
            Login to continue
          </Link>
        </div>
      ) : cartLoading ? (
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading cart...</p>
      ) : cartHasItems ? (
        <>
          <div style={{ maxHeight: 256, overflowY: "auto", paddingRight: 4 }}>
            {cartItems.map((item) => {
              const previewSrc = resolveProductImage(item.product);
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(235,202,221,.6)" }}>
                  <ProductImage src={previewSrc} alt={item.product?.name || "Product image"} style={{ width: 64, height: 64, objectFit: "cover", border: "1px solid rgba(235,202,221,.7)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{item.product?.name || "Unavailable product"}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0" }}>
                      Qty {item.quantity}{item.size ? ` · size ${item.size}` : ""}{item.height ? ` · ${item.height}` : ""}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--pink)", margin: 0 }}>{formatCurrency(item.lineTotal)}</p>
                  </div>
                  <button onClick={() => handleRemoveFromCart(item.id)} disabled={removingItemId === item.id} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", opacity: removingItemId === item.id ? 0.5 : 1 }} aria-label="Remove item" type="button">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(235,202,221,.7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14 }}>
              <span style={{ color: "var(--muted)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(cartTotal)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link to="/checkout" onClick={() => setIsCartOpen(false)} style={{ display: "block", background: "var(--ink)", color: "#fff", textAlign: "center", padding: "12px", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none" }}>
                Proceed to checkout
              </Link>
              <Link to="/shop" onClick={() => setIsCartOpen(false)} style={{ display: "block", border: "1px solid var(--line)", textAlign: "center", padding: "12px", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink)", textDecoration: "none" }}>
                Continue shopping
              </Link>
            </div>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Your cart is empty. Explore our collections to add something special.</p>
      )}
    </div>
  );

  return (
    <>
      {/* ===== Announcement bar ===== */}
      <div className="announce">
        {announcementText} <Link to="/shop">Shop now</Link>
      </div>

      {/* ===== Main Header ===== */}
      <header
        className={`nav-wrap${isScrolled ? " scrolled" : ""}`}
        id="navWrap"
        onMouseLeave={() => setIsMegaOpen(false)}
      >
        <div className="container nav">
          {/* Logo */}
          <Link to="/" className="logo" aria-label="Tere Rang home">
            <img src={logo} alt="Tere Rang" />
          </Link>

          {/* Nav Links */}
          <nav className="nav-links" aria-label="Primary navigation">
            <Link className="nav-link" to="/shop">
              New Arrivals
            </Link>
            <Link
              className="nav-link"
              to="/shop"
              id="shopTrigger"
              aria-expanded={isMegaOpen}
              onMouseEnter={() => setIsMegaOpen(true)}
            >
              Shop
            </Link>
            <Link className="nav-link" to="/shop">
              Collections
            </Link>
            <Link className="nav-link" to="/products/wedding">
              Best Sellers
            </Link>
            <Link className="nav-link" to="/contact">
              About
            </Link>
          </nav>

          {/* Right Action Icons */}
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

            {/* Account (desktop only) */}
            <div style={{ position: "relative" }} ref={loginRef} className="desktop-only">
              <button
                type="button"
                onClick={() => setIsLoginMenuOpen((s) => !s)}
                className="icon-btn"
                aria-label={isAuthenticated ? "Account menu" : "Login"}
              >
                <User />
              </button>
              <div className={`nav-account-popup${isLoginMenuOpen ? " is-open" : ""}`}>
                {isAuthenticated ? (
                  <>
                    <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <User size={20} style={{ color: "var(--pink)" }} />
                      <div>
                        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, margin: 0 }}>{user?.name || "welcome"}</p>
                        <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{user?.phoneNumber}</p>
                      </div>
                    </div>
                    <hr style={{ borderColor: "rgba(235,202,221,.6)", margin: "0 0 16px" }} />
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                      <li><Link to="/MyOrder" onClick={() => setIsLoginMenuOpen(false)} style={{ display: "flex", alignItems: "center", color: "var(--ink)", textDecoration: "none" }}><Package size={16} style={{ marginRight: 10, color: "var(--pink)" }} /> My orders</Link></li>
                      <li><Link to="/addresses" onClick={() => setIsLoginMenuOpen(false)} style={{ display: "flex", alignItems: "center", color: "var(--ink)", textDecoration: "none" }}><MapPin size={16} style={{ marginRight: 10, color: "var(--pink)" }} /> Addresses</Link></li>
                      <li><button onClick={handleLogout} style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#c22f2f", fontSize: 14, padding: 0 }} type="button"><LogOut size={16} style={{ marginRight: 10 }} /> Logout</button></li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, margin: "0 0 4px" }}>welcome</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 16px" }}>Access your account and manage orders.</p>
                    <Link to="/login" onClick={() => setIsLoginMenuOpen(false)} style={{ display: "block", background: "var(--pink)", color: "#fff", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none" }}>
                      Login / signup
                    </Link>
                    <hr style={{ borderColor: "rgba(235,202,221,.6)", margin: "16px 0" }} />
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                      <li><Link to="/MyOrder" onClick={() => setIsLoginMenuOpen(false)} style={{ display: "flex", alignItems: "center", color: "var(--ink)", textDecoration: "none" }}><Package size={16} style={{ marginRight: 10, color: "var(--pink)" }} /> My orders</Link></li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Wishlist Button (desktop only) */}
            <button
              className="icon-btn desktop-only"
              aria-label="Wishlist"
              type="button"
              onClick={() => navigate("/shop")}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M20.8 4.9a5.2 5.2 0 0 0-7.4 0L12 6.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
              </svg>
            </button>

            {/* Cart Button */}
            <div style={{ position: "relative" }} ref={cartRef}>
              <button
                type="button"
                onClick={() => setIsCartOpen((prev) => !prev)}
                className="icon-btn"
                aria-label="Cart"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 7h16l-1.3 13H5.3L4 7Z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
                {cartCount > 0 ? <span className="badge" id="cartCount">{cartBadge}</span> : null}
              </button>
              {isCartOpen ? cartPanel : null}
            </div>

            {/* Mobile Hamburger Menu Button */}
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

        {/* ===== Mega Menu (Popup when hover on Shop) ===== */}
        <div
          className={`mega${isMegaOpen ? " open" : ""}`}
          id="megaMenu"
          onMouseEnter={() => setIsMegaOpen(true)}
          onMouseLeave={() => setIsMegaOpen(false)}
        >
          <div className="mega-inner">
            <div>
              <h4>Shop by edit</h4>
              <Link to="/shop" onClick={() => setIsMegaOpen(false)}>New Arrivals</Link>
              <Link to="/products/wedding" onClick={() => setIsMegaOpen(false)}>Best Sellers</Link>
              <Link to="/products/Suit" onClick={() => setIsMegaOpen(false)}>Occasion Wear</Link>
              <Link to="/products/Kurti" onClick={() => setIsMegaOpen(false)}>Everyday Essentials</Link>
            </div>
            <div>
              <h4>Collections</h4>
              <Link to="/products/Kurti" onClick={() => setIsMegaOpen(false)}>Rang Bloom</Link>
              <Link to="/products/Suit" onClick={() => setIsMegaOpen(false)}>Soft Structure</Link>
              <Link to="/products/Coat" onClick={() => setIsMegaOpen(false)}>After Dark</Link>
              <Link to="/products/EthnicWear" onClick={() => setIsMegaOpen(false)}>Accessories</Link>
            </div>
            <Link className="mega-card" to="/shop" onClick={() => setIsMegaOpen(false)}>
              <div>
                <span className="kicker">Featured edit</span>
                <h3 style={{ fontFamily: '"Playfair Display", serif', margin: "6px 0 0", fontSize: "30px" }}>
                  The Colour Story
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Search Panel (slides down from top) ===== */}
      <div
        className={`search-panel${isSearchOpen ? " open" : ""}`}
        id="searchPanel"
        aria-hidden={!isSearchOpen}
      >
        <div
          className="search-backdrop"
          data-close-search
          onClick={() => setIsSearchOpen(false)}
        />
        <div className="search-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
            <div className="kicker">Search Tere Rang</div>
            <button
              className="icon-btn"
              data-close-search
              aria-label="Close search"
              type="button"
              onClick={() => setIsSearchOpen(false)}
            >
              ✕
            </button>
          </div>
          <form className="search-line" onSubmit={handleSearchSubmit}>
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
          <p style={{ fontSize: "12px", margin: "14px 0 0", color: "var(--muted)" }}>
            Try “dress”, “co-ord”, or “new arrivals”.
          </p>
        </div>
      </div>

      {/* ===== Mobile Drawer ===== */}
      <div
        className={`drawer${isDrawerOpen ? " open" : ""}`}
        id="drawer"
        aria-hidden={!isDrawerOpen}
      >
        <div
          className="drawer-backdrop"
          data-close-drawer
          onClick={() => setIsDrawerOpen(false)}
        />
        <div className="drawer-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link className="drawer-logo" to="/" onClick={() => setIsDrawerOpen(false)}>
              <img src={logo} alt="Tere Rang" />
            </Link>
            <button
              className="icon-btn"
              data-close-drawer
              aria-label="Close menu"
              type="button"
              onClick={() => setIsDrawerOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="drawer-links">
            <Link to="/shop" onClick={() => setIsDrawerOpen(false)}>New Arrivals</Link>
            <Link to="/shop" onClick={() => setIsDrawerOpen(false)}>Shop</Link>
            <Link to="/shop" onClick={() => setIsDrawerOpen(false)}>Collections</Link>
            <Link to="/products/wedding" onClick={() => setIsDrawerOpen(false)}>Best Sellers</Link>
            <Link to="/contact" onClick={() => setIsDrawerOpen(false)}>About</Link>
          </div>
          <div className="drawer-bottom-links">
            <Link to={isAuthenticated ? "/MyOrder" : "/login"} onClick={() => setIsDrawerOpen(false)}>Account</Link>
            <Link to="/shop" onClick={() => setIsDrawerOpen(false)}>Wishlist</Link>
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsCartOpen(true);
              }}
              style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
            >
              Cart ({cartCount})
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
