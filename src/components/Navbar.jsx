import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  FileText,
  Gift,
  Home,
  LogOut,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { GiAmpleDress, GiDiamondRing, GiKimono, GiLabCoat, GiPoncho } from "react-icons/gi";
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

const linkTone = "relative rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/75 transition-all duration-300 hover:bg-secondary/70 hover:text-primary";

const iconButtonTone = "rounded-full p-2 text-foreground/70 transition-all duration-200 hover:bg-secondary/70 hover:text-primary";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [isProductsAccordionOpen, setIsProductsAccordionOpen] = useState(false);
  const [promotionalText, setPromotionalText] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const loginRef = useRef(null);
  const cartRef = useRef(null);
  const location = useLocation();
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
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
    setIsDropdownOpen(false);
    setIsLoginMenuOpen(false);
    setIsMobileMenuOpen(false);
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

  const isActive = (path) => location.pathname === path;
  const cartHasItems = Array.isArray(cartItems) && cartItems.length > 0;
  const cartBadge = cartCount > 99 ? "99+" : cartCount;
  const hasPromotionalText = promotionalText && promotionalText.trim() !== "";
  const announcementText = hasPromotionalText
    ? promotionalText
    : "✨ Complimentary shipping across India | Custom stitched to perfection";

  const productMenu = [
    { name: "Stylish Kurtis", to: "/products/Kurti", enabled: true, icon: <GiAmpleDress /> },
    { name: "Designer Suits", to: "/products/Suit", enabled: true, icon: <GiKimono /> },
    { name: "Elegant Coat Sets", to: "/products/Coat", enabled: true, icon: <GiLabCoat /> },
    { name: "Winter Ethnic Wear", to: "/products/EthnicWear", enabled: true, icon: <GiPoncho /> },
    { name: "Wedding Collection", to: "/products/wedding", enabled: true, icon: <GiDiamondRing /> },
  ];

  const cartPanel = (
    <div className="storefront-popup absolute right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] origin-top-right p-6 text-foreground">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground">My cart</p>
          <p className="font-serif text-xl lowercase text-foreground">
            {cartHasItems ? `${cartCount} item${cartCount === 1 ? "" : "s"}` : "no items yet"}
          </p>
        </div>
        {cartHasItems ? <span className="text-sm font-medium text-foreground">{formatCurrency(cartTotal)}</span> : null}
      </div>

      {cartFeedback ? (
        <div className={`mb-3 border px-3 py-2 text-xs ${cartFeedback.type === "error" ? "border-red-200 bg-red-50 text-destructive" : "border-border bg-secondary text-primary"}`}>
          {cartFeedback.text}
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-4">Log in to start adding beautiful fits to your cart.</p>
          <Link to="/login" onClick={() => setIsCartOpen(false)} className="inline-block bg-primary px-6 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-white transition hover:bg-primary/90">
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
                  <ProductImage src={previewSrc} alt={item.product?.name || "Product image"} className="h-16 w-16 border border-border/70 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight text-foreground">{item.product?.name || "Unavailable product"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {item.quantity}
                      {item.size ? ` · size ${item.size}` : ""}
                      {item.height ? ` · ${item.height}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary">{formatCurrency(item.lineTotal)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    disabled={removingItemId === item.id}
                    className={`text-muted-foreground transition hover:text-destructive ${removingItemId === item.id ? "cursor-not-allowed opacity-50" : ""}`}
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
              <span className="font-medium text-foreground">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="space-y-2.5">
              <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full bg-primary py-2.5 text-center text-xs font-semibold tracking-[0.14em] uppercase text-white transition hover:bg-primary/90">
                Proceed to checkout
              </Link>
              <Link to="/shop" onClick={() => setIsCartOpen(false)} className="block w-full border border-border bg-secondary py-2.5 text-center text-xs font-semibold tracking-[0.14em] uppercase text-foreground transition hover:border-primary">
                Continue shopping
              </Link>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Your cart is empty. Explore our collections to add something special.</p>
      )}
    </div>
  );

  return (
    <>
      <div className="storefront-announcement">
        {announcementText}
      </div>

      <header className={`storefront-header sticky top-0 z-50 text-foreground backdrop-blur-md ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-[72px] items-center justify-between">
            <div className="relative z-20 flex w-24 items-center md:w-32">
              <button type="button" onClick={() => setIsMobileMenuOpen(true)} className={`${iconButtonTone} md:hidden`} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <Link to="/" className="absolute left-1/2 z-10 -translate-x-1/2 transition-transform duration-300 hover:scale-[1.03]">
              <img src={logo} alt="Tererang" className="h-10 w-auto md:h-16" />
            </Link>

            <div className="relative z-20 flex items-center gap-1 md:gap-2">
              <Link to="/shop" className={iconButtonTone} aria-label="Search collections">
                <Search className="h-[18px] w-[18px] stroke-[1.75]" />
              </Link>

              <div className="relative hidden md:block" ref={loginRef}>
                <button type="button" onClick={() => setIsLoginMenuOpen((s) => !s)} className={iconButtonTone} aria-label={isAuthenticated ? "Account menu" : "Login"}>
                  <User className="h-[18px] w-[18px] stroke-[1.75]" />
                </button>

                <div className={`storefront-popup absolute right-0 z-50 mt-3 w-64 origin-top-right p-6 text-foreground transition-all duration-200 ${isLoginMenuOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}>
                  {isAuthenticated ? (
                    <>
                      <div className="mb-4 flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-serif text-lg lowercase text-foreground">{user?.name || "welcome"}</h4>
                          <p className="text-xs text-muted-foreground">{user?.phoneNumber}</p>
                        </div>
                      </div>
                      <hr className="mb-4 border-border/60" />
                      <ul className="space-y-3 text-sm">
                        <li><Link to="/MyOrder" onClick={() => setIsLoginMenuOpen(false)} className="flex items-center text-foreground/85 transition-colors duration-200 hover:text-primary"><Package className="mr-2.5 h-4 w-4 text-primary" /> My orders</Link></li>
                        <li><Link to="/addresses" onClick={() => setIsLoginMenuOpen(false)} className="flex items-center text-foreground/85 transition-colors duration-200 hover:text-primary"><MapPin className="mr-2.5 h-4 w-4 text-primary" /> Addresses</Link></li>
                        <li>
                          <button onClick={handleLogout} className="flex w-full items-center text-left text-destructive transition-colors duration-200 hover:opacity-80" type="button">
                            <LogOut className="mr-2.5 h-4 w-4" /> Logout
                          </button>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <h4 className="mb-1 font-serif text-lg lowercase text-foreground">welcome</h4>
                      <p className="mb-4 text-xs text-muted-foreground">Access your account and manage orders.</p>
                      <Link to="/login" onClick={() => setIsLoginMenuOpen(false)} className="block bg-primary py-2.5 text-center text-xs font-semibold tracking-[0.14em] uppercase text-white transition hover:bg-primary/90">
                        Login / signup
                      </Link>
                      <hr className="my-4 border-border/60" />
                      <ul className="space-y-3 text-sm">
                        <li><Link to="/MyOrder" onClick={() => setIsLoginMenuOpen(false)} className="flex items-center text-foreground/85 transition-colors duration-200 hover:text-primary"><Package className="mr-2.5 h-4 w-4 text-primary" /> My orders</Link></li>
                        <li><Link to="/AlwaysOffers" onClick={() => setIsLoginMenuOpen(false)} className="flex items-center text-foreground/85 transition-colors duration-200 hover:text-primary"><Gift className="mr-2.5 h-4 w-4 text-primary" /> Offers</Link></li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              <div className="relative" ref={cartRef}>
                <button type="button" onClick={() => setIsCartOpen((prev) => !prev)} className={`relative ${iconButtonTone}`} aria-label="Cart">
                  <ShoppingBag className="h-[18px] w-[18px] stroke-[1.75]" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[var(--card,#fff)]">
                      {cartBadge}
                    </span>
                  ) : null}
                </button>
                {isCartOpen ? cartPanel : null}
              </div>
            </div>
          </div>

          <nav className="storefront-nav hidden items-center justify-center gap-1 border-t py-3 md:flex">
            <Link to="/" className={`${linkTone} ${isActive("/") ? "bg-primary/10 text-primary" : ""}`}>
              Home
            </Link>
            <Link to="/shop" className={`${linkTone} ${isActive("/shop") ? "bg-primary/10 text-primary" : ""}`}>
              Shop
            </Link>
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-controls="navbar-collections"
                className={`${linkTone} inline-flex items-center gap-1.5 ${isDropdownOpen || location.pathname.startsWith("/products") ? "bg-primary/10 text-primary" : ""}`}
              >
                Collections
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                id="navbar-collections"
                className={`storefront-popup storefront-collections absolute left-1/2 top-full z-50 mt-3 w-72 origin-top -translate-x-1/2 p-2 text-foreground transition-all duration-200 ${isDropdownOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
              >
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Shop by category</p>
                <ul>
                  {productMenu.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.to}
                        onClick={() => setIsDropdownOpen(false)}
                        className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/85 transition-all duration-200 hover:bg-secondary hover:text-primary"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover/item:bg-primary group-hover/item:text-white [&>svg]:h-4 [&>svg]:w-4">
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link to="/products/wedding" className={`${linkTone} ${isActive("/products/wedding") ? "bg-primary/10 text-primary" : ""}`}>
              Bestsellers
            </Link>
            <Link to="/TermsPage" className={`${linkTone} ${isActive("/TermsPage") ? "bg-primary/10 text-primary" : ""}`}>
              Terms
            </Link>
            <Link to="/contact" className={`${linkTone} ${isActive("/contact") ? "bg-primary/10 text-primary" : ""}`}>
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] transition md:hidden ${isMobileMenuOpen ? "visible" : "invisible pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close menu backdrop"
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside className={`absolute left-0 top-0 flex h-full w-[88%] max-w-sm transform flex-col border-r border-border bg-card shadow-[0_24px_70px_rgba(45,41,36,0.18)] transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}><img src={logo} alt="Tererang" className="h-10 w-auto" /></Link>
            <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-1">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 text-sm font-medium tracking-[0.06em] text-foreground transition hover:bg-secondary">
                <Home className="mr-3 h-4 w-4 text-primary" /> Home
              </Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 text-sm font-medium tracking-[0.06em] text-foreground transition hover:bg-secondary">
                <Search className="mr-3 h-4 w-4 text-primary" /> Shop
              </Link>

              <div className="border border-border">
                <button type="button" onClick={() => setIsProductsAccordionOpen(!isProductsAccordionOpen)} className="flex w-full items-center justify-between bg-secondary p-3 text-sm font-medium tracking-[0.06em] text-foreground transition hover:bg-muted">
                  <span className="flex items-center"><ShoppingBag className="mr-3 h-4 w-4 text-primary" /> Collections</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${isProductsAccordionOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${isProductsAccordionOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="space-y-1 bg-card p-2">
                    {productMenu.map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className="block p-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-primary">
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link to="/TermsPage" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 text-sm font-medium tracking-[0.06em] text-foreground transition hover:bg-secondary">
                <FileText className="mr-3 h-4 w-4 text-primary" /> Terms
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 text-sm font-medium tracking-[0.06em] text-foreground transition hover:bg-secondary">
                <Phone className="mr-3 h-4 w-4 text-primary" /> Contact
              </Link>
            </div>
          </div>

          <div className="border-t border-border bg-secondary px-6 py-5">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name || "Welcome"}</p>
                    <p className="text-xs text-muted-foreground">{user?.phoneNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="border border-border bg-card p-2.5 text-center text-[10px] font-semibold tracking-[0.1em] text-muted-foreground transition hover:border-primary">
                    <ShoppingBag className="mx-auto mb-1 h-4 w-4 text-primary" /> Cart ({cartCount})
                  </Link>
                  <Link to="/MyOrder" onClick={() => setIsMobileMenuOpen(false)} className="border border-border bg-card p-2.5 text-center text-[10px] font-semibold tracking-[0.1em] text-muted-foreground transition hover:border-primary">
                    <Package className="mx-auto mb-1 h-4 w-4 text-primary" /> Orders
                  </Link>
                  <Link to="/addresses" onClick={() => setIsMobileMenuOpen(false)} className="border border-border bg-card p-2.5 text-center text-[10px] font-semibold tracking-[0.1em] text-muted-foreground transition hover:border-primary">
                    <MapPin className="mx-auto mb-1 h-4 w-4 text-primary" /> Address
                  </Link>
                </div>

                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-destructive transition hover:bg-red-50" type="button">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border border-border bg-card p-3">
                  <span className="flex items-center text-sm font-medium text-foreground"><ShoppingBag className="mr-3 h-4 w-4 text-primary" /> My cart</span>
                  {cartCount > 0 ? <span className="bg-primary px-2 py-0.5 text-[10px] font-medium text-white">{cartCount}</span> : null}
                </Link>
                <p className="text-center text-xs text-muted-foreground">Login to manage orders and checkout faster.</p>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-primary py-3 text-center text-sm font-semibold tracking-[0.12em] text-white transition hover:bg-primary/90">
                  Login / signup
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
