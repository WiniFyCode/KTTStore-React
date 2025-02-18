// CustomerLayout.jsx - Layout chung cho phần customer của website
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaUser, FaBars, FaTimes, FaSearch, FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaClipboardList, FaMapMarker, FaArrowUp, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../contexts/CustomerThemeContext';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import { shopInfo } from '../data/ShopInfo';

const CustomerLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State để kiểm tra trạng thái đăng nhập
  const [openDropdowns, setOpenDropdowns] = useState({
    products: false,
    account: false,
  });
  // Thêm state cho search
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  // Thêm state để lưu số lượng
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Thêm state cho modal đăng xuất

  // Menu items dựa theo theme - Các mục menu sẽ thay đổi dựa vào theme hiện tại (Tết hoặc bình thường)
  const menuItems = theme === 'tet' ? [
    { name: 'THỜI TRANG TẾT', path: '/tet-collection' },
    { name: 'SẢN PHẨM', path: '/products' },
    { name: 'NAM', path: '/male' },
    { name: 'NỮ', path: '/female' },
    { name: 'GIẢM GIÁ TẾT', path: '/sale-tet' },
    { name: 'TIN TỨC', path: '/news' },
    { name: 'GIỚI THIỆU', path: '/about' },
  ] : [
    { name: 'HÀNG MỚI VỀ', path: '/new-arrivals' },
    { name: 'SẢN PHẨM', path: '/products' },
    { name: 'NAM', path: '/male' },
    { name: 'NỮ', path: '/female' },
    { name: 'GIẢM GIÁ', path: '/sale' },
    { name: 'TIN TỨC', path: '/news' },
    { name: 'GIỚI THIỆU', path: '/about' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Hàm toggle dropdown
  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Xử lý đổi theme và chuyển trang tương ứng với theme mới
  const handleThemeToggle = () => {
    const newTheme = theme === 'tet' ? 'normal' : 'tet'; // Sửa 'default' thành 'normal' cho đồng nhất
    toggleTheme();

    // Chuyển trang tương ứng với theme mới
    if (location.pathname === '/new-arrivals' && newTheme === 'tet') {
      navigate('/tet-collection');
    } else if (location.pathname === '/tet-collection' && newTheme === 'normal') {
      navigate('/new-arrivals');
    } else if (location.pathname === '/sale-tet' && newTheme === 'normal') {
      navigate('/sale');
    } else if (location.pathname === '/sale' && newTheme === 'tet') {
      navigate('/sale-tet');
    }
  };

  // Cập nhật hàm handleLogout
  const handleLogout = () => {
    setShowLogoutModal(true); // Hiển thị modal xác nhận thay vì đăng xuất ngay
  };

  // Thêm hàm xử lý đăng xuất thực sự
  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Dispatch event để thông báo thay đổi auth
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('cartChange'));
    window.dispatchEvent(new Event('wishlistChange'));

    // Hiển thị thông báo
    toast.success('Đăng xuất thành công!');
    setIsLoggedIn(false);
    setShowLogoutModal(false);
    navigate('/login');
  };

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkLoginStatus = () => {
      const customerToken = localStorage.getItem('customerToken');
      setIsLoggedIn(!!customerToken);
    };

    // Kiểm tra khi component mount
    checkLoginStatus();

    // Tạo custom event để lắng nghe thay đổi auth
    const handleAuthChange = () => {
      checkLoginStatus();
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Thêm useEffect để fetch số lượng
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('customerToken');
        if (!token) {
          setCartCount(0);
          setWishlistCount(0);
          return;
        }

        // Fetch số lượng giỏ hàng và yêu thích cùng lúc
        const [cartResponse, wishlistResponse] = await Promise.all([
          axiosInstance.get('/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axiosInstance.get('/api/favorite', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        setCartCount(cartResponse.data.items?.length || 0);
        setWishlistCount(wishlistResponse.data.items?.length || 0);

      } catch (error) {
        console.error('Error fetching counts:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customerInfo');
          setIsLoggedIn(false);
        }
      }
    };

    // Fetch ngay lập tức khi component mount hoặc đăng nhập thay đổi
    if (isLoggedIn) {
      fetchCounts();
    }

    // Lắng nghe sự kiện thay đổi
    window.addEventListener('cartChange', fetchCounts);
    window.addEventListener('wishlistChange', fetchCounts);

    // Cleanup
    return () => {
      window.removeEventListener('cartChange', fetchCounts);
      window.removeEventListener('wishlistChange', fetchCounts);
    };
  }, [isLoggedIn]); // Chỉ chạy lại khi trạng thái đăng nhập thay đổi

  // Hàm xử lý search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false); // Đóng menu mobile nếu đang mở
    }
  };

  // Thêm useEffect để theo dõi scroll
  useEffect(() => {
    const handleScroll = () => {
      // Hiển thị nút khi cuộn xuống 70% chiều cao trang
      const scrollThreshold = document.documentElement.scrollHeight * 0.7;
      const shouldShow = window.scrollY + window.innerHeight > scrollThreshold;
      setShowScrollTop(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hàm xử lý cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Thêm useEffect để theo dõi thay đổi đường dẫn và cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]); // Chạy lại mỗi khi pathname thay đổi

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Phần đầu trang cố định ở trên cùng */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        theme === 'tet' 
          ? 'bg-red-900' 
          : 'bg-gray-900'
      }`}>
        <nav className="container mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo - Giữ nguyên width trên mobile */}
            <div className="w-auto">
              <Link to="/" className="relative group inline-block">
                <div className="flex items-center">
                  {/* Logo Text */}
                  <div className="relative">
                    <span className={`text-2xl font-bold ${
                      theme === 'tet'
                        ? 'text-yellow-300/90'
                        : 'text-white'
                    } transition-all duration-300 animate-pulse-slow`}>
                      KTT
                    </span>
                    <span className={`ml-2 text-2xl font-light ${
                      theme === 'tet'
                        ? 'text-yellow-200/90'
                        : 'text-gray-300'
                    } transition-all duration-300`}>
                      Store
                    </span>

                    {/* Glow Effect */}
                    <div className={`absolute inset-0 opacity-75 ${theme === 'tet'
                      ? 'animate-glow-gold'
                      : 'animate-glow-blue'
                      }`} />

                    {/* Sparkles */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-sparkle-1" />
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-sparkle-2" />
                      <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-white rounded-full animate-sparkle-3" />
                    </div>

                    {/* Glowing Border */}
                    <div className={`absolute -inset-0.5 opacity-0 ${theme === 'tet'
                      ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400'
                      : 'bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400'
                      } rounded-lg blur animate-border-glow`} />

                    {/* Glowing Dot */}
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${theme === 'tet'
                      ? 'bg-yellow-400'
                      : 'bg-blue-400'
                      } transition-all duration-300 animate-ping`} />
                  </div>

                  {/* Theme-based Decoration */}
                  {theme === 'tet' && (
                    <>
                      {/* Mai Flower */}
                      <div className="absolute -top-3 -right-6 text-yellow-400 animate-bounce-slow">
                        ✿
                      </div>
                      {/* Red Envelope */}
                      <div className="absolute -bottom-2 -right-4 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                        🧧
                      </div>
                    </>
                  )}
                </div>

                {/* Tooltip */}
                <div className={`absolute ml-4 -bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${theme === 'tet'
                  ? 'bg-yellow-400 text-red-700'
                  : 'bg-blue-500 text-white'
                  } opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0`}>
                  {theme === 'tet' ? 'Chúc Mừng Năm Mới' : 'Welcome to KTT Store'}
                </div>
              </Link>
            </div>

            {/* Mobile menu button - Hiển thị trên màn <= 1024px */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FaTimes size={24} className="text-white" /> : <FaBars size={24} className="text-white" />}
            </button>

            {/* Desktop Navigation - Hiển thị trên màn > 1024px */}
            <div className="hidden lg:flex items-center justify-center flex-1 ml-8">
              <div className="flex items-center space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`whitespace-nowrap hover:text-white/80 transition-colors ${
                      location.pathname === item.path
                        ? theme === 'tet'
                          ? 'text-yellow-400 font-semibold'
                          : 'text-blue-400 font-semibold'
                        : theme === 'tet'
                          ? 'text-yellow-300/90'
                          : 'text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Icons - Hiển thị trên màn > 1024px */}
            <div className="hidden lg:flex items-center justify-end space-x-4 ml-8">
              {/* Search with dropdown */}
              <div className="relative group">
                <button className={`p-2 rounded-full transition-all duration-300 ${
                  theme === 'tet'
                    ? 'hover:bg-red-800/50'
                    : 'hover:bg-gray-800/50'
                }`}>
                  <FaSearch size={20} className={`${
                    theme === 'tet'
                      ? 'text-yellow-300/90'
                      : 'text-white'
                  }`} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <form onSubmit={handleSearch} className="p-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full px-4 py-3 pl-12 rounded-xl border-2 focus:outline-none transition-all duration-300 ${
                          theme === 'tet'
                            ? 'border-red-200 focus:border-red-500 placeholder-red-300'
                            : 'border-gray-200 focus:border-blue-500 placeholder-gray-400'
                        }`}
                      />
                      <FaSearch 
                        size={16} 
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                          theme === 'tet'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      />
                      <button
                        type="submit"
                        className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          theme === 'tet'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Tìm
                      </button>
                    </div>
                  </form>
                  {/* Gợi ý tìm kiếm */}
                  <div className="px-4 pb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">Gợi ý tìm kiếm:</div>
                    <div className="flex flex-wrap gap-2">
                      {['Áo thun', 'Quần jean', 'Váy', 'Áo khoác' ,'Quần dài', 'Áo dài'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSearchQuery(tag);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                            theme === 'tet'
                              ? 'bg-red-500/90 text-white hover:bg-red-800/100'
                              : 'bg-blue-500/90 text-white hover:bg-blue-800/100'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wishlist with counter */}
              <Link
                to="/wishlist"
                className="relative group p-2"
              >
                <FaHeart size={20} className={`${theme === 'tet' ? 'text-yellow-400' : 'text-white'} hover:opacity-80 transition-opacity`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart with counter */}
              <Link
                to="/cart"
                className="relative group p-2"
              >
                <FaShoppingCart size={20} className={`${
                  theme === 'tet' 
                    ? 'text-yellow-300/90 hover:text-yellow-400' 
                    : 'text-white hover:opacity-80'
                } transition-opacity`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile with dropdown */}
              <div className="relative group">
                <button className={`p-2 hover:opacity-80 transition-opacity ${theme === 'tet' ? 'text-yellow-400' : 'text-white'}`}>
                  <FaUser size={20} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    {isLoggedIn ? (
                      <>
                        <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Tài khoản của tôi</Link>
                        <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đơn hàng</Link>
                        <div className="border-t border-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đăng nhập</Link>
                        <Link to="/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đăng ký</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Theme toggle */}
              <button
                onClick={handleThemeToggle}
                className={`px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
                  theme === 'tet'
                    ? 'bg-yellow-400/90 text-red-800 hover:bg-yellow-400'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {theme === 'tet' ? '🎋' : '🧧'}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`lg:hidden fixed inset-0 bg-gray-900/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? 'opacity-100 visible'
                : 'opacity-0 invisible pointer-events-none'
            }`}
          >
            {/* Close button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaTimes size={24} />
            </button>

            {/* Logo */}
            <div className="p-4 border-b border-white/10">
              <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                <span className={`text-2xl font-bold ${theme === 'tet'
                  ? 'text-yellow-300/90'
                  : 'text-white'
                  }`}>
                  KTT
                </span>
                <span className="ml-2 text-2xl font-light text-white">
                  Store
                </span>
              </Link>
            </div>

            <div className="h-[calc(100vh-80px)] overflow-y-auto">
              {/* Search */}
              <div className="p-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-4 py-3 pl-12 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 border-2 transition-all duration-300 ${
                        theme === 'tet'
                          ? 'border-red-500/30 focus:border-red-500/50'
                          : 'border-blue-500/30 focus:border-blue-500/50'
                      } focus:outline-none`}
                    />
                    <FaSearch 
                      size={16} 
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    />
                    <button
                      type="submit"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        theme === 'tet'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Tìm
                    </button>
                  </div>
                </form>
                {/* Gợi ý tìm kiếm cho mobile */}
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-400 mb-2">Gợi ý tìm kiếm:</div>
                  <div className="flex flex-wrap gap-2">
                    {['Áo thun', 'Quần jean', 'Váy', 'Áo khoác'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                          theme === 'tet'
                            ? 'bg-red-500/20 text-white hover:bg-red-500/30'
                            : 'bg-blue-500/20 text-white hover:bg-blue-500/30'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Menu with Dropdowns */}
              <div className="p-4 space-y-2">
                <div className="text-sm font-medium text-gray-400 uppercase mb-2">Menu</div>

                {/* Trang chủ */}
                <Link
                  to="/"
                  className={`block px-4 py-2 rounded-lg transition-colors text-white hover:bg-white/10`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Trang chủ
                </Link>

                {/* Products Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('products')}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-white hover:bg-white/10`}
                  >
                    <span>Sản phẩm</span>
                    <span className={`transform transition-transform duration-200 ${openDropdowns.products ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openDropdowns.products ? 'max-h-96' : 'max-h-0'}`}>
                    {theme === 'tet' ? (
                      <>
                        <Link
                          to="/tet-collection"
                          className="block px-6 py-2 text-white hover:bg-white/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Thời trang Tết
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/new-arrivals"
                        className="block px-6 py-2 text-white hover:bg-white/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Hàng mới về
                      </Link>
                    )}
                    <Link
                      to="/products"
                      className="block px-6 py-2 text-white hover:bg-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tất cả sản phẩm
                    </Link>
                    <Link
                      to="/male"
                      className="block px-6 py-2 text-white hover:bg-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Nam
                    </Link>
                    <Link
                      to="/female"
                      className="block px-6 py-2 text-white hover:bg-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Nữ
                    </Link>
                    <Link
                      to={theme === 'tet' ? '/sale-tet' : '/sale'}
                      className="block px-6 py-2 text-white hover:bg-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {theme === 'tet' ? 'Giảm giá Tết' : 'Giảm giá'}
                    </Link>
                  </div>
                </div>

                {/* Other Menu Items */}
                <Link
                  to="/news"
                  className={`block px-4 py-2 rounded-lg transition-colors text-white hover:bg-white/10`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tin tức
                </Link>
                <Link
                  to="/about"
                  className={`block px-4 py-2 rounded-lg transition-colors text-white hover:bg-white/10`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giới thiệu
                </Link>
              </div>

              {/* User Actions */}
              <div className="p-4 pb-0 border-t border-white/10">
                <div className="text-sm font-medium text-gray-400 uppercase mb-2">Tài khoản</div>
                <div className="space-y-2">
                  {isLoggedIn ? (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('account')}
                        className="w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-white hover:bg-white/10"
                      >
                        <span>Tài khoản của tôi</span>
                        <span className={`transform transition-transform duration-200 ${openDropdowns.account ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${openDropdowns.account ? 'max-h-96 mb-4 border-b border-white/10 pb-4' : 'max-h-0'}`}>
                        <Link
                          to="/profile"
                          className="flex items-center px-6 py-2 text-white hover:bg-white/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FaUser className="mr-3" size={16} />
                          <span>Thông tin tài khoản</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-6 py-2 text-white hover:bg-white/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FaClipboardList className="mr-3" size={16} />
                          <span>Đơn hàng</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center px-6 py-2 text-red-500 hover:bg-white/10"
                        >
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUser className="mr-3" size={16} />
                        <span>Đăng nhập</span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors mb-4 border-b border-white/10 pb-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUserPlus className="mr-3" size={16} />
                        <span>Đăng ký</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 space-y-2">
                <Link
                  to="/wishlist"
                  className="flex items-center px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="relative mr-3">
                    <FaHeart size={16} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span>Yêu thích</span>
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="relative mr-3">
                    <FaShoppingCart size={16} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span>Giỏ hàng</span>
                </Link>
              </div>

              {/* Theme Toggle */}
              <div className="p-4">
                <button
                  onClick={() => {
                    handleThemeToggle();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 rounded-lg transition-all duration-300 ${theme === 'tet'
                    ? 'bg-yellow-400/90 text-red-800 hover:bg-yellow-400'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                  {theme === 'tet' ? '🎋 Chế độ thường' : '🧧 Chế độ Tết'}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`${theme === 'tet' ? 'bg-red-900' : 'bg-gray-900'} text-white py-8`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Thông tin cửa hàng */}
            <div>
              <h3 className="text-lg font-bold mb-4">{shopInfo.name}</h3>
              <p className="text-sm text-gray-300 mb-2">Địa chỉ: &nbsp;{shopInfo.address} &nbsp;
                <a href={`https://maps.google.com/?q=${shopInfo.address}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  <FaMapMarker size={16} className="inline-block mr-1" />
                </a>
              </p>
              <p className="text-sm text-gray-300 mb-2">Điện thoại: &nbsp;
                <a href={`tel:${shopInfo.phone}`} className="text-gray-300 hover:text-white transition-colors">
                  {shopInfo.phone}
                </a>
              </p>
              <p className="text-sm text-gray-300">Email: &nbsp;
                <a href={`mailto:${shopInfo.email}`} className="text-gray-300 hover:text-white transition-colors">
                  {shopInfo.email}
                </a>
              </p>
            </div>

            {/* Footer Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Chính sách</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/policy" className="text-gray-300 hover:text-white transition-colors">
                    Tất cả chính sách
                  </Link>
                </li>
                <li>
                  <Link to="/policy/shipping" className="text-gray-300 hover:text-white transition-colors">
                    Chính sách vận chuyển
                  </Link>
                </li>
                <li>
                  <Link to="/policy/return" className="text-gray-300 hover:text-white transition-colors">
                    Chính sách đổi trả
                  </Link>
                </li>
                <li>
                  <Link to="/policy/payment" className="text-gray-300 hover:text-white transition-colors">
                    Chính sách thanh toán
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Hỗ trợ khách hàng</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/support" className="text-gray-300 hover:text-white transition-colors">
                    Trung tâm hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link to="/support/faq" className="text-gray-300 hover:text-white transition-colors">
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link to="/support/size-guide" className="text-gray-300 hover:text-white transition-colors">
                    Hướng dẫn chọn size
                  </Link>
                </li>
                <li>
                  <Link to="/support/contact" className="text-gray-300 hover:text-white transition-colors">
                    Liên hệ - Báo cáo lỗi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Kết nối với chúng tôi</h3>
              <div className="flex flex-col space-y-2">
                <Link to="/connect" className="text-gray-300 hover:text-white transition-colors">
                  Tất cả kênh kết nối
                </Link>
                <div className="flex space-x-6 mt-2">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-[#1877F2]"
                  >
                    <FaFacebook className="text-2xl" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-[#E4405F]"
                  >
                    <FaInstagram className="text-2xl" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-white"
                  >
                    <FaTiktok className="text-2xl" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-[#FF0000]"
                  >
                    <FaYoutube className="text-2xl" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} KTT Store. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Nút cuộn lên đầu trang */}
      <button
        onClick={scrollToTop}
        className={`fixed right-6 bottom-6 p-3 rounded-full shadow-lg transition-all duration-300 transform ${
          showScrollTop 
            ? 'translate-y-0 opacity-100 visible'
            : 'translate-y-10 opacity-0 invisible'
        } ${
          theme === 'tet'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <FaArrowUp className="w-5 h-5" />
      </button>

      {/* Modal xác nhận đăng xuất */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowLogoutModal(false)}></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                    <FaSignOutAlt className={`h-6 w-6 ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xác nhận đăng xuất
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={confirmLogout}
                  className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 ${
                    theme === 'tet'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors`}
                >
                  Đăng xuất
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLayout;
