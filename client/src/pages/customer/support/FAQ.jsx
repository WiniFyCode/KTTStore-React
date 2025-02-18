// FAQ.jsx - Component hiển thị trang câu hỏi thường gặp

import React, { useState } from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  // Sử dụng theme context để quản lý giao diện theo chủ đề
  const { theme } = useTheme();
  
  // State lưu trữ index của câu hỏi đang được mở
  const [activeIndex, setActiveIndex] = useState(null);

  // Dữ liệu các câu hỏi thường gặp, được chia theo danh mục
  const faqs = [
    {
      category: 'Đơn hàng & Vận chuyển',
      questions: [
        {
          q: 'Tôi có thể theo dõi đơn hàng của mình ở đâu?',
          a: 'Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi" sau khi đăng nhập. Tại đây bạn sẽ thấy trạng thái và vị trí hiện tại của đơn hàng.'
        },
        {
          q: 'Thời gian giao hàng mất bao lâu?',
          a: 'Thời gian giao hàng thông thường:\n- Nội thành: 1-2 ngày\n- Ngoại thành: 2-3 ngày\n- Tỉnh/thành khác: 3-5 ngày'
        },
        {
          q: 'Tôi có thể thay đổi địa chỉ giao hàng không?',
          a: 'Bạn có thể thay đổi địa chỉ giao hàng trước khi đơn hàng được xác nhận. Vui lòng liên hệ hotline để được hỗ trợ.'
        }
      ]
    },
    {
      category: 'Sản phẩm & Chất lượng',
      questions: [
        {
          q: 'Làm sao để biết size quần áo phù hợp?',
          a: 'Bạn có thể tham khảo bảng size trong mục "Hướng dẫn chọn size". Nếu còn phân vân, hãy liên hệ với chúng tôi để được tư vấn.'
        },
        {
          q: 'Sản phẩm có bảo hành không?',
          a: 'Các sản phẩm của KTT Store được bảo hành 30 ngày cho các lỗi từ nhà sản xuất. Riêng giày được bảo hành 90 ngày.'
        },
        {
          q: 'Chất liệu sản phẩm có bền không?',
          a: 'Tất cả sản phẩm của chúng tôi đều được kiểm tra chất lượng kỹ càng trước khi xuất kho. Chúng tôi cam kết chỉ sử dụng các chất liệu bền đẹp, an toàn cho người dùng.'
        }
      ]
    },
    {
      category: 'Thanh toán & Giá cả',
      questions: [
        {
          q: 'Có những phương thức thanh toán nào?',
          a: 'KTT Store chấp nhận các hình thức thanh toán:\n- COD (thanh toán khi nhận hàng)\n- Chuyển khoản ngân hàng\n- Thẻ tín dụng/ghi nợ\n- Ví điện tử (Momo, ZaloPay)'
        },
        {
          q: 'Có được đổi trả nếu không vừa ý không?',
          a: 'Có, bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên tem mác và chưa qua sử dụng.'
        },
        {
          q: 'Có mất phí đổi trả không?',
          a: 'Phí ship đổi trả sẽ do khách hàng chi trả. Trong trường hợp lỗi từ phía cửa hàng, chúng tôi sẽ chịu phí ship 2 chiều.'
        }
      ]
    }
  ];

  // Hàm xử lý khi click vào câu hỏi để mở/đóng
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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
          title="Câu hỏi thường gặp"
          description="Giải đáp các thắc mắc của khách hàng"
          className={theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'}
        />

        {/* Nội dung chính */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Lặp qua từng danh mục câu hỏi */}
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              {/* Tiêu đề danh mục */}
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'tet' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {category.category}
              </h2>
              {/* Danh sách câu hỏi trong danh mục */}
              <div className="space-y-4">
                {category.questions.map((item, index) => {
                  const isActive = activeIndex === `${categoryIndex}-${index}`;
                  return (
                    <div 
                      key={index}
                      className={`rounded-xl overflow-hidden backdrop-blur-sm transform transition-all duration-300 ease-in-out hover:-translate-y-1 ${
                        theme === 'tet'
                          ? 'bg-white/90 hover:bg-red-50/90'
                          : 'bg-white/90 hover:bg-blue-50/90'
                      } ${isActive ? 'shadow-lg' : 'hover:shadow-xl'}`}
                    >
                      {/* Nút câu hỏi */}
                      <button
                        className="w-full px-6 py-4 flex items-center justify-between gap-4"
                        onClick={() => toggleAccordion(`${categoryIndex}-${index}`)}
                      >
                        <span className="font-medium text-left flex-1">{item.q}</span>
                        <div className={`transform transition-transform duration-300 ease-in-out ${isActive ? 'rotate-180' : ''}`}>
                          <FaChevronDown className={`${
                            isActive 
                              ? (theme === 'tet' ? 'text-red-500' : 'text-blue-500')
                              : 'text-gray-400'
                          }`} />
                        </div>
                      </button>
                      {/* Phần câu trả lời */}
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-6 pb-4 pt-0">
                            <p className="text-gray-600 whitespace-pre-line">{item.a}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Phần liên hệ hỗ trợ */}
          <div className={`mt-12 p-6 rounded-2xl text-center ${
            theme === 'tet'
              ? 'bg-red-50'
              : 'bg-blue-50'
          }`}>
            <p className="text-gray-600">
              Không tìm thấy câu trả lời bạn cần? Hãy{' '}
              <a 
                href="/support/contact" 
                className={`font-medium ${
                  theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                } hover:underline`}
              >
                liên hệ với chúng tôi
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
