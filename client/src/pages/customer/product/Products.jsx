// Products.jsx - Trang danh sách sản phẩm
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaTags, FaSearch, FaFilter, FaSortAmountDown, FaThList, FaThLarge, FaChevronLeft, FaChevronRight, FaChevronDown, FaTimes, FaFire, FaClock, FaSortAmountUp, FaStar } from 'react-icons/fa';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import { getColorCode, isPatternOrStripe, getBackgroundSize } from '../../../utils/colorUtils';
import Loading from '../../../components/Products/Loading';
import Pagination from '../../../components/Products/Pagination';
import ColorTooltip from '../../../components/Products/ColorTooltip';
import SizeTooltip from '../../../components/Products/SizeTooltip';
import ProductThumbnails from '../../../components/Products/ProductThumbnails';

const Products = () => {
  // Lấy theme từ context
  const { theme } = useTheme();
  // Lấy search params từ URL
  const [searchParams] = useSearchParams();
  // State lưu trữ sản phẩm gốc
  const [products, setProducts] = useState([]);
  // State lưu trữ sản phẩm sau khi lọc
  const [filteredProducts, setFilteredProducts] = useState([]);
  // State lưu trạng thái loading
  const [loading, setLoading] = useState(false);
  // State lưu trữ phân trang
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });
  // Lưu trữ danh sách khuyến mãi
  const [promotions, setPromotions] = useState([]);
  // Lưu trữ ảnh đang được chọn cho mỗi sản phẩm
  const [selectedImages, setSelectedImages] = useState({});
  // Quản lý tooltip đang hiển thị
  const [activeColorTooltip, setActiveColorTooltip] = useState(null);
  // Quản lý trạng thái bộ lọc mobile
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // Thêm state quản lý tooltip size đang active
  const [activeSizeTooltip, setActiveSizeTooltip] = useState(null);

  // State quản lý các bộ lọc
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '', // Từ khóa tìm kiếm
    categories: [], // Danh mục đã chọn
    priceRanges: [], // Khoảng giá đã chọn
    inStock: false, // Lọc theo tình trạng còn hàng
    sort: 'popular' // Sắp xếp mặc định theo độ phổ biến
  });

  // Định nghĩa các tùy chọn cho bộ lọc
  const filterOptions = {
    // Các khoảng giá
    priceRanges: [
      { id: '0-100', label: 'Dưới 100.000đ', range: [0, 100000] },
      { id: '100-300', label: '100.000đ - 300.000đ', range: [100000, 300000] },
      { id: '300-500', label: '300.000đ - 500.000đ', range: [300000, 500000] },
      { id: '500-1000', label: '500.000đ - 1.000.000đ', range: [500000, 1000000] },
      { id: '1000-up', label: 'Trên 1.000.000đ', range: [1000000, Infinity] }
    ],
    // Các tùy chọn sắp xếp
    sortOptions: [
      { id: 'popular', label: 'Phổ biến nhất', icon: FaFire },
      { id: 'newest', label: 'Mới nhất', icon: FaClock },
      { id: 'price-asc', label: 'Giá tăng dần', icon: FaSortAmountUp },
      { id: 'price-desc', label: 'Giá giảm dần', icon: FaSortAmountDown }
    ]
  };

  // Hàm chuyển đổi giá từ string sang number
  const convertPriceToNumber = (priceString) => {
    if (!priceString) return 0;
    // Nếu đã là số thì trả về luôn
    if (typeof priceString === 'number') return priceString;
    // Nếu là chuỗi thì xử lý bỏ dấu chấm
    const stringPrice = String(priceString);
    return parseInt(stringPrice.replace(/\./g, ''), 10) || 0;
  };

  // Hàm format giá tiền
  const formatPrice = (price) => {
    if (!price) return '0';
    // Chuyển thành string và format với dấu chấm
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Lấy danh sách danh mục duy nhất từ sản phẩm
  const categories = useMemo(() => {
    if (!products.length) return [];
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return uniqueCategories.map(cat => ({
      id: cat,
      label: cat
    }));
  }, [products]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (type, value) => {
    // Reset trang về 1 khi thay đổi bất kỳ bộ lọc nào
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));

    setFilters(prev => {
      if (Array.isArray(prev[type])) {
        if (prev[type].includes(value)) {
          // Nếu đã có thì xóa
          return {
            ...prev,
            [type]: prev[type].filter(item => item !== value)
          };
        } else {
          // Nếu chưa có thì thêm
          return {
            ...prev,
            [type]: [...prev[type], value]
          };
        }
      } else {
        // Nếu không phải array thì gán trực tiếp
        return {
          ...prev,
          [type]: value
        };
      }
    });
  };

  // Hàm sắp xếp size theo thứ tự chuẩn
  const sortSizes = (sizes) => {
    const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
    return [...sizes].sort((a, b) => {
      return (sizeOrder[a.size] || 99) - (sizeOrder[b.size] || 99); // nếu không có size thì sắp xếp về cuối
    });
  };

  // Effect xử lý lọc và sắp xếp sản phẩm
  useEffect(() => {
    // Lọc sản phẩm theo các điều kiện
    const filtered = products.filter(product => {
      // Lọc theo từ khóa tìm kiếm
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Lọc theo danh mục
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }

      // Lọc theo khoảng giá
      if (filters.priceRanges.length > 0) {
        const productPrice = convertPriceToNumber(product.price);
        const matchesRange = filters.priceRanges.some(rangeId => {
          const range = filterOptions.priceRanges.find(r => r.id === rangeId);
          if (!range) return false;
          return productPrice >= range.range[0] && productPrice <= range.range[1];
        });
        if (!matchesRange) return false;
      }

      // Lọc theo tình trạng còn hàng
      if (filters.inStock && product.stock === 0) {
        return false;
      }

      return true;
    });

    // Sắp xếp sản phẩm
    const sorted = [...filtered].sort((a, b) => {
      if (!filters.sort) return 0;

      switch (filters.sort) {
        case 'popular': // Sắp xếp theo độ phổ biến (số lượng đã bán)
          return b.sold - a.sold;
        case 'newest': // Sắp xếp theo thời gian tạo
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price-asc': // Sắp xếp giá tăng dần
          return convertPriceToNumber(a.price) - convertPriceToNumber(b.price);
        case 'price-desc': // Sắp xếp giá giảm dần
          return convertPriceToNumber(b.price) - convertPriceToNumber(a.price);
        default:
          return 0;
      }
    });

    // Cập nhật state và tính toán phân trang
    setFilteredProducts(sorted);
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(sorted.length / 16),
      totalProducts: sorted.length
    }));
  }, [products, filters]);

  // Tính toán sản phẩm hiển thị cho trang hiện tại
  const displayedProducts = filteredProducts.slice(
    (pagination.currentPage - 1) * 16,
    pagination.currentPage * 16
  );

  // State quản lý dropdown
  const [openDropdown, setOpenDropdown] = useState(null);

  // Xử lý đóng/mở dropdown
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hàm lấy danh sách sản phẩm từ API
  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Thêm các params cho API
      if (filters.search) params.append('search', filters.search);
      if (filters.categories.length > 0) params.append('category', filters.categories.join(','));
      if (filters.sort) params.append('sort', filters.sort);

      // Thêm params phân trang
      params.append('page', pagination.currentPage);
      params.append('limit', 15);

      // Gọi API và cập nhật state
      const response = await axiosInstance.get(`/api/products/basic?${params.toString()}`);
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.data.products.length / 15),
        totalProducts: response.data.products.length
      }));
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách khuyến mãi từ API
  const fetchPromotions = async () => {
    try {
      const response = await axiosInstance.get('/api/promotions/active');
      if (response.data && response.data.success) {
        setPromotions(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách khuyến mãi(Products.jsx):', error);
    }
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchAllProducts();
    fetchPromotions();
  }, []);

  // Cập nhật bộ lọc khi URL thay đổi
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({
        ...prev,
        search: searchQuery
      }));
    }
  }, [searchParams]);

  // Xử lý khi click vào màu sắc
  const handleColorClick = (e, productId, colorIndex) => {
    e.preventDefault();
    setSelectedImages(prev => ({
      ...prev,
      [productId]: {
        colorIndex: colorIndex,
        imageIndex: 0
      }
    }));
  };

  // Xử lý khi click vào thumbnail
  const handleThumbnailClick = (e, productId, imageIndex) => {
    e.preventDefault();
    setSelectedImages(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        imageIndex: imageIndex
      }
    }));
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Render giao diện chính
  if (loading) {
    return (
      <Loading 
        theme={theme} 
        icon={FaStar}
        title="SẢN PHẨM"
        subtitle={theme === 'tet' ? 'Đón xuân sang - Giảm giá sốc' : 'Khuyến mãi cực lớn - Giá siêu hời'}
        breadcrumbText="Sản phẩm"
      />
    );
  }

  return (
    // Container chính với gradient background tùy theo theme
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
      {/* Banner */}
      <PageBanner
        theme={theme}
        icon={FaStar}
        title="SẢN PHẨM"
        subtitle={theme === 'tet'
          ? 'Đón xuân sang - Giảm giá sốc'
          : 'Khuyến mãi cực lớn - Giá siêu hời'
        }
        breadcrumbText="Sản phẩm"
      />

      {/* Container chứa nội dung chính */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="relative z-10 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-grow">
                {/* Search */}
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="h-10 px-3 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
                  >
                    <FaFilter className="w-4 h-4 text-gray-500" />
                    <span className="hidden sm:inline">Bộ lọc</span>
                    {(filters.categories.length > 0 || filters.priceRanges.length > 0 || filters.inStock || filters.sort) && (
                      <span className="flex items-center justify-center w-4 h-4 text-[10px] bg-blue-500 text-white rounded-full">
                        {filters.categories.length + filters.priceRanges.length + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Nút chuyển đổi view và số lượng sản phẩm */}
              <div className="flex items-center gap-4">
                {!loading && (
                  <div className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium text-gray-900">{filteredProducts.length}</span> sản phẩm
                  </div>
                )}
              </div>
            </div>

            {/* Bộ lọc đang chọn */}
            {(filters.categories.length > 0 || filters.priceRanges.length > 0 || filters.inStock || filters.sort) && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase">Bộ lọc đang chọn:</span>
                {filters.categories.map((category, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100"
                  >
                    <span>{categories.find(cat => cat.id === category).label}</span>
                    <button
                      onClick={() => handleFilterChange('categories', category)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Bộ lọc giá */}
                {filters.priceRanges.map((range, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100"
                  >
                    <span>{filterOptions.priceRanges.find(r => r.id === range).label}</span>
                    <button
                      onClick={() => handleFilterChange('priceRanges', range)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Bộ lọc tồn kho */}
                {filters.inStock && (
                  <div className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100">
                    <span>Còn hàng</span>
                    <button
                      onClick={() => handleFilterChange('inStock', false)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Bộ lọc sắp xếp */}
                {filters.sort && (
                  <div className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100">
                    <span>{filterOptions.sortOptions.find(option => option.id === filters.sort).label}</span>
                    <button
                      onClick={() => handleFilterChange('sort', null)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Nút xóa tất cả */}
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      categories: [],
                      priceRanges: [],
                      inStock: false,
                      sort: null
                    });
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Container chứa nội dung chính */}
        <div className="relative">
          {/* Products Grid */}
          {!Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
            // Hiển thị thông báo khi không tìm thấy sản phẩm
            <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <FaSearch className="text-blue-500 text-4xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
            </div>
          ) : (
            <>
              {/* Grid sản phẩm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {displayedProducts.map((product) => {
                  return (
                    <Link
                      key={product.productID}
                      to={`/product/${product.productID}`}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {/* Ảnh chính */}
                        <img
                          src={
                            product.colors?.[selectedImages[product.productID]?.colorIndex || 0]
                              ?.images?.[selectedImages[product.productID]?.imageIndex || 0]
                            || product.thumbnail
                          }
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Overlay gradient khi hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme === 'tet'
                            ? 'bg-gradient-to-t from-red-900/20 via-transparent to-transparent'
                            : 'bg-gradient-to-t from-blue-900/20 via-transparent to-transparent'
                          }`} />

                        {/* Overlay khi hết hàng */}
                        {!product.inStock && (
                          <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[2px] ${theme === 'tet'
                              ? 'bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40'
                              : 'bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-blue-900/40'
                            }`}>
                            <span className={`font-medium px-3 py-1.5 rounded-full text-sm text-white ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                              }`}>
                              Hết hàng
                            </span>
                          </div>
                        )}

                        {/* Badge số lượng còn lại */}
                        {product.totalStock <= 5 && product.totalStock > 0 && (
                          <div className="absolute top-3 right-3">
                            <span className={`text-white text-xs font-medium px-3 py-1.5 rounded-full ${theme === 'tet' ? 'bg-red-500' : 'bg-orange-500'
                              }`}>
                              Chỉ còn {product.totalStock}
                            </span>
                          </div>
                        )}

                        {/* Badge giảm giá */}
                        {product.discount > 0 && (
                          <div className="absolute top-3 left-3">
                            <span className={`text-white text-xs font-medium px-3 py-1.5 rounded-full ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                              }`}>
                              -{product.discount}%
                            </span>
                          </div>
                        )}

                        {/* Thumbnails */}
                        {product.colors?.[selectedImages[product.productID]?.colorIndex || 0]?.images?.length > 1 && (
                          <ProductThumbnails 
                            images={product.colors[selectedImages[product.productID]?.colorIndex || 0].images}
                            productID={product.productID}
                            productName={product.name}
                            selectedImages={selectedImages}
                            theme={theme}
                            onThumbnailClick={handleThumbnailClick}
                          />
                        )}
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="p-6">
                        <div>
                          {/* Danh mục sản phẩm */}
                          <div className="mb-2">
                            <span className="text-sm text-blue-500 font-medium">{product.category}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                            {product.name}
                          </h3>

                          {/* Giá sản phẩm */}
                          <div className="flex items-baseline gap-2 mb-4">
                            {product.promotion ? (
                              <>
                                <span className="text-lg font-bold text-red-500">
                                  {formatPrice(Math.round(Number(product.price) * (1 - product.discount / 100)))}đ
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.price)}đ
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(product.price)}đ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-3 mt-4">
                          {/* Thông tin màu sắc */}
                          {product.colors && product.colors.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Màu sắc:</span>
                              <div className="flex items-center gap-1">
                                {product.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="group relative p-1"
                                    title={color.colorName}
                                    onClick={(e) => handleColorClick(e, product.productID, index)}
                                    onMouseEnter={() => setActiveColorTooltip(`${product.productID}-${index}`)}
                                    onMouseLeave={() => setActiveColorTooltip(null)}
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-full border shadow-sm cursor-pointer transition-all hover:scale-110 ${color.colorName.toLowerCase() === 'trắng' ? 'border-gray-300' : ''
                                        } ${selectedImages[product.productID]?.colorIndex === index
                                          ? 'ring-2 ring-blue-500 ring-offset-2'
                                          : ''
                                        }`}
                                      style={{
                                        background: getColorCode(color.colorName),
                                        backgroundSize: getBackgroundSize(color.colorName)
                                      }}
                                    />
                                    {/* Tooltip tên màu */}
                                    <ColorTooltip 
                                      isVisible={activeColorTooltip === `${product.productID}-${index}`}
                                      colorName={color.colorName}
                                      theme={theme}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Thông tin kích thước */}
                          {product.colors && (
                            <div className="flex items-center gap-2">
                              {/* Label size */}
                              <span className="text-sm text-gray-500">Size:</span>
                              {/* Danh sách size */}
                              <div className="flex items-center gap-1">
                                {/* Map qua từng size và sắp xếp theo kích thước */}
                                {sortSizes(product.colors[selectedImages[product.productID]?.colorIndex || 0].sizes).map((size, index) => (
                                  <div
                                    key={index}
                                    className="relative"
                                    onMouseEnter={(e) => {
                                      e.preventDefault(); // Ngăn chặn sự kiện click lan truyền lên Link
                                      e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền ra các phần tử khác
                                      setActiveSizeTooltip(`${product.productID}-${product.colors[selectedImages[product.productID]?.colorIndex || 0].colorName}-${size.size}`);
                                    }}
                                    onMouseLeave={(e) => {
                                      e.preventDefault(); // Ngăn chặn sự kiện click lan truyền lên Link
                                      e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền ra các phần tử khác
                                      setActiveSizeTooltip(null);
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault(); // Ngăn chặn sự kiện click lan truyền lên Link
                                      e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền ra các phần tử khác
                                    }}
                                  >
                                    {/* Mỗi size được hiển thị trong một phần tử div */}
                                    <div
                                      className={`min-w-[2.5rem] h-8 flex items-center justify-center text-sm rounded cursor-help transition-all ${
                                        size.stock > 0
                                          ? theme === 'tet'
                                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                          : 'bg-gray-50 text-gray-400'
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault(); // Ngăn chặn sự kiện click lan truyền lên Link
                                        e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền ra các phần tử khác
                                      }}
                                    >
                                      {/* Hiển thị kích thước */}
                                      {size.size}
                                    </div>
                                    {/* Tooltip */}
                                    <SizeTooltip 
                                      isVisible={activeSizeTooltip === `${product.productID}-${product.colors[selectedImages[product.productID]?.colorIndex || 0].colorName}-${size.size}`}
                                      stock={size.stock}
                                      colorName={product.colors[selectedImages[product.productID]?.colorIndex || 0].colorName}
                                      theme={theme}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Thông tin tồn kho và số màu */}
                          <div className="flex items-center justify-between">
                            {product.colorCount > 1 && (
                              <span className="text-sm text-gray-500">
                                {product.colorCount} màu sắc
                              </span>
                            )}
                            {product.totalStock > 0 ? (
                              <span className="text-sm text-green-600">
                                Còn {product.totalStock} sản phẩm
                              </span>
                            ) : (
                              <span className="text-sm text-red-500">
                                Hết hàng
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Thông tin khuyến mãi */}
                        {product.promotion && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-700 font-medium">
                              {product.promotion.name}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              {product.promotion.description}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              Kết thúc: {new Date(product.promotion.endDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination 
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  theme="blue"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal bộ lọc */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsMobileFilterOpen(false)}></div>
            </div>

            {/* Nội dung modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    {/* Header modal */}
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Bộ lọc sản phẩm
                      </h3>
                      <button
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Bộ lọc sắp xếp */}
                    <div className="mb-8">
                      <h4 className="font-medium text-gray-900 mb-3">Sắp xếp theo</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {filterOptions.sortOptions.map(option => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleFilterChange('sort', option.id)}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                                ${filters.sort === option.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              <Icon className={filters.sort === option.id ? 'text-white' : 'text-gray-500'} />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bộ lọc danh mục */}
                    <div className="mb-8">
                      <h4 className="font-medium text-gray-900 mb-3">Danh mục</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => handleFilterChange('categories', category.id)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                              ${filters.categories.includes(category.id)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bộ lọc khoảng giá */}
                    <div className="mb-8">
                      <h4 className="font-medium text-gray-900 mb-3">Khoảng giá</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {filterOptions.priceRanges.map(range => (
                          <button
                            key={range.id}
                            onClick={() => handleFilterChange('priceRanges', range.id)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                              ${filters.priceRanges.includes(range.id)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bộ lọc tồn kho */}
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700">Chỉ hiện sản phẩm còn hàng</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer modal */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none sm:w-auto sm:text-sm"
                >
                  Áp dụng ({filters.categories.length + filters.priceRanges.length + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      search: '',
                      categories: [],
                      priceRanges: [],
                      inStock: false,
                      sort: null
                    });
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
