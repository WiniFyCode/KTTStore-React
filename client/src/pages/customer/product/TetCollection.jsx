// TetCollection.jsx - Trang bộ sưu tập Tết - Hiển thị các sản phẩm áo dài dành cho dịp Tết

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaHeart, FaShoppingBag, FaTags, FaTimes, FaSortAmountUp, FaFire, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiLanternFlame } from 'react-icons/gi';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import { getProductsData } from '../../../data/ProductsData';
import PageBanner from '../../../components/PageBanner';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import { getColorCode, isPatternOrStripe, getBackgroundSize } from '../../../utils/colorUtils';
import Loading from '../../../components/Products/Loading';
import Pagination from '../../../components/Products/Pagination';
import ColorTooltip from '../../../components/Products/ColorTooltip';
import SizeTooltip from '../../../components/Products/SizeTooltip';
import ProductThumbnails from '../../../components/Products/ProductThumbnails';

const TetCollection = () => {
  // Lấy theme từ context
  const { theme } = useTheme();

  // Khởi tạo các state cần thiết
  const [products, setProducts] = useState([]); // Danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm sau khi lọc
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  }); // Trạng thái pagination
  const [selectedImages, setSelectedImages] = useState({}); // Lưu trữ ảnh đang được chọn cho mỗi sản phẩm
  const [activeTooltip, setActiveTooltip] = useState(null); // Tooltip đang active
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // Trạng thái mở/đóng modal filter trên mobile
  const productsPerPage = 12; // Số sản phẩm hiển thị trên mỗi trang
  const [activeSizeTooltip, setActiveSizeTooltip] = useState(null);

  // Định nghĩa các option cho filter
  const filterOptions = {
    // Các khoảng giá
    priceRanges: [
      { id: '0-100', label: 'Dưới 100.000đ', range: [0, 100000] },
      { id: '100-300', label: '100.000đ - 300.000đ', range: [100000, 300000] },
      { id: '300-500', label: '300.000đ - 500.000đ', range: [300000, 500000] },
      { id: '500-1000', label: '500.000đ - 1.000.000đ', range: [500000, 1000000] },
      { id: '1000-up', label: 'Trên 1.000.000đ', range: [1000000, Infinity] }
    ],
    // Các option sắp xếp
    sortOptions: [
      { id: 'popular', label: 'Phổ biến nhất', icon: FaFire },
      { id: 'newest', label: 'Mới nhất', icon: FaClock },
      { id: 'price-asc', label: 'Giá tăng dần', icon: FaSortAmountUp },
      { id: 'price-desc', label: 'Giá giảm dần', icon: FaSortAmountDown }
    ]
  };

  // State cho filter và sort
  const [filters, setFilters] = useState({
    search: '', // Từ khóa tìm kiếm
    categories: [], // Danh mục đã chọn
    priceRanges: [], // Các khoảng giá đã chọn
    inStock: false, // Lọc sản phẩm còn hàng
    sort: 'newest' // Tiêu chí sắp xếp
  });

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

  // Fetch sản phẩm áo dài từ API
  const fetchAoDaiProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/products/basic');
      // Lọc ra các sản phẩm áo dài
      const aoDaiProducts = response.data.products.filter(product => 
        product.category.toLowerCase().includes('áo dài')
      );
      setProducts(aoDaiProducts);
      setFilteredProducts(aoDaiProducts);
    } catch (error) {
      toast.error('Không thể tải danh sách áo dài');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    fetchAoDaiProducts();
  }, []);

  // Hàm tính giá sau khuyến mãi
  const calculateDiscountedPrice = (product) => {
    if (!product.promotion) return null;

    const price = convertPriceToNumber(product.price);
    const discountAmount = (price * product.promotion.discountPercent) / 100;
    const discountedPrice = price - discountAmount;
    
    const formattedPrice = formatPrice(discountedPrice);

    return {
      discountedPrice: formattedPrice,
      discountPercent: product.promotion.discountPercent,
      promotion: product.promotion
    };
  };

  // Effect xử lý lọc và sắp xếp sản phẩm khi filters hoặc products thay đổi
  useEffect(() => {
    if (!products.length) return;

    let filtered = [...products];

    // Lọc theo danh mục
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    // Lọc theo từ khóa tìm kiếm
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Lọc theo khoảng giá (nhiều khoảng giá)
    if (filters.priceRanges.length > 0) {
      filtered = filtered.filter(product => {
        const price = convertPriceToNumber(product.price);
        return filters.priceRanges.some(rangeId => {
          const selectedRange = filterOptions.priceRanges.find(r => r.id === rangeId);
          if (!selectedRange) return false;
          return price >= selectedRange.range[0] && price <= selectedRange.range[1];
        });
      });
    }

    // Lọc theo tình trạng còn hàng
    if (filters.inStock) {
      filtered = filtered.filter(product => {
        const totalStock = product.colors?.reduce((total, color) => {
          return total + color.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0);
        }, 0);
        return totalStock > 0;
      });
    }

    // Sắp xếp sản phẩm theo tiêu chí đã chọn
    switch (filters.sort) {
      case 'popular':
        filtered.sort((a, b) => b.sold - a.sold);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'price-asc':
        filtered.sort((a, b) => convertPriceToNumber(a.price) - convertPriceToNumber(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => convertPriceToNumber(b.price) - convertPriceToNumber(a.price));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalPages: Math.ceil(filtered.length / productsPerPage),
      totalProducts: filtered.length
    }));
  }, [products, filters]);

  // Xử lý phân trang
  const indexOfLastProduct = pagination.currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Lấy danh sách category duy nhất từ sản phẩm
  const categories = [...new Set(products.map(product => product.category))];

  // Hàm chuyển đổi giá từ string sang number
  const convertPriceToNumber = (priceString) => {
    if (!priceString) return 0;
    // Nếu là số thì chuyển thành string
    const stringPrice = String(priceString);
    // Xóa tất cả dấu chấm và chuyển thành số
    return parseInt(stringPrice.replace(/\./g, ''), 10) || 0;
  };

  // Hàm format giá tiền
  const formatPrice = (price) => {
    if (!price) return '0';
    // Chuyển thành string và format với dấu chấm
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Hàm sắp xếp size theo thứ tự chuẩn
  const sortSizes = (sizes) => {
    const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
    return [...sizes].sort((a, b) => {
      return (sizeOrder[a.size] || 99) - (sizeOrder[b.size] || 99);
    });
  };

  // Hàm xử lý khi click vào màu sắc
  const handleColorClick = (e, productId, colorIndex) => {
    e.preventDefault(); // Ngăn chặn chuyển trang
    setSelectedImages(prev => ({
      ...prev,
      [productId]: {
        colorIndex: colorIndex,
        imageIndex: 0 // Reset về ảnh đầu tiên của màu mới
      }
    }));
  };

  // Hàm xử lý khi click vào thumbnail
  const handleThumbnailClick = (e, productId, imageIndex) => {
    e.preventDefault(); // Ngăn chặn chuyển trang
    setSelectedImages(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        imageIndex: imageIndex
      }
    }));
  };

  // Render giao diện chính
  if (loading) {
    return (
      <Loading 
        theme={theme} 
        icon={GiLanternFlame}
        title="BỘ SƯU TẬP TẾT 2025"
        subtitle="Rực rỡ sắc xuân - Đón năm mới an khang"
        breadcrumbText="Bộ sưu tập Tết"
      />
    );
  }

  return (
    // Container chính với gradient background tùy theo theme
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
      {/* Banner trang */}
      <PageBanner
        theme={theme}
        icon={GiLanternFlame}
        title="BỘ SƯU TẬP TẾT 2025"
        subtitle="Rực rỡ sắc xuân - Đón năm mới an khang"
        breadcrumbText="Bộ sưu tập Tết"
      />

      {/* Container chứa nội dung chính */}
      <div className="container mx-auto px-4 py-8">
        {/* Trang trí tết */}
        <div className="relative">
          <div className="absolute -top-16 left-0 w-32 h-32 bg-contain bg-no-repeat bg-center opacity-50"
          />
          <div className="absolute -top-16 right-0 w-32 h-32 bg-contain bg-no-repeat bg-center opacity-50"
          />
        </div>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="relative z-10 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4">
            {/* Phần tìm kiếm và điều khiển bộ lọc */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-grow">
                {/* Ô tìm kiếm */}
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    placeholder="Tìm kiếm áo dài Tết..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-10"
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Nút bộ lọc */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="h-10 px-3 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
                  >
                    <FaFilter className="w-4 h-4 text-gray-500" />
                    <span className="hidden sm:inline">Bộ lọc</span>
                    {(filters.categories.length > 0 || filters.priceRanges.length > 0 || filters.inStock || filters.sort) && (
                      <span className="flex items-center justify-center w-4 h-4 text-[10px] bg-red-500 text-white rounded-full">
                        {filters.categories.length + filters.priceRanges.length + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Hiển thị số lượng sản phẩm */}
              <div className="flex items-center gap-4">
                {!loading && (
                  <div className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium text-gray-900">{filteredProducts.length}</span> sản phẩm
                  </div>
                )}
              </div>
            </div>

            {/* Hiển thị các bộ lọc đang được áp dụng */}
            {(filters.categories.length > 0 || filters.priceRanges.length > 0 || filters.inStock || filters.sort) && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase">Bộ lọc đang chọn:</span>
                
                {/* Hiển thị các danh mục đã chọn */}
                {filters.categories.map((category, index) => (
                  <div key={index} className="px-3 py-1 bg-red-50 rounded-full text-sm text-red-700 flex items-center gap-1.5 transition-all hover:bg-red-100">
                    <span>{category}</span>
                    <button
                      onClick={() => handleFilterChange('categories', category)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Hiển thị các khoảng giá đã chọn */}
                {filters.priceRanges.map((rangeId) => (
                  <div key={rangeId} className="px-3 py-1 bg-red-50 rounded-full text-sm text-red-700 flex items-center gap-1.5 transition-all hover:bg-red-100">
                    <span>{filterOptions.priceRanges.find(r => r.id === rangeId)?.label}</span>
                    <button
                      onClick={() => handleFilterChange('priceRanges', rangeId)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Hiển thị trạng thái lọc còn hàng */}
                {filters.inStock && (
                  <div className="px-3 py-1 bg-red-50 rounded-full text-sm text-red-700 flex items-center gap-1.5 transition-all hover:bg-red-100">
                    <span>Còn hàng</span>
                    <button
                      onClick={() => handleFilterChange('inStock', false)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Hiển thị kiểu sắp xếp đã chọn */}
                {filters.sort && (
                  <div className="px-3 py-1 bg-red-50 rounded-full text-sm text-red-700 flex items-center gap-1.5 transition-all hover:bg-red-100">
                    <span>{filterOptions.sortOptions.find(option => option.id === filters.sort)?.label}</span>
                    <button
                      onClick={() => handleFilterChange('sort', null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Nút xóa tất cả bộ lọc */}
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
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsMobileFilterOpen(false)}></div>
              </div>

              {/* Filter Modal Content */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      {/* Modal Header */}
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

                      {/* Sort Options */}
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
                                    ? 'bg-red-500 text-white'
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

                      {/* Danh mục */}
                      <div className="mb-8">
                        <h4 className="font-medium text-gray-900 mb-3">Danh mục</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map(category => (
                            <button
                              key={category}
                              onClick={() => handleFilterChange('categories', category)}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${filters.categories.includes(category)
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Khoảng giá */}
                      <div className="mb-8">
                        <h4 className="font-medium text-gray-900 mb-3">Khoảng giá</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.priceRanges.map(range => (
                            <button
                              key={range.id}
                              onClick={() => handleFilterChange('priceRanges', range.id)}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${filters.priceRanges.includes(range.id)
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tình trạng còn hàng */}
                      <div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.inStock}
                            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                          <span className="ms-3 text-sm font-medium text-gray-700">Chỉ hiện sản phẩm còn hàng</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none sm:w-auto sm:text-sm"
                  >
                    Áp dụng ({filters.categories.length + (filters.priceRanges.length > 0 ? filters.priceRanges.length : 0) + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)})
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

        {/* Products Grid */}
        {!Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
          // Hiển thị thông báo khi không tìm thấy sản phẩm
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <FaSearch className="text-red-500 text-4xl" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
          </div>
        ) : (
          <>
            {/* Tết Collection Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-400 text-white py-4 px-6 rounded-xl mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Bộ Sưu Tập Áo Dài Tết 2025</h3>
                <p className="text-red-100">Đón xuân sang - Phát tài phát lộc</p>
              </div>
              <GiLanternFlame className="text-3xl text-yellow-300" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {currentProducts.map((product) => {
                if (!product) return null;

                // Tính toán tổng stock của sản phẩm
                const totalStock = product.colors?.reduce((total, color) => {
                  return total + color.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0);
                }, 0);

                // Kiểm tra xem sản phẩm có còn hàng không
                const isInStock = totalStock > 0;

                const discountInfo = calculateDiscountedPrice(product);

                return (
                  <Link 
                    key={product.productID}
                    to={`/product/${product.productID}`}
                    className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-red-100"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={
                          product.colors?.[selectedImages[product.productID]?.colorIndex || 0]
                            ?.images?.[selectedImages[product.productID]?.imageIndex || 0]
                          || product.thumbnail
                        }
                        alt={product.name}
                        className={`w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ${
                          !isInStock ? 'opacity-50' : ''
                        }`}
                      />

                      {/* Overlay gradient khi hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-red-900/20 via-transparent to-transparent" />

                      {/* Overlay khi hết hàng */}
                      {!isInStock && (
                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40">
                          <span className="font-medium px-3 py-1.5 rounded-full text-sm text-white bg-red-500">
                            Hết hàng
                          </span>
                        </div>
                      )}

                      {/* Badge số lượng còn lại */}
                      {totalStock <= 5 && totalStock > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-red-500">
                            Chỉ còn {totalStock}
                          </span>
                        </div>
                      )}

                      {/* Badge giảm giá */}
                      {discountInfo && (
                        <div className="absolute top-3 left-3">
                          <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-red-500">
                          -{discountInfo.discountPercent}%
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

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="text-sm text-red-500 font-medium">{product.category}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        {discountInfo ? (
                          <>
                            <span className="text-lg font-bold text-red-500">
                              {formatPrice(convertPriceToNumber(discountInfo.discountedPrice))}đ
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(convertPriceToNumber(product.price))}đ
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(convertPriceToNumber(product.price))}đ
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-3 mt-4">
                        {/* Màu sắc */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Màu sắc:</span>
                            <div className="flex items-center gap-1">
                              {product.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="group relative p-1"
                                  onClick={(e) => handleColorClick(e, product.productID, index)}
                                  onMouseEnter={() => setActiveTooltip(`${product.productID}-${index}`)}
                                  onMouseLeave={() => setActiveTooltip(null)}
                                >
                                  <div
                                    className={`w-7 h-7 rounded-full border shadow-sm cursor-pointer transition-all hover:scale-110 ${
                                      color.colorName.toLowerCase() === 'trắng' ? 'border-gray-300' : ''
                                    } ${
                                      selectedImages[product.productID]?.colorIndex === index 
                                        ? 'ring-2 ring-red-500 ring-offset-2'
                                        : ''
                                    }`}
                                    style={{
                                      background: getColorCode(color.colorName),
                                      backgroundSize: getBackgroundSize(color.colorName)
                                    }}
                                  />
                                  {/* Tooltip màu sắc */}
                                  <ColorTooltip 
                                    isVisible={activeTooltip === `${product.productID}-${index}`}
                                    colorName={color.colorName}
                                    theme={theme}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Size */}
                        {product.colors?.[selectedImages[product.productID]?.colorIndex || 0]?.sizes && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Size:</span>
                            <div className="flex items-center gap-1">
                              {sortSizes(product.colors[selectedImages[product.productID]?.colorIndex || 0].sizes).map((size, index) => (
                                <div
                                  key={index}
                                  className="relative"
                                >
                                  <div
                                    className={`min-w-[2.5rem] h-8 flex items-center justify-center text-sm rounded cursor-help transition-all ${
                                      size.stock > 0
                                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                        : 'bg-gray-50 text-gray-400'
                                    }`}
                                    title={`${size.stock > 0 ? 'Còn hàng' : 'Hết hàng'}`}
                                    onMouseEnter={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveSizeTooltip(`${product.productID}-${product.colors[selectedImages[product.productID]?.colorIndex || 0].colorName}-${size.size}`);
                                    }}
                                    onMouseLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveSizeTooltip(null);
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    {size.size}
                                  </div>
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
                          {product.colors?.length > 1 && (
                            <span className="text-sm text-gray-500">
                              {product.colors.length} màu sắc
                            </span>
                          )}
                          {isInStock ? (
                            <span className="text-sm text-green-600">
                              Còn {totalStock} sản phẩm
                            </span>
                          ) : (
                            <span className="text-sm text-red-500">
                              Hết hàng
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Thông tin khuyến mãi */}
                      {discountInfo && discountInfo.promotion && (
                        <div className="mt-4 p-3 bg-red-50 rounded-xl">
                          <p className="text-sm text-red-700 font-medium">{discountInfo.promotion.name}</p>
                          <p className="text-xs text-red-500 mt-1">
                            Kết thúc: {new Date(discountInfo.promotion.endDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Phân trang */}
            {pagination.totalPages > 1 && (
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                theme="red"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TetCollection;
