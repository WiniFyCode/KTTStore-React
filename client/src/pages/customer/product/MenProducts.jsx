// MenProducts.jsx - Trang danh sách sản phẩm nam
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaHeart, FaShoppingBag, FaTags, FaTimes, FaSortAmountUp, FaFire, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import { getColorCode, isPatternOrStripe, getBackgroundSize } from '../../../utils/colorUtils';

const MenProducts = () => {
   const { theme } = useTheme();
   const [searchParams] = useSearchParams();
   const [products, setProducts] = useState([]); // Lưu trữ sản phẩm gốc
   const [filteredProducts, setFilteredProducts] = useState([]); // Lưu trữ sản phẩm sau khi filter
   const [loading, setLoading] = useState(false);
   const [pagination, setPagination] = useState({
      currentPage: 1,
      totalPages: 1,
      totalProducts: 0
   });
   const [selectedImages, setSelectedImages] = useState({});
   const [activeTooltip, setActiveTooltip] = useState(null);
   const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

   // State cho filter và sort
   const [filters, setFilters] = useState({
      search: searchParams.get('search') || '',
      categories: [],
      priceRanges: [],
      inStock: false,
      sort: 'popular'
   });

   // Định nghĩa các option cho filter
   const filterOptions = {
      priceRanges: [
         { id: '0-100', label: 'Dưới 100.000đ', range: [0, 100000] },
         { id: '100-300', label: '100.000đ - 300.000đ', range: [100000, 300000] },
         { id: '300-500', label: '300.000đ - 500.000đ', range: [300000, 500000] },
         { id: '500-1000', label: '500.000đ - 1.000.000đ', range: [500000, 1000000] },
         { id: '1000-up', label: 'Trên 1.000.000đ', range: [1000000, Infinity] }
      ],
      sortOptions: [
         { id: 'popular', label: 'Phổ biến nhất', icon: FaFire },
         { id: 'newest', label: 'Mới nhất', icon: FaClock },
         { id: 'price-asc', label: 'Giá tăng dần', icon: FaSortAmountUp },
         { id: 'price-desc', label: 'Giá giảm dần', icon: FaSortAmountDown }
      ]
   };

   // Helper function để chuyển đổi giá từ string sang number
   const convertPriceToNumber = (priceString) => {
      if (!priceString) return 0;
      // Nếu là số thì chuyển thành string
      const stringPrice = String(priceString);
      // Xóa tất cả dấu chấm và chuyển thành số
      return parseInt(stringPrice.replace(/\./g, ''), 10) || 0;
   };

   // Helper function để format giá
   const formatPrice = (price) => {
      if (!price) return '0';
      // Chuyển thành string và format với dấu chấm
      return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
   };

   const menCategories = [
      "Áo thun", "Áo Polo", "Áo sơ mi", "Áo len", "Áo khoác",
      "Áo Hoodie", "Quần dài", "Quần Kaki", "Quần Jean", "Quần lửng"
   ];

   // Get categories từ danh sách có sẵn
   const categories = useMemo(() => {
      return menCategories.map(cat => ({
         id: cat,
         label: cat
      }));
   }, []);

   // Hàm xử lý khi click vào bộ lọc
   const handleFilterChange = (type, value) => {
      if (type === 'priceRanges') {
         setFilters(prev => ({
            ...prev,
            [type]: prev[type].includes(value)
               ? prev[type].filter(item => item !== value)
               : [...prev[type], value]
         }));
      } else {
         setFilters(prev => ({
            ...prev,
            [type]: Array.isArray(prev[type])
               ? prev[type].includes(value)
                  ? prev[type].filter(item => item !== value)
                  : [...prev[type], value]
               : value
         }));
      }
   };

   // Filter và sort sản phẩm
   useEffect(() => {
      // Lọc sản phẩm theo các điều kiện
      const filtered = products.filter(product => {
         // Lọc theo search
         if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
         }

         // Lọc theo categories
         if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
            return false;
         }

         // Lọc theo price ranges
         if (filters.priceRanges.length > 0) {
            const productPrice = convertPriceToNumber(product.price);
            const matchesRange = filters.priceRanges.some(rangeId => {
               const range = filterOptions.priceRanges.find(r => r.id === rangeId);
               if (!range) return false;
               return productPrice >= range.range[0] && productPrice <= range.range[1];
            });
            if (!matchesRange) return false;
         }

         // Lọc theo stock
         if (filters.inStock && product.stock === 0) {
            return false;
         }

         return true;
      });

      // Sort sản phẩm
      const sorted = [...filtered].sort((a, b) => {
         if (!filters.sort) return 0;

         switch (filters.sort) {
            case 'popular':
               return b.sold - a.sold;
            case 'newest':
               return new Date(b.createdAt) - new Date(a.createdAt);
            case 'price-asc':
               return convertPriceToNumber(a.price) - convertPriceToNumber(b.price);
            case 'price-desc':
               return convertPriceToNumber(b.price) - convertPriceToNumber(a.price);
            default:
               return 0;
         }
      });

      setFilteredProducts(sorted);
   }, [products, filters]);

   // Hàm tính giá sau khuyến mãi
   const calculateDiscountedPrice = (product) => {
      if (!product.promotion) return null;

      return {
         discountedPrice: formatPrice(product.promotion.discountedPrice),
         discountPercent: product.promotion.discountPercent,
         promotion: product.promotion
      };
   };

   // Fetch sản phẩm
   const fetchProducts = async () => {
      try {
         setLoading(true);
         const params = new URLSearchParams({
            gender: 'Nam',
            targetID: '1',
            page: pagination.currentPage,
            limit: 12,
            sort: filters.sort || 'popular'
         });

         // Thêm các điều kiện lọc vào params
         if (filters.search) params.append('search', filters.search);// tìm kiếm sản phẩm
         if (filters.categories.length > 0) {
            params.append('categories', filters.categories.join(','));// lọc theo danh mục
         }
         // lọc theo giá
         if (filters.priceRanges.length > 0) {
            const selectedRanges = filters.priceRanges.map(rangeId =>
               filterOptions.priceRanges.find(r => r.id === rangeId)
            );
            if (selectedRanges.length > 0) {
               params.append('minPrice', selectedRanges[0].range[0]);
               params.append('maxPrice', selectedRanges[selectedRanges.length - 1].range[1]);
            }
         }

         // lọc theo stock
         if (filters.inStock) params.append('inStock', 'true');

         // gọi api lấy sản phẩm
         const response = await axiosInstance.get(`/api/products/gender?${params}`);
         const responseData = response.data?.data;

         // set sản phẩm
         if (responseData?.products) {
            setProducts(responseData.products);
            setFilteredProducts(responseData.products);
            setPagination(prev => ({
               ...prev,
               totalPages: responseData.pagination?.totalPages || 1,
               totalProducts: responseData.pagination?.total || 0
            }));
         } else {
            setProducts([]);
            setFilteredProducts([]);
            setPagination(prev => ({
               ...prev,
               totalPages: 1,
               totalProducts: 0
            }));
         }
      } catch (error) {
         console.error('Lỗi khi tải sản phẩm:', error);
         toast.error('Không thể tải sản phẩm. Vui lòng thử lại sau.');
         setProducts([]);
         setFilteredProducts([]);
         setPagination(prev => ({
            ...prev,
            totalPages: 1,
            totalProducts: 0
         }));
      } finally {
         setLoading(false);
      }
   };

   // Hàm xử lý khi click vào trang
   const handlePageChange = (page) => {
      setPagination(prev => ({
         ...prev,
         currentPage: page
      }));
   };

   // Fetch data khi component mount và khi filters hoặc pagination thay đổi
   useEffect(() => {
      fetchProducts();
   }, [filters, pagination.currentPage]);

   // Cập nhật filters khi URL thay đổi
   useEffect(() => {
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
         setFilters(prev => ({
            ...prev,
            search: searchQuery
         }));
      }
   }, [searchParams]);

   // Hàm xử lý khi click vào ảnh thumbnail
   const handleThumbnailClick = (e, productId, imageIndex) => {
      e.preventDefault(); // Ngăn chặn sự kiện click lan truyền lên Link
      setSelectedImages(prev => ({
         ...prev,
         [productId]: {
            ...prev[productId],
            imageIndex: imageIndex
         }
      }));
   };

   // Hàm xử lý khi click vào màu sắc
   const handleColorClick = (e, productId, colorIndex) => {
      e.preventDefault(); // Ngăn chặn sự kiện click lan truyền lên Link
      setSelectedImages(prev => ({
         ...prev,
         [productId]: {
            colorIndex: colorIndex,
            imageIndex: 0 // Reset về ảnh đầu tiên của màu mới
         }
      }));
   };

   // Render component
   return (
      // Container chính với gradient background tùy theo theme
      <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
         {/* Banner */}
         <PageBanner
            theme={theme}
            icon={FaTags}
            title="Thời Trang Nam"
            subtitle="Phong cách nam tính, mạnh mẽ và cuốn hút"
            breadcrumbText="Thời trang nam"
         />

         {/* Container chứa các sản phẩm */}
         <div className="container mx-auto px-4 py-8">
            {/* Bar lọc */}
            <div className="relative z-10 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
               <div className="p-4">
                  {/* Bar tìm kiếm và bộ lọc */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                     <div className="flex items-center gap-3 flex-grow">
                        {/* Tìm kiếm */}
                        <div className="relative flex-grow max-w-md">
                           <input
                              type="text"
                              placeholder="Tìm kiếm sản phẩm nam..."
                              value={filters.search}
                              onChange={(e) => handleFilterChange('search', e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                           />
                           <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        {/* Nút bộ lọc */}
                        <div className="flex items-center gap-2">
                           <button
                              onClick={() => {
                                 setIsMobileFilterOpen(true);
                              }}
                              className="px-4 py-2.5 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
                           >
                              <FaFilter className="text-gray-500" />
                              <span>Bộ lọc</span>
                              {filters.categories.length > 0 || filters.priceRanges.length > 0 || filters.inStock || filters.sort ? (
                                 <span className="ml-1 w-5 h-5 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">
                                    {filters.categories.length + filters.priceRanges.length + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)}
                                 </span>
                              ) : null}
                           </button>
                        </div>
                     </div>

                     {/* Nút xem và số lượng sản phẩm */}
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
                        {/* Lọc theo danh mục */}
                        {filters.categories.map((category, index) => (
                           <div
                              key={index}
                              className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100">
                              <span>{categories.find(cat => cat.id === category)?.label}</span>
                              <button
                                 onClick={() => handleFilterChange('categories', category)}
                                 className="text-blue-400 hover:text-blue-600"
                              >
                                 <FaTimes className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                        {/* Lọc theo giá */}
                        {filters.priceRanges.map((rangeId) => (
                           <div
                              key={rangeId}
                              className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 flex items-center gap-1.5 transition-all hover:bg-blue-100"
                           >
                              <span>{filterOptions.priceRanges.find(r => r.id === rangeId)?.label}</span>
                              <button
                                 onClick={() => handleFilterChange('priceRanges', rangeId)}
                                 className="text-blue-400 hover:text-blue-600"
                              >
                                 <FaTimes className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                        {/* Lọc theo stock */}
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
                        {/* Lọc theo sắp xếp */}
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
                        {/* Nút xóa tất cả */}
                        <button
                           onClick={() => {
                              setFilters({
                                 search: '',
                                 categories: [],
                                 priceRanges: [],
                                 inStock: false,
                                 sort: 'popular'
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

            {/* Grid sản phẩm */}
            {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[...Array(12)].map((_, index) => (
                     <div key={index} className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
                        {/* Skeleton cho ảnh sản phẩm */}
                        <div className="relative aspect-[3/4] bg-gray-200"></div>

                        {/* Skeleton cho thông tin sản phẩm */}
                        <div className="p-6">
                           <div className="mb-2">
                              <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                           </div>
                           <div className="space-y-3">
                              <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                           </div>
                           <div className="mt-4 flex items-center gap-2">
                              <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                              <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
               // Trường hợp không tìm thấy sản phẩm
            ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
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
                     {filteredProducts.map((product) => {
                        if (!product) return null;

                        // Tính toán tổng stock của sản phẩm
                        const totalStock = product.colors?.reduce((total, color) => {
                           return total + color.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0);
                        }, 0);

                        // Kiểm tra xem sản phẩm có còn hàng không
                        const isInStock = totalStock > 0;

                        // Render sản phẩm
                        return (
                           <Link
                              key={product.productID}
                              to={`/product/${product.productID}`}
                              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                           >
                              {/* Ảnh sản phẩm */}
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
                                       <span className={`font-medium px-3 py-1.5 rounded-full text-sm text-white ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
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

                                 {/* Thumbnails */}
                                 {product.colors?.[selectedImages[product.productID]?.colorIndex || 0]?.images?.length > 1 && (
                                    <div
                                       className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                                       onClick={e => e.preventDefault()} // Ngăn chặn sự kiện click lan truyền lên Link
                                    >
                                       {product.colors[selectedImages[product.productID]?.colorIndex || 0].images.slice(0, 4).map((image, index) => (
                                          <div
                                             key={index}
                                             onClick={(e) => handleThumbnailClick(e, product.productID, index)}
                                             className={`w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${selectedImages[product.productID]?.imageIndex === index
                                                   ? 'border-2 border-white ring-2 ring-offset-2 ' + (theme === 'tet' ? 'ring-red-500' : 'ring-blue-500')
                                                   : 'border-2 border-white hover:border-gray-300'
                                                }`}
                                          >
                                             <img
                                                src={image}
                                                alt={`${product.name} - ${index + 1}`}
                                                className="w-full h-full object-cover"
                                             />
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>

                              {/* Thông tin sản phẩm */}
                              <div className="p-6">
                                 <div className="mb-2">
                                    <span className="text-sm text-blue-500 font-medium">{product.category}</span>
                                 </div>
                                 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                                    {product.name}
                                 </h3>
                                 <div className="flex items-baseline gap-2 mb-4">
                                    {product.promotion?.discountedPrice ? (
                                       <>
                                          <span className="text-lg font-bold text-red-500">
                                             {formatPrice(product.promotion.discountedPrice)}đ
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
                                                   onClick={(e) => {
                                                      e.preventDefault();
                                                      handleColorClick(e, product.productID, index);
                                                   }}
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
                                                   <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded transition-all ${activeTooltip === `${product.productID}-${index}`
                                                         ? 'opacity-100 visible'
                                                         : 'opacity-0 invisible'
                                                      }`}>
                                                      {color.colorName}
                                                   </div>
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
                                             {product.colors[selectedImages[product.productID]?.colorIndex || 0].sizes.map((size, index) => (
                                                <div
                                                   key={index}
                                                   className={`px-2 py-1 text-xs rounded ${size.stock > 0
                                                         ? 'bg-gray-100 text-gray-700'
                                                         : 'bg-gray-50 text-gray-400 line-through'
                                                      }`}
                                                   title={`${size.stock > 0 ? 'Còn hàng' : 'Hết hàng'}`}
                                                >
                                                   {size.size}
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
                              </div>
                           </Link>
                        );
                     })}
                  </div>

                  {/* Phân trang */}
                  {pagination.totalPages > 1 && (
                     <div className="flex items-center justify-center mt-12">
                        <nav className="inline-flex items-center -space-x-px overflow-hidden rounded-lg bg-white shadow-sm">
                           {/* Nút Previous */}
                           <button
                              onClick={() => handlePageChange(pagination.currentPage - 1)}
                              disabled={pagination.currentPage === 1}
                              className={`flex items-center justify-center h-10 px-4 border-r ${pagination.currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                           >
                              <FaChevronLeft className="w-5 h-5" />
                           </button>

                           {/* Render các trang */}
                           {/* Tạo mảng các số trang từ 1 đến tổng số trang
                              Array.from() tạo mảng mới với length = tổng số trang
                              Tham số _ trong callback không dùng đến nên dùng dấu gạch dưới
                              i là index để tạo số trang = index + 1 */}
                           {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                              // Lọc để chỉ hiển thị trang đầu, trang cuối và các trang xung quanh trang hiện tại
                              .filter(page => {
                                 const current = pagination.currentPage;
                                 return page === 1 || // Luôn hiển thị trang 1
                                    page === pagination.totalPages || // Luôn hiển thị trang cuối
                                    (page >= current - 1 && page <= current + 1); // Hiển thị trang trước và sau trang hiện tại
                              })
                              // Render các nút trang
                              .map((page, index, array) => {
                                 // Nếu có khoảng cách > 1 giữa các trang thì thêm dấu ...
                                 if (index > 0 && page - array[index - 1] > 1) {
                                    return [
                                       // Render dấu ...
                                       <span key={`ellipsis-${page}`} className="flex items-center justify-center h-10 px-4 text-gray-400 border-r">
                                          ...
                                       </span>,
                                       // Render nút trang
                                       <button
                                          key={page}
                                          onClick={() => handlePageChange(page)}
                                          className={`flex items-center justify-center h-10 w-10 border-r ${pagination.currentPage === page
                                                ? 'bg-blue-500 text-white' // Style cho trang hiện tại
                                                : 'text-gray-700 hover:bg-gray-100' // Style cho các trang khác
                                             }`}
                                       >
                                          {page}
                                       </button>
                                    ];
                                 }
                                 // Render nút trang bình thường
                                 return (
                                    <button
                                       key={page}
                                       onClick={() => handlePageChange(page)}
                                       className={`flex items-center justify-center h-10 w-10 border-r ${pagination.currentPage === page
                                             ? 'bg-blue-500 text-white' // Style cho trang hiện tại  
                                             : 'text-gray-700 hover:bg-gray-100' // Style cho các trang khác
                                          }`}
                                    >
                                       {page}
                                    </button>
                                 );
                              })}

                           {/* Nút Next */}
                           <button
                              onClick={() => handlePageChange(pagination.currentPage + 1)}
                              disabled={pagination.currentPage === pagination.totalPages}
                              className={`flex items-center justify-center h-10 px-4 ${pagination.currentPage === pagination.totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                           >
                              <FaChevronRight className="w-5 h-5" />
                           </button>
                        </nav>
                     </div>
                  )}
               </>
            )}
         </div>

         {/* Filter Modal khi trên mobile */}
         {isMobileFilterOpen && (
            // Container cố định
            <div className="fixed inset-0 z-50 overflow-y-auto">
               {/* Container chứa nội dung modal */}
               <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  {/* Nền mờ */}
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                     {/* Nền mờ */}
                     <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsMobileFilterOpen(false)}></div>
                  </div>

                  {/* Container chứa nội dung modal */}
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                     <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                           <div className="w-full">
                              {/* Modal Header */}
                              <div className="flex justify-between items-center mb-6">
                                 <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Bộ lọc sản phẩm
                                 </h3>
                                 {/* Nút đóng modal */}
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

                              {/* Categories */}
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

                              {/* Price Ranges */}
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

                              {/* Stock Status */}
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

                     {/* Modal Footer */}
                     <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                        {/* Nút áp dụng */}
                        <button
                           type="button"
                           onClick={() => setIsMobileFilterOpen(false)}
                           className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none sm:w-auto sm:text-sm"
                        >
                           Áp dụng ({filters.categories.length + filters.priceRanges.length + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)})
                        </button>
                        {/* Nút đặt lại */}
                        <button
                           type="button"
                           onClick={() => {
                              setFilters({
                                 search: '',
                                 categories: [],
                                 priceRanges: [],
                                 inStock: false,
                                 sort: 'popular'
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

export default MenProducts;
