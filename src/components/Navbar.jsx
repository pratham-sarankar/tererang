import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// 💡 IMPORTANT: Ensure 'Final Logo.jpg' is now a transparent PNG file 
// (or rename and import the new transparent PNG file)
import tereRang from "../assets/logo.png";
import { Menu, X, User, LogOut, ShoppingCart, Trash2, Gift, Home, ShoppingBag, FileText, Phone, Package, MapPin, Tag } from "lucide-react"; // For mobile menu icons
import { GiAmpleDress, GiKimono, GiLabCoat, GiPoncho, GiDiamondRing, GiSkirt } from "react-icons/gi";
import { useCart } from "../context/cartContextStore.js";
import { notifyCartAuthChange } from "../context/cartEvents.js";
import { imageUrl } from "../config/env.js";

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
  const [isProductsAccordionOpen, setIsProductsAccordionOpen] = useState(false); // New state for mobile accordion

  const dropdownRef = useRef(null);
  const loginRef = useRef(null);
  const cartRef = useRef(null);
  const location = useLocation();
  const { cartItems, cartCount, cartTotal, loading: cartLoading, removeCartItem, error: cartError } = useCart();

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
    { name: 'Wedding Collection', to: '/products/festiveSuits', enabled: false },
  ];

  return (
    <>
      {/* Discount Strip */}
      <div className="text-white text-center py-2 text-sm font-semibold sticky top-0 z-50 flex justify-center items-center gap-2" style={{ backgroundColor: '#b81582' }}>
        <Gift size={16} /> FREE DELIVERY ABOVE ₹999
      </div>

      <nav className="bg-white text-gray-900 shadow-lg sticky top-8 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex justify-between items-center">

          {/* ✅ LOGO SECTION - UPDATED CSS */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src={tereRang}
                alt="Logo"
                // 🖼️ MODIFIED CSS: Removed 'rounded-xl' and 'shadow-lg' to ensure transparency 
                // and prevent background bleed. The size is kept as you requested.
                className="h-40 w-40 mr-3 object-contain hover:scale-110 transition duration-300"
              />
            </Link>
          </div>

          {/* ✅ DESKTOP MENU */}
          <ul className="hidden md:flex space-x-8 items-center font-light">
            <li>
              <Link
                to="/"
                className={`transition duration-200 relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full ${isActive("/")
                  ? "text-white"
                  : "text-gray-700"
                  }`}
                style={{
                  color: isActive("/") ? "#b81582" : undefined,
                }}
                onMouseEnter={(e) => (e.target.style.color = "#b81582")}
                onMouseLeave={(e) => (e.target.style.color = isActive("/") ? "#b81582" : "")}
              >
                Home
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
                className={`transition duration-200 relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full ${isActive("/products/kurti") ||
                  isActive("/products/suit") ||
                  isActive("/products/designerSuit") ||
                  isActive("/products/coat")
                  ? "text-white"
                  : "text-gray-700"
                  }`}
                style={{
                  color:
                    isActive("/products/kurti") ||
                      isActive("/products/suit") ||
                      isActive("/products/designerSuit") ||
                      isActive("/products/coat")
                      ? "#b81582"
                      : undefined,
                }}
                onMouseEnter={(e) => (e.target.style.color = "#b81582")}
                onMouseLeave={(e) => {
                  e.target.style.color =
                    isActive("/products/kurti") ||
                      isActive("/products/suit") ||
                      isActive("/products/designerSuit") ||
                      isActive("/products/coat")
                      ? "#b81582"
                      : "";
                }}
              >
                Products
              </button>

              {isDropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full pt-4 w-[360px] z-50">
                  {/* Dropdown Container with Glassmorphism */}
                  <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300 transform origin-top ease-out">

                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500"></div>

                    <ul className="p-3 divide-y divide-gray-100/50">
                      {productMenu.map((item) => (
                        <li key={item.name}>
                          {item.enabled ? (
                            <Link
                              to={item.to}
                              onClick={() => setIsDropdownOpen(false)}
                              className="group flex items-center p-3 rounded-xl hover:bg-pink-50 transition-all duration-300 ease-in-out"
                            >
                              {/* Icon Container */}
                              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-pink-100 text-xl group-hover:scale-110 transition-transform duration-300 shadow-sm text-pink-600">
                                {item.icon || <Gift size={20} />}
                              </div>

                              {/* Text Content */}
                              <div className="ml-4 flex-1">
                                <p className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 group-hover:text-pink-400">
                                  Explore our collection
                                </p>
                              </div>

                              {/* Arrow icon */}
                              <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-pink-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
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
                className={`transition duration-200 relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full ${isActive("/TermsPage") ? "text-white" : "text-gray-700"
                  }`}
                style={{
                  color: isActive("/TermsPage") ? "#b81582" : undefined,
                }}
                onMouseEnter={(e) => (e.target.style.color = "#b81582")}
                onMouseLeave={(e) => (e.target.style.color = isActive("/TermsPage") ? "#b81582" : "")}
              >
                Terms & Conditions
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className={`transition duration-200 relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full ${isActive("/contact") ? "text-white" : "text-gray-700"
                  }`}
                style={{
                  color: isActive("/contact") ? "#b81582" : undefined,
                }}
                onMouseEnter={(e) => (e.target.style.color = "#b81582")}
                onMouseLeave={(e) => (e.target.style.color = isActive("/contact") ? "#b81582" : "")}
              >
                Contact Us
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
                  className="relative h-10 w-10 flex items-center justify-center rounded-full border border-gray-300 transition"
                  style={{
                    borderColor: isCartOpen ? "#b81582" : undefined,
                    color: isCartOpen ? "#b81582" : undefined,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#b81582";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isCartOpen ? "#b81582" : "";
                  }}
                  aria-label="Shopping cart"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-1 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow-md" style={{ backgroundColor: '#b81582' }}>
                      {cartBadge}
                    </span>
                  )}
                </button>

                {isCartOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600">My Cart</p>
                        <p className="text-base font-semibold text-gray-900">{cartHasItems ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'No items yet'}</p>
                      </div>
                      {cartHasItems && (
                        <span className="text-sm text-gray-600">{formatCurrency(cartTotal)}</span>
                      )}
                    </div>

                    {cartFeedback && (
                      <div
                        className={`mb-3 text-xs rounded-lg px-3 py-2 ${cartFeedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {cartFeedback.text}
                      </div>
                    )}

                    {!isAuthenticated ? (
                      <div className="text-center text-sm text-gray-600">
                        <p className="mb-3">Log in to start adding beautiful fits to your cart.</p>
                        <Link
                          to="/login"
                          onClick={() => setIsCartOpen(false)}
                          className="inline-block px-4 py-2 rounded-full text-white font-semibold"
                          style={{ backgroundColor: '#b81582' }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#a01478')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = '#b81582')}
                        >
                          Login to continue
                        </Link>
                      </div>
                    ) : cartLoading ? (
                      <p className="text-sm text-gray-600">Loading cart...</p>
                    ) : cartHasItems ? (
                      <>
                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-200">
                          {cartItems.map((item) => {
                            const previewSrc = resolveProductImage(item.product);
                            return (
                              <div key={item.id} className="flex items-start gap-3 py-3">
                                {previewSrc ? (
                                  <img src={previewSrc} alt={item.product?.name || 'Product image'} className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                                ) : (
                                  <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                                    No image
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-semibold leading-tight text-gray-900">
                                    {item.product?.name || 'Unavailable product'}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Qty {item.quantity}
                                    {item.size ? ` · Size ${item.size}` : ''}
                                    {item.height ? ` · ${item.height}` : ''}
                                  </p>
                                  <p className="text-sm font-semibold mt-1" style={{ color: '#b81582' }}>
                                    {formatCurrency(item.lineTotal)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  disabled={removingItemId === item.id}
                                  className={`text-gray-400 hover:text-red-600 transition ${removingItemId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 border-t border-gray-200 pt-4 text-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(cartTotal)}</span>
                          </div>
                          <div className="space-y-2">
                            <Link
                              to="/checkout"
                              onClick={() => setIsCartOpen(false)}
                              className="block w-full text-center text-white font-semibold py-2 rounded-full transition"
                              style={{ backgroundColor: '#b81582' }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = '#a01478')}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = '#b81582')}
                            >
                              Proceed to checkout
                            </Link>
                            <Link
                              to="/shop"
                              onClick={() => setIsCartOpen(false)}
                              className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-full"
                            >
                              Continue shopping
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">Your cart is empty. Explore our collections to add something special.</p>
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
                    className="flex items-center space-x-2 text-white px-4 py-1.5 rounded-full font-medium transition"
                    style={{ backgroundColor: '#b81582' }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#a01478')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#b81582')}
                  >
                    <User size={16} />
                    <span>{user?.name || user?.phoneNumber || 'User'}</span>
                  </button>

                  {isLoginMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
                      <div className="flex items-center mb-3">
                        <User className="mr-2" size={20} />
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{user?.name || 'Welcome'}</h4>
                          <p className="text-sm text-gray-600">{user?.phoneNumber}</p>
                        </div>
                      </div>

                      <hr className="border-gray-200 mb-3" />

                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link
                            to="/MyOrder"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-gray-700 transition"
                            style={{ color: '#b81582' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}
                          >
                            <Package className="mr-2" size={16} /> My Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/addresses"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="flex items-center text-gray-700 transition"
                            style={{ color: '#b81582' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}
                          >
                            <MapPin className="mr-2" size={16} /> Addresses
                          </Link>
                        </li>
                        {/* <li>
                      <Link
                        to="/AlwaysOffers"
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="flex items-center hover:text-pink-600 transition"
                      >
                        🎁 Offers
                      </Link>
                    </li> */}
                        <li>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center space-x-2 hover:text-red-600 transition text-red-600"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
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
                    className="flex items-center space-x-2 text-white px-4 py-1.5 rounded-full font-medium transition"
                    style={{ backgroundColor: '#b81582' }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#a01478')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#b81582')}
                  >
                    <User size={16} />
                    <span>Login</span>
                  </button>

                  {isLoginMenuOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
                      <h4 className="text-lg font-bold mb-2 text-gray-900">Welcome</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Access your account and manage orders
                      </p>

                      <Link
                        to="/login"
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="block text-center py-2 rounded-lg font-semibold transition mb-3 text-white"
                        style={{ backgroundColor: '#b81582' }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#a01478')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#b81582')}
                      >
                        Login / Signup
                      </Link>

                      <hr className="border-gray-200 mb-3" />

                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link
                            to="/MyOrder"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="text-gray-700 transition"
                            style={{ color: '#b81582' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}
                          >
                            <Package className="mr-2" size={16} /> My Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/AlwaysOffers"
                            onClick={() => setIsLoginMenuOpen(false)}
                            className="text-gray-700 transition"
                            style={{ color: '#b81582' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}
                          >
                            <Tag className="mr-2" size={16} /> Offers
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
              className="md:hidden text-3xl text-gray-700 transition"
              style={{ color: '#b81582' }}
              onMouseEnter={(e) => (e.target.style.color = '#b81582')}
              onMouseLeave={(e) => (e.target.style.color = 'rgb(55, 65, 81)')}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* ✅ MOBILE MENU */}
        {/* ✅ MOBILE MENU OVERLAY & DRAWER */}
        <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-pink-50/50">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-white hover:shadow-md text-gray-500 hover:text-pink-600 transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-6">

              {/* Product Links */}
              <div className="space-y-3">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 transition-all font-medium">
                  <span className="mr-3 text-lg"><Home size={20} /></span> Home
                </Link>

                {/* Products Accordion */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setIsProductsAccordionOpen(!isProductsAccordionOpen)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 transition-all font-medium"
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-lg"><ShoppingBag size={20} /></span> Collections
                    </div>
                    <span className={`transform transition-transform duration-300 ${isProductsAccordionOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  <div className={`transition-all duration-300 ease-in-out ${isProductsAccordionOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-white p-2 space-y-2">
                      <Link to="/products/kurti" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-all text-sm ml-2">
                        <span className="mr-2"><GiAmpleDress size={18} /></span> Stylish Kurtis
                      </Link>
                      <Link to="/products/suit" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-all text-sm ml-2">
                        <span className="mr-2"><GiKimono size={18} /></span> Designer Suits
                      </Link>
                      <Link to="/products/coat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-all text-sm ml-2">
                        <span className="mr-2"><GiLabCoat size={18} /></span> Elegant Coat Sets
                      </Link>
                      <Link to="/products/EthnicWear" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-all text-sm ml-2">
                        <span className="mr-2"><GiPoncho size={18} /></span> Winter Ethnic Wear
                      </Link>

                      {/* Coming Soon in Accordion */}
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-4">Coming Soon</p>
                        {[
                          { name: 'Wedding Collection', icon: <GiDiamondRing size={16} /> },
                          { name: 'Sharara Suits', icon: <GiKimono size={16} /> },
                          { name: 'Skirt Sets', icon: <GiSkirt size={16} /> }
                        ].map((item) => (
                          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition-all text-sm ml-2 opacity-70">
                            <div className="flex items-center">
                              <span className="mr-2 grayscale">{item.icon}</span>
                              <span>{item.name}</span>
                            </div>
                            <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase">Soon</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Link to="/TermsPage" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 transition-all font-medium">
                  <span className="mr-3 text-lg"><FileText size={20} /></span> Terms & Conditions
                </Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 transition-all font-medium">
                  <span className="mr-3 text-lg"><Phone size={20} /></span> Contact Us
                </Link>
              </div>
            </div>

            {/* Footer / Auth Section */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 z-20">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm border border-pink-200">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{user?.name || 'Welcome'}</p>
                      <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Action Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-sm transition text-center group">
                      <span className="text-lg mb-1 group-hover:scale-110 transition-transform"><ShoppingCart size={20} /></span>
                      <span className="text-[10px] font-semibold text-gray-700">Cart ({cartCount})</span>
                    </Link>
                    <Link to="/MyOrder" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-sm transition text-center group">
                      <span className="text-lg mb-1 group-hover:scale-110 transition-transform"><Package size={20} /></span>
                      <span className="text-[10px] font-semibold text-gray-700">Orders</span>
                    </Link>
                    <Link to="/addresses" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-sm transition text-center group">
                      <span className="text-lg mb-1 group-hover:scale-110 transition-transform"><MapPin size={20} /></span>
                      <span className="text-[10px] font-semibold text-gray-700">Address</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 flex items-center justify-center space-x-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition text-sm"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Cart Link for Guest */}
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-xl"><ShoppingCart size={24} /></span>
                      <span className="font-medium">My Cart</span>
                    </div>
                    {cartCount > 0 && <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}
                  </Link>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 text-center">Login to manage orders & checkout faster</p>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-3 text-center rounded-xl font-bold text-white shadow-lg shadow-pink-200 transition transform hover:scale-[1.02]"
                      style={{ backgroundColor: '#b81582' }}
                    >
                      Login / Signup
                    </Link>
                  </div>
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