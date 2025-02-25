// Promotion.jsx - Component hiển thị trang khuyến mãi

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaGift, FaCalendarAlt, FaTag, FaClock, FaPercent, FaShoppingBag, FaInfoCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';

const Promotion = () => {
  // Sử dụng theme context để quản lý giao diện theo chủ đề
  const { theme } = useTheme();
  
  // Khởi tạo các state cần thiết
  const [promotions, setPromotions] = useState([]); // State lưu trữ danh sách khuyến mãi
  const [loading, setLoading] = useState(true); // State quản lý trạng thái loading
  const [filter, setFilter] = useState('all'); // State quản lý bộ lọc ('all', 'active', 'upcoming', 'expired')

  // Effect hook để fetch dữ liệu khuyến mãi khi component mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/promotions/active');
        if (response.data && response.data.success) {
          setPromotions(response.data.data);
        } else {
          toast.error('Không thể tải danh sách khuyến mãi');
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách khuyến mãi (Promotion.jsx):', error);
        toast.error('Có lỗi xảy ra khi tải danh sách khuyến mãi');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Hàm format ngày tháng theo định dạng tiếng Việt
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: vi });
  };

  // Hàm xác định màu sắc cho trạng thái khuyến mãi
  const getStatusColor = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'text-yellow-600 bg-yellow-100'; // Sắp diễn ra
    } else if (now > end) {
      return 'text-red-600 bg-red-100'; // Đã kết thúc
    } else {
      return 'text-green-600 bg-green-100'; // Đang diễn ra
    }
  };

  // Hàm lấy text hiển thị trạng thái khuyến mãi
  const getStatusText = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'Sắp diễn ra';
    } else if (now > end) {
      return 'Đã kết thúc';
    } else {
      return 'Đang diễn ra';
    }
  };

  // Lọc danh sách khuyến mãi theo trạng thái đã chọn
  const filteredPromotions = promotions.filter(promo => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    switch (filter) {
      case 'active':
        return now >= start && now <= end; // Đang diễn ra
      case 'upcoming':
        return now < start; // Sắp diễn ra
      case 'expired':
        return now > end; // Đã kết thúc
      default:
        return true; // Hiển thị tất cả
    }
  });

  // Render component
  return (
    <div className={`min-h-screen relative ${
      theme === 'tet'
        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Phần trang trí nền */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Hình tròn trang trí */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 ${
          theme === 'tet' ? 'bg-red-300' : 'bg-blue-300'
        }`} />
        <div className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20 ${
          theme === 'tet' ? 'bg-yellow-300' : 'bg-purple-300'
        }`} />
        
        {/* Các phần tử nổi */}
        {theme === 'tet' ? (
          // Hiển thị các phần tử nổi cho theme 'tet'
          <>
            <div className="absolute top-1/4 left-10 w-4 h-4 bg-red-400 rounded-full animate-float-slow" />
            <div className="absolute top-1/3 right-12 w-3 h-3 bg-yellow-400 rounded-full animate-float-slower" />
            <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-orange-400 rounded-full animate-float" />
          </>
        ) : (
          // Hiển thị các phần tử nổi cho theme 'normal'
          <>
            <div className="absolute top-1/4 left-10 w-4 h-4 bg-blue-400 rounded-full animate-float-slow" />
            <div className="absolute top-1/3 right-12 w-3 h-3 bg-indigo-400 rounded-full animate-float-slower" />
            <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-float" />
          </>
        )}
      </div>

      <div className="relative">
        {/* Banner trang */}
        <PageBanner 
          icon={FaGift}
          title="KHUYẾN MÃI"
          subtitle="Các chương trình ưu đãi hấp dẫn từ KTT Store"
          breadcrumbText="Khuyến mãi"
        />

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Các nút lọc */}
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
              Đang diễn ra
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === 'upcoming'
                  ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              Sắp diễn ra
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === 'expired'
                  ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/50'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              Đã kết thúc
            </button>
          </div>

          {/* Stats Cards - Glassmorphism Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card tổng khuyến mãi */}
            <div className={`p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-xl transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-800">Tổng khuyến mãi</p>
                  <h3 className="text-3xl font-bold mt-2">{promotions.length}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'tet' ? 'bg-red-500/20' : 'bg-blue-500/20'
                }`}>
                  <FaGift className={`w-6 h-6 ${
                    theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </div>

            {/* Card đang diễn ra */}
            <div className={`p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-xl transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-800">Đang diễn ra</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {promotions.filter(promo => {
                      const now = new Date();
                      const start = new Date(promo.startDate);
                      const end = new Date(promo.endDate);
                      return now >= start && now <= end;
                    }).length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <FaCalendarAlt className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            {/* Card sắp diễn ra */}
            <div className={`p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-xl transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-800">Sắp diễn ra</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {promotions.filter(promo => new Date() < new Date(promo.startDate)).length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <FaClock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Hiển thị trạng thái loading */}
          {loading ? (
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
          ) : filteredPromotions.length === 0 ? (
            // Hiển thị khi không có khuyến mãi
            <div className="text-center py-12">
              <FaGift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Không có chương trình khuyến mãi nào
              </h3>
              <p className="text-gray-500">
                Vui lòng quay lại sau để xem các chương trình khuyến mãi mới nhất
              </p>
            </div>
          ) : (
            // Hiển thị danh sách khuyến mãi
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions.map((promo) => (
                  <div
                    key={promo.promotionID}
                    className={`group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 transition-all duration-500 border border-white/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-12 h-12 rounded-xl ${
                          theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
                        } flex items-center justify-center transform rotate-3 transition-transform group-hover:rotate-0`}>
                          <FaPercent className={`w-6 h-6 ${
                            theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                          }`} />
                        </div>
                        <span className={`text-lg font-bold ${
                          theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          Giảm {promo.discountPercent}%
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusColor(promo.startDate, promo.endDate)
                      }`}>
                        {getStatusText(promo.startDate, promo.endDate)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className={`relative p-6 rounded-xl mb-4 backdrop-blur-sm ${
                      theme === 'tet'
                        ? 'bg-gradient-to-r from-red-50/50 via-orange-50/50 to-yellow-50/50'
                        : 'bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50'
                    } group-hover:shadow-md transition-all duration-300`}>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{promo.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{promo.description}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <FaCalendarAlt />
                        <span>
                          {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                        </span>
                      </div>

                      {/* Thông tin áp dụng */}
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <FaShoppingBag className={theme === 'tet' ? 'text-red-500' : 'text-blue-500'} />
                          Áp dụng cho:
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {promo.products && promo.products.length > 0 && (
                            <li>{promo.products.length} sản phẩm được chọn</li>
                          )}
                          {promo.categories && promo.categories.length > 0 && (
                            <li>Danh mục: {promo.categories.join(', ')}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phần lưu ý */}
              <div className={`mt-12 p-6 rounded-2xl ${
                theme === 'tet'
                  ? 'bg-red-50'
                  : 'bg-blue-50'
              }`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaInfoCircle />
                  Lưu ý:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Thời gian và điều kiện có thể thay đổi mà không báo trước</li>
                  <li>Vui lòng đọc kỹ điều kiện áp dụng trước khi tham gia</li>
                  <li>Mỗi khách hàng chỉ được áp dụng một chương trình khuyến mãi tại một thời điểm</li>
                  <li>Số lượng ưu đãi có hạn</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Promotion;
