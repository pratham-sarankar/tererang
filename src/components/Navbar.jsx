import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// 💡 IMPORTANT: Ensure 'Final Logo.jpg' is now a transparent PNG file 
// (or rename and import the new transparent PNG file)
import tereRang from "./Final Logo.jpg"; 
import { Menu, X } from "lucide-react"; // For mobile menu icons

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const loginRef = useRef(null);
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setIsLoginMenuOpen(false);
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
  }, [location]);

  // Active route highlighting
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
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
        <ul className="hidden md:flex space-x-8 items-center font-medium">
          <li>
            <Link
              to="/"
              className={`transition duration-200 ${
                isActive("/") ? "text-teal-400" : "hover:text-teal-400"
              }`}
            >
              Home
            </Link>
          </li>

          {/* ✅ PRODUCTS DROPDOWN */}
          <li ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen((s) => !s)}
              className={`transition duration-200 ${
                isActive("/products/kurti") ||
                isActive("/products/suit") ||
                isActive("/products/designerSuit")
                  ? "text-teal-400"
                  : "hover:text-teal-400"
              }`}
            >
              Products
            </button>

            {isDropdownOpen && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 bg-gray-900 text-white rounded-xl shadow-2xl p-5 grid grid-cols-2 gap-6 w-[480px] border border-gray-700 z-50">
                
                {/* 🌿 Daily Wear */}
                <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                  <h4 className="font-semibold text-teal-400 border-b border-teal-600 pb-1 mb-2">
                    🌿 Daily Wear
                  </h4>
                  <Link
                    to="/products/kurti"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block hover:text-teal-400"
                  >
                    Kurti
                  </Link>
                  <Link
                    to="/products/suit"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block hover:text-teal-400"
                  >
                    Suit
                  </Link>
                  <Link
                    to="/products/coat"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block hover:text-teal-400"
                  >
                    Coat
                  </Link>
                </div>

                {/* 🎉 Party Wear */}
                <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                  <h4 className="font-semibold text-cyan-400 border-b border-cyan-600 pb-1 mb-2">
                    🎉 Party Wear
                  </h4>
                  <Link
                    to="/products/ShararaData"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block hover:text-cyan-400"
                  >
                    Sarara Suits
                  </Link>
                  <Link
                    to="/products/skirt"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block hover:text-cyan-400"
                  >
                    Skirt
                  </Link>
                  <Link
                    to="/products/DesignerSuit"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block hover:text-cyan-400"
                  >
                    Designer Suits
                  </Link>
                </div>
              </div>
            )}
          </li>

          <li>
            <Link
              to="/TermsPage"
              className={`transition duration-200 ${
                isActive("/TermsPage") ? "text-teal-400" : "hover:text-teal-400"
              }`}
            >
              Terms & Conditions
            </Link>
          </li>

          <li>
            <Link
              to="/contact"
              className={`transition duration-200 ${
                isActive("/contact") ? "text-teal-400" : "hover:text-teal-400"
              }`}
            >
              Contact Us
            </Link>
          </li>
        </ul>

        {/* ✅ RIGHT SECTION */}
        <div className="flex items-center space-x-4 relative">
          
          {/* 🔍 Search Section */}
          <div className="relative flex items-center">
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isSearchOpen ? "w-48 opacity-100" : "w-0 opacity-0"
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

          {/* 🛒 Cart */}
          <div className="relative">
            <button className="text-2xl hover:text-teal-400 transition">
              🛒
            </button>
            <span className="absolute -top-2 -right-3 bg-teal-500 text-white text-xs font-bold rounded-full px-2 shadow-md">
              2
            </span>
          </div>

          {/* 👤 Login Dropdown */}
          <div ref={loginRef} className="relative">
            <button
              onClick={() => setIsLoginMenuOpen((s) => !s)}
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-full font-medium transition"
            >
              Login
            </button>

            {isLoginMenuOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 z-50 p-5">
                <h4 className="text-lg font-bold mb-2">Welcome</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Access your account and manage orders
                </p>

                <Link
                  to="/login"
                  onClick={() => setIsLoginMenuOpen(false)}
                  className="block bg-teal-600 text-center py-2 rounded-lg font-semibold hover:bg-teal-500 transition mb-3"
                >
                  LOGIN / SIGNUP
                </Link>

                <hr className="border-gray-700 mb-3" />

                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/MyOrder"
                      onClick={() => setIsLoginMenuOpen(false)}
                      className="hover:text-teal-400"
                    >
                      📦 My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/AlwaysOffers"
                      onClick={() => setIsLoginMenuOpen(false)}
                      className="hover:text-teal-400"
                    >
                      🎁 Offers
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* 📝 Register Button */}
          <Link
            to="/register"
            className="hidden md:inline bg-white text-black hover:bg-gray-200 px-4 py-1.5 rounded-full font-semibold transition"
          >
            Register
          </Link>

          {/* 📱 Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-3xl hover:text-teal-400 transition"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ✅ MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 text-white px-6 py-5 space-y-4 font-medium border-t border-gray-800">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products/kurti" onClick={() => setIsMobileMenuOpen(false)}>
            Kurti
          </Link>
          <Link to="/products/suit" onClick={() => setIsMobileMenuOpen(false)}>
            Suit
          </Link>
          <Link
            to="/products/designerSuit"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Designer Suits
          </Link>
          <Link to="/TermsPage" onClick={() => setIsMobileMenuOpen(false)}>
            Terms & Conditions
          </Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            Contact Us
          </Link>
          <Link
            to="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block bg-teal-600 text-center py-2 rounded-full font-semibold hover:bg-teal-500 transition"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;