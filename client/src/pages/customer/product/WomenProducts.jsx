// WomenProducts.jsx - Trang sản phẩm thời trang nữ 

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaHeart, FaShoppingBag, FaTags, FaTimes, FaFire, FaClock, FaSortAmountUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import { getColorCode, isPatternOrStripe, getBackgroundSize } from '../../../utils/colorUtils';

const WomenProducts = () => {
   // Sử dụng theme context và lấy params từ URL
   const { theme } = useTheme();
   const [searchParams] = useSearchParams();

   // Khởi tạo các state cần thiết
   const [products, setProducts] = useState([]); // Lưu trữ danh sách sản phẩm gốc
   const [filteredProducts, setFilteredProducts] = useState([]); // Lưu trữ danh sách sản phẩm sau khi lọc
   const [loading, setLoading] = useState(false); // Quản lý trạng thái loading
   const [pagination, setPagination] = useState({ // Quản lý thông tin phân trang
      currentPage: 1, // Trang hiện tại
      totalPages: 1, // Tổng số trang
      totalProducts: 0 // Tổng số sản phẩm
   });
   const [selectedImages, setSelectedImages] = useState({}); // Lưu trữ ảnh đang được chọn cho mỗi sản phẩm
   const [activeTooltip, setActiveTooltip] = useState(null); // Quản lý tooltip đang hiển thị
   const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // Quản lý trạng thái hiển thị modal filter trên mobile

   // Khởi tạo state filters với giá trị mặc định
   const [filters, setFilters] = useState({
      search: searchParams.get('search') || '', // Từ khóa tìm kiếm, lấy từ URL nếu có
      categories: [], // Danh mục đã chọn
      priceRange: null, // Khoảng giá đã chọn
      inStock: false, // Lọc sản phẩm còn hàng
      sort: 'popular' // Tiêu chí sắp xếp mặc định
   });

   // Hàm xử lý khi click vào màu sắc của sản phẩm
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

   // Hàm xử lý khi click vào thumbnail của sản phẩm
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

   // Định nghĩa các tùy chọn cho bộ lọc
   const filterOptions = {
      // Các khoảng giá cho sản phẩm
      priceRanges: [
         { id: '0-100', label: 'Dưới 100.000đ', range: [0, 100000] },
         { id: '100-300', label: '100.000đ - 300.000đ', range: [100000, 300000] },
         { id: '300-500', label: '300.000đ - 500.000đ', range: [300000, 500000] },
         { id: '500-1000', label: '500.000đ - 1.000.000đ', range: [500000, 1000000] },
         { id: '1000-up', label: 'Trên 1.000.000đ', range: [1000000, Infinity] }
      ],
      // Các tùy chọn sắp xếp sản phẩm
      sortOptions: [
         { id: 'popular', label: 'Phổ biến nhất', icon: FaFire }, // Sắp xếp theo độ phổ biến
         { id: 'newest', label: 'Mới nhất', icon: FaClock }, // Sắp xếp theo thời gian
         { id: 'price-asc', label: 'Giá tăng dần', icon: FaSortAmountUp }, // Sắp xếp theo giá từ thấp đến cao
         { id: 'price-desc', label: 'Giá giảm dần', icon: FaSortAmountDown } // Sắp xếp theo giá từ cao đến thấp
      ]
   };

   // Hàm chuyển đổi giá từ string sang number
   const convertPriceToNumber = (priceString) => {
      if (!priceString) return 0;
      // Nếu là số thì chuyển thành string
      const stringPrice = String(priceString);
      // Xóa tất cả dấu chấm và chuyển thành số
      return parseInt(stringPrice.replace(/\./g, ''), 10) || 0;
   };

   // Hàm format giá tiền theo định dạng Việt Nam
   const formatPrice = (price) => {
      if (!price) return '0';
      // Chuyển thành string và format với dấu chấm phân cách hàng nghìn
      return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
   };

   // Danh sách các danh mục sản phẩm nữ
   const womenCategories = [
      "Áo Croptop", "Áo thun", "Áo sơ mi", "Áo Peplum", "Áo len",
      "Đồ lót", "Áo Vest", "Áo khoác da", "Áo phao", "Quần dài",
      "Quần Jean", "Quần lửng short", "Jumpsuit", "Chân váy chữ A",
      "Váy đầm công sở", "Đầm", "Đầm Maxi", "Đầm thun", "Áo dài"
   ];

   // Tạo danh sách categories với useMemo để tối ưu hiệu suất
   const categories = useMemo(() => {
      return womenCategories.map(cat => ({
         id: cat,
         label: cat
      }));
   }, []);

   // Hàm xử lý thay đổi bộ lọc
   const handleFilterChange = (type, value) => {
      if (type === 'priceRange') {
         // Xử lý đặc biệt cho khoảng giá
         setFilters(prev => ({
            ...prev,
            [type]: prev[type] === value ? null : value
         }));
      } else {
         // Xử lý cho các loại filter khác
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

   // Effect xử lý lọc và sắp xếp sản phẩm khi filters hoặc products thay đổi
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
         if (filters.priceRange) {
            const productPrice = convertPriceToNumber(product.price);
            const range = filterOptions.priceRanges.find(r => r.id === filters.priceRange);
            if (!range) return false;
            if (!(productPrice >= range.range[0] && productPrice <= range.range[1])) return false;
         }

         // Lọc theo tình trạng còn hàng
         if (filters.inStock && product.stock === 0) {
            return false;
         }

         return true;
      });

      // Sắp xếp sản phẩm theo tiêu chí đã chọn
      const sorted = [...filtered].sort((a, b) => {
         if (!filters.sort) return 0;

         switch (filters.sort) {
            case 'popular':
               return b.sold - a.sold; // Sắp xếp theo số lượng đã bán
            case 'newest':
               return new Date(b.createdAt) - new Date(a.createdAt); // Sắp xếp theo thời gian tạo
            case 'price-asc':
               return convertPriceToNumber(a.price) - convertPriceToNumber(b.price); // Sắp xếp theo giá tăng dần
            case 'price-desc':
               return convertPriceToNumber(b.price) - convertPriceToNumber(a.price); // Sắp xếp theo giá giảm dần
            default:
               return 0;
         }
      });

      setFilteredProducts(sorted);
   }, [products, filters]);


   // Hàm fetch dữ liệu sản phẩm từ API
   const fetchProducts = async () => {
      try {
         setLoading(true);
         // Tạo params cho API call
         const params = new URLSearchParams({
            gender: 'Nữ',
            targetID: '2',
            page: pagination.currentPage,
            limit: 12,
            sort: filters.sort || 'popular'
         });

         // Thêm các params tùy chọn
         if (filters.search) params.append('search', filters.search);
         if (filters.categories.length > 0) {
            params.append('categories', filters.categories.join(','));
         }
         if (filters.priceRange) {
            const selectedRange = filterOptions.priceRanges.find(r => r.id === filters.priceRange);
            if (selectedRange) {
               params.append('minPrice', selectedRange.range[0]);
               params.append('maxPrice', selectedRange.range[1]);
            }
         }
         if (filters.inStock) params.append('inStock', 'true');

         // Gọi API và xử lý response
         const response = await axiosInstance.get(`/api/products/gender?${params}`);
         const responseData = response.data?.data;

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
         console.error('Lỗi khi tải sản phẩm nữ:', error);
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

   // Hàm xử lý chuyển trang
   const handlePageChange = (page) => {
      setPagination(prev => ({
         ...prev,
         currentPage: page
      }));
   };

   // Effect hook để fetch dữ liệu khi component mount và khi filters hoặc pagination thay đổi
   useEffect(() => {
      fetchProducts();
   }, [filters, pagination.currentPage]);

   // Effect hook để cập nhật filters khi URL thay đổi
   useEffect(() => {
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
         setFilters(prev => ({
            ...prev,
            search: searchQuery
         }));
      }
   }, [searchParams]);

   return (
      <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
         {/* Banner */}
         <PageBanner
            theme={theme}
            icon={FaTags}
            title="Thời Trang Nữ"
            subtitle="Phong cách thời thượng, cá tính cho phái đẹp"
            breadcrumbText="Thời trang nữ"
         />

         <div className="container mx-auto px-4 py-8">
            {/* Thanh bộ lọc */}
            <div className="relative z-10 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
               <div className="p-4">
                  {/* Tìm kiếm và các tùy chọn bộ lọc */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                     <div className="flex items-center gap-3 flex-grow">
                        {/* Search */}
                        <div className="relative flex-grow max-w-md">
                           <input
                              type="text"
                              placeholder="Tìm kiếm sản phẩm nữ..."
                              value={filters.search}
                              onChange={(e) => handleFilterChange('search', e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                           />
                           <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        {/* Các nút bộ lọc */}
                        <div className="flex items-center gap-2">
                           <button
                              onClick={() => {
                                 setIsMobileFilterOpen(true);
                              }}
                              className="px-4 py-2.5 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
                           >
                              <FaFilter className="text-gray-500" />
                              <span>Bộ lọc</span>
                              {filters.categories.length > 0 || filters.priceRange || filters.inStock || filters.sort ? (
                                 <span className="ml-1 w-5 h-5 flex items-center justify-center bg-pink-500 text-white text-xs rounded-full">
                                    {filters.categories.length + (filters.priceRange ? 1 : 0) + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)}
                                 </span>
                              ) : null}
                           </button>
                        </div>
                     </div>

                     {/* Chuyển đổi số lượng sản phẩm */}
                     <div className="flex items-center gap-4">
                        {!loading && (
                           <div className="text-sm text-gray-500">
                              Hiển thị <span className="font-medium text-gray-900">{filteredProducts.length}</span> sản phẩm
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Các bộ lọc đang chọn */}
                  {(filters.categories.length > 0 || filters.priceRange || filters.inStock || filters.sort) && (
                     <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-500 uppercase">Bộ lọc đang chọn:</span>

                        {/* Danh mục */}
                        {filters.categories.map((category, index) => (
                           <div
                              key={index}
                              className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100"
                           >
                              <span>{categories.find(cat => cat.id === category)?.label}</span>
                              <button
                                 onClick={() => handleFilterChange('categories', category)}
                                 className="text-pink-400 hover:text-pink-600"
                              >
                                 <FaTimes className="w-3 h-3" />
                              </button>
                           </div>
                        ))}

                        {/* Khoảng giá */}
                        {filters.priceRange && (
                           <div className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100">
                              <span>{filterOptions.priceRanges.find(r => r.id === filters.priceRange)?.label}</span>
                              <button
                                 onClick={() => handleFilterChange('priceRange', null)}
                                 className="text-pink-400 hover:text-pink-600"
                              >
                                 <FaTimes className="w-3 h-3" />
                              </button>
                           </div>
                        )}

                        {/* Tình trạng còn hàng */}
                        {filters.inStock && (
                           <div className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100">
                              <span>Còn hàng</span>
                              <button
                                 onClick={() => handleFilterChange('inStock', false)}
                                 className="text-pink-400 hover:text-pink-600"
                              >
                                 <FaTimes className="w-3 h-3" />
                              </button>
                           </div>
                        )}

                        {/* Tiêu chí sắp xếp */}
                        {filters.sort && (
                           <div className="px-3 py-1 bg-pink-50 rounded-full text-sm text-pink-700 flex items-center gap-1.5 transition-all hover:bg-pink-100">
                              <span>{filterOptions.sortOptions.find(option => option.id === filters.sort)?.label}</span>
                              <button
                                 onClick={() => handleFilterChange('sort', null)}
                                 className="text-pink-400 hover:text-pink-600"
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
                                 priceRange: null,
                                 inStock: false,
                                 sort: 'popular'
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

            {/* Products Grid */}
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
            ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
               // Hiển thị thông báo khi không tìm thấy sản phẩm
               <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
                  <div className="mb-6">
                     <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto">
                        <FaSearch className="text-pink-500 text-4xl" />
                     </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
               </div>
            ) : (
               // Hiển thị sản phẩm
               <>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                     {filteredProducts.map((product) => {
                        if (!product) return null;

                        // Tính toán tổng stock của sản phẩm
                        const totalStock = product.colors?.reduce((total, color) => {
                           return total + color.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0);
                        }, 0);

                        // Kiểm tra xem sản phẩm có còn hàng không
                        const isInStock = totalStock > 0;

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
                                    className={`w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ${
                                       !isInStock ? 'opacity-50' : ''
                                    }`}
                                 />

                                 {/* Overlay gradient khi hover */}
                                 <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                                    theme === 'tet' 
                                       ? 'bg-gradient-to-t from-red-900/20 via-transparent to-transparent' 
                                       : 'bg-gradient-to-t from-pink-900/20 via-transparent to-transparent'
                                 }`} />

                                 {/* Overlay khi hết hàng */}
                                 {!isInStock && (
                                    <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[2px] ${
                                       theme === 'tet' 
                                          ? 'bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40' 
                                          : 'bg-gradient-to-br from-pink-900/40 via-pink-800/40 to-pink-900/40'
                                    }`}>
                                       <span className={`font-medium px-3 py-1.5 rounded-full text-sm text-white ${
                                          theme === 'tet' ? 'bg-red-500' : 'bg-pink-500'
                                       }`}>
                                          Hết hàng
                                       </span>
                                    </div>
                                 )}

                                 {/* Badge số lượng còn lại */}
                                 {totalStock <= 5 && totalStock > 0 && (
                                    <div className="absolute top-3 right-3">
                                       <span className={`text-white text-xs font-medium px-3 py-1.5 rounded-full ${
                                          theme === 'tet' ? 'bg-red-500' : 'bg-orange-500'
                                       }`}>
                                          Chỉ còn {totalStock}
                                       </span>
                                    </div>
                                 )}

                                 {/* Badge giảm giá */}
                                 {product.promotion?.discountPercent > 0 && (
                                    <div className="absolute top-3 left-3">
                                       <span className={`text-white text-xs font-medium px-3 py-1.5 rounded-full ${
                                          theme === 'tet' ? 'bg-red-500' : 'bg-pink-500'
                                       }`}>
                                          -{product.promotion.discountPercent}%
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
                                             className={`w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                                                selectedImages[product.productID]?.imageIndex === index
                                                   ? 'border-2 border-white ring-2 ring-offset-2 ' + (theme === 'tet' ? 'ring-red-500' : 'ring-pink-500')
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

                              {/* Product Info */}
                              <div className="p-6">
                                 <div className="mb-2">
                                    <span className="text-sm text-pink-500 font-medium">{product.category}</span>
                                 </div>
                                 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">
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
                                                   onClick={(e) => handleColorClick(e, product.productID, index)}
                                                   onMouseEnter={() => setActiveTooltip(`${product.productID}-${index}`)}
                                                   onMouseLeave={() => setActiveTooltip(null)}
                                                >
                                                   <div
                                                      className={`w-7 h-7 rounded-full border shadow-sm cursor-pointer transition-all hover:scale-110 ${
                                                         color.colorName.toLowerCase() === 'trắng' ? 'border-gray-300' : ''
                                                      } ${
                                                         selectedImages[product.productID]?.colorIndex === index 
                                                            ? 'ring-2 ring-pink-500 ring-offset-2' 
                                                            : ''
                                                      }`}
                                                      style={{
                                                         background: getColorCode(color.colorName),
                                                         backgroundSize: getBackgroundSize(color.colorName)
                                                      }}
                                                   />
                                                   {/* Tooltip tên màu */}
                                                   <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded transition-all ${
                                                      activeTooltip === `${product.productID}-${index}` 
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
                                                   className={`px-2 py-1 text-xs rounded ${
                                                      size.stock > 0
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

                                 {/* Thông tin khuyến mãi */}
                                 {product.promotion?.discountedPrice && (
                                    <div className="mt-4 p-3 bg-pink-50 rounded-xl">
                                       <p className="text-sm text-pink-700 font-medium">{product.promotion.name}</p>
                                       <p className="text-xs text-pink-500 mt-1">
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
                     <div className="flex items-center justify-center mt-12">
                        <nav className="inline-flex items-center -space-x-px overflow-hidden rounded-lg bg-white shadow-sm">
                           {/* Nút Previous */}
                           <button
                              onClick={() => handlePageChange(pagination.currentPage - 1)}
                              disabled={pagination.currentPage === 1}
                              className={`flex items-center justify-center h-10 px-4 border-r ${
                                 pagination.currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                              }`}
                           >
                              <FaChevronLeft className="w-5 h-5" />
                           </button>

                           {/* Các trang */}
                           {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                              .filter(page => {
                                 const current = pagination.currentPage;
                                 return page === 1 ||
                                    page === pagination.totalPages ||
                                    (page >= current - 1 && page <= current + 1);
                              })
                              .map((page, index, array) => {
                                 if (index > 0 && page - array[index - 1] > 1) {
                                    return [
                                       <span key={`ellipsis-${page}`} className="flex items-center justify-center h-10 px-4 text-gray-400 border-r">
                                          ...
                                       </span>,
                                       <button
                                          key={page}
                                          onClick={() => handlePageChange(page)}
                                          className={`flex items-center justify-center h-10 w-10 border-r ${
                                             pagination.currentPage === page
                                                ? 'bg-pink-500 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                          }`}
                                       >
                                          {page}
                                       </button>
                                    ];
                                 }
                                 return (
                              <button
                                 key={page}
                                 onClick={() => handlePageChange(page)}
                                       className={`flex items-center justify-center h-10 w-10 border-r ${
                                          pagination.currentPage === page
                                       ? 'bg-pink-500 text-white'
                                             : 'text-gray-700 hover:bg-gray-100'
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
                              className={`flex items-center justify-center h-10 px-4 ${
                                 pagination.currentPage === pagination.totalPages
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

         {/* Filter Modal */}
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

                              {/* Tiêu chí sắp xếp */}
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

                              {/* Danh mục */}
                              <div className="mb-8">
                                 <h4 className="font-medium text-gray-900 mb-3">Danh mục</h4>
                                 <div className="grid grid-cols-2 gap-2">
                                    {categories.map(category => (
                                       <button
                                          key={category.id}
                                          onClick={() => handleFilterChange('categories', category.id)}
                                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                              ${filters.categories.includes(category.id)
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                             }`}
                                       >
                                          {category.label}
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
                                          onClick={() => handleFilterChange('priceRange', range.id)}
                                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                              ${filters.priceRange === range.id
                                                ? 'bg-pink-500 text-white'
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
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-700">Chỉ hiện sản phẩm còn hàng</span>
                                 </label>
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
                           Áp dụng ({filters.categories.length + (filters.priceRange ? 1 : 0) + (filters.inStock ? 1 : 0) + (filters.sort ? 1 : 0)})
                        </button>
                        <button
                           type="button"
                           onClick={() => {
                              setFilters({
                                 search: '',
                                 categories: [],
                                 priceRange: null,
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

export default WomenProducts;
