// NewArrivals.jsx - Trang sản phẩm mới
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaChevronLeft, FaChevronRight, FaFire, FaClock, FaSortAmountUp, FaSortAmountDown, FaTimes, FaFilter } from 'react-icons/fa';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import { getColorCode, isPatternOrStripe, getBackgroundSize } from '../../../utils/colorUtils';
import Loading from '../../../components/Products/Loading';
import Pagination from '../../../components/Products/Pagination';
import ColorTooltip from '../../../components/Products/ColorTooltip';
import SizeTooltip from '../../../components/Products/SizeTooltip';
import ProductThumbnails from '../../../components/Products/ProductThumbnails';

const NewArrivals = () => {
  // Lấy theme từ context
  const { theme } = useTheme();
  // State lưu danh sách sản phẩm gốc
  const [products, setProducts] = useState([]);
  // State lưu danh sách sản phẩm đã lọc
  const [filteredProducts, setFilteredProducts] = useState([]);
  // State lưu trạng thái loading
  const [loading, setLoading] = useState(false);
  // State lưu trữ phân trang
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });
  const productsPerPage = 12;
  const [selectedImages, setSelectedImages] = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeSizeTooltip, setActiveSizeTooltip] = useState(null);

  // Định nghĩa các options cho bộ lọc
  const filterOptions = {
    // Các khoảng giá
    priceRanges: [
      { id: '0-100', label: 'Dưới 100.000đ', range: [0, 100000] },
      { id: '100-300', label: '100.000đ - 300.000đ', range: [100000, 300000] },
      { id: '300-500', label: '300.000đ - 500.000đ', range: [300000, 500000] },
      { id: '500-1000', label: '500.000đ - 1.000.000đ', range: [500000, 1000000] },
      { id: '1000-up', label: 'Trên 1.000.000đ', range: [1000000, Infinity] }
    ],
    // Các options sắp xếp
    sortOptions: [
      { id: 'popular', label: 'Phổ biến nhất', icon: FaFire },
      { id: 'newest', label: 'Mới nhất', icon: FaClock },
      { id: 'price-asc', label: 'Giá tăng dần', icon: FaSortAmountUp },
      { id: 'price-desc', label: 'Giá giảm dần', icon: FaSortAmountDown }
    ]
  };

  // State quản lý các bộ lọc
  const [filters, setFilters] = useState({
    search: '', // Từ khóa tìm kiếm
    categories: [], // Danh mục đã chọn
    priceRanges: [], // Khoảng giá đã chọn
    inStock: false, // Lọc theo tình trạng còn hàng
    sort: "newest" // Sắp xếp mặc định theo mới nhất
  });

  // Hàm fetch sản phẩm mới nhất từ API
  const fetchNewProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/products/basic');
      // Sắp xếp sản phẩm theo ID giảm dần (ID cao = sản phẩm mới)
      const sortedProducts = response.data.products.sort((a, b) => b.productID - a.productID);
      // Lấy 20 sản phẩm mới nhất
      const newProducts = sortedProducts.slice(0, 20);
      setProducts(newProducts);
      setFilteredProducts(newProducts);
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm mới');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    fetchNewProducts();
  }, []);

  // Hàm chuyển đổi giá từ string sang number
  const convertPriceToNumber = (priceString) => {
    if (!priceString) return 0;
    // Nếu là số thì chuyển thành string
    const stringPrice = String(priceString);
    // Xóa tất cả dấu chấm và chuyển thành số
    return parseInt(stringPrice.replace(/\./g, ''), 10) || 0;
  };

  // Hàm format giá tiền với dấu chấm phân cách
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

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Effect xử lý lọc và sắp xếp sản phẩm
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

    // Lọc theo khoảng giá
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

    // Sắp xếp sản phẩm
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

  // Tính toán sản phẩm hiển thị trên trang hiện tại
  const currentProducts = useMemo(() => {
    const indexOfLastProduct = pagination.currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, pagination.currentPage]);

  // Lấy danh sách danh mục duy nhất
  const categories = [...new Set(products.map(product => product.category))];

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

  // Hàm kiểm tra sản phẩm mới (trong vòng 7 ngày)
  const isNewProduct = (createdAt) => {
    const productDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - productDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Render giao diện chính
  if (loading) {
    return (
      <Loading 
        theme={theme} 
        icon={FaStar}
        title="SẢN PHẨM MỚI"
        subtitle="Khám phá các thiết kế mới nhất của chúng tôi"
        breadcrumbText="Hàng mới về"
      />
    );
  }

  return (
    // Container chính với gradient background tùy theo theme
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
      {/* Banner trang */}
      <PageBanner
        theme={theme}
        icon={FaStar}
        title="SẢN PHẨM MỚI"
        subtitle="Khám phá các thiết kế mới nhất của chúng tôi"
        breadcrumbText="Hàng mới về"
      />

      {/* Container chứa nội dung chính */}
      <div className="container mx-auto px-4 py-8">
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
                    placeholder="Tìm kiếm sản phẩm mới..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-10"
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
                      <span className="flex items-center justify-center w-4 h-4 text-[10px] bg-blue-500 text-white rounded-full">
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
                  <div key={index} className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100">
                    <span>{category}</span>
                    <button
                      onClick={() => handleFilterChange('categories', category)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Hiển thị các khoảng giá đã chọn */}
                {filters.priceRanges.map((rangeId) => (
                  <div key={rangeId} className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100">
                    <span>{filterOptions.priceRanges.find(r => r.id === rangeId)?.label}</span>
                    <button
                      onClick={() => handleFilterChange('priceRanges', rangeId)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Hiển thị trạng thái lọc còn hàng */}
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

                {/* Hiển thị kiểu sắp xếp đã chọn */}
                {filters.sort && (
                  <div className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100">
                    <span>{filterOptions.sortOptions.find(option => option.id === filters.sort)?.label}</span>
                    <button
                      onClick={() => handleFilterChange('sort', null)}
                      className="text-blue-400 hover:text-blue-600"
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
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Banner thông báo sản phẩm mới */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 px-6 rounded-xl mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Sản phẩm mới về</h3>
            <p className="text-blue-100">Cập nhật mỗi tuần</p>
          </div>
          <FaStar className="text-3xl text-yellow-300" />
        </div>

        {/* Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay */}
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsMobileFilterOpen(false)}></div>
              </div>

              {/* Modal Content */}
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
                                  ? 'bg-blue-500 text-white'
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
                                  ? 'bg-blue-500 text-white'
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
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
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
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none sm:w-auto sm:text-sm"
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

        {/* Grid sản phẩm */}
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
            {/* Grid hiển thị sản phẩm */}
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
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
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
                        className={`w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ${!isInStock ? 'opacity-50' : ''
                          }`}
                      />

                      {/* Overlay gradient khi hover */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme === 'tet'
                          ? 'bg-gradient-to-t from-red-900/20 via-transparent to-transparent'
                          : 'bg-gradient-to-t from-blue-900/20 via-transparent to-transparent'
                        }`} />

                      {/* Overlay khi hết hàng */}
                      {!isInStock && (
                        <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[2px] ${theme === 'tet'
                            ? 'bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40'
                            : 'bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-blue-900/40'
                          }`}>
                          <span className={`font-medium px-3 py-1.5 rounded-full text-white ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                            Hết hàng
                          </span>
                        </div>
                      )}

                      {/* Badge số lượng còn lại */}
                      {totalStock <= 5 && totalStock > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className={`text-white text-xs font-medium px-3 py-1.5 rounded-full ${theme === 'tet' ? 'bg-red-500' : 'bg-orange-500'
                            }`}>
                            Chỉ còn {totalStock}
                          </span>
                        </div>
                      )}

                      {/* Badge giảm giá và New */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.promotion?.discountPercent > 0 && (
                          <span className={`text-white text-xs font-medium px-3 py-1.5 rounded-full ${theme === 'tet' ? 'bg-red-500' : 'bg-pink-500'
                            }`}>
                            -{product.promotion.discountPercent}%
                          </span>
                        )}
                        {isNewProduct(product.createdAt) && (
                          <div className="relative">
                            <span className="absolute -inset-3 animate-ping bg-blue-400 opacity-75 rounded-full px-3 py-1.5"></span>
                            <span className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              NEW
                            </span>
                          </div>
                        )}
                      </div>

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
                        <span className="text-sm text-blue-500 font-medium">{product.category}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
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
                                        ? theme === 'tet'
                                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
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
                        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                          <p className="text-sm text-blue-700 font-medium">{discountInfo.promotion.name}</p>
                          <p className="text-xs text-blue-500 mt-1">
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
                theme={theme === 'tet' ? 'red' : 'blue'}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
