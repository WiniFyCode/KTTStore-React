// ShippingPolicy.jsx - Trang chính sách vận chuyển của KTT Store
import React from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaTruck, FaClock, FaMapMarkedAlt, FaShieldAlt } from 'react-icons/fa';

const ShippingPolicy = () => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

  // Dữ liệu các chính sách vận chuyển
  const policies = [
    {
      icon: <FaTruck />,
      title: 'Phương thức vận chuyển',
      content: 'Chúng tôi hợp tác với các đơn vị vận chuyển uy tín như GiaoHangNhanh, Viettel Post để đảm bảo hàng hóa được giao đến tay khách hàng an toàn và nhanh chóng.'
    },
    {
      icon: <FaClock />,
      title: 'Thời gian giao hàng',
      content: 'Nội thành: 1-2 ngày làm việc\nNgoại thành: 2-3 ngày làm việc\nTỉnh/Thành phố khác: 3-5 ngày làm việc'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Phí vận chuyển',
      content: 'Miễn phí vận chuyển cho đơn hàng từ 500,000đ\nNội thành: 20,000đ\nNgoại thành: 30,000đ\nTỉnh/Thành phố khác: Tùy theo khu vực'
    },
    {
      icon: <FaMapMarkedAlt />,
      title: 'Khu vực giao hàng',
      content: 'Chúng tôi giao hàng trên toàn quốc. Một số khu vực đặc biệt có thể mất thêm 1-2 ngày để giao hàng.'
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
          title="Chính sách vận chuyển"
          description="Thông tin chi tiết về dịch vụ vận chuyển của KTT Store"
          className={theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'}
        />

        {/* Nội dung chính */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Grid hiển thị các chính sách vận chuyển */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {policies.map((policy, index) => (
              // Card cho mỗi chính sách
              <div 
                key={index}
                className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm ${
                  theme === 'tet'
                    ? 'bg-white/90 hover:bg-red-50/90'
                    : 'bg-white/90 hover:bg-blue-50/90'
                }`}
              >
                {/* Icon chính sách */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  theme === 'tet'
                    ? 'bg-red-100 text-red-500'
                    : 'bg-blue-100 text-blue-500'
                }`}>
                  {policy.icon}
                </div>
                {/* Tiêu đề và nội dung */}
                <h3 className="text-xl font-bold mb-3">{policy.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{policy.content}</p>
              </div>
            ))}
          </div>

          {/* Phần lưu ý quan trọng */}
          <div className={`mt-12 p-6 rounded-2xl ${
            theme === 'tet'
              ? 'bg-red-50'
              : 'bg-blue-50'
          }`}>
            <h3 className="text-xl font-bold mb-4">Lưu ý:</h3>
            {/* Danh sách các lưu ý quan trọng */}
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Thời gian giao hàng có thể thay đổi do điều kiện thời tiết hoặc các sự kiện bất khả kháng</li>
              <li>Quý khách vui lòng kiểm tra hàng kỹ trước khi nhận hàng</li>
              <li>Trường hợp không nhận được hàng, vui lòng liên hệ hotline để được hỗ trợ</li>
              <li>Phí ship có thể thay đổi tùy theo khối lượng và kích thước đơn hàng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
