// Policy.jsx - Trang chính sách chung của KTT Store
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaTruck, FaExchangeAlt, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';

const Policy = () => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

  // Dữ liệu các chính sách
  const policies = [
    {
      icon: <FaTruck className="text-4xl" />,
      title: 'Chính sách vận chuyển',
      description: 'Thông tin chi tiết về phương thức vận chuyển, thời gian giao hàng và phí vận chuyển.',
      link: '/policy/shipping',
      linkText: 'Xem chi tiết'
    },
    {
      icon: <FaExchangeAlt className="text-4xl" />,
      title: 'Chính sách đổi trả',
      description: 'Quy định về việc đổi trả hàng, hoàn tiền và các trường hợp được chấp nhận.',
      link: '/policy/return',
      linkText: 'Xem chi tiết'
    },
    {
      icon: <FaMoneyBillWave className="text-4xl" />,
      title: 'Chính sách thanh toán',
      description: 'Các phương thức thanh toán được chấp nhận và quy trình xử lý giao dịch.',
      link: '/policy/payment',
      linkText: 'Xem chi tiết'
    }
  ];

  return (
    // Container chính với gradient background tùy theo theme
    <div className={`min-h-screen relative ${
      theme === 'tet'
        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Các phần tử trang trí nền */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Vòng tròn trang trí */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 ${
          theme === 'tet' ? 'bg-red-300' : 'bg-blue-300'
        }`} />
        <div className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20 ${
          theme === 'tet' ? 'bg-yellow-300' : 'bg-purple-300'
        }`} />
        
        {/* Các phần tử nổi với animation */}
        {theme === 'tet' ? (
          // Các phần tử nổi cho theme Tết
          <>
            <div className="absolute top-1/4 left-10 w-4 h-4 bg-red-400 rounded-full animate-float-slow" />
            <div className="absolute top-1/3 right-12 w-3 h-3 bg-yellow-400 rounded-full animate-float-slower" />
            <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-orange-400 rounded-full animate-float" />
          </>
        ) : (
          // Các phần tử nổi cho theme mặc định
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
          title="Chính sách"
          description="Các chính sách và quy định của KTT Store"
        />

        {/* Nội dung chính */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Grid hiển thị các chính sách */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy, index) => (
              // Card cho mỗi chính sách
              <div
                key={index}
                className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm ${
                  theme === 'tet'
                    ? 'bg-white/90 hover:bg-red-50/90'
                    : 'bg-white/90 hover:bg-blue-50/90'
                }`}
              >
                {/* Icon chính sách */}
                <div className={`mb-4 ${
                  theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                }`}>
                  {policy.icon}
                </div>
                {/* Tiêu đề và mô tả */}
                <h3 className="text-xl font-bold mb-2">{policy.title}</h3>
                <p className="text-gray-600 mb-4">{policy.description}</p>
                {/* Link xem chi tiết */}
                <Link
                  to={policy.link}
                  className={`inline-flex items-center gap-2 font-medium ${
                    theme === 'tet'
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-blue-500 hover:text-blue-600'
                  }`}
                >
                  <span>{policy.linkText}</span>
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>
            ))}
          </div>

          {/* Phần cam kết của shop */}
          <div className={`mt-12 p-8 rounded-2xl ${
            theme === 'tet'
              ? 'bg-red-50'
              : 'bg-blue-50'
          }`}>
            <h2 className="text-2xl font-bold mb-4">Cam kết của chúng tôi</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Tại KTT Store, chúng tôi cam kết:
              </p>
              {/* Danh sách các cam kết */}
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Minh bạch trong mọi chính sách</li>
                <li>Bảo vệ quyền lợi khách hàng</li>
                <li>Hỗ trợ khách hàng 24/7</li>
                <li>Liên tục cập nhật và cải thiện dịch vụ</li>
              </ul>
              {/* Phần liên hệ */}
              <p>
                Nếu bạn có bất kỳ thắc mắc nào về các chính sách của chúng tôi, 
                vui lòng <Link to="/support/contact" className={`font-medium ${
                  theme === 'tet' ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'
                }`}>liên hệ</Link> để được hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policy;
