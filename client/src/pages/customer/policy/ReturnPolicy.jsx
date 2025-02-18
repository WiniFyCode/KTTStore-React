// ReturnPolicy.jsx - Trang chính sách đổi trả của KTT Store
import React from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaExchangeAlt, FaBoxOpen, FaTruck, FaTimesCircle } from 'react-icons/fa';

const ReturnPolicy = () => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

  // Dữ liệu các chính sách đổi trả
  const policies = [
    {
      icon: <FaTruck />,
      title: 'Thời gian đổi trả',
      content: '- 7 ngày đối với sản phẩm lỗi từ nhà sản xuất\n- 3 ngày đối với sản phẩm không vừa size\n- Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng'
    },
    {
      icon: <FaExchangeAlt />,
      title: 'Điều kiện đổi trả',
      content: '- Sản phẩm còn nguyên tem mác\n- Chưa qua sử dụng hoặc giặt ủi\n- Có hóa đơn mua hàng\n- Không áp dụng cho hàng khuyến mãi'
    },
    {
      icon: <FaBoxOpen />,
      title: 'Quy trình đổi trả',
      content: '1. Liên hệ hotline hoặc fanpage\n2. Gửi hình ảnh và mô tả lỗi sản phẩm\n3. Nhận mã đổi trả\n4. Gửi hàng về theo địa chỉ được cung cấp'
    },
    {
      icon: <FaTimesCircle />,
      title: 'Hoàn tiền',
      content: '- Hoàn tiền trong vòng 24h sau khi nhận được hàng trả\n- Hoàn tiền qua tài khoản ngân hàng\n- Phí ship đổi trả do khách hàng chi trả'
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
          title="Chính sách đổi trả"
          description="Thông tin về quy định đổi trả hàng tại KTT Store"
          className={theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'}
        />

        {/* Nội dung chính */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Grid hiển thị các chính sách đổi trả */}
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

          {/* Phần các trường hợp không được đổi trả */}
          <div className={`mt-12 p-6 rounded-2xl ${
            theme === 'tet'
              ? 'bg-red-50'
              : 'bg-blue-50'
          }`}>
            <h3 className="text-xl font-bold mb-4">Các trường hợp không được đổi trả:</h3>
            {/* Danh sách các trường hợp không được đổi trả */}
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Sản phẩm đã qua sử dụng, giặt ủi</li>
              <li>Không còn nguyên tem mác, bao bì</li>
              <li>Sản phẩm trong chương trình khuyến mãi</li>
              <li>Quá thời hạn đổi trả quy định</li>
              <li>Không có hóa đơn mua hàng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
