// Coupons.jsx - Trang hiển thị danh sách mã giảm giá của người dùng
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaGift, FaCalendarAlt, FaTag, FaClock, FaPercent, FaShoppingBag, FaInfoCircle, FaCheck, FaTimes, FaCalculator } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';

// Hàm helper để xác định trạng thái của coupon (đã hủy, hết hạn, đã sử dụng, còn hiệu lực)
const getStatusInfo = (coupon) => {
  const now = new Date();
  const expiry = new Date(coupon.expiryDate);

  // Kiểm tra các trạng thái theo thứ tự ưu tiên
  if (coupon.status === 'cancelled') {
    return {
      text: 'Đã hủy',
      color: 'text-red-600 bg-red-100'
    };
  }

  if (now > expiry) {
    return {
      text: 'Đã hết hạn',
      color: 'text-gray-600 bg-gray-100'
    };
  }

  if (coupon.usageLeft === 0) {
    return {
      text: 'Đã sử dụng',
      color: 'text-blue-600 bg-blue-100'
    };
  }

  return {
    text: 'Còn hiệu lực',
    color: 'text-green-600 bg-green-100'
  };
};

// Component hiển thị thẻ coupon
const CouponCard = ({ coupon, theme, onPreview }) => {
  // Kiểm tra dữ liệu coupon hợp lệ
  if (!coupon || !coupon.couponInfo) {
    return null;
  }

  // State quản lý trạng thái copy mã
  const [copied, setCopied] = useState(false);

  // Thêm state để quản lý trạng thái hiển thị chi tiết
  const [showDetails, setShowDetails] = useState(false);

  // Xử lý sao chép mã giảm giá
  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.couponInfo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset trạng thái sau 2s
  };

  return (
    <div className="relative group">
      {/* Hiệu ứng lấp lánh khi hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Card chính */}
      <div className={`relative flex bg-white rounded-2xl overflow-hidden shadow-lg ${
        theme === 'tet' ? 'border-red-100' : 'border-blue-100'
      } border-2`}>
        {/* Phần bên trái - Hiển thị giá trị giảm giá */}
        <div className={`w-1/3 p-6 flex flex-col items-center justify-center ${
          theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'
        }`}>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-1 ${
              theme === 'tet' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {coupon.couponInfo.discountValue}
              <span className="text-2xl">{coupon.couponInfo.discountType === 'percentage' ? '%' : 'đ'}</span>
            </div>
            <div className="text-sm text-gray-600">Giảm tối đa</div>
            <div className="font-medium text-gray-800">
              {coupon.couponInfo.maxDiscountAmount?.toLocaleString()}đ
            </div>
          </div>
        </div>

        {/* Đường răng cưa trang trí giữa */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-200"></div>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`absolute left-[-4px] w-2 h-2 rounded-full bg-gray-100 ${
              i % 2 === 0 ? 'bg-white' : ''
            }`} style={{ top: `${(i + 1) * 8}%` }}></div>
          ))}
        </div>

        {/* Phần bên phải - Thông tin chi tiết */}
        <div className="flex-1 p-6">
          {/* Header - Hiển thị trạng thái và số lần sử dụng còn lại */}
          <div className="flex justify-between items-start mb-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusInfo(coupon).color}`}>
              {getStatusInfo(coupon).text}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FaClock className="w-3 h-3" />
              <span>Còn {coupon.usageLeft} lần dùng</span>
            </div>
          </div>

          {/* Tên và mã giảm giá */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem] h-14 overflow-hidden">
              {coupon.couponInfo.description}
            </h3>
            <div className="flex items-center gap-2">
              <code className={`px-2 py-1 rounded text-sm font-mono ${
                theme === 'tet' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {coupon.couponInfo.code}
              </code>
              <button
                onClick={handleCopyCode}
                className={`text-sm ${
                  copied 
                    ? 'text-green-500' 
                    : theme === 'tet' ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'
                }`}
              >
                {copied ? <FaCheck className="w-4 h-4" /> : 'Sao chép'}
              </button>
            </div>
          </div>

          {/* Điều kiện sử dụng */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaShoppingBag className="w-3 h-3" />
              <span>Đơn tối thiểu {coupon.couponInfo.minOrderValue?.toLocaleString()}đ</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCalendarAlt className="w-3 h-3" />
              <span>HSD: {format(new Date(coupon.expiryDate), 'dd/MM/yyyy')}</span>
            </div>
            {/* Thêm danh sách category với nút xem chi tiết */}
            {coupon.couponInfo.appliedCategories && coupon.couponInfo.appliedCategories.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <FaTag className="w-3 h-3 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>Áp dụng cho {coupon.couponInfo.appliedCategories.length} danh mục</span>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className={`text-xs flex items-center gap-1 ${
                        theme === 'tet' ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {showDetails ? 'Thu gọn' : 'Xem chi tiết'}
                      <div className={`transform transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </button>
                  </div>
                  <div className={`grid transition-all duration-300 ease-in-out ${
                    showDetails ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}>
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {coupon.couponInfo.appliedCategories.map((category) => (
                          <span 
                            key={category.categoryID}
                            className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                              theme === 'tet' 
                                ? 'bg-red-50 text-red-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thanh tiến trình hiển thị số lần sử dụng */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Số lần sử dụng còn lại</span>
              <span className={`text-sm font-medium ${
                theme === 'tet' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {coupon.usageLeft}/{coupon.couponInfo.usageLimit} lần
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  theme === 'tet' 
                    ? 'bg-gradient-to-r from-red-500 to-red-400'
                    : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{
                  width: `${(coupon.usageLeft / coupon.couponInfo.usageLimit) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Thêm nút xem trước vào cuối card */}
          <div className="mt-4">
            <button
              onClick={() => onPreview(coupon)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                theme === 'tet'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <FaCalculator className="w-5 h-5" />
              <span>Xem trước giảm giá</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component chính
const Coupons = () => {
  // Sử dụng theme từ context
  const { theme } = useTheme();
  
  // Các state quản lý dữ liệu
  const [coupons, setCoupons] = useState([]); // Danh sách coupon
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [filter, setFilter] = useState('all'); // Bộ lọc: 'all', 'active', 'used', 'expired'
  
  // State cho modal xem trước
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [previewOrderValue, setPreviewOrderValue] = useState('');

  // Fetch dữ liệu coupon từ API khi component mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/user-coupon/my-coupons');
        console.log(response.data);
        if (response.data && response.data.userCoupons) {
          setCoupons(response.data.userCoupons);
        } else {
          setCoupons([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách mã giảm giá(Coupons.jsx):', error);
        toast.error('Không thể tải danh sách mã giảm giá');
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Hàm format ngày tháng theo tiếng Việt
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: vi });
  };

  // Lọc danh sách coupon theo filter đã chọn
  const filteredCoupons = Array.isArray(coupons) ? coupons.filter(coupon => {
    if (!coupon) return false;
    
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    const status = getStatusInfo(coupon);

    switch (filter) {
      case 'active':
        return status.text === 'Còn hiệu lực';
      case 'used':
        return coupon.usageLeft === 0;
      case 'expired':
        return now > expiry || coupon.status === 'cancelled';
      default:
        return true;
    }
  }) : [];

  // Hàm tính toán số tiền giảm giá
  const calculateDiscount = (coupon, orderValue) => {
    if (!orderValue || !coupon?.couponInfo) return 0;
    
    const value = parseInt(orderValue);
    if (value < coupon.couponInfo.minOrderValue) return 0;

    let discount = 0;
    if (coupon.couponInfo.discountType === 'percentage') {
      discount = Math.floor(value * (coupon.couponInfo.discountValue / 100));
      if (coupon.couponInfo.maxDiscountAmount) {
        discount = Math.min(discount, coupon.couponInfo.maxDiscountAmount);
      }
    } else {
      discount = Math.min(coupon.couponInfo.discountValue, value);
    }
    
    return discount;
  };

  // Hàm xử lý khi click nút xem trước
  const handlePreviewClick = (coupon) => {
    setSelectedCoupon(coupon);
    setShowPreviewModal(true);
  };

  // Modal xem trước
  const renderPreviewModal = () => {
    if (!showPreviewModal || !selectedCoupon) return null;

    const discount = calculateDiscount(selectedCoupon, previewOrderValue);

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className={`relative bg-white rounded-xl p-8 max-w-md w-full ${
            theme === 'tet' ? 'shadow-red-100' : 'shadow-blue-100'
          } shadow-xl`}>
            <h3 className={`text-2xl font-bold mb-6 ${
              theme === 'tet' ? 'text-red-600' : 'text-blue-600'
            }`}>
              Xem trước giảm giá
            </h3>
            
            <div className="space-y-6">
              {/* Thông tin mã giảm giá */}
              <div className={`p-4 rounded-lg ${
                theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                <p className="font-medium mb-2">Thông tin mã giảm giá:</p>
                <ul className="space-y-1 text-sm">
                  <li>Mã: {selectedCoupon.couponInfo.code}</li>
                  <li>
                    Giảm: {selectedCoupon.couponInfo.discountValue}
                    {selectedCoupon.couponInfo.discountType === 'percentage' ? '%' : 'đ'}
                  </li>
                  <li>Đơn tối thiểu: {selectedCoupon.couponInfo.minOrderValue.toLocaleString()}đ</li>
                  {selectedCoupon.couponInfo.maxDiscountAmount && (
                    <li>Giảm tối đa: {selectedCoupon.couponInfo.maxDiscountAmount.toLocaleString()}đ</li>
                  )}
                  {/* Thêm danh sách category */}
                  {selectedCoupon.couponInfo.appliedCategories && 
                   selectedCoupon.couponInfo.appliedCategories.length > 0 && (
                    <li className="mt-2">
                      <span className="block mb-1">Áp dụng cho danh mục:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCoupon.couponInfo.appliedCategories.map((category) => (
                          <span 
                            key={category.categoryID}
                            className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                              theme === 'tet' 
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Nhập giá trị đơn hàng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập giá trị đơn hàng để xem trước
                </label>
                <input
                  type="number"
                  value={previewOrderValue}
                  onChange={(e) => setPreviewOrderValue(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500 focus:border-red-500'
                      : 'focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="VD: 500000"
                />
              </div>

              {/* Hiển thị kết quả */}
              {previewOrderValue && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Giá trị đơn hàng:</span>
                      <span>{parseInt(previewOrderValue).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giảm giá:</span>
                      <span className={`font-medium ${
                        theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        -{discount.toLocaleString()}đ
                      </span>
                    </div>
                    <div className="border-t pt-3 font-medium flex justify-between">
                      <span>Số tiền sau giảm:</span>
                      <span className="text-lg">
                        {(parseInt(previewOrderValue) - discount).toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  {parseInt(previewOrderValue) < selectedCoupon.couponInfo.minOrderValue && (
                    <div className={`text-sm ${
                      theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      * Đơn hàng cần tối thiểu {selectedCoupon.couponInfo.minOrderValue.toLocaleString()}đ để áp dụng mã này
                    </div>
                  )}
                </div>
              )}

              {/* Nút đóng */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewOrderValue('');
                  }}
                  className={`px-6 py-2 rounded-xl transition-colors ${
                    theme === 'tet'
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Kiểm tra trạng thái loading
  if (loading) {
    return (
      <div className={`min-h-screen ${
        theme === 'tet'
          ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <PageBanner 
          icon={FaGift}
          title="MÃ GIẢM GIÁ"
          subtitle="Danh sách mã giảm giá của bạn"
          breadcrumbText="Mã giảm giá"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Grid skeleton loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/80 rounded-2xl p-6 animate-pulse">
                <div className="h-4 w-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
                <div className="h-20 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'tet'
        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Hiệu ứng nền động */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${
          theme === 'tet' ? 'bg-red-200' : 'bg-blue-200'
        }`}></div>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${
          theme === 'tet' ? 'bg-orange-200' : 'bg-indigo-200'
        }`}></div>
        <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${
          theme === 'tet' ? 'bg-yellow-200' : 'bg-purple-200'
        }`}></div>
      </div>

      <div className="relative">
        {/* Banner trang */}
        <PageBanner 
          icon={FaGift}
          title="Mã Giảm Giá"
          subtitle="Danh sách mã giảm giá của bạn"
          breadcrumbText="Mã giảm giá"
        />

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Nút lọc */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === 'all'
                  ? theme === 'tet'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                    : 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === 'active'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              Còn hiệu lực
            </button>
            <button
              onClick={() => setFilter('used')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === 'used'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              Đã sử dụng
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === 'expired'
                  ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/50'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              Hết hạn
            </button>
          </div>

          {/* Nội dung chính */}
          {filteredCoupons.length === 0 ? (
            // Hiển thị thông báo khi không có coupon
            <div className="text-center py-12 bg-white/50 backdrop-blur-md rounded-2xl">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <FaGift className={`w-10 h-10 ${
                  theme === 'tet' ? 'text-red-400' : 'text-blue-400'
                }`} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Không có mã giảm giá nào
              </h3>
              <p className="text-gray-500">
                {filter === 'active' && 'Bạn không có mã giảm giá nào còn hiệu lực'}
                {filter === 'used' && 'Bạn chưa sử dụng mã giảm giá nào'}
                {filter === 'expired' && 'Bạn không có mã giảm giá nào đã hết hạn'}
                {filter === 'all' && 'Bạn chưa có mã giảm giá nào'}
              </p>
            </div>
          ) : (
            // Hiển thị danh sách coupon
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCoupons.map((coupon) => (
                coupon && coupon.userCouponsID && coupon.couponInfo ? (
                  <CouponCard 
                    key={coupon.userCouponsID} 
                    coupon={coupon} 
                    theme={theme} 
                    onPreview={handlePreviewClick}
                  />
                ) : null
              ))}
            </div>
          )}

          {/* Phần thông tin lưu ý */}
          <div className={`mt-12 p-6 rounded-2xl ${
            theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaInfoCircle />
              Lưu ý:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Mỗi mã giảm giá có số lần sử dụng giới hạn</li>
              <li>Vui lòng kiểm tra điều kiện áp dụng trước khi sử dụng</li>
              <li>Mã giảm giá không được áp dụng cùng lúc với các chương trình khuyến mãi khác</li>
              <li>Một số mã giảm giá có thể bị hủy hoặc thay đổi mà không báo trước</li>
            </ul>
          </div>
        </div>
      </div>
      
      {renderPreviewModal()}
    </div>
  );
};

export default Coupons; 