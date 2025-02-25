// Notification.jsx - Trang thông báo của KTT Store
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaBell, FaCheckCircle, FaRegBell, FaCalendarAlt, FaClock, FaExclamationCircle, FaGift, FaShieldAlt, FaStore, FaUserPlus, FaClipboardList, FaPoll, FaFileAlt, FaStar, FaInfoCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import Pagination from '../../../components/Products/Pagination';

const Notification = () => {
  const { theme } = useTheme();
  const [allNotifications, setAllNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0
  });
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 5
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/user-notification');
      if (response.data) {
        const notifications = response.data.data.notifications;
        setAllNotifications(notifications);
        setStats({
          total: notifications.length,
          unread: notifications.filter(notif => !notif.isRead).length
        });
        applyFiltersAndPagination(notifications, 'all', 1);
      }
    } catch (error) {
      console.error('Lỗi lấy thông báo:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = (notifications, currentFilter, page) => {
    let filtered = notifications.filter(notif => {
      const now = new Date();
      const scheduledTime = new Date(notif.notification.scheduledFor);

      if (now < scheduledTime) return false;

      switch (currentFilter) {
        case 'unread':
          return !notif.isRead;
        case 'read':
          return notif.isRead;
        default:
          return true;
      }
    });

    const totalPages = Math.ceil(filtered.length / pagination.limit);
    const start = (page - 1) * pagination.limit;
    const end = start + pagination.limit;
    
    setFilteredNotifications(filtered.slice(start, end));
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      totalPages
    }));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (allNotifications.length > 0) {
      applyFiltersAndPagination(allNotifications, filter, pagination.currentPage);
    }
  }, [filter, pagination.currentPage]);

  const handleMarkAsRead = async (userNotificationID) => {
    try {
      await axiosInstance.put(`/api/user-notification/${userNotificationID}/read`);
      
      const updatedNotifications = allNotifications.map(notif =>
        notif.userNotificationID === userNotificationID
          ? { ...notif, isRead: true, readAt: new Date() }
          : notif
      );
      
      setAllNotifications(updatedNotifications);
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
      applyFiltersAndPagination(updatedNotifications, filter, pagination.currentPage);
      
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Lỗi đánh dấu thông báo đã đọc:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.put('/api/user-notification/mark-all-read');
      
      const updatedNotifications = allNotifications.map(notif => ({
        ...notif,
        isRead: true,
        readAt: new Date()
      }));
      
      setAllNotifications(updatedNotifications);
      setStats(prev => ({
        ...prev,
        unread: 0
      }));
      applyFiltersAndPagination(updatedNotifications, filter, pagination.currentPage);
      
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả thông báo là đã đọc:', error);
      toast.error('Không thể đánh dấu tất cả là đã đọc');
    }
  };

  const handlePageChange = (page) => {
    applyFiltersAndPagination(allNotifications, filter, page);
  };

  // Kiểm tra ngày hợp lệ
  const isValidDate = (date) => {
    return date && !isNaN(new Date(date));
  };

  // Format date với xử lý lỗi
  const formatDate = (date) => {
    try {
      if (!isValidDate(date)) {
        return 'Không xác định';
      }
      return format(new Date(date), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Lỗi format ngày(Notification.jsx):', error);
      return 'Không xác định';
    }
  };

  // Lấy icon dựa trên loại thông báo
  const getNotificationIcon = (type) => {
    const iconProps = {
      className: `w-6 h-6 ${getIconColor(type)}`,
    };

    switch (type) {
      case 'welcome':
        return <FaUserPlus {...iconProps} />;
      case 'promotion':
        return <FaGift {...iconProps} />;
      case 'system':
        return <FaStore {...iconProps} />;
      case 'new_collection':
        return <FaStar {...iconProps} />;
      case 'membership':
        return <FaUserPlus {...iconProps} />;
      case 'policy':
        return <FaFileAlt {...iconProps} />;
      case 'survey':
        return <FaPoll {...iconProps} />;
      case 'security':
        return <FaShieldAlt {...iconProps} />;
      case 'holiday':
        return <FaCalendarAlt {...iconProps} />;
      default:
        return <FaBell {...iconProps} />;
    }
  };

  // Lấy màu icon dựa trên loại thông báo
  const getIconColor = (type) => {
    switch (type) {
      case 'welcome':
        return 'text-green-500';
      case 'promotion':
        return 'text-purple-500';
      case 'system':
        return 'text-blue-500';
      case 'new_collection':
        return 'text-yellow-500';
      case 'membership':
        return 'text-indigo-500';
      case 'policy':
        return 'text-gray-500';
      case 'survey':
        return 'text-orange-500';
      case 'security':
        return 'text-red-500';
      case 'holiday':
        return 'text-pink-500';
      default:
        return 'text-blue-500';
    }
  };

  // Lấy màu nền dựa trên loại thông báo
  const getBackgroundColor = (type) => {
    switch (type) {
      case 'welcome':
        return 'bg-green-50';
      case 'promotion':
        return 'bg-purple-50';
      case 'system':
        return 'bg-blue-50';
      case 'new_collection':
        return 'bg-yellow-50';
      case 'membership':
        return 'bg-indigo-50';
      case 'policy':
        return 'bg-gray-50';
      case 'survey':
        return 'bg-orange-50';
      case 'security':
        return 'bg-red-50';
      case 'holiday':
        return 'bg-pink-50';
      default:
        return 'bg-blue-50';
    }
  };

  // Sửa lại text hiển thị khi không có thông báo
  const getEmptyMessage = () => {
    if (filter === 'unread') {
      return 'Bạn đã đọc tất cả thông báo';
    } else if (filter === 'read') {
      return 'Bạn chưa đọc thông báo nào';
    } else {
      return 'Hiện tại không có thông báo nào';
    }
  };

  // Kiểm tra trạng thái loading
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'tet' ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <PageBanner
          icon={FaBell}
          title="THÔNG BÁO"
          subtitle="Cập nhật những thông tin mới nhất từ KTT Store"
          breadcrumbText="Thông báo"
        />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-xl animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Notifications Skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white/80 rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    // Container chính với gradient background tùy theo theme
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Các phần tử trang trí */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${
          theme === 'tet' ? 'bg-red-200' : 'bg-purple-200'
        }`}></div>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${
          theme === 'tet' ? 'bg-orange-200' : 'bg-yellow-200'
        }`}></div>
        <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${
          theme === 'tet' ? 'bg-yellow-200' : 'bg-pink-200'
        }`}></div>
      </div>

      {/* Banner trang */}
      <PageBanner
        icon={FaBell}
        title="Thông Báo"
        subtitle="Cập nhật những thông tin mới nhất từ KTT Store"
        breadcrumbText="Thông báo"
      />

      {/* Nội dung chính */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Filters - Modern Pill Design */}
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
            onClick={() => setFilter('unread')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === 'unread'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                : 'bg-white/50 hover:bg-white/80'
            }`}
          >
            Chưa đọc
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === 'read'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/50 hover:bg-white/80'
            }`}
          >
            Đã đọc
          </button>
        </div>

        {/* Stats Cards - Glassmorphism Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-xl transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-800">Tổng thông báo</p>
                <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                theme === 'tet' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                <FaBell className={`w-6 h-6 ${
                  theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                }`} />
              </div>
            </div>
          </div>

          {/* Card thông báo chưa đọc */}
          <div className={`p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-xl transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-800">Chưa đọc</p>
                <h3 className="text-3xl font-bold mt-2">{stats.unread}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'tet' ? 'bg-yellow-500/20' : 'bg-purple-500/20'}`}>
                <FaRegBell className={`w-6 h-6 ${theme === 'tet' ? 'text-yellow-500' : 'text-purple-500'}`} />
              </div>
            </div>
          </div>

          {/* Card thông báo đã đọc */}
          <div className={`p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-xl transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-800">Đã đọc</p>
                <h3 className="text-3xl font-bold mt-2">{stats.total - stats.unread}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <FaCheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="space-y-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white/50 backdrop-blur-md rounded-2xl">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <FaBell className={`w-10 h-10 ${
                  theme === 'tet' ? 'text-red-400' : 'text-blue-400'
                }`} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Không có thông báo nào
              </h3>
              <p className="text-gray-500">
                {getEmptyMessage()}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.userNotificationID}
                  className={`group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 transition-all duration-500 border border-white/50 shadow-lg hover:shadow-xl ${
                    !notif.isRead 
                      ? theme === 'tet'
                        ? 'ring-2 ring-red-500/50'
                        : 'ring-2 ring-blue-500/50'
                      : ''
                  } transform hover:-translate-y-1`}
                >
                  <div className="flex items-start gap-6">
                    {/* Pill thời gian */}
                    <div className="flex flex-col items-center min-w-[120px]">
                      <div className={`w-full rounded-2xl p-4 text-center backdrop-blur-md ${
                        theme === 'tet' 
                          ? 'bg-gradient-to-br from-red-500/90 to-orange-500/90 text-white' 
                          : 'bg-gradient-to-br from-blue-500/90 to-purple-500/90 text-white'
                      } shadow-lg`}>
                        <div className="text-sm font-medium">
                          {format(new Date(notif.notification.createdAt), 'MMM', { locale: vi }).toUpperCase()}
                        </div>
                        <div className="text-3xl font-bold mt-1">
                          {format(new Date(notif.notification.createdAt), 'dd')}
                        </div>
                        <div className="text-sm mt-1">
                          {format(new Date(notif.notification.createdAt), 'yyyy')}
                        </div>
                        <div className="text-xs mt-2 pt-2 border-t border-white/20">
                          {format(new Date(notif.notification.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${getBackgroundColor(notif.notification.type)} flex items-center justify-center transform rotate-3 transition-transform group-hover:rotate-0`}>
                              {getNotificationIcon(notif.notification.type)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                              {notif.notification.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-300 ${
                              new Date() > new Date(notif.notification.expiresAt)
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            } group-hover:shadow-md`}>
                              {new Date() > new Date(notif.notification.expiresAt)
                                ? 'Đã hết hạn'
                                : 'Còn hiệu lực'}
                            </span>
                            <span className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-300 ${getBackgroundColor(notif.notification.type)} ${getIconColor(notif.notification.type)} group-hover:shadow-md`}>
                              {notif.notification.type === 'welcome' && 'Chào mừng'}
                              {notif.notification.type === 'promotion' && 'Khuyến mãi'}
                              {notif.notification.type === 'system' && 'Hệ thống'}
                              {notif.notification.type === 'new_collection' && 'Bộ sưu tập mới'}
                              {notif.notification.type === 'membership' && 'Thành viên'}
                              {notif.notification.type === 'policy' && 'Chính sách'}
                              {notif.notification.type === 'survey' && 'Khảo sát'}
                              {notif.notification.type === 'security' && 'Bảo mật'}
                              {notif.notification.type === 'holiday' && 'Ngày lễ'}
                            </span>
                          </div>
                        </div>

                        {/* Nút đánh dấu đã đọc với hiệu ứng hover */}
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.userNotificationID)}
                            className={`opacity-0 group-hover:opacity-100 transition-all duration-500 p-3 rounded-xl ${
                              theme === 'tet'
                                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            } text-white shadow-lg hover:shadow-xl transform hover:scale-110`}
                            title="Đánh dấu đã đọc"
                          >
                            <FaCheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Nội dung với nền gradient */}
                      <div className={`relative p-6 rounded-xl mb-4 backdrop-blur-sm ${
                        theme === 'tet'
                          ? 'bg-gradient-to-r from-red-50/50 via-orange-50/50 to-yellow-50/50'
                          : 'bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50'
                      } group-hover:shadow-md transition-all duration-300`}>
                        <div className="absolute inset-0 rounded-xl opacity-10 bg-gradient-to-r from-current to-transparent"></div>
                        <p className="text-gray-700 relative z-10 text-base leading-relaxed">
                          {notif.notification.message}
                        </p>
                      </div>

                      {/* Timeline với các biển hiệu động */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className={`w-3 h-3 rounded-full ${
                              theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                            <div className={`absolute -inset-2 rounded-full animate-ping opacity-20 ${
                              theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                          </div>
                          <span>Hết hạn: {notif.notification?.expiresAt ? formatDate(notif.notification.expiresAt) : 'Không xác định'}</span>
                        </div>
                        {notif.isRead && notif.readAt && (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <div className="absolute -inset-2 rounded-full animate-pulse opacity-20 bg-green-500"></div>
                            </div>
                            <span className="text-green-600">Đã đọc lúc: {formatDate(notif.readAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phân trang */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              theme={theme === 'tet' ? 'red' : 'blue'}
            />
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
            <li>Thông báo sẽ tự động được đánh dấu là đã đọc sau khi bạn xem</li>
            <li>Một số thông báo quan trọng sẽ được ghim lại trong thời gian dài</li>
            <li>Thông báo khuyến mãi sẽ tự động ẩn sau khi hết hạn</li>
            <li>Bạn có thể tắt thông báo cho từng loại trong phần cài đặt</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notification; 