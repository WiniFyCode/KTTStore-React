// PaymentPolicy.jsx - Trang chính sách thanh toán của KTT Store
import React from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaMoneyBillWave, FaCreditCard, FaQrcode, FaUniversity } from 'react-icons/fa';

const PaymentPolicy = () => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

  // Dữ liệu các phương thức thanh toán
  const paymentMethods = [
    {
      icon: <FaMoneyBillWave />,
      title: 'Thanh toán khi nhận hàng (COD)',
      content: '- Thanh toán bằng tiền mặt khi nhận hàng\n- Áp dụng toàn quốc\n- Kiểm tra hàng trước khi thanh toán\n- Không mất phí giao dịch'
    },
    {
      icon: <FaCreditCard />,
      title: 'Thẻ ngân hàng',
      content: '- Hỗ trợ tất cả các ngân hàng nội địa\n- Thanh toán an toàn qua cổng VNPAY\n- Hoàn tiền nếu giao dịch lỗi\n- Phí giao dịch: Miễn phí'
    },
    {
      icon: <FaQrcode />,
      title: 'Ví điện tử',
      content: '- Hỗ trợ: Momo, ZaloPay, VNPay\n- Quét mã QR để thanh toán\n- Xử lý giao dịch tức thì\n- Nhiều ưu đãi từ các ví điện tử'
    },
    {
      icon: <FaUniversity />,
      title: 'Chuyển khoản ngân hàng',
      content: '- Chuyển khoản trước khi giao hàng\n- Gửi biên lai cho CSKH\n- Đơn hàng được xử lý sau khi xác nhận\n- Thời gian xử lý: 5-15 phút'
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
          title="Phương thức thanh toán"
          description="Các hình thức thanh toán được chấp nhận tại KTT Store"
          className={theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'}
        />

        {/* Nội dung chính */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Grid hiển thị các phương thức thanh toán */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paymentMethods.map((method, index) => (
              // Card cho mỗi phương thức thanh toán
              <div 
                key={index}
                className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm ${
                  theme === 'tet'
                    ? 'bg-white/90 hover:bg-red-50/90'
                    : 'bg-white/90 hover:bg-blue-50/90'
                }`}
              >
                {/* Icon phương thức thanh toán */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  theme === 'tet'
                    ? 'bg-red-100 text-red-500'
                    : 'bg-blue-100 text-blue-500'
                }`}>
                  {method.icon}
                </div>
                {/* Tiêu đề và nội dung */}
                <h3 className="text-xl font-bold mb-3">{method.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{method.content}</p>
              </div>
            ))}
          </div>

          {/* Phần thông tin tài khoản ngân hàng */}
          <div className={`mt-12 p-6 rounded-2xl ${
            theme === 'tet'
              ? 'bg-red-50'
              : 'bg-blue-50'
          }`}>
            <h3 className="text-xl font-bold mb-4">Thông tin tài khoản:</h3>
            <div className="space-y-4 text-gray-600">
              {/* Thông tin tài khoản Vietcombank */}
              <div>
                <p className="font-medium">Ngân hàng Vietcombank:</p>
                <p>- Số tài khoản: 1234567890</p>
                <p>- Chủ tài khoản: CÔNG TY TNHH KTT STORE</p>
                <p>- Chi nhánh: TP.HCM</p>
              </div>
              {/* Thông tin tài khoản Techcombank */}
              <div>
                <p className="font-medium">Ngân hàng Techcombank:</p>
                <p>- Số tài khoản: 0987654321</p>
                <p>- Chủ tài khoản: CÔNG TY TNHH KTT STORE</p>
                <p>- Chi nhánh: TP.HCM</p>
              </div>
              {/* Lưu ý khi chuyển khoản */}
              <div className="pt-4">
                <p className="italic">Lưu ý: Nội dung chuyển khoản ghi rõ "Mã đơn hàng - Số điện thoại"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPolicy;
