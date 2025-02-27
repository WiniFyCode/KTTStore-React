import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider as AdminThemeProvider } from './contexts/AdminThemeContext';
import { ThemeProvider as CustomerThemeProvider } from './contexts/CustomerThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminRoute, AuthRoute } from './components/PrivateRoute';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Customers from './pages/admin/CustomerMangement';
import Products from './pages/admin/ProductManagement'
import Orders from "./pages/admin/OrderManagement";
import Coupons from "./pages/admin/CouponManagement";
import Notifications from './pages/admin/NotificationManagement';
import PromotionManagement from './pages/admin/PromotionManagement';
import SettingManagement from './pages/admin/SettingManagement';

// Customer Pages

import Login from "./pages/customer/auth/Login";
import Register from "./pages/customer/auth/Register";
import ForgotPassword from "./pages/customer/auth/ForgotPassword";
import Home from "./pages/customer/Home";
import ProductList from "./pages/customer/product/Products";
import MenProducts from "./pages/customer/product/MenProducts";
import WomenProducts from "./pages/customer/product/WomenProducts";
import SaleProducts from "./pages/customer/product/SaleProducts";
import NewArrivals from "./pages/customer/product/NewArrivals";
import TetCollection from "./pages/customer/product/TetCollection";
import ProductDetail from "./pages/customer/product/ProductDetail";
import Cart from "./pages/customer/cart/Cart";
import Checkout from "./pages/customer/checkout/Checkout";
import Profile from "./pages/customer/auth/Profile";
import Wishlist from "./pages/customer/wishlist/Wishlist";
import OrderHistory from "./pages/customer/order/OrderHistory";
import CustomerOrders from "./pages/customer/order/Orders";
import OrderDetail from "./pages/customer/order/OrderDetail";
import News from "./pages/customer/news/News";
import NewsDetail from "./pages/customer/news/NewsDetail";
import About from "./pages/customer/auth/About";
import NotFound from "./pages/NotFound";
import Notification from "./pages/customer/notification/Notification";
import UserCoupons from './pages/customer/coupon/Coupons';

// Policy Pages
import ShippingPolicy from "./pages/customer/policy/ShippingPolicy";
import ReturnPolicy from "./pages/customer/policy/ReturnPolicy";
import PaymentPolicy from "./pages/customer/policy/PaymentPolicy";
import Policy from "./pages/customer/policy/Policy";

// Support Pages
import FAQ from "./pages/customer/support/FAQ";
import SizeGuide from "./pages/customer/support/SizeGuide";
import Contact from "./pages/customer/support/Contact";
import Support from "./pages/customer/support/Support";

// Connect
import Connect from "./pages/customer/connect/Connect";

// Promotion Page
import Promotion from "./pages/customer/promotion/Promotion";

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Payment Page
import PaymentSuccess from "./pages/customer/payment/PaymentSuccess";

function App() {
  return (
    <AdminThemeProvider>
      <CustomerThemeProvider>
        <Router>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="products" element={<ProductList />} />
              <Route path="male" element={<MenProducts />} />
              <Route path="female" element={<WomenProducts />} />
              <Route path="sale" element={<SaleProducts />} />
              <Route path="sale-tet" element={<SaleProducts />} />
              <Route path="new-arrivals" element={<NewArrivals />} />
              <Route path="tet-collection" element={<TetCollection />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<AuthRoute><Cart /></AuthRoute>} />
              <Route path="checkout" element={<AuthRoute><Checkout /></AuthRoute>} />
              <Route path="wishlist" element={<AuthRoute><Wishlist /></AuthRoute>} />
              <Route path="profile" element={<AuthRoute><Profile /></AuthRoute>} />
              <Route path="orders" element={<AuthRoute><CustomerOrders /></AuthRoute>} />
              <Route path="order/:id" element={<AuthRoute><OrderDetail /></AuthRoute>} />
              <Route path="order-history" element={<AuthRoute><OrderHistory /></AuthRoute>} />
              <Route path="notifications" element={<AuthRoute><Notification /></AuthRoute>} />
              <Route path="payment/success" element={<AuthRoute><PaymentSuccess /></AuthRoute>} />
              <Route path="news" element={<News />} />
              <Route path="news/:id" element={<NewsDetail />} />
              <Route path="about" element={<About />} />
              <Route path="coupons" element={<UserCoupons />} />
              {/* Auth Routes */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />

              {/* Policy Pages */}
              <Route path="policy">
                <Route index element={<Policy />} />
                <Route path="shipping" element={<ShippingPolicy />} />
                <Route path="return" element={<ReturnPolicy />} />
                <Route path="payment" element={<PaymentPolicy />} />
              </Route>

              {/* Support Pages */}
              <Route path="support">
                <Route index element={<Support />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="size-guide" element={<SizeGuide />} />
                <Route path="contact" element={<Contact />} />
              </Route>

              {/* Connect */}
              <Route path="connect" element={<Connect />} />

              {/* Promotion Page */}
              <Route path="promotion" element={<Promotion />} />
            </Route>

            {/* Routes sử dụng AdminLayout */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              {/* Chuyển hướng /admin về /admin/dashboard */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="settings" element={<SettingManagement />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Route cho trang 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-left"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          stacked={false}
          pauseOnFocusLoss
          pauseOnHover
          theme="light"
        />
      </CustomerThemeProvider>
    </AdminThemeProvider>
  );
}

export default App;
