// PageBanner.jsx - Component banner cho các trang
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import { useTheme } from '../contexts/CustomerThemeContext';

const PageBanner = ({
  icon: Icon,
  title,
  subtitle,
  breadcrumbText,
  extraContent
}) => {
  const { theme } = useTheme();
  const location = useLocation();

  // Tạo breadcrumb từ current path
  const getBreadcrumbs = () => {
    // Bỏ qua ký tự "/" đầu tiên và split path thành array
    const pathSegments = location.pathname.split('/').filter(segment => segment);

    // Object map các path segment sang tên hiển thị
    const pathNames = {
      'products': 'Sản phẩm',
      'cart': 'Giỏ hàng',
      'checkout': 'Thanh toán',
      'order-history': 'Lịch sử đơn hàng',
      'wishlist': 'Yêu thích',
      'policy': 'Chính sách',
      'shipping': 'Vận chuyển',
      'male': 'Nam',
      'female': 'Nữ',
      'sale': 'Giảm giá',
      'sale-tet': 'Giảm giá Tết',
      'new-arrivals': 'Hàng mới về',
      'tet-collection': 'Thời trang Tết',
      'tet': 'Thời trang Tết',
      'news': 'Tin tức',
      'return': 'Đổi trả',
      'orders': 'Đơn hàng',
      'payment': 'Thanh toán',
      'support': 'Hỗ trợ',
      'about': 'Giới thiệu',
      'connect': 'Liên hệ',
      'faq': 'FAQ',
      'profile': 'Tài khoản',
      'size-guide': 'Hướng dẫn chọn size',
      'contact': 'Liên hệ',
      'promotion': 'Khuyến mãi',
      'coupons': 'Mã giảm giá',
      'notifications': 'Thông báo',
      'admin': 'Quản lý'
    };

    // Tạo mảng breadcrumbs với path và label
    const breadcrumbs = pathSegments.map((segment, index) => {
      // Tạo full path cho segment này
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      // Lấy tên hiển thị từ map hoặc dùng segment gốc nếu không có trong map
      let label = pathNames[segment] || segment;
      if (segment === 'product') {
        return { path: '/products', label: 'Sản phẩm' }; // Đường link cho segment 'product'
      }

      return { path, label };
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="relative">
      {/* Banner chính */}
      <div className={`relative overflow-hidden ${theme === 'tet'
        ? 'bg-gradient-to-br from-red-600 via-red-500 to-orange-500'
        : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
        }`}>
        {/* Các phần tử trang trí */}
        <div className="absolute inset-0">

          {/* Các hình tròn hiệu ứng động */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float-slow"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 animate-float-slow animation-delay-2000"></div>
          </div>

          {/* Nền Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

          {/* Đường thẳng hiệu ứng động */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer"></div>
          </div>

          {/* Các chấm tròn trên overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Container nội dung */}
        <div className="relative container mx-auto px-4 py-20 sm:py-24">
          <div className="max-w-4xl mx-auto">
            {/* Icon với background hiệu ứng động */}
            {Icon && (
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-full">
                  <Icon className="w-12 h-12 text-white" />
                </div>
              </div>
            )}

            {/* Tiêu đề với đường chữ nổi */}
            <h1 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight inline-block">
              {title.toUpperCase()}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 rounded overflow-hidden">
                <div className="h-full w-1/3 bg-white rounded animate-slide"></div>
              </div>
            </h1>

            {/* Chữ mờ với gradient */}
            {subtitle && (
              <p className={`text-xl ${theme === 'tet'
                ? 'text-yellow-200'
                : 'text-blue-200'
                } font-medium mt-4`}>
                {subtitle}
              </p>
            )}

            {/* Nội dung bổ sung */}
            {extraContent}
          </div>
        </div>

        {/* Đường chia hiệu ứng động */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 sm:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0 C150,90 400,120 600,100 C800,80 1050,40 1200,100 L1200,120 L0,120 Z"
              className="fill-[#F8FAFC]"
            ></path>
          </svg>
        </div>
      </div>

      {/* Breadcrumb hiệu ứng động */}
      <div className="container mx-auto px-4">
        <div className={`relative -mt-8 sm:-mt-12 mb-8 inline-flex items-center gap-2 px-6 py-3 rounded-full shadow-lg ${theme === 'tet'
          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
          } backdrop-blur-md`}>
          <Link
            to="/"
            className={`flex items-center gap-2 ${theme === 'tet'
              ? 'text-yellow-300 hover:text-yellow-400'
              : 'text-blue-200 hover:text-blue-300'
              } transition-colors duration-300`}
          >
            <FaHome className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">
              Trang chủ
            </span>
          </Link>

          {/* Breadcrumb */}
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>

              {/* Icon chevron */}
              <FaChevronRight className={`w-3 h-3 ${theme === 'tet'
                ? 'text-yellow-200'
                : 'text-blue-200'
                }`} />
              {index === breadcrumbs.length - 1 ? (
                
                // Label
                <span className={`font-medium ${theme === 'tet'
                  ? 'text-yellow-300'
                  : 'text-blue-300'
                  }`}>
                  {crumb.label}
                </span>
              ) : (
                
                // Link
                <Link
                  to={crumb.path}
                  className={`hover:opacity-90 transition-opacity ${theme === 'tet'
                    ? 'text-yellow-300/90'
                    : 'text-blue-300/90'
                    }`}
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>
        {`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -10px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }

        .animate-slide {
          animation: slide 2s linear infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        `}
      </style>
    </div>
  );
};

export default PageBanner;
