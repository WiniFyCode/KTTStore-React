// ProductDetail.jsx - Trang chi tiết sản phẩm

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaStar, FaMinus, FaPlus, FaArrowRight, FaHome, FaChevronRight, FaRegHeart, FaTag, FaEye, FaMedal, FaRuler, FaPalette, FaBolt, FaChevronDown, FaInfoCircle, FaPhoneAlt, FaFacebookMessenger } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs, EffectFade } from 'swiper/modules';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';
import { getColorCode, isPatternOrStripe, getBackgroundSize } from '../../../utils/colorUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedSection, setExpandedSection] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const navigate = useNavigate();

  // State cho phần review
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  });
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  // Thêm state để theo dõi trạng thái yêu thích
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch thông tin sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/api/products/${id}`);
        setProduct(response.data.product);
        // Tự động chọn màu và size đầu tiên nếu có
        if (response.data.product.availableColors.length > 0) {
          setSelectedColor(response.data.product.availableColors[0]);
        }
        if (response.data.product.availableSizes.length > 0) {
          setSelectedSize(response.data.product.availableSizes[0]);
        }
      } catch (error) {
        toast.error('Không thể tải thông tin sản phẩm');
        console.error('Lỗi khi tải thông tin sản phẩm(ProductDetail.jsx):', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Kiểm tra trạng thái yêu thích của sản phẩm khi component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // Kiểm tra token đăng nhập
        const token = localStorage.getItem('customerToken');
        if (!token) return;

        // Kiểm tra đã chọn màu và size chưa
        if (!selectedColor || !selectedSize) return;

        // Lấy thông tin color và size để tạo SKU
        const color = product.colors.find(c => c.colorName === selectedColor);
        const stockResponse = await axiosInstance.get(`/api/product-size-stock/color/${color.colorID}`);
        const sizeStock = stockResponse.data.find(item => item.size === selectedSize);

        if (!sizeStock) return;

        // Tạo SKU và kiểm tra trạng thái yêu thích
        const SKU = `${product.productID}_${color.colorID}_${selectedSize}_${sizeStock.sizeStockID}`;
        console.log('SKU:', SKU);
        
        const response = await axiosInstance.get(`/api/favorite/check/${SKU}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error('Lỗi khi check trạng thái yêu thích(ProductDetail.jsx):', error);
      }
    };

    checkFavoriteStatus();
  }, [product, selectedColor, selectedSize]);

  // Hàm lấy danh sách đánh giá từ API
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await axiosInstance.get(`/api/reviews/product/${id}`);
      setReviews(response.data.reviews);

      // Tính toán thống kê đánh giá
      const stats = {
        averageRating: 0,
        totalReviews: response.data.reviews.length,
        ratingCounts: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      };

      // Tính số lượng mỗi loại đánh giá và điểm trung bình
      response.data.reviews.forEach(review => {
        stats.averageRating += review.rating;
        stats.ratingCounts[review.rating]++;
      });

      // Tính điểm trung bình và làm tròn đến 1 chữ số thập phân
      stats.averageRating = stats.totalReviews > 0
        ? Math.round((stats.averageRating / stats.totalReviews) * 10) / 10
        : 0;

      setReviewStats(stats);

      // Tìm đánh giá của user hiện tại nếu có
      const userReview = response.data.reviews.find(review => review.isCurrentUser);
      setUserReview(userReview);
    } catch (error) {
      console.error('Lỗi khi tải đánh giá(ProductDetail.jsx):', error);
      toast.error('Không thể tải đánh giá sản phẩm');
    } finally {
      setReviewsLoading(false);
    }
  };

  // Hàm xử lý gửi đánh giá mới
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('customerToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm');
      navigate('/login');
      return;
    }

    try {
      if (userReview) {
        // Nếu đã có đánh giá thì cập nhật
        await handleUpdateReview(userReview.reviewID);
      } else {
        // Nếu chưa có thì tạo mới
        await axiosInstance.post('/api/reviews', {
          productID: parseInt(id),
          rating: newReview.rating,
          comment: newReview.comment
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        toast.success('Đã gửi đánh giá thành công');
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: '' });
        fetchReviews(); // Tải lại danh sách đánh giá
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá(ProductDetail.jsx):', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Bạn chỉ có thể đánh giá sản phẩm đã mua');
      } else {
        toast.error('Không thể gửi đánh giá');
      }
    }
  };

  // Hàm xử lý xóa đánh giá
  const handleDeleteReview = async (reviewID) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xóa đánh giá');
        navigate('/login');
        return;
      }

      await axiosInstance.delete(`/api/reviews/${reviewID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Đã xóa đánh giá');
      setUserReview(null);
      fetchReviews(); // Tải lại danh sách đánh giá
    } catch (error) {
      console.error('Lỗi xóa đánh giá(ProductDetail.jsx):', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error('Không thể xóa đánh giá');
      }
    }
  };

  // Hàm xử lý cập nhật đánh giá
  const handleUpdateReview = async (reviewID) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập để cập nhật đánh giá');
        navigate('/login');
        return;
      }

      await axiosInstance.put(`/api/reviews/${reviewID}`, {
        rating: newReview.rating,
        comment: newReview.comment
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Đã cập nhật đánh giá');
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(); // Tải lại danh sách đánh giá
    } catch (error) {
      console.error('Lỗi khi cập nhật đánh giá(ProductDetail.jsx):', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error('Không thể cập nhật đánh giá');
      }
    }
  };

  // Tải đánh giá khi chuyển tab hoặc id thay đổi
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, id]);

  // Hàm format giá tiền với dấu chấm phân cách
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Hàm kiểm tra số lượng tồn kho cho size và màu đã chọn
  const getStockForSelectedOptions = () => {
    if (!selectedColor || !selectedSize) return 0;
    const color = product.colors.find(c => c.colorName === selectedColor);
    if (!color) return 0;
    const size = color.sizes.find(s => s.size === selectedSize);
    return size ? size.stock : 0;
  };

  // Hàm lấy danh sách ảnh của màu đã chọn
  const getSelectedColorImages = () => {
    if (!selectedColor) return [];
    const color = product.colors.find(c => c.colorName === selectedColor);
    return color ? color.images : [];
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      // Kiểm tra đã chọn size và màu
      if (!selectedSize || !selectedColor) {
        toast.error('Vui lòng chọn size và màu sắc');
        return;
      }

      // Kiểm tra số lượng tồn kho
      const stock = getStockForSelectedOptions();
      if (stock <= 0) {
        toast.error('Sản phẩm đã hết hàng');
        return;
      }

      // Lấy thông tin color và size
      const color = product.colors.find(c => c.colorName === selectedColor);
      console.log('Selected Color:', color);
      console.log('Selected Size:', selectedSize);
      console.log('Product Colors:', product.colors);

      // Tìm size trong color.sizes
      const size = color.sizes.find(s => s.size === selectedSize);
      console.log('Size:', size);

      if (!color || !size) {
        toast.error('Không tìm thấy thông tin size hoặc màu sắc');
        return;
      }

      // Lấy thông tin sizeStockID từ API
      const stockResponse = await axiosInstance.get(`/api/product-size-stock/color/${color.colorID}`);
      const sizeStock = stockResponse.data.find(item => item.size === selectedSize);

      if (!sizeStock) {
        toast.error('Không tìm thấy thông tin tồn kho');
        return;
      }

      // Tạo SKU từ các thông tin: productID_colorID_size_sizeStockID
      const SKU = `${product.productID}_${color.colorID}_${selectedSize}_${sizeStock.sizeStockID}`;
      console.log('SKU:', SKU);

      // Kiểm tra đăng nhập
      const token = localStorage.getItem('customerToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Gọi API thêm vào giỏ hàng
      const response = await axiosInstance.post('/api/cart/add', {
        SKU,
        quantity
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        toast.success('Đã thêm vào giỏ hàng');
        window.dispatchEvent(new Event('cartChange'));
      } else {
        toast.error('Không thể thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng(ProductDetail.jsx):', error);
      if (error.response && error.response.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      }
    }
  };

  // Hàm xử lý thêm/xóa yêu thích
  const handleToggleFavorite = async () => {
    try {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem('customerToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
        navigate('/login');
        return;
      }

      // Kiểm tra đã chọn size và màu
      if (!selectedSize || !selectedColor) {
        toast.error('Vui lòng chọn size và màu sắc');
        return;
      }

      // Lấy thông tin color và size
      const color = product.colors.find(c => c.colorName === selectedColor);
      console.log('Selected color:', color);

      const stockResponse = await axiosInstance.get(`/api/product-size-stock/color/${color.colorID}`);
      const sizeStock = stockResponse.data.find(item => item.size === selectedSize);
      console.log('Size stock:', sizeStock);

      if (!sizeStock) {
        toast.error('Không tìm thấy thông tin tồn kho');
        return;
      }

      // Tạo SKU
      const SKU = `${product.productID}_${color.colorID}_${selectedSize}_${sizeStock.sizeStockID}`;
      console.log('Toggle favorite for SKU:', SKU);

      if (isFavorite) {
        // Nếu đã yêu thích thì xóa
        await axiosInstance.delete(`/api/favorite/${SKU}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Đã xóa khỏi danh sách yêu thích');
        window.dispatchEvent(new Event('wishlistChange'));
      } else {
        // Nếu chưa yêu thích thì thêm
        await axiosInstance.post('/api/favorite/add', { SKU }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Đã thêm vào danh sách yêu thích');
        window.dispatchEvent(new Event('wishlistChange'));
      }

      // Cập nhật trạng thái yêu thích
      setIsFavorite(!isFavorite);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  // Trạng thái loading
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`inline-block w-16 h-16 rounded-full border-4 border-t-transparent animate-spin ${theme === 'tet' ? 'border-red-500' : 'border-blue-500'}`}></div>
          <p className={`mt-4 text-lg font-medium ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`}>
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo nếu không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  // Hiển thị nội dung sản phẩm
  return (
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-lg" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {/* Breadcrumb item 1 */}
            <li className="inline-flex items-center">
              <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                <FaHome className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
            </li>
            {/* Breadcrumb item 2 */}
            <li>
              <div className="flex items-center">
                <FaChevronRight className="w-3 h-3 text-gray-400" />
                <Link to="/products" className="ml-1 md:ml-2 text-gray-700 hover:text-gray-900">
                  Sản phẩm
                </Link>
              </div>
            </li>
            {/* Breadcrumb item 3 */}
            <li aria-current="page">
              <div className="flex items-center">
                <FaChevronRight className="w-3 h-3 text-gray-400" />
                <span className={`ml-1 md:ml-2 ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}>
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Ảnh và thông tin sản phẩm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Ảnh */}
          <div className="relative">
            {/* Swiper chính */}
            <Swiper
              modules={[Navigation, Pagination, Autoplay, Thumbs, EffectFade]}
              effect="fade"
              speed={800}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}

              // Phân trang
              pagination={{
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
                dynamicBullets: true,
              }}

              // Tự động chuyển ảnh
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}

              // Lặp lại ảnh
              loop={true}
              thumbs={{ swiper: thumbsSwiper }}
              className={`product-main-swiper h-[500px] rounded-2xl overflow-hidden mb-4 group ${theme === 'tet' ? 'ring-2 ring-red-200' : 'ring-1 ring-gray-200'}`}
            >
              {getSelectedColorImages().map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full">
                    <img
                      src={image}
                      alt={`${product.name} - ${selectedColor}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 ${theme === 'tet' ? 'bg-gradient-to-b from-transparent to-red-900/20' : 'bg-gradient-to-b from-transparent to-black/20'}`}></div>
                  </div>
                </SwiperSlide>
              ))}

              {/* Nút điều hướng tùy chỉnh */}
              <div className={`swiper-button-prev after:!text-base !w-10 !h-10 !backdrop-blur-sm ${theme === 'tet' ? '!bg-red-500/20 hover:!bg-red-500/30' : '!bg-white/20 hover:!bg-white/30'} !rounded-full -translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 !left-4`}></div>
              <div className={`swiper-button-next after:!text-base !w-10 !h-10 !backdrop-blur-sm ${theme === 'tet' ? '!bg-red-500/20 hover:!bg-red-500/30' : '!bg-white/20 hover:!bg-white/30'} !rounded-full translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 !right-4`}></div>

              {/* Phân trang tùy chỉnh */}
              <div className="swiper-pagination !bottom-4"></div>
            </Swiper>

            {/* Swiper thumbnails */}
            <div className="px-2">
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[Navigation, Thumbs]}
                spaceBetween={16}
                slidesPerView={4}
                watchSlidesProgress
                className="thumbs-swiper mt-4"
              >
                {getSelectedColorImages().map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${theme === 'tet' ? 'hover:ring-2 hover:ring-red-500' : 'hover:ring-2 hover:ring-gray-500'} h-24`}>
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover hover:opacity-75 transition-all duration-300"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="space-y-6">
            <h1 className={`text-3xl font-medium ${theme === 'tet' ? 'text-red-600' : 'text-gray-900'}`}>{product.name}</h1>

            {/* Giá và khuyến mãi */}
            <div className="space-y-2">
              {product.promotion ? (
                <>
                  {/* Hiển thị giá sau khi giảm */}
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.promotion.discountedPrice)}đ
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}đ
                    </span>

                    {/* Hiển thị phần trăm khuyến mãi */}
                    <span className="px-2 py-1 text-sm font-semibold text-white bg-red-500 rounded">
                      -{product.promotion.discountPercent}%
                    </span>
                  </div>

                  {/* Hiển thị thông tin khuyến mãi */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 font-medium">{product.promotion.name}</p>
                    <p className="text-red-600 text-sm mt-1">{product.promotion.description}</p>
                    <p className="text-red-500 text-sm mt-1">
                      Kết thúc: {new Date(product.promotion.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}đ
                </span>
              )}
            </div>

            {/* Chọn kích thước */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Kích thước</h3>
              <div className="grid grid-cols-4 gap-4">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center rounded-md ${selectedSize === size
                      ? `${theme === 'tet' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`
                      : `${theme === 'tet' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {/* Thông báo về size đặc biệt */}
              <div className={`mt-3 p-3 rounded-lg ${theme === 'tet' ? 'bg-red-50/80' : 'bg-blue-50/80'} border ${theme === 'tet' ? 'border-red-100' : 'border-blue-100'}`}>
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 p-1 rounded-full ${theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <FaInfoCircle className={`w-3 h-3 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'} font-medium`}>
                      Cần size XL, XXL?
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Shop có thể đặt may riêng theo số đo của bạn. Liên hệ ngay:
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <a
                        href="tel:1900xxxx"
                        className={`text-xs flex items-center gap-1 ${theme === 'tet' ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        <FaPhoneAlt className="w-3 h-3" />
                        <span>1900 xxxx</span>
                      </a>
                      <a
                        href="https://m.me/kttstore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs flex items-center gap-1 ${theme === 'tet' ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        <FaFacebookMessenger className="w-3 h-3" />
                        <span>Nhắn tin</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chọn màu sắc */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {product.availableColors.map((color) => {
                  // Lấy thông tin màu sắc từ utils
                  const colorCode = getColorCode(color);
                  const isPattern = isPatternOrStripe(color);
                  const bgSize = getBackgroundSize(color);

                  // Hiển thị màu sắc
                  return (
                    <span key={color}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                        ${selectedColor === color
                          ? theme === 'tet'
                            ? 'ring-2 ring-red-500'
                            : 'ring-2 ring-blue-500'
                          : 'hover:ring-1 hover:ring-gray-300'
                        } 
                        transition-all cursor-pointer relative group`}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        // Áp dụng màu nền hoặc pattern
                        background: colorCode,
                        backgroundSize: bgSize,
                        // Điều chỉnh màu chữ tùy theo màu nền
                        color: isPattern ? 'inherit' : (color === 'Trắng' || color === 'Trắng ngà' || color.includes('nhạt')) ? '#000' : '#fff',
                        // Thêm viền cho màu trắng để dễ nhìn
                        borderColor: color === 'Trắng' || color === 'Trắng ngà' ? '#e5e7eb' : 'transparent',
                        borderWidth: color === 'Trắng' || color === 'Trắng ngà' ? '1px' : '0',
                      }}
                    >
                      {/* Tooltip hiển thị tên màu khi hover */}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-normal text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {color}
                      </span>
                      {/* Tên màu */}
                      <span className={`${isPattern ? 'text-gray-700' : ''}`}>
                        {color}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Số lượng */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Số lượng</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={` h-10 rounded-full border border-gray-300 flex items-center justify-center ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                    } ${theme === 'tet' ? 'text-red-600' : 'text-gray-900'}`}
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(getStockForSelectedOptions(), quantity + 1))}
                  disabled={quantity >= getStockForSelectedOptions()}
                  className={` h-10 rounded-full border border-gray-300 flex items-center justify-center ${quantity >= getStockForSelectedOptions() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                    } ${theme === 'tet' ? 'text-red-600' : 'text-gray-900'}`}
                >
                  <FaPlus className="w-3 h-3" />
                </button>
                <span className="text-sm text-gray-500">
                  Còn {getStockForSelectedOptions()} sản phẩm
                </span>
              </div>
            </div>

            {/* Thêm vào giỏ hàng và yêu thích */}
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={!selectedSize || !selectedColor || getStockForSelectedOptions() === 0}
                onClick={handleAddToCart}
                className={`flex items-center justify-center w-full px-6 lg:px-6 py-3 lg:py-3 text-sm lg:text-base rounded-full transition-all duration-300 ${!selectedSize || !selectedColor || getStockForSelectedOptions() === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : theme === 'tet'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                <FaShoppingCart className="mr-2 text-base lg:text-lg" />
                Thêm vào giỏ
              </button>
              <button
                disabled={!selectedSize || !selectedColor}
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center w-full px-6 lg:px-6 py-3 lg:py-3 text-sm lg:text-base rounded-full transition-all duration-300 ${!selectedSize || !selectedColor
                    ? 'bg-gray-300 cursor-not-allowed'
                    : isFavorite
                      ? theme === 'tet'
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : theme === 'tet'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isFavorite ? (
                  <>
                    <FaHeart className="mr-2 text-base lg:text-lg" />
                    Đã yêu thích
                  </>
                ) : (
                  <>
                    <FaRegHeart className="mr-2 text-base lg:text-lg" />
                    Thêm vào yêu thích
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`relative py-4 text-sm font-medium transition-colors duration-200
                  ${activeTab === 'description'
                    ? theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Mô tả sản phẩm
                <span className={`absolute bottom-0 left-0 w-full h-0.5 transition-colors duration-200
                  ${activeTab === 'description'
                    ? theme === 'tet' ? 'bg-red-600' : 'bg-blue-600'
                    : 'bg-transparent'
                  }`}
                ></span>
              </button>

              {/* Nút chọn tab đánh giá */}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`relative py-4 text-sm font-medium transition-colors duration-200
                  ${activeTab === 'reviews'
                    ? theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <span>Đánh giá</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full 
                    ${theme === 'tet'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className={`absolute bottom-0 left-0 w-full h-0.5 transition-colors duration-200
                  ${activeTab === 'reviews'
                    ? theme === 'tet' ? 'bg-red-600' : 'bg-blue-600'
                    : 'bg-transparent'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* Nội dung tab */}
        {activeTab === 'description' ? (
          <>
            {/* Quick View Section */}
            <div className="mb-8">
              {/* Thanh trạng thái */}
              <div className="flex items-center justify-between mb-6 bg-gray-50/70 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                    ${product.totalStock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'}`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${product.totalStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {product.totalStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </div>
                  <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                    ${theme === 'tet' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                  >
                    <FaTag className="h-4 w-4 mr-1.5" />
                    {product.category}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500">
                    <FaEye className="h-5 w-5 mr-1.5" />
                    <span className="text-sm">Đã xem: {product.views || 0}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FaMedal className="h-5 w-5 mr-1.5" />
                    <span className="text-sm">Đã bán: {product.sold || 0}</span>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Key Features */}
                <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'}`}>
                      <FaBolt className={`h-5 w-5 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                    </div>
                    <h4 className="font-medium text-gray-900">Đặc điểm nổi bật</h4>
                  </div>

                  {/* Hiển thị 3 đặc điểm nổi bật */}
                  <div className="space-y-3">
                    {product.description
                      ?.split('\n')
                      .filter(line => !line.includes('Chi tiết bảo quản sản phẩm') && !line.includes('Thông tin mẫu') && line.trim())
                      .slice(0, 3)
                      .map((line, index) => (
                        <div key={index} className="flex items-start group">
                          <span className={`w-1.5 h-1.5 rounded-full mt-2 mr-3 ${theme === 'tet' ? 'bg-red-400' : 'bg-blue-400'}`} />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {line.trim().replace(/^-\s*/, '')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'}`}>
                      <FaRuler className={`h-5 w-5 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                    </div>
                    <h4 className="font-medium text-gray-900">Kích thước có sẵn</h4>
                  </div>

                  {/* Hiển thị các kích thước có sẵn */}
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes
                      .sort((a, b) => {
                        const order = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
                        return order[a] - order[b];
                      })
                      .map((size) => (
                        <span key={size}
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 text-sm font-medium
                            ${selectedSize === size
                              ? theme === 'tet'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            } 
                            transition-all cursor-pointer`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'}`}>
                      <FaPalette className={`h-5 w-5 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                    </div>
                    <h4 className="font-medium text-gray-900">Màu sắc có sẵn</h4>
                  </div>

                  {/* Hiển thị các màu sắc có sẵn */}
                  <div className="flex flex-wrap gap-2">
                    {product.availableColors.map((color) => (
                      <span key={color}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                          ${selectedColor === color
                            ? theme === 'tet'
                              ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                              : 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } 
                          transition-all cursor-pointer`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Các phần mở rộng */}
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'details' ? null : 'details')}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between ${expandedSection === 'details' ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                >
                  <span className="font-medium flex items-center">
                    <FaInfoCircle className="h-4 w-4 mr-2 text-red-600" />
                    Chi tiết sản phẩm
                  </span>
                  <FaChevronDown
                    className={`w-4 h-4 transform transition-transform ${expandedSection === 'details' ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Chi tiết sản phẩm */}
                {expandedSection === 'details' && (
                  <div className="p-4 border-t">
                    <div className="prose max-w-none">
                      <div className="space-y-6">
                        {/* Đặc điểm chi tiết */}
                        <div>
                          <h4 className={`text-base font-medium mb-3 ${theme === 'tet' ? 'text-red-600' : 'text-gray-900'}`}>
                            Đặc điểm chi tiết
                          </h4>
                          <div className="space-y-2">
                            {product.description
                              ?.split('\n')
                              .filter(line => !line.includes('Chi tiết bảo quản sản phẩm') && !line.includes('Thông tin mẫu') && line.trim())
                              .map((line, index) => (
                                <div key={index} className="flex items-start group">
                                  <span className={`w-1.5 h-1.5 rounded-full mt-2 mr-3 ${theme === 'tet' ? 'bg-red-400' : 'bg-blue-400'}`} />
                                  <span className="text-gray-600">{line.trim().replace(/^-\s*/, '')}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Thông tin người mẫu */}
                        <div>
                          <h4 className={`text-base font-medium mb-3 ${theme === 'tet' ? 'text-red-600' : 'text-gray-900'}`}>
                            Thông tin người mẫu
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {product.description
                              ?.split('Thông tin mẫu:')[1]
                              ?.split('Chi tiết bảo quản sản phẩm')[0]
                              .split('\n')
                              .filter(line => line.trim())
                              .map((line, index) => {
                                const [label, value] = line.split(':').map(part => part.trim());
                                return (
                                  <div key={index} className="flex items-center space-x-2">
                                    <span className="text-gray-500">{label}:</span>
                                    <span className="font-medium text-gray-900">{value}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Bảng size chi tiết */}
                        <div>
                          <h4 className={`text-base font-medium mb-3 ${theme === 'tet' ? 'text-red-600' : 'text-gray-900'}`}>
                            Bảng size chi tiết
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiều cao (cm)</th>
                                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cân nặng (kg)</th>
                                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vòng ngực (cm)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 text-sm font-medium text-gray-900">S</td>
                                  <td className="py-4 text-sm text-gray-600">150-160</td>
                                  <td className="py-4 text-sm text-gray-600">45-50</td>
                                  <td className="py-4 text-sm text-gray-600">85-90</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 text-sm font-medium text-gray-900">M</td>
                                  <td className="py-4 text-sm text-gray-600">160-165</td>
                                  <td className="py-4 text-sm text-gray-600">50-55</td>
                                  <td className="py-4 text-sm text-gray-600">90-95</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 text-sm font-medium text-gray-900">L</td>
                                  <td className="py-4 text-sm text-gray-600">165-170</td>
                                  <td className="py-4 text-sm text-gray-600">55-60</td>
                                  <td className="py-4 text-sm text-gray-600">95-100</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-4 space-y-2">
                            <p className="text-sm text-gray-500 italic">
                              * Bảng size chỉ mang tính chất tham khảo. Kích thước thực tế có thể thay đổi từ 1-2cm.
                            </p>
                            <div className={`p-4 rounded-lg ${theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'}`}>
                              <p className={`text-sm ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'} font-medium mb-1`}>
                                🎯 Cần đặt size đặc biệt (XL, XXL)?
                              </p>
                              <p className="text-sm text-gray-600">
                                Shop có thể đặt may riêng size XL, XXL theo số đo của bạn. Vui lòng liên hệ với chúng tôi qua:
                              </p>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FaPhoneAlt className={`${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                                  <span>Hotline: 1900 xxxx</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FaFacebookMessenger className={`${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                                  <a 
                                    href="https://m.me/kttstore" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`${theme === 'tet' ? 'text-red-600' : 'text-blue-600'} hover:underline`}
                                  >
                                    Nhắn tin Facebook
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hướng dẫn bảo quản */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'care' ? null : 'care')}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between ${expandedSection === 'care' ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                >
                  <span className="font-medium flex items-center">
                    <FaInfoCircle className="h-4 w-4 mr-2 text-red-600" />
                    Hướng dẫn bảo quản
                  </span>
                  <FaChevronDown
                    className={`w-4 h-4 transform transition-transform ${expandedSection === 'care' ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Hướng dẫn bảo quản */}
                {expandedSection === 'care' && (
                  <div className="p-4 border-t">
                    <div className="space-y-2">
                      {product.description
                        ?.split('Chi tiết bảo quản sản phẩm :')[1]
                        ?.split('\n')
                        .filter(line => line.trim())
                        .map((line, index) => (
                          <div key={index} className="flex items-start group">
                            <span className={`w-1.5 h-1.5 rounded-full mt-2 mr-3 ${theme === 'tet' ? 'bg-red-400' : 'bg-blue-400'}`} />
                            <span className="text-gray-600">{line.trim().replace(/^\*\s*/, '')}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // Đánh giá sản phẩm
          <div className="space-y-8">
            {/* Đánh giá sản phẩm */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Đánh giá trung bình */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{reviewStats.averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-5 h-5 ${star <= reviewStats.averageRating
                            ? theme === 'tet'
                              ? 'text-red-400'
                              : 'text-yellow-400'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reviewStats.totalReviews} đánh giá
                  </div>
                </div>

                {/* Rating Bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <div className="flex items-center w-24">
                        <span className="text-sm text-gray-600 mr-2">{rating}</span>
                        <FaStar className={`w-4 h-4 ${theme === 'tet' ? 'text-red-400' : 'text-yellow-400'}`} />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${theme === 'tet' ? 'bg-red-400' : 'bg-yellow-400'}`}
                          style={{
                            width: `${reviewStats.totalReviews > 0
                                ? (reviewStats.ratingCounts[rating] / reviewStats.totalReviews) * 100
                                : 0
                              }%`,
                          }}
                        ></div>
                      </div>
                      <span className="w-16 text-right text-sm text-gray-500">
                        {reviewStats.ratingCounts[rating]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Viết đánh giá */}
                <div className="flex flex-col justify-center items-center">
                  {!userReview ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${theme === 'tet'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      Viết đánh giá
                    </button>
                  ) : (
                    // Đánh giá đã có
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">Bạn đã đánh giá sản phẩm này</p>
                      <button
                        onClick={() => {
                          setNewReview({
                            rating: userReview.rating,
                            comment: userReview.comment
                          });
                          setShowReviewForm(true);
                        }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${theme === 'tet'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                      >
                        Chỉnh sửa đánh giá
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form đánh giá */}
            {showReviewForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá của bạn
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="focus:outline-none"
                        >
                          <FaStar
                            className={`w-8 h-8 ${star <= newReview.rating
                                ? theme === 'tet'
                                  ? 'text-red-400'
                                  : 'text-yellow-400'
                                : 'text-gray-300'
                              } transition-colors duration-200`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhận xét của bạn
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      minLength={10}
                      maxLength={1000}
                      required
                    ></textarea>
                    <p className="mt-1 text-sm text-gray-500">
                      {newReview.comment.length}/1000 ký tự
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setNewReview({ rating: 5, comment: '' });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${theme === 'tet'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {userReview ? 'Cập nhật' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Danh sách đánh giá */}
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : reviews.length > 0 ? (
              // Danh sách đánh giá
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.reviewID} className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                          {review.userInfo?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div>
                          {/* User Info */}
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.userInfo?.fullName || 'Người dùng ẩn danh'}</span>
                            {review.isCurrentUser && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'tet'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-blue-100 text-blue-600'
                                }`}>
                                Đánh giá của bạn
                              </span>
                            )}
                          </div>

                          {/* Đánh giá */}
                          <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating
                                    ? theme === 'tet'
                                      ? 'text-red-400'
                                      : 'text-yellow-400'
                                    : 'text-gray-300'
                                  }`}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          {/* Nhận xét */}
                          <p className="mt-2 text-gray-600">{review.comment}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      {review.isCurrentUser && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setNewReview({
                                rating: review.rating,
                                comment: review.comment
                              });
                              setShowReviewForm(true);
                            }}
                            className={`p-2 rounded-full transition-colors duration-200 ${theme === 'tet'
                                ? 'hover:bg-red-50 text-red-600'
                                : 'hover:bg-blue-50 text-blue-600'
                              }`}
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.reviewID)}
                            className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors duration-200"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">Chưa có đánh giá nào cho sản phẩm này</div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${theme === 'tet'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  Hãy là người đầu tiên đánh giá
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
