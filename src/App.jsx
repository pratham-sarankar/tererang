import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminHelp from "./pages/admin/AdminHelp";

// Products
import Kurti from "./products/Kurti";
import Suit from "./products/Suit";
import Coat from "./products/Coat";
import EthnicWear from "./products/EthnicWear";
import ShararaData from "./products/ShararaData";
import Skirt from "./products/Skirt";
import WeddingCollection from "./products/WeddingCollection";
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
import Cart from "./pages/Cart";

// Layout wrapper to conditionally render Navbar
function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="discounts" element={<AdminSettings />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="help" element={<AdminHelp />} />
          </Route>

          {/* Products */}
          <Route path="/products/Kurti" element={<Kurti />} />
          <Route path="/products/EthnicWear" element={<EthnicWear />} />
          <Route path="/products/Suit" element={<Suit />} />
          <Route path="/products/Coat" element={<Coat />} />
          <Route path="/products/ShararaData" element={<ShararaData />} />
          <Route path="/products/Skirt" element={<Skirt />} />
          <Route path="/products/wedding" element={<WeddingCollection />} />
          <Route path="/Shipping" element={<Shipping />} />
          <Route path="/OrderTracker" element={<OrderTracker />} />
          <Route path="/FaqPage" element={<FaqPage />} />
          <Route path="/HelpCenterPage" element={<HelpCenterPage />} />
          <Route path="/TermsPage" element={<TermsPage />} />
          <Route path="/AlwaysOffers" element={<AlwaysOffers />} />
          <Route path="/MyOrder" element={<MyOrder />} />
          <Route path="ReturnPolicy" element={<ReturnPolicy />} />
          <Route path="DesignerSuit" element={<DesignerSuit />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/addresses" element={<AddressBook />} />
          <Route path="/product/:productId" element={<ProductDetail />} />

          {/* Fallback Route */}
          <Route
            path="*"
            element={<h2 style={{ padding: "20px" }}>404 - Page Not Found</h2>}
          />
        </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
