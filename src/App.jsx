import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Deals from "./pages/Deals";
import Categories from "./pages/Categories";

// Admin Components
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Products
import Kurti from "./products/Kurti";
import Suit from "./products/Suit";
import Coat from "./products/Coat";
import EthnicWear from "./products/EthnicWear";
import ShararaData from "./products/ShararaData";
import Skirt from "./products/Skirt";
//import Offers from "./pages/Offers";
import Shipping from "./products/Shipping";
import OrderTracker from "./products/OrderTracker";
import FaqPage from "./products/FaqPage";
import HelpCenterPage from "./products/HelpCenterPage";
import TermsPage from "./products/TermsPage";
import AlwaysOffers from "./products/AlwaysOffers";
import MyOrder from "./products/MyOrder";
import ReturnPolicy from "./products/ReturnPolicy";
import DesignerSuit from "./products/DesignerSuit";
import Privacy from "./pages/Privacy";
import { CartProvider } from "./context/CartContext.jsx";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import AddressBook from "./pages/AddressBook";




function App() {
  const [showPopup] = useState(false);
  return (
    <CartProvider>
      <Router>
        {/* <Navbar /> */}
        {!showPopup && <Navbar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />   {/* ✅ Changed /Home → / */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Products */}
          <Route path="/products/Kurti" element={<Kurti />} />
          <Route path="/products/EthnicWear" element={<EthnicWear />} />
          <Route path="/products/Suit" element={<Suit />} />
          <Route path="/products/Coat" element={<Coat />} />
          <Route path="/products/ShararaData" element={<ShararaData />} />   {/* ✅ lowercase */}
          <Route path="/products/Skirt" element={<Skirt />} />     {/* ✅ lowercase */}
          <Route path="/Shipping" element={<Shipping />} />     {/* ✅ lowercase */}
          <Route path="/OrderTracker" element={<OrderTracker />} />     {/* ✅ lowercase */}
          <Route path="/FaqPage" element={<FaqPage />} />
          <Route path="/HelpCenterPage" element={<HelpCenterPage />} />
          <Route path="/TermsPage" element={<TermsPage />} />
          <Route path="/AlwaysOffers" element={<AlwaysOffers />} />
          <Route path="/MyOrder" element={<MyOrder />} />
          <Route path="ReturnPolicy" element={<ReturnPolicy />} />
          <Route path="DesignerSuit" element={<DesignerSuit />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/addresses" element={<AddressBook />} />
          <Route path="/product/:productId" element={<ProductDetail />} />



          {/* Fallback Route */}
          <Route
            path="*"
            element={<h2 style={{ padding: "20px" }}>404 - Page Not Found</h2>}
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
