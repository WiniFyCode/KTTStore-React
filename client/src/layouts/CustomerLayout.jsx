// CustomerLayout.jsx - Layout chung cho phần customer của website
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaUser, FaBars, FaTimes, FaSearch, FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaClipboardList, FaMapMarker, FaArrowUp, FaUserPlus, FaSignOutAlt, FaTrash, FaHome, FaFireAlt, FaStar, FaBoxOpen, FaMale, FaFemale, FaPercent, FaNewspaper, FaInfoCircle, FaTshirt } from 'react-icons/fa';
import { useTheme } from '../contexts/CustomerThemeContext';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import { shopInfo } from '../data/ShopInfo';
import AIChat from '../components/AI/AIChat';
import Logo from '../components/CustomerLayout/Logo';

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
  // Thêm state để lưu danh sách sản phẩm trong giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  // Thêm state để lưu danh sách yêu thích
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

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
    const newTheme = theme === 'tet' ? 'normal' : 'tet';
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

  // Xóa các useEffect riêng lẻ và gộp vào một useEffect chung
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('customerToken');
        if (!token) {
          setCartCount(0);
          setWishlistCount(0);
          setCartItems([]);
          setFavoriteItems([]);
          return;
        }

        // Fetch tất cả dữ liệu cùng lúc
        const [cartResponse, wishlistResponse] = await Promise.all([
          axiosInstance.get('/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axiosInstance.get('/api/favorite', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // Cập nhật state cho cart
        setCartItems(cartResponse.data.items || []);
        setCartCount(cartResponse.data.items?.length || 0);

        // Cập nhật state cho wishlist
        setFavoriteItems(wishlistResponse.data.items?.slice(0, 4) || []); // Chỉ lấy 4 sản phẩm mới nhất
        setWishlistCount(wishlistResponse.data.items?.length || 0);

      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customerInfo');
          setIsLoggedIn(false);
        }
      }
    };

    // Fetch ngay lập tức khi component mount hoặc đăng nhập thay đổi
    if (isLoggedIn) {
      fetchData();
    }

    // Lắng nghe sự kiện thay đổi
    window.addEventListener('cartChange', fetchData);
    window.addEventListener('wishlistChange', fetchData);

    // Cleanup
    return () => {
      window.removeEventListener('cartChange', fetchData);
      window.removeEventListener('wishlistChange', fetchData);
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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${theme === 'tet'
        ? 'bg-red-900'
        : 'bg-gray-900'
        }`}>
        <nav className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Logo />

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
                    className={`whitespace-nowrap transition-all duration-300 border-b-2 relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-0 before:h-0.5 before:transition-all before:duration-300 hover:before:w-full ${location.pathname === item.path
                      ? theme === 'tet'
                        ? 'text-yellow-400 font-semibold border-yellow-400 hover:text-yellow-300 before:bg-yellow-300'
                        : 'text-blue-400 font-semibold border-blue-400 hover:text-blue-300 before:bg-blue-300'
                      : theme === 'tet'
                        ? 'text-yellow-100/90 border-transparent hover:text-yellow-400 before:bg-yellow-400'
                        : 'text-white border-transparent hover:text-blue-300 before:bg-blue-300'
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
                <button
                  onClick={() => toggleDropdown('search')}
                  className="p-2 text-white hover:opacity-80 transition-opacity"
                >
                  <FaSearch size={20} />
                </button>

                {/* Search dropdown */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                  {/* Arrow */}
                  <div className="absolute right-2 -top-2 w-6 h-6 bg-white transform rotate-45"></div>

                  {/* Search content */}
                  <div className="relative z-10 bg-white rounded-xl">
                    <form onSubmit={handleSearch} className="p-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm kiếm sản phẩm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`w-full px-4 py-3 pl-12 rounded-xl border-2 focus:outline-none transition-all duration-300 ${theme === 'tet'
                            ? 'border-red-200 focus:border-red-500 placeholder-red-300'
                            : 'border-gray-200 focus:border-blue-500 placeholder-gray-400'
                            }`}
                        />
                        <FaSearch
                          size={16}
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'tet'
                            ? 'text-red-400'
                            : 'text-gray-400'
                            }`}
                        />
                        <button
                          type="submit"
                          className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${theme === 'tet'
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
                        {['Áo thun', 'Quần jean', 'Váy', 'Áo khoác', 'Quần dài', 'Áo dài'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSearchQuery(tag);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${theme === 'tet'
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
              </div>

              {/* Wishlist with dropdown */}
              <div className="relative group">
                <Link
                  to="/wishlist"
                  className="relative p-2 block"
                >
                  <FaHeart size={20} className={`${theme === 'tet'
                    ? 'text-yellow-300/90 hover:text-yellow-400'
                    : 'text-white hover:opacity-80'
                    } transition-opacity`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                  {/* Arrow */}
                  <div className="absolute right-2 -top-2 w-6 h-6 bg-white transform rotate-45"></div>

                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Danh sách yêu thích</h3>
                      <span className={`text-sm ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}>
                        {wishlistCount} sản phẩm
                      </span>
                    </div>
                  </div>

                  {/* Favorite items */}
                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingFavorite ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin"
                          style={{ borderTopColor: theme === 'tet' ? '#ef4444' : '#3b82f6' }}>
                        </div>
                      </div>
                    ) : favoriteItems.length > 0 ? (
                      <div className="py-2">
                        {favoriteItems.map((item) => (
                          <div key={item.favoriteID} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              {/* Product image */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.product.thumbnail}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Product info */}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/product/${item.product.productID}`}
                                  className={`text-sm font-medium text-gray-900 truncate block ${theme === 'tet' ? 'hover:text-red-600' : 'hover:text-blue-600'}`}
                                >
                                  {item.product.name}
                                </Link>
                                {/* Thêm size và màu sắc */}
                                {(item.size || item.colorName) && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {item.colorName && `${item.colorName}`}
                                    {item.colorName && item.size && ' / '}
                                    {item.size && `${item.size}`}
                                  </p>
                                )}
                                <div className="flex items-center mt-2">
                                  <span className={`text-sm mt-1 font-medium ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {item.product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ
                                  </span>
                                  <span className="mx-2">|</span>
                                  {/* Thêm note nếu có */}
                                  {item.note && (
                                    <p className="text-xs text-gray-500 mt-1 italic truncate">
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">Chưa có sản phẩm yêu thích</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {favoriteItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                      <Link
                        to="/wishlist"
                        className={`block w-full py-2 px-4 rounded-lg text-center text-sm font-medium text-white transition-colors ${theme === 'tet'
                          ? 'bg-red-600 hover:bg-white hover:text-red-500 hover:border-red-500 hover:border-2'
                          : 'bg-blue-600 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border-2'
                          }`}
                      >
                        Xem tất cả
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart with dropdown */}
              <div className="relative group">
                <Link
                  to="/cart"
                  className="relative p-2 block"
                >
                  <FaShoppingCart size={20} className={`${theme === 'tet'
                    ? 'text-yellow-300/90 hover:text-yellow-400'
                    : 'text-white hover:opacity-80'
                    } transition-opacity`} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                  {/* Arrow */}
                  <div className="absolute right-2 -top-2 w-6 h-6 bg-white transform rotate-45"></div>

                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Giỏ hàng</h3>
                      <span className={`text-sm ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}>
                        {cartCount} sản phẩm
                      </span>
                    </div>
                  </div>

                  {/* Cart items */}
                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingCart ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin"
                          style={{ borderTopColor: theme === 'tet' ? '#ef4444' : '#3b82f6' }}>
                        </div>
                      </div>
                    ) : cartItems.length > 0 ? (
                      <div className="py-2">
                        {cartItems.map((item) => (
                          <div key={item.cartID} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              {/* Product image */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.product.imageURL}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Product info */}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/product/${item.product.productID}`}
                                  className={`text-sm font-medium text-gray-900 truncate block ${theme === 'tet' ? 'hover:text-red-600' : 'hover:text-blue-600'}`}
                                >
                                  {item.product.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.color.colorName} / {item.size.name}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-sm font-medium ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}>
                                    {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ {item.originalPrice !== item.price ? <span className="text-sm text-gray-400 line-through ml-1">{item.originalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ</span> : null}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    x{item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">Giỏ hàng trống</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {cartItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                      <Link
                        to="/cart"
                        className={`block w-full py-2 px-4 rounded-lg text-center text-sm font-medium text-white transition-colors ${theme === 'tet'
                          ? 'bg-red-600 hover:bg-white hover:text-red-500 hover:border-red-500 hover:border-2'
                          : 'bg-blue-600 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border-2'
                          }`}
                      >
                        Xem giỏ hàng
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile with dropdown */}
              <div className="relative group">
                <button
                  onClick={() => toggleDropdown('account')}
                  className="p-2 text-white hover:opacity-80 transition-opacity"
                >
                  <FaUser size={20} />
                </button>

                {/* Profile dropdown */}
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                  {/* Arrow */}
                  <div className="absolute right-2 -top-2 w-6 h-6 bg-white transform rotate-45"></div>

                  {/* Profile content */}
                  <div className="relative z-10 bg-white rounded-xl">
                    {isLoggedIn ? (
                      <div className="py-2">
                        <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Tài khoản của tôi</Link>
                        <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đơn hàng</Link>
                        <div className="border-t border-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Link to="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đăng nhập</Link>
                        <Link to="/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đăng ký</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Theme toggle */}
              <button
                onClick={handleThemeToggle}
                className={`px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap ${theme === 'tet'
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
            className={`lg:hidden fixed inset-0 bg-gray-900/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${isMenuOpen
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
              <Logo />
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
                      className={`w-full px-4 py-3 pl-12 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 border-2 transition-all duration-300 ${theme === 'tet'
                        ? 'border-red-500/30 focus:border-red-500/50'
                        : 'border-blue-500/30 focus:border-blue-500/50'
                        }`}
                    />
                    <FaSearch
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    />
                    <button
                      type="submit"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${theme === 'tet'
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
                    {['Áo thun', 'Quần jean', 'Váy', 'Áo khoác', 'Quần dài', 'Áo dài'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${theme === 'tet'
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
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-white relative overflow-hidden ${location.pathname === '/'
                    ? theme === 'tet'
                      ? 'bg-red-500/20 text-yellow-300 border-b-2 border-yellow-300'
                      : 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-300'
                    : 'hover:bg-white/10'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaHome className="mr-3" size={16} />
                  <span className="relative z-10">Trang chủ</span>
                </Link>

                {/* Products Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('products')}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-300 text-white ${['/products', '/male', '/female', '/new-arrivals', '/tet-collection', '/sale', '/sale-tet'].includes(location.pathname)
                      ? theme === 'tet'
                        ? 'bg-red-500/20 text-yellow-300 border-b-2 border-yellow-300'
                        : 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-300'
                      : 'hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center">
                      <FaTshirt className="mr-3" size={16} />
                      <span>Sản phẩm</span>
                    </div>
                    <span className={`transform transition-transform duration-200 ${openDropdowns.products ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openDropdowns.products ? 'max-h-96' : 'max-h-0'}`}>
                    {theme === 'tet' ? (
                      <Link
                        to="/tet-collection"
                        className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === '/tet-collection'
                          ? theme === 'tet'
                            ? 'bg-red-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                          : 'hover:bg-white/10'
                          }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaFireAlt className="mr-3" size={16} />
                        <span>Thời trang Tết</span>
                      </Link>
                    ) : (
                      <Link
                        to="/new-arrivals"
                        className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === '/new-arrivals'
                          ? theme === 'tet'
                            ? 'bg-red-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                          : 'hover:bg-white/10'
                          }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaStar className="mr-3" size={16} />
                        <span>Hàng mới về</span>
                      </Link>
                    )}
                    <Link
                      to="/products"
                      className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === '/products'
                        ? theme === 'tet'
                          ? 'bg-red-500/20 text-yellow-300'
                          : 'bg-blue-500/20 text-blue-300'
                        : 'hover:bg-white/10'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaBoxOpen className="mr-3" size={16} />
                      <span>Tất cả sản phẩm</span>
                    </Link>
                    <Link
                      to="/male"
                      className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === '/male'
                        ? theme === 'tet'
                          ? 'bg-red-500/20 text-yellow-300'
                          : 'bg-blue-500/20 text-blue-300'
                        : 'hover:bg-white/10'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaMale className="mr-3" size={16} />
                      <span>Nam</span>
                    </Link>
                    <Link
                      to="/female"
                      className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === '/female'
                        ? theme === 'tet'
                          ? 'bg-red-500/20 text-yellow-300'
                          : 'bg-blue-500/20 text-blue-300'
                        : 'hover:bg-white/10'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaFemale className="mr-3" size={16} />
                      <span>Nữ</span>
                    </Link>
                    <Link
                      to={theme === 'tet' ? '/sale-tet' : '/sale'}
                      className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === (theme === 'tet' ? '/sale-tet' : '/sale')
                        ? theme === 'tet'
                          ? 'bg-red-500/20 text-yellow-300'
                          : 'bg-blue-500/20 text-blue-300'
                        : 'hover:bg-white/10'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaPercent className="mr-3" size={16} />
                      <span>{theme === 'tet' ? 'Giảm giá Tết' : 'Giảm giá'}</span>
                    </Link>
                  </div>
                </div>

                {/* News */}
                <Link
                  to="/news"
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === '/news'
                    ? theme === 'tet'
                      ? 'bg-red-500/20 text-yellow-300 border-b-2 border-yellow-300'
                      : 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-300'
                    : 'hover:bg-white/10'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaNewspaper className="mr-3" size={16} />
                  <span>Tin tức</span>
                </Link>

                {/* About */}
                <Link
                  to="/about"
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-white ${location.pathname === '/about'
                    ? theme === 'tet'
                      ? 'bg-red-500/20 text-yellow-300 border-b-2 border-yellow-300'
                      : 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-300'
                    : 'hover:bg-white/10'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaInfoCircle className="mr-3" size={16} />
                  <span>Giới thiệu</span>
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
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-300 text-white relative overflow-hidden ${['/profile', '/orders'].includes(location.pathname)
                          ? theme === 'tet'
                            ? 'bg-red-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                          : 'hover:bg-white/10'
                          }`}
                      >
                        <span className="relative z-10">Tài khoản của tôi</span>
                        <span className={`transform transition-transform duration-200 ${openDropdowns.account ? 'rotate-180' : ''}`}>▼</span>
                        <span className={`absolute bottom-0 left-0 h-0.5 ${theme === 'tet' ? 'bg-yellow-400' : 'bg-blue-400'
                          } transition-all duration-300 ${['/profile', '/orders'].includes(location.pathname) ? 'w-full' : 'w-0'
                          }`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${openDropdowns.account ? 'max-h-96 mb-4 border-b border-white/10 pb-4' : 'max-h-0'}`}>
                        <Link
                          to="/profile"
                          className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white relative overflow-hidden ${location.pathname === '/profile'
                            ? theme === 'tet'
                              ? 'bg-red-500/20 text-yellow-300'
                              : 'bg-blue-500/20 text-blue-300'
                            : 'hover:bg-white/10'
                            }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FaUser className="mr-3" size={16} />
                          <span className="relative z-10">Thông tin tài khoản</span>
                        </Link>
                        <Link
                          to="/orders"
                          className={`flex items-center px-9 py-2 rounded-lg transition-all duration-300 text-white relative overflow-hidden ${location.pathname === '/orders'
                            ? theme === 'tet'
                              ? 'bg-red-500/20 text-yellow-300'
                              : 'bg-blue-500/20 text-blue-300'
                            : 'hover:bg-white/10'
                            }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FaClipboardList className="mr-3" size={16} />
                          <span className="relative z-10">Đơn hàng</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center px-9 py-2 text-red-500 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                        >
                          <FaSignOutAlt className="mr-3" size={16} />
                          <span className="relative z-10">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className={`flex items-center px-4 py-2 transition-all duration-300 text-white relative overflow-hidden rounded-lg ${location.pathname === '/login'
                          ? theme === 'tet'
                            ? 'bg-red-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                          : 'hover:bg-white/10'
                          }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUser className="mr-3" size={16} />
                        <span className="relative z-10">Đăng nhập</span>
                      </Link>
                      <Link
                        to="/register"
                        className={`flex items-center px-4 py-2 transition-all duration-300 text-white relative overflow-hidden rounded-lg mb-4 border-b border-white/10 pb-4 ${location.pathname === '/register'
                          ? theme === 'tet'
                            ? 'bg-red-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                          : 'hover:bg-white/10'
                          }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUserPlus className="mr-3" size={16} />
                        <span className="relative z-10">Đăng ký</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 space-y-2">
                <Link
                  to="/wishlist"
                  className={`flex items-center px-4 py-2 transition-all duration-300 text-white relative overflow-hidden rounded-lg ${location.pathname === '/wishlist'
                    ? theme === 'tet'
                      ? 'bg-red-500/20 text-yellow-300'
                      : 'bg-blue-500/20 text-blue-300'
                    : 'hover:bg-white/10'
                    }`}
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
                  <span className="relative z-10">Yêu thích</span>
                  <span className={`absolute bottom-0 left-0 h-0.5 ${theme === 'tet' ? 'bg-yellow-400' : 'bg-blue-400'
                    } transition-all duration-300 ${location.pathname === '/wishlist' ? 'w-full' : 'w-0'
                    }`} />
                </Link>
                <Link
                  to="/cart"
                  className={`flex items-center px-4 py-2 transition-all duration-300 text-white relative overflow-hidden rounded-lg ${location.pathname === '/cart'
                    ? theme === 'tet'
                      ? 'bg-red-500/20 text-yellow-300'
                      : 'bg-blue-500/20 text-blue-300'
                    : 'hover:bg-white/10'
                    }`}
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
                  <span className="relative z-10">Giỏ hàng</span>
                  <span className={`absolute bottom-0 left-0 h-0.5 ${theme === 'tet' ? 'bg-yellow-400' : 'bg-blue-400'
                    } transition-all duration-300 ${location.pathname === '/cart' ? 'w-full' : 'w-0'
                    }`} />
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
      <main className={`flex-1 rounded-lg shadow-lg ${theme === 'tet'
        ? 'bg-red-50' // Gradient màu đỏ-vàng cho theme Tết
        : 'bg-blue-50' // Gradient màu xanh-tím cho theme thường
        }`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`${theme === 'tet' ? 'bg-red-900' : 'bg-gray-900'} text-white py-8`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Thông tin cửa hàng */}
            <div>
              <div className="mb-6 flex items-center">
                <img
                  src="/logo.png"
                  alt="KTT Store Logo"
                  className="h-16 w-auto object-contain mr-4"
                />
                <Logo />
              </div>

              {/* Thông tin liên hệ với hiệu ứng hover mới */}
              <div className="space-y-2">
                <p className={`text-sm ${theme === 'tet' ? 'text-yellow-100' : 'text-gray-300'}`}>
                  Địa chỉ: &nbsp;
                  <a
                    href={`https://maps.google.com/?q=${shopInfo.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative group inline-flex items-center ${theme === 'tet'
                      ? 'text-yellow-300 hover:text-yellow-500'
                      : 'text-blue-300 hover:text-blue-500'
                      } transition-colors duration-300`}
                  >
                    <span>{shopInfo.address}</span>
                    <FaMapMarker size={16} className="ml-1" />
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-400'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </a>
                </p>

                <p className={`text-sm ${theme === 'tet' ? 'text-yellow-100' : 'text-gray-300'}`}>
                  Điện thoại: &nbsp;
                  <a
                    href={`tel:${shopInfo.phone}`}
                    className={`relative group inline-block ${theme === 'tet'
                      ? 'text-yellow-300 hover:text-yellow-500'
                      : 'text-blue-300 hover:text-blue-500'
                      } transition-colors duration-300`}
                  >
                    <span>{shopInfo.phone}</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-400'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </a>
                </p>

                <p className={`text-sm ${theme === 'tet' ? 'text-yellow-100' : 'text-gray-300'}`}>
                  Email: &nbsp;
                  <a
                    href={`mailto:${shopInfo.email}`}
                    className={`relative group inline-block ${theme === 'tet'
                      ? 'text-yellow-300 hover:text-yellow-500'
                      : 'text-blue-300 hover:text-blue-500'
                      } transition-colors duration-300`}
                  >
                    <span>{shopInfo.email}</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-400'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </a>
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Chính sách</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/policy"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Tất cả chính sách</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/policy/shipping"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Chính sách vận chuyển</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/policy/return"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Chính sách đổi trả</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/policy/payment"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Chính sách thanh toán</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Hỗ trợ khách hàng</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/support"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Trung tâm hỗ trợ</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/faq"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Câu hỏi thường gặp</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/size-guide"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Hướng dẫn chọn size</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/contact"
                    className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                      ? 'hover:text-yellow-300'
                      : 'hover:text-blue-300'
                      } transition-colors duration-300`}
                  >
                    <span>Liên hệ - Báo cáo lỗi</span>
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                      ? 'bg-yellow-300'
                      : 'bg-blue-300'
                      } transition-all duration-300 group-hover:w-full`}></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Kết nối với chúng tôi</h3>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/connect"
                  className={`text-gray-300 relative group block w-fit ${theme === 'tet'
                    ? 'hover:text-yellow-300'
                    : 'hover:text-blue-300'
                    } transition-colors duration-300`}
                >
                  <span>Tất cả kênh kết nối</span>
                  <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${theme === 'tet'
                    ? 'bg-yellow-300'
                    : 'bg-blue-300'
                    } transition-all duration-300 group-hover:w-full`}></span>
                </Link>
                <div className="flex space-x-6 mt-2">
                  <a
                    href="#"
                    target="_blank"
                    onClick={(e) => e.preventDefault()}
                    rel="noopener noreferrer"
                    className={`transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-[#1877F2]`}
                  >
                    <FaFacebook className="text-2xl" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    onClick={(e) => e.preventDefault()}
                    rel="noopener noreferrer"
                    className={`transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-[#E4405F]`}
                  >
                    <FaInstagram className="text-2xl" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    onClick={(e) => e.preventDefault()}
                    rel="noopener noreferrer"
                    className={`transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-white`}
                  >
                    <FaTiktok className="text-2xl" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    onClick={(e) => e.preventDefault()}
                    rel="noopener noreferrer"
                    className={`transform transition-all duration-300 hover:scale-110 text-gray-300 hover:text-[#FF0000]`}
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
        className={`fixed right-6 bottom-28 p-3 rounded-full shadow-lg transition-all duration-300 transform ${showScrollTop
          ? 'translate-y-0 opacity-100 visible'
          : 'translate-y-10 opacity-0 invisible'
          } ${theme === 'tet'
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
                  className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 ${theme === 'tet'
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
      <AIChat />
    </div>
  );
};

export default CustomerLayout;
