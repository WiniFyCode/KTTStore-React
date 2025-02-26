// SaleProducts.jsx - Trang sản phẩm đang giảm giá
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaPercentage, FaHeart, FaTimes, FaSortAmountUp, FaFire, FaClock, FaTags } from 'react-icons/fa';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import Loading from '../../../components/Products/Loading';
import Pagination from '../../../components/Products/Pagination';
import ProductThumbnails from '../../../components/Products/ProductThumbnails';

const SaleProducts = () => {
  // Sử dụng theme context
  const { theme } = useTheme();

  // Khởi tạo các state cần thiết
  const [loading, setLoading] = useState(true); // State quản lý trạng thái loading
  const [products, setProducts] = useState([]); // State lưu trữ danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // State lưu trữ danh sách sản phẩm đã được lọc
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // State quản lý trạng thái hiển thị modal filter trên mobile
  const [currentPage, setCurrentPage] = useState(1); // State quản lý trang hiện tại
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });
  const [productsPerPage] = useState(12); // Số sản phẩm hiển thị trên mỗi trang
  const [categories, setCategories] = useState([]); // State lưu trữ danh sách danh mục

  // Khởi tạo state filters với giá trị mặc định
  const [filters, setFilters] = useState({
    search: '', // Từ khóa tìm kiếm
    categories: [], // Danh mục đã chọn
    priceRanges: [], // Các khoảng giá đã chọn 
    discountRanges: [], // Các khoảng giảm giá đã chọn
    sort: 'price-asc' // Tiêu chí sắp xếp
  });

  // State để lưu ảnh đang được chọn cho mỗi sản phẩm
  const [selectedImages, setSelectedImages] = useState({});

  // Reset trang về 1 khi filters thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Lấy danh sách categories từ sản phẩm khi products thay đổi
  useEffect(() => {
    if (products.length > 0) {
      // Lọc ra các category có sản phẩm và sắp xếp theo alphabet
      const uniqueCategories = [...new Set(products.map(product => product.category))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      setCategories(uniqueCategories);
    }
  }, [products]);

  // Định nghĩa các option cho filter
  const filterOptions = {
    // Các khoảng giá
    priceRanges: [
      { id: '0-100', label: 'Dưới 100.000đ', range: [0, 100000] },
      { id: '100-300', label: '100.000đ - 300.000đ', range: [100000, 300000] },
      { id: '300-500', label: '300.000đ - 500.000đ', range: [300000, 500000] },
      { id: '500-1000', label: '500.000đ - 1.000.000đ', range: [500000, 1000000] },
      { id: '1000-up', label: 'Trên 1.000.000đ', range: [1000000, 999999999] }
    ],
    // Các khoảng giảm giá
    discountRanges: [
      { id: '70-100', label: 'Giảm 70% trở lên', range: [70, 100] },
      { id: '50-69', label: 'Giảm 50% - 69%', range: [50, 69] },
      { id: '30-49', label: 'Giảm 30% - 49%', range: [30, 49] },
      { id: '10-29', label: 'Giảm 10% - 29%', range: [10, 29] }
    ],
    // Các option sắp xếp
    sortOptions: [
      { id: 'discount-desc', label: '% Giảm giá cao nhất', icon: FaPercentage },
      { id: 'price-asc', label: 'Giá tăng dần', icon: FaSortAmountUp },
      { id: 'price-desc', label: 'Giá giảm dần', icon: FaSortAmountDown },
      { id: 'name-asc', label: 'Tên A-Z', icon: FaSortAmountUp },
      { id: 'name-desc', label: 'Tên Z-A', icon: FaSortAmountDown }
    ]
  };

  // Effect xử lý lọc và sắp xếp sản phẩm khi filters hoặc products thay đổi
  useEffect(() => {
    let result = [...products];

    // Lọc theo từ khóa tìm kiếm
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter(product =>
        (product.name?.toLowerCase() || '').includes(searchTerm) ||
        (product.description?.toLowerCase() || '').includes(searchTerm) ||
        (product.category?.toLowerCase() || '').includes(searchTerm)
      );
    }

    // Lọc theo danh mục
    if (filters.categories.length > 0) {
      result = result.filter(product => filters.categories.includes(product.category));
    }

    // Lọc theo khoảng giá
    if (filters.priceRanges.length > 0) {
      result = result.filter(product => {
        const productPrice = convertPriceToNumber(calculateDiscountPrice(product.price, product.discount));
        // Kiểm tra xem sản phẩm có thuộc một trong các khoảng giá đã chọn không
        return filters.priceRanges.some(rangeId => {
          const range = filterOptions.priceRanges.find(r => r.id === rangeId);
          return range && productPrice >= range.range[0] && productPrice <= range.range[1];
        });
      });
    }

    // Lọc theo mức giảm giá (đã sửa để hỗ trợ nhiều mức)
    if (filters.discountRanges.length > 0) {
      result = result.filter(product => {
        // Kiểm tra xem sản phẩm có thuộc một trong các khoảng giảm giá đã chọn không
        return filters.discountRanges.some(rangeId => {
          const range = filterOptions.discountRanges.find(r => r.id === rangeId);
          return range && product.discount >= range.range[0] && product.discount <= range.range[1];
        });
      });
    }

    // Sắp xếp sản phẩm theo tiêu chí đã chọn
    switch (filters.sort) {
      case 'discount-desc':
        result.sort((a, b) => b.discount - a.discount);
        break;
      case 'price-asc':
        result.sort((a, b) =>
          convertPriceToNumber(calculateDiscountPrice(a.price, a.discount)) -
          convertPriceToNumber(calculateDiscountPrice(b.price, b.discount))
        );
        break;
      case 'price-desc':
        result.sort((a, b) =>
          convertPriceToNumber(calculateDiscountPrice(b.price, b.discount)) -
          convertPriceToNumber(calculateDiscountPrice(a.price, a.discount))
        );
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalPages: Math.ceil(result.length / productsPerPage),
      totalProducts: result.length
    }));
  }, [products, filters]);

  // Effect để fetch dữ liệu sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Lấy tất cả sản phẩm kèm thông tin promotion
        const response = await axiosInstance.get('/api/products/basic');

        if (!response.data || !response.data.success) {
          console.error('Có lỗi xảy ra khi tải dữ liệu(SaleProducts.jsx):', response);
          toast.error('Không thể tải danh sách sản phẩm');
          return;
        }

        // Lọc ra các sản phẩm có promotion
        const productsWithPromotion = response.data.products.filter(product => product.promotion);
        setProducts(productsWithPromotion);

      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Hàm format giá tiền
  const formatPrice = (price) => {
    if (!price) return '0';
    // Chuyển thành string và format với dấu chấm
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Hàm tính giá sau khi giảm
  const calculateDiscountPrice = (price, discount) => {
    // Chuyển giá từ dạng string "490.000" sang số để tính toán
    const numericPrice = parseFloat(price.replace(/\./g, ''));
    // Tính giá sau giảm
    const discountedPrice = numericPrice * (1 - discount / 100);
    // Làm tròn số
    const roundedPrice = Math.round(discountedPrice);
    // Chuyển lại về dạng string với dấu chấm
    return roundedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

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

  // Hàm chuyển đổi giá từ string sang number
  const convertPriceToNumber = (priceString) => {
    if (!priceString) return 0;
    const stringPrice = String(priceString);
    return parseInt(stringPrice.replace(/\./g, ''), 10) || 0;
  };

  // Hàm xử lý khi click vào thumbnail
  const handleThumbnailClick = (productID, index) => {
    setSelectedImages(prev => ({
      ...prev,
      [productID]: index
    }));
  };

  // Render loading state
  if (loading) {
    return (
      <Loading 
        theme={theme} 
        icon={FaPercentage}
        title={theme === 'tet' ? 'GIẢM GIÁ TẾT 2025' : 'GIẢM GIÁ'}
        subtitle={theme === 'tet'
            ? 'Đón xuân sang - Giảm giá sốc'
          : 'Khuyến mãi cực lớn - Giá siêu hời'
        }
        breadcrumbText="Sale"
      />
    );
  }

  // Render khi đã tải xong dữ liệu
  return (
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
      <PageBanner
        theme={theme}
        icon={FaPercentage}
        title={theme === 'tet' ? 'GIẢM GIÁ TẾT 2025' : 'GIẢM GIÁ'}
        subtitle={theme === 'tet'
          ? 'Đón xuân sang - Giảm giá sốc'
          : 'Khuyến mãi cực lớn - Giá siêu hời'
        }
        breadcrumbText="Sale"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="relative z-10 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4">
            {/* Phần tìm kiếm và điều khiển bộ lọc */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-grow">
                {/* Ô tìm kiếm */}
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm sale..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm h-10"
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
                    {(filters.categories.length > 0 || filters.priceRanges.length > 0 || filters.discountRanges.length > 0 || filters.sort !== 'discount-desc') && (
                      <span className="flex items-center justify-center w-4 h-4 text-[10px] bg-pink-500 text-white rounded-full">
                        {filters.categories.length + filters.priceRanges.length + filters.discountRanges.length + (filters.sort !== 'discount-desc' ? 1 : 0)}
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
            {(filters.categories.length > 0 || filters.priceRanges.length > 0 || filters.discountRanges.length > 0 || filters.sort !== 'discount-desc') && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase">Bộ lọc đang chọn:</span>

                {/* Hiển thị các danh mục đã chọn */}
                {filters.categories.map((category, index) => (
                  <div key={index} className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100">
                    <span>{category}</span>
                    <button
                      onClick={() => handleFilterChange('categories', category)}
                      className="text-pink-400 hover:text-pink-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Hiển thị các khoảng giá đã chọn */}
                {filters.priceRanges.map((rangeId) => (
                  <div key={rangeId} className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100">
                    <span>{filterOptions.priceRanges.find(r => r.id === rangeId)?.label}</span>
                    <button
                      onClick={() => handleFilterChange('priceRanges', rangeId)}
                      className="text-pink-400 hover:text-pink-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Hiển thị các khoảng giảm giá đã chọn */}
                {filters.discountRanges.map((rangeId) => (
                  <div key={rangeId} className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100">
                    <span>{filterOptions.discountRanges.find(r => r.id === rangeId)?.label}</span>
                    <button
                      onClick={() => handleFilterChange('discountRanges', rangeId)}
                      className="text-pink-400 hover:text-pink-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Hiển thị kiểu sắp xếp đã chọn */}
                {filters.sort !== 'discount-desc' && (
                  <div className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100">
                    <span>{filterOptions.sortOptions.find(option => option.id === filters.sort)?.label}</span>
                    <button
                      onClick={() => handleFilterChange('sort', 'discount-desc')}
                      className="text-pink-400 hover:text-pink-600"
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
                      discountRanges: [], 
                      sort: 'discount-desc'
                    });
                  }}
                  className="px-3 py-1 text-sm text-pink-600 hover:text-pink-700 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsMobileFilterOpen(false)}></div>
              </div>

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
                                    ? 'bg-pink-500 text-white'
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

                      {/* Lọc theo danh mục */}
                      <div className="mb-8">
                        <h4 className="font-medium text-gray-900 mb-3">Danh mục</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map(category => (
                            <button
                              key={category}
                              onClick={() => handleFilterChange('categories', category)}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${filters.categories.includes(category)
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lọc theo khoảng giá */}
                      <div className="mb-8">
                        <h4 className="font-medium text-gray-900 mb-3">Khoảng giá</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.priceRanges.map(range => (
                            <button
                              key={range.id}
                              onClick={() => handleFilterChange('priceRanges', range.id)}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${filters.priceRanges.includes(range.id)
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Discount Ranges */}
                      <div className="mb-8">
                        <h4 className="font-medium text-gray-900 mb-3">Mức giảm giá</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.discountRanges.map(range => (
                            <button
                              key={range.id}
                              onClick={() => handleFilterChange('discountRanges', range.id)}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${filters.discountRanges.includes(range.id)
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-pink-500 text-base font-medium text-white hover:bg-pink-600 focus:outline-none sm:w-auto sm:text-sm"
                  >
                    Áp dụng ({filters.categories.length + filters.priceRanges.length + filters.discountRanges.length + (filters.sort !== 'discount-desc' ? 1 : 0)})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({
                        search: '',
                        categories: [],
                        priceRanges: [],
                        discountRanges: [],
                        sort: 'discount-desc'
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
        {filteredProducts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-16 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <FaSearch className="text-gray-400 text-3xl" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {currentProducts.map((product) => (
                <Link
                  key={product.productID}
                  to={`/product/${product.productID}`}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group relative"
                >
                  {/* Ảnh sản phẩm */}
                  <div className="relative aspect-[3/4] overflow-hidden group">
                    <img
                      src={product.colors?.[0]?.images?.[selectedImages[product.productID] || 0] || product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                      }}
                    />

                    {/* Badge giảm giá */}
                    {product.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1.5 rounded-l-full font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                        -{product.discount}%
                      </div>
                    )}

                    {/* Tag Badge */}
                    {product.tag && (
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl text-white px-4 py-1.5 rounded-r-full font-medium">
                        {product.tag}
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium inline-block">
                        {product.promotion?.type === 'flash-sale' ? 'Flash Sale' : 'Khuyến mãi'}
                      </span>
                      {product.promotion?.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {product.promotion.description}
                        </p>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl font-bold text-red-500">
                        {formatPrice(calculateDiscountPrice(product.price, product.discount))}đ
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}đ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{product.category}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span className="text-sm text-emerald-500 font-medium flex items-center gap-1">
                          <FaTags className="w-3 h-3" />
                          Đang giảm mạnh
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-500">Đã bán {product.soldCount || 0}</span>
                        <span className={`font-medium ${product.totalStock <= 5
                          ? 'text-red-500'
                          : product.totalStock <= 10
                            ? 'text-orange-500'
                            : 'text-emerald-500'
                          }`}>
                          {product.totalStock > 0 ? (
                            product.totalStock > 99 ?
                              'Còn nhiều' :
                              `Còn ${product.totalStock} sản phẩm`
                          ) : (
                            'Hết hàng'
                          )}
                        </span>
                      </div>
                      {product.soldCount > 0 && product.totalStock > 0 && (
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${product.totalStock <= 5
                              ? 'bg-gradient-to-r from-red-500 to-red-400'
                              : product.totalStock <= 10
                                ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                              }`}
                            style={{
                              width: `${Math.min(((product.soldCount) / (product.soldCount + product.totalStock)) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Phân trang */}
            {pagination.totalPages > 1 && (
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                theme={theme === 'tet' ? 'red' : 'pink'}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SaleProducts;
