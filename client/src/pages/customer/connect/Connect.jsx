// Connect.jsx - Trang liên hệ và kết nối với KTT Store
import React from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Connect = () => {
  // Sử dụng theme từ context để thay đổi giao diện
  const { theme } = useTheme();

  // Dữ liệu các mạng xã hội
  const socialLinks = [
    {
      icon: <FaFacebook className="text-4xl" />,
      title: 'Facebook',
      description: 'Theo dõi chúng tôi trên Facebook để cập nhật những tin tức và ưu đãi mới nhất.',
      url: 'https://facebook.com',
      color: 'hover:text-[#1877F2]' // Màu xanh Facebook khi hover
    },
    {
      icon: <FaInstagram className="text-4xl" />,
      title: 'Instagram',
      description: 'Khám phá bộ sưu tập hình ảnh sản phẩm mới nhất trên Instagram.',
      url: 'https://instagram.com',
      color: 'hover:text-[#E4405F]' // Màu hồng Instagram khi hover
    },
    {
      icon: <FaTiktok className="text-4xl" />,
      title: 'TikTok',
      description: 'Xem những video ngắn thú vị về sản phẩm và xu hướng thời trang.',
      url: 'https://tiktok.com',
      color: 'hover:text-[#000000]' // Màu đen TikTok khi hover
    },
    {
      icon: <FaYoutube className="text-4xl" />,
      title: 'YouTube',
      description: 'Theo dõi kênh YouTube của chúng tôi để xem các video review sản phẩm.',
      url: 'https://youtube.com',
      color: 'hover:text-[#FF0000]' // Màu đỏ YouTube khi hover
    }
  ];

  // Dữ liệu thông tin liên hệ
  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: 'Địa chỉ',
      content: '12 Trịnh Đình Thảo, P. Hoà Thanh,\nQ. Tân Phú, TP.HCM'
    },
    {
      icon: <FaPhoneAlt className="text-2xl" />,
      title: 'Hotline',
      content: '1900 xxxx\n0123 456 789'
    },
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: 'Email',
      content: 'support@kttstore.com\ninfo@kttstore.com'
    }
  ];

  return (
    // Container chính với gradient background tùy theo theme
    <div className={`min-h-screen relative ${
      theme === 'tet'
        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' // Gradient cho theme Tết
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50' // Gradient cho theme mặc định
    }`}>
      {/* Các hình trang trí nền */}
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
          title="Kết nối với chúng tôi"
          description="Theo dõi KTT Store trên các nền tảng mạng xã hội"
        />

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Phần mạng xã hội */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {socialLinks.map((social, index) => (
              // Card mạng xã hội với hiệu ứng hover
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm group ${
                  theme === 'tet'
                    ? 'bg-white/90 hover:bg-red-50/90'
                    : 'bg-white/90 hover:bg-blue-50/90'
                }`}
              >
                {/* Icon mạng xã hội */}
                <div className={`mb-4 transition-colors duration-300 ${
                  theme === 'tet' ? 'text-red-500 group-hover:text-red-600' : 'text-blue-500 group-hover:text-blue-600'
                } ${social.color}`}>
                  {social.icon}
                </div>
                {/* Tiêu đề và mô tả */}
                <h3 className="text-xl font-bold mb-2">{social.title}</h3>
                <p className="text-gray-600">{social.description}</p>
              </a>
            ))}
          </div>

          {/* Phần thông tin liên hệ */}
          <div className={`p-8 rounded-2xl ${
            theme === 'tet'
              ? 'bg-red-50'
              : 'bg-blue-50'
          }`}>
            <h2 className="text-2xl font-bold mb-8 text-center">Thông tin liên hệ</h2>
            {/* Grid thông tin liên hệ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="text-center">
                  {/* Icon thông tin */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    theme === 'tet'
                      ? 'bg-red-100 text-red-500'
                      : 'bg-blue-100 text-blue-500'
                  }`}>
                    {info.icon}
                  </div>
                  {/* Tiêu đề và nội dung */}
                  <h3 className="font-bold mb-2">{info.title}</h3>
                  <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bản đồ Google Maps */}
          <div className="mt-12 rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4876586180674!2d106.62628827465386!3d10.777563089364447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ea168a65c0b%3A0x2a4a7dc43e177de1!2zMTIgVHLhu4tuaCDEkMOsbmggVGjhuqNvLCBIb8OgIFRoYW5oLCBUw6JuIFBow7osIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1705252184447!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
