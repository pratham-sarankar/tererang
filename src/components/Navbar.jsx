import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// 💡 IMPORTANT: Ensure 'Final Logo.jpg' is now a transparent PNG file 
// (or rename and import the new transparent PNG file)
import tereRang from "../assets/logo.png";
import { Menu, X, User, LogOut, ShoppingCart, Trash2, Gift, Home, ShoppingBag, FileText, Phone, Package, MapPin, Tag, ChevronDown } from "lucide-react"; // For mobile menu icons
import { GiAmpleDress, GiKimono, GiLabCoat, GiPoncho, GiDiamondRing, GiSkirt } from "react-icons/gi";
import { useCart } from "../context/cartContextStore.js";
import { notifyCartAuthChange } from "../context/cartEvents.js";
import { apiUrl, imageUrl } from "../config/env.js";
import ProductImage from "./ProductImage.jsx";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => currencyFormatter.format(Math.max(0, value));

const resolveProductImage = (product) => {
  if (!product) return null;
  // Prioritize imageUrls over images field
  const candidate =
    (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
    product.image ||
    (Array.isArray(product.images) && product.images[0]);
  if (!candidate) return null;
  if (/^https?:/i.test(candidate)) return candidate;
  return imageUrl(candidate);
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isProductsAccordionOpen, setIsProductsAccordionOpen] = useState(false); // New state for mobile accordion
  const [promotionalText, setPromotionalText] = useState('');

  const dropdownRef = useRef(null);
  const loginRef = useRef(null);
  const cartRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, loading: cartLoading, removeCartItem, error: cartError } = useCart();

  // Detect mobile view on mount and resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Check authentication status on component mount and route changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, [location]);

  // Fetch promotional text from settings
  useEffect(() => {
    const fetchPromotionalText = async () => {
      try {
        const response = await fetch(apiUrl('/api/settings'));
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          if (data.settings && 'promotionalText' in data.settings) {
            setPromotionalText(data.settings.promotionalText);
          }
        }
      } catch (error) {
        console.error('Error fetching promotional text:', error);
        // Keep default promotional text on error
      }
    };

    fetchPromotionalText();
  }, []);

  // Close dropdowns when clicking outside
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

  // Auto-close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsLoginMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
  }, [location]);

  useEffect(() => {
    if (cartError) {
      setCartFeedback({ type: 'error', text: cartError });
    }
  }, [cartError]);

  useEffect(() => {
    if (!cartFeedback) return undefined;
    const timer = setTimeout(() => setCartFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [cartFeedback]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsLoginMenuOpen(false);
    setIsCartOpen(false);
    notifyCartAuthChange();
    window.location.href = '/';
  };

  const handleRemoveFromCart = async (itemId) => {
    if (!itemId) return;
    try {
      setRemovingItemId(itemId);
      setCartFeedback(null);
      await removeCartItem(itemId);
      setCartFeedback({ type: 'success', text: 'Item removed from cart' });
    } catch (error) {
      setCartFeedback({ type: 'error', text: error.message || 'Unable to remove cart item' });
    } finally {
      setRemovingItemId(null);
    }
  };

  const cartHasItems = Array.isArray(cartItems) && cartItems.length > 0;
  const cartBadge = cartCount > 99 ? '99+' : cartCount;

  // Active route highlighting
  const isActive = (path) => location.pathname === path;

  // Product menu items: enabled items are clickable, others show "Coming soon"
  const productMenu = [
    { name: 'Stylish Kurtis', to: '/products/kurti', enabled: true, icon: <GiAmpleDress /> },
    { name: 'Designer Suits', to: '/products/suit', enabled: true, icon: <GiKimono /> },
    { name: 'Elegant Coat Sets', to: '/products/coat', enabled: true, icon: <GiLabCoat /> },
    { name: 'Winter Ethnic Wear', to: '/products/EthnicWear', enabled: true, icon: <GiPoncho /> },
    { name: 'Wedding Collection', to: '/products/wedding', enabled: true, icon: <GiDiamondRing /> },
  ];

  const hasPromotionalText = promotionalText && promotionalText.trim() !== "";

  return (
    <>
      {/* Top Announcement Banner */}
      {hasPromotionalText && (
        <div className="bg-secondary text-muted-foreground text-center py-2 text-xs font-light tracking-wide border-b border-border sticky top-0 z-50">
          {promotionalText}
        </div>
      )}

      <nav className={`bg-card text-foreground shadow-sm border-b border-border sticky ${hasPromotionalText ? 'top-8' : 'top-0'} z-50`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex justify-between items-center">

          {/* ✅ LOGO SECTION - UPDATED CSS */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src={tereRang}
                alt="Logo"
                // 🖼️ MODIFIED CSS: Removed 'rounded-xl' and 'shadow-lg' to ensure transparency 
                // and prevent background bleed. The size is kept as you requested.
                className="h-32 w-32 mr-3 object-contain transition duration-300"
              />
            </Link>
          </div>

          {/* ✅ DESKTOP MENU */}
          <ul className="hidden md:flex space-x-8 items-center font-light">
            <li>
              <Link
                to="/"
                className={`text-sm lowercase tracking-wide transition-colors duration-300 ${
                  isActive("/") ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                home
              </Link>
            </li>

            {/* ✅ PRODUCTS DROPDOWN */}
            <li
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen((s) => !s)}
                className={`text-sm lowercase tracking-wide transition-colors duration-300 ${
                  isActive("/products/kurti") ||
                  isActive("/products/suit") ||
                  isActive("/products/designerSuit") ||
                  isActive("/products/coat")
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                collections
              </button>

              {isDropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full pt-4 w-[320px] z-50">
                  <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    <ul className="p-2 divide-y divide-border/50">
                      {productMenu.map((item) => (
                        <li key={item.name}>
                          {item.enabled ? (
                            <Link
                              to={item.to}
                              onClick={() => setIsDropdownOpen(false)}
                              className="group flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors duration-300"
                            >
                              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-primary">
                                {item.icon || <Gift size={18} />}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors lowercase">
                                  {item.name.toLowerCase()}
                                </p>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center p-3 opacity-60 cursor-not-allowed">
                              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-xl grayscale">
                                {item.icon || '🔒'}
                              </div>
                              <div className="ml-4 flex-1">
                                <p className="font-medium text-gray-500">{item.name}</p>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 mt-1 inline-block">
                                  Coming Soon
                                </span>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            <li>
              <Link
                to="/TermsPage"
                className={`text-sm lowercase tracking-wide transition-colors duration-300 ${
                  isActive("/TermsPage") ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                terms & conditions
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className={`text-sm lowercase tracking-wide transition-colors duration-300 ${
                  isActive("/contact") ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                contact us
              </Link>
            </li>
          </ul>

          {/* ✅ RIGHT SECTION */}
          <div className="flex items-center space-x-4 relative">

            {/* 🔍 Search Section */}
            {/* <div className="relative flex items-center">
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isSearchOpen ? "w-48 opacity-100" : "w-0 opacity-0"
                }`}
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search..."
                className="bg-gray-800 border border-gray-600 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 w-full text-white placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-xl ml-2 hover:text-teal-400 transition"
            >
              🔍
            </button>
          </div>
 */}
            {/* 🛒 Cart & User - Hidden on Mobile, Visible on Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 🛒 Cart */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen((prev) => !prev)}
                  className={`relative h-10 w-10 flex items-center justify-center rounded-full border transition-colors ${
                    isCartOpen ? "border-primary text-primary" : "border-border text-foreground hover:border-primary hover:text-primary"
                  }`}
                  aria-label="Shopping cart"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {cartBadge}
                    </span>
                  )}
                </button>

                {isCartOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-card text-foreground rounded-sm shadow-md border border-border z-50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">my cart</p>
                        <p className="text-base font-serif lowercase text-foreground">{cartHasItems ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'no items yet'}</p>
                      </div>
                      {cartHasItems && (
                        <span className="text-sm text-muted-foreground">{formatCurrency(cartTotal)}</span>
                      )}
                    </div>

                    {cartFeedback && (
                      <div
                        className={`mb-3 text-xs rounded-sm px-3 py-2 border ${cartFeedback.type === 'error' ? 'bg-red-50 text-destructive border-red-200' : 'bg-secondary text-primary border-border'
                          }`}
                      >
                        {cartFeedback.text}
                      </div>
                    )}

                    {!isAuthenticated ? (
                      <div className="text-center text-sm text-muted-foreground">
                        <p className="mb-3 lowercase">log in to start adding beautiful fits to your cart.</p>
                        <Link
                          to="/login"
                          onClick={() => setIsCartOpen(false)}
                          className="inline-block px-5 py-2 rounded-sm bg-primary text-white font-medium hover:bg-primary/90 transition-colors lowercase tracking-wide text-xs"
                        >
                          login to continue
                        </Link>
                      </div>
                    ) : cartLoading ? (
                      <p className="text-sm text-muted-foreground">loading cart...</p>
                    ) : cartHasItems ? (
                      <>
                        <div className="max-h-64 overflow-y-auto divide-y divide-border">
                          {cartItems.map((item) => {
                            const previewSrc = resolveProductImage(item.product);
                            return (
                              <div key={item.id} className="flex items-start gap-3 py-3">
                                <ProductImage
                                  src={previewSrc}
                                  alt={item.product?.name || 'Product image'}
                                  className="h-16 w-16 rounded-sm object-cover border border-border"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium leading-tight text-foreground">
                                    {item.product?.name || 'unavailable product'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    qty {item.quantity}
                                    {item.size ? ` · size ${item.size}` : ''}
                                    {item.height ? ` · ${item.height}` : ''}
                                  </p>
                                  <p className="text-sm font-medium mt-1 text-primary">
                                    {formatCurrency(item.lineTotal)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  disabled={removingItemId === item.id}
                                  className={`text-muted-foreground hover:text-destructive transition ${removingItemId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 border-t border-border pt-4 text-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-muted-foreground lowercase">subtotal</span>
                            <span className="font-medium text-foreground">{formatCurrency(cartTotal)}</span>
                          </div>
                          <div className="space-y-2">
                            <Link
                              to="/checkout"
                              onClick={() => setIsCartOpen(false)}
                              className="block w-full text-center bg-primary text-white font-medium py-2 rounded-sm hover:bg-primary/90 transition-colors lowercase tracking-wide text-xs"
                            >
                              proceed to checkout
                            </Link>
                            <Link
                              to="/shop"
                              onClick={() => setIsCartOpen(false)}
                              className="block w-full text-center bg-secondary hover:bg-muted text-foreground font-medium py-2 rounded-sm border border-border transition-colors lowercase tracking-wide text-xs"
                            >
                              continue shopping
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">your cart is empty. explore our collections to add something special.</p>
                    )}
                  </div>
                )}
              </div>

              {/* 👤 Authentication Section */}
              {isAuthenticated ? (
                /* User Profile Dropdown - When Logged In */
                <div ref={loginRef} className="relative">
                  <button
                    onClick={() => setIsLoginMenuOpen((s) => !s)}
                    className="flex items-center gap-2 border border-border bg-card text-foreground px-4 py-1.5 rounded-sm font-medium hover:border-primary hover:text-primary transition-colors lowercase tracking-wide text-xs"
                  >
                    <User size={16} />
                    <span>{user?.name || user?.phoneNumber || 'user'}</span>
                  </button>

                  {isLoginMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-card text-foreground rounded-sm shadow-md border border-border z-50 p-5">
                      <div className="flex items-center mb-3">
                        <User className="mr-2 text-primary" size={20} />
                        <div>
                          <h4 className="text-base font-serif lowercase text-foreground">{user?.name || 'welcome'}</h4>
                          <p className="text-sm text-muted-foreground">{user?.phoneNumber}</p>
                        </div>
                      </div>

                      <hr className="border-border mb-3" />

                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link
                            to="/MyOrder"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-primary hover:opacity-80 transition-opacity lowercase"
                          >
                            <Package className="mr-2" size={16} /> my orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/addresses"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-primary hover:opacity-80 transition-opacity lowercase"
                          >
                            <MapPin className="mr-2" size={16} /> addresses
                          </Link>
                        </li>
                        {/* <li>
                      <Link
                        to="/AlwaysOffers"
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="flex items-center hover:text-primary transition-colors lowercase"
                      >
                        🎁 Offers
                      </Link>
                    </li> */}
                        <li>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center space-x-2 text-destructive hover:opacity-80 transition-opacity lowercase"
                          >
                            <LogOut size={16} />
                            <span>logout</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* Login/Signup Button - When Not Logged In */
                <div ref={loginRef} className="relative">
                  <button
                    onClick={() => setIsLoginMenuOpen((s) => !s)}
                    className="flex items-center gap-2 border border-primary text-primary px-4 py-1.5 rounded-sm font-medium hover:bg-primary hover:text-white transition-colors lowercase tracking-wide text-xs"
                  >
                    <User size={16} />
                    <span>login</span>
                  </button>

                  {isLoginMenuOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-card text-foreground rounded-sm shadow-md border border-border z-50 p-5">
                      <h4 className="text-base font-serif lowercase mb-2">welcome</h4>
                      <p className="text-sm text-muted-foreground mb-3 lowercase">
                        access your account and manage orders
                      </p>

                      <Link
                        to="/login"
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="block text-center py-2 rounded-sm font-medium transition-colors mb-3 bg-primary text-white hover:bg-primary/90 lowercase tracking-wide text-xs"
                      >
                        login / signup
                      </Link>

                      <hr className="border-border mb-3" />

                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link
                            to="/MyOrder"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-primary hover:opacity-80 transition-opacity lowercase"
                          >
                            <Package className="mr-2" size={16} /> my orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/AlwaysOffers"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-primary hover:opacity-80 transition-opacity lowercase"
                          >
                            <Tag className="mr-2" size={16} /> offers
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 📱 Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-2xl text-foreground hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* ✅ MOBILE MENU */}
        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Full-width drawer */}
          <div className={`absolute top-0 right-0 h-full w-[88%] max-w-sm bg-card shadow-lg transform transition-transform duration-300 ease-out flex flex-col border-l border-border ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-lg font-serif lowercase tracking-wide">menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-5">

              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center p-3 rounded-sm text-foreground hover:bg-secondary transition-colors font-medium text-sm lowercase tracking-wide"
                >
                  <Home size={18} className="mr-3 text-primary" /> home
                </Link>

                {/* Collections Accordion */}
                <div className="rounded-sm border border-border overflow-hidden">
                  <button
                    onClick={() => setIsProductsAccordionOpen(!isProductsAccordionOpen)}
                    className="w-full flex items-center justify-between p-3 bg-secondary text-foreground hover:bg-muted transition-colors font-medium text-sm lowercase tracking-wide"
                  >
                    <div className="flex items-center">
                      <ShoppingBag size={18} className="mr-3 text-primary" /> collections
                    </div>
                    <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-300 ${isProductsAccordionOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ease-in-out ${isProductsAccordionOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-card p-2 space-y-1">
                      {[
                        { name: 'stylish kurtis', path: '/products/kurti' },
                        { name: 'designer suits', path: '/products/suit' },
                        { name: 'elegant coat sets', path: '/products/coat' },
                        { name: 'winter ethnic wear', path: '/products/EthnicWear' },
                        { name: 'wedding collection', path: '/products/wedding' },
                      ].map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center p-2.5 rounded-sm hover:bg-secondary text-muted-foreground hover:text-primary transition-colors text-sm lowercase tracking-wide ml-2"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to="/TermsPage"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center p-3 rounded-sm text-foreground hover:bg-secondary transition-colors font-medium text-sm lowercase tracking-wide"
                >
                  <FileText size={18} className="mr-3 text-primary" /> terms & conditions
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center p-3 rounded-sm text-foreground hover:bg-secondary transition-colors font-medium text-sm lowercase tracking-wide"
                >
                  <Phone size={18} className="mr-3 text-primary" /> contact us
                </Link>
              </div>
            </div>

            {/* Footer / Auth Section */}
            <div className="px-6 py-5 border-t border-border bg-secondary z-20">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{user?.name || 'welcome'}</p>
                      <p className="text-xs text-muted-foreground">{user?.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Action Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-2.5 bg-card border border-border rounded-sm text-center group hover:border-primary/50 transition-colors">
                      <ShoppingCart size={18} className="mb-1 text-primary" />
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">cart ({cartCount})</span>
                    </Link>
                    <Link to="/MyOrder" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-2.5 bg-card border border-border rounded-sm text-center group hover:border-primary/50 transition-colors">
                      <Package size={18} className="mb-1 text-primary" />
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">orders</span>
                    </Link>
                    <Link to="/addresses" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-2.5 bg-card border border-border rounded-sm text-center group hover:border-primary/50 transition-colors">
                      <MapPin size={18} className="mb-1 text-primary" />
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">address</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 flex items-center justify-center gap-2 text-destructive font-medium hover:bg-red-50 rounded-sm transition text-sm lowercase"
                  >
                    <LogOut size={14} />
                    <span>logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-sm"
                  >
                    <div className="flex items-center text-foreground text-sm font-medium">
                      <ShoppingCart size={18} className="mr-3 text-primary" />
                      <span className="lowercase tracking-wide">my cart</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded-sm">{cartCount}</span>
                    )}
                  </Link>

                  <p className="text-xs text-muted-foreground text-center lowercase tracking-wide">login to manage orders & checkout faster</p>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 text-center rounded-sm bg-primary text-white text-sm font-medium tracking-wide lowercase hover:bg-primary/90 transition-colors"
                  >
                    login / signup
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>

  );
};

export default Navbar;