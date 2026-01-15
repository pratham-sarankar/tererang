import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// 💡 IMPORTANT: Ensure 'Final Logo.jpg' is now a transparent PNG file 
// (or rename and import the new transparent PNG file)
import tereRang from "./Final Logo.jpg";
import { Menu, X, User, LogOut, ShoppingCart, Trash2 } from "lucide-react"; // For mobile menu icons
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
    { name: 'Stylish Kurtis', to: '/products/kurti', enabled: true, emoji: '👚' },
    { name: 'Designer Suits', to: '/products/suit', enabled: true, emoji: '👗' },
    { name: 'Elegant Coat Sets', to: '/products/coat', enabled: true, emoji: '🧥' },
    { name: 'Winter Ethnic Wear', to: '/products/EthnicWear', enabled: true, emoji: '🧣' },
    { name: 'Wedding Collection', to: '/products/festiveSuits', enabled: false },
  ];

  return (
    <>
      {/* Discount Strip */}
      <div className="text-white text-center py-2 text-sm font-semibold sticky top-0 z-50" style={{ backgroundColor: '#b81582' }}>
        🎁 FREE DELIVERY ABOVE ₹999
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
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full pt-4 w-[320px] z-50">
                  <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-3 border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {productMenu.map((item) => (
                        <li key={item.name} className="py-2">
                          {item.enabled ? (
                            <Link
                              to={item.to}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center justify-between text-gray-700 transition"
                              style={{ color: "#b81582" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#b81582")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#b81582")}
                            >
                              <span>
                                {item.emoji ? <span className="mr-2" aria-hidden> {item.emoji} </span> : null}
                                {item.name}
                              </span>
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between text-gray-500 cursor-not-allowed">
                              <span>{item.name}</span>
                              <span className="ml-3 text-xs bg-gray-100 border border-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming soon</span>
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
                          📦 My Orders
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
                          📍 Addresses
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
                          📦 My Orders
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
                          🎁 Offers
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

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
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white text-gray-900 px-6 py-5 space-y-4 font-medium border-t border-gray-200">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
              Home
            </Link>
            <Link to="/products/kurti" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
              👚 Stylish Kurtis
            </Link>
            <Link to="/products/suit" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
              👗 Designer Suits
            </Link>
            <Link to="/products/coat" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
              🧥 Elegant Coat Sets
            </Link>
            {/* Disabled/Coming soon items */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>Sharara Suits</span>
                <span className="text-xs bg-gray-100 border border-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming soon</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Skirt</span>
                <span className="text-xs bg-gray-100 border border-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming soon</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Designer Suits</span>
                <span className="text-xs bg-gray-100 border border-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Coming soon</span>
              </div>
            </div>
            <Link to="/TermsPage" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
              Terms & Conditions
            </Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
              Contact Us
            </Link>

            {/* Authentication section for mobile */}
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center mb-3">
                    <User className="mr-2" size={20} />
                    <div>
                      <p className="font-bold text-gray-900">{user?.name || 'Welcome'}</p>
                      <p className="text-sm text-gray-600">{user?.phoneNumber}</p>
                    </div>
                  </div>
                  <Link to="/MyOrder" onClick={() => setIsMobileMenuOpen(false)} className="block mb-2 text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
                    📦 My Orders
                  </Link>
                  <Link to="/addresses" onClick={() => setIsMobileMenuOpen(false)} className="block mb-2 text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
                    📍 Addresses
                  </Link>
                  <Link to="/AlwaysOffers" onClick={() => setIsMobileMenuOpen(false)} className="block mb-2 text-gray-700 transition" style={{ color: '#b81582' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#b81582')} onMouseLeave={(e) => (e.currentTarget.style.color = '#b81582')}>
                    🎁 Offers
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-red-600 hover:text-red-700 transition flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center py-2 rounded-full font-semibold transition text-white"
                style={{ backgroundColor: '#b81582' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#a01478')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#b81582')}
              >
                Login/Signup
              </Link>
            )}
          </div>
        )}
      </nav>
    </>

  );
};

export default Navbar;