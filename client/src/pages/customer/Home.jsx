// Home.jsx - Trang chủ của website KTT Store

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, EffectCoverflow } from 'swiper/modules';
import { FaArrowRight, FaGift, FaShippingFast, FaUndo, FaPhoneAlt, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { RiRedPacketLine, RiCoupon3Line, RiVipCrownLine } from 'react-icons/ri';
import { MdCelebration } from 'react-icons/md';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { useTheme } from '../../contexts/CustomerThemeContext';
import { getPromotionContent } from '../../data/PromotionContent';
import { getSubscriptionContent } from '../../data/SubscriptionContent';
import { getSliderData } from '../../data/SliderData';
import { getBannerData } from '../../data/BannerData';
import { getFlashSaleData } from '../../data/FlashSaleData';
import CountdownTimer from '../../components/CountdownTimer';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

const Home = () => {
  const { theme } = useTheme();
  const { sliderContent, benefits } = getPromotionContent(theme);
  const subscriptionContent = getSubscriptionContent(theme);
  const sliderData = getSliderData(theme);
  const banners = getBannerData(theme);
  const flashSaleData = getFlashSaleData(theme || 'default'); // Thêm giá trị mặc định

  // States cho Flash Sale
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [flashSaleInfo, setFlashSaleInfo] = useState(null);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  // State cho sản phẩm và promotions
  const [newProducts, setNewProducts] = useState([]);
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // State cho email subscription
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tính giá sau khi giảm
  const calculateDiscountPrice = (price, discount) => {
    // Chuyển giá từ dạng string "490.000" sang số để tính toán
    const numericPrice = parseFloat(price.replace(/\./g, ''));
    // Tính giá sau giảm
    const discountedPrice = numericPrice * (1 - discount / 100);
    // Làm tròn số
    const roundedPrice = Math.round(discountedPrice);
    // Chuyển lại về dạng string với dấu chấm
    return roundedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Format giá tiền (giá đã được định dạng sẵn trong CSDL)
  const formatPrice = (price) => {
    // Chuyển giá từ dạng string "490.000" sang dạng "###.###.###"
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Function kiểm tra khung giờ Flash Sale
  const isInFlashSaleTimeRange = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return (currentHour >= 12 && currentHour < 14) ||
      (currentHour >= 20 && currentHour < 22);
  };

  // Function để lấy ngẫu nhiên n phần tử từ một mảng
  const getRandomItems = (array, n) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  // Function fetch Flash Sale
  const fetchFlashSale = async () => {
    try {
      // Kiểm tra khung giờ Flash Sale
      const isInTimeRange = isInFlashSaleTimeRange();
      setIsFlashSaleActive(isInTimeRange);

      // Fetch sản phẩm với thông tin promotion
      const response = await axiosInstance.get('/api/products/basic');
      if (response.data && response.data.success) {
        // Lọc ra các sản phẩm có promotion loại flash-sale
        const flashSaleProducts = response.data.products
          .filter(product => product.promotion && product.promotion.type === 'flash-sale')
          .map(product => ({
            ...product,
            originalPrice: product.price,
            discountedPrice: isInTimeRange
              ? calculateDiscountPrice(product.price, product.promotion.discountPercent)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
              : product.price,
            discountPercent: isInTimeRange ? product.promotion.discountPercent : 0,
            soldQuantity: Math.floor(Math.random() * 50 + 50), // Giả lập số lượng đã bán
            totalQuantity: 100 // Giả lập tổng số lượng
          }));

        if (flashSaleProducts.length > 0) {
          // Lấy thông tin flash sale từ sản phẩm đầu tiên
          const flashSale = flashSaleProducts[0].promotion;

          // Tính thời gian bắt đầu và kết thúc của khung giờ flash sale tiếp theo
          const now = new Date();
          const currentHour = now.getHours();
          let nextFlashSaleStart, nextFlashSaleEnd;

          if (currentHour < 12) {
            nextFlashSaleStart = new Date(now.setHours(12, 0, 0, 0));
            nextFlashSaleEnd = new Date(now.setHours(14, 0, 0, 0));
          } else if (currentHour < 20) {
            nextFlashSaleStart = new Date(now.setHours(20, 0, 0, 0));
            nextFlashSaleEnd = new Date(now.setHours(22, 0, 0, 0));
          } else {
            nextFlashSaleStart = new Date(now.setDate(now.getDate() + 1));
            nextFlashSaleStart.setHours(12, 0, 0, 0);
            nextFlashSaleEnd = new Date(nextFlashSaleStart);
            nextFlashSaleEnd.setHours(14, 0, 0, 0);
          }

          setFlashSaleInfo({
            ...flashSale,
            nextStart: nextFlashSaleStart,
            endTime: isInTimeRange ? (currentHour < 14 ? new Date(now.setHours(14, 0, 0, 0)) : new Date(now.setHours(22, 0, 0, 0))) : nextFlashSaleEnd
          });

          // Lấy ngẫu nhiên 4 sản phẩm từ danh sách
          setFlashSaleProducts(getRandomItems(flashSaleProducts, 4));
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu Flash Sale(Home.jsx):', error);
      toast.error('Không thể tải thông tin Flash Sale');
    }
  };

  // Fetch sản phẩm mới nhất
  const fetchNewProducts = async () => {
    setLoadingFeatured(true);
    try {
      const response = await axiosInstance.get('/api/products/basic');
      if (response.data && response.data.success) {
        // Lọc ra các sản phẩm có promotion
        const productsWithPromotion = response.data.products.filter(product => product.promotion);
        // Lấy ngẫu nhiên 4 sản phẩm
        const randomProducts = getRandomItems(productsWithPromotion, 4);
        setNewProducts(randomProducts);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm(Home.jsx):', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoadingFeatured(false);
    }
  };

  // useEffect để fetch và cập nhật Flash Sale
  useEffect(() => {
    const fetchFlashSaleData = async () => {
      setLoadingFlashSale(true);
      try {
        await fetchFlashSale();
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu Flash Sale(Home.jsx):', error);
      } finally {
        setLoadingFlashSale(false);
      }
    };

    fetchFlashSaleData();

    const interval = setInterval(() => {
      fetchFlashSaleData();
    }, 60000); // 60000ms = 1 phút

    return () => clearInterval(interval);
  }, []);

  // useEffect để fetch sản phẩm mới nhất
  useEffect(() => {
    fetchNewProducts();
  }, []);

  // Function to handle email subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/subscriptions', { email });
      if (response.data && response.data.success) {
        toast.success('Đăng ký thành công!');
        setEmail('');
      }
    } catch (error) {
      console.error('Lỗi khi đăng kí (Home.jsx):', error);
      toast.error('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Dòng chạy thông báo */}
      <div className={`w-full py-3 ${theme === 'tet'
          ? 'bg-gradient-to-r from-red-700/100 to-red-700/90 border-y border-yellow-300/30'
          : 'bg-gradient-to-r from-blue-800/100 to-blue-700/100 border-y border-blue-300/30'
        }`}>
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className={`inline-block ${theme === 'tet'
                ? 'text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
              } text-lg font-medium mx-8 tracking-wide`}>
              {/* 🎉 Chào mừng đến với cửa hàng thời trang của chúng tôi! */}
              🙏 Cảm ơn Pantio vì đã cung cấp hình ảnh tham khảo
            </span>
            <span className={`inline-block ${theme === 'tet'
                ? 'text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
              } text-lg font-medium mx-8 tracking-wide`}>
              {/* 🌟 Giảm giá đặc biệt cho các sản phẩm mới! */}
              📚 Hình ảnh và nội dung chỉ mang tính chất tham khảo cho mục đích học tập
            </span>
            <span className={`inline-block ${theme === 'tet'
                ? 'text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
              } text-lg font-medium mx-8 tracking-wide`}>
              {/* 🎁 Miễn phí vận chuyển cho đơn hàng trên 500,000đ! */}
              ⚠️ Không mang tính chất thương mại - Dự án này được tạo ra với mục đích học tập
            </span>
            <span className={`inline-block ${theme === 'tet'
                ? 'text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
              } text-lg font-medium mx-8 tracking-wide`}>
              🎓 Đây là dự án học tập của sinh viên năm 2 ngành CNTT
            </span>
            <span className={`inline-block ${theme === 'tet'
                ? 'text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
              } text-lg font-medium mx-8 tracking-wide`}>
              💻 Sử dụng công nghệ: React, Node.js, MongoDB và Express
            </span>
          </div>
        </div>
      </div>
      
      {/* Hero Section với Slider */}
      <section className="relative h-[calc(100vh-4rem)]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          navigation={false}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false
          }}
          loop={true}
          className="h-full"
        >
          {sliderData.map((slide, index) => (
            <SwiperSlide key={index} className="w-[80%]">
              <div className="relative h-full group">
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayColor} to-transparent`} />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-contain md:object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end pb-16">
                  <div className="text-center transform transition-all duration-500 group-hover:scale-105">
                    <h1 className={`text-5xl font-bold mb-3 ${theme === 'tet' ? 'text-yellow-300' : 'text-white'
                      }`}
                      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                      {slide.title}
                    </h1>
                    <p className="text-xl text-white mb-6"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      {slide.subtitle}
                    </p>
                    <Link
                      to={slide.buttonLink}
                      className={`inline-flex items-center ${theme === 'tet'
                          ? 'bg-red-600 hover:bg-white hover:text-red-600'
                          : 'bg-blue-600 hover:bg-white hover:text-blue-600'
                        } text-white px-8 py-3 rounded-full text-lg transition duration-300 border-2 border-transparent hover:border-current`}
                    >
                      {slide.buttonText}
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination !bottom-4"></div>
        </Swiper>
      </section>

      {/* Slider Section */}
      {sliderContent.map((slide, index) => (
        <div
          key={index}
          className={`relative min-h-[100vh] md:min-h-[580px] flex items-center justify-center text-white ${slide.backgroundColor} `}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="relative z-10 text-center px-4 py-8 md:py-12 w-full max-w-4xl mx-auto">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 ${theme === 'tet' ? 'text-yellow-400' : 'text-white'
              }`}>
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-12">{slide.subtitle}</p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
              {slide.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  // Background color
                  className={`p-4 md:p-6 rounded-lg backdrop-blur-sm ${theme === 'tet'
                      ? 'bg-red-800/50 border border-yellow-400'
                      : 'bg-blue-900/50 border border-blue-400'
                    }`}
                >
                  {/* Icon */}
                  <div className={`text-2xl md:text-3xl font-bold mb-1 md:mb-2 ${theme === 'tet' ? 'text-yellow-400' : 'text-white'
                    }`}>
                    {benefit.value}
                  </div>
                  {/* Description */}
                  <div className="text-xs sm:text-sm md:text-base">{benefit.description}</div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              to="/products"
              className={`inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all ${theme === 'tet'
                  ? 'bg-yellow-400 text-red-700 hover:bg-yellow-300 hover:text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-400 hover:text-white'
                }`}
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}


      {/* Dịch vụ */}
      <section className={`py-10 ${theme === 'tet'
          ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaShippingFast className={`text-4xl ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="font-medium text-gray-800">Miễn phí vận chuyển</h3>
                <p className="text-sm text-gray-600">Cho đơn từ 699K</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaGift className={`text-4xl ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="font-medium text-gray-800">
                  {theme === 'tet' ? 'Lì xì may mắn' : 'Quà tặng hấp dẫn'}
                </h3>
                <p className="text-sm text-gray-600">Tặng kèm đơn hàng</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaUndo className={`text-4xl ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="font-medium text-gray-800">Đổi trả miễn phí</h3>
                <p className="text-sm text-gray-600">Trong 15 ngày</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaPhoneAlt className={`text-4xl ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="font-medium text-gray-800">Hỗ trợ 24/7</h3>
                <p className="text-sm text-gray-600">Hotline: 1900 xxxx</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className={`py-20 ${theme === 'tet' ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`relative overflow-hidden group rounded-2xl shadow-lg md:hover:shadow-2xl transition-all duration-500 ${theme === 'tet'
                    ? 'md:hover:shadow-red-200/50'
                    : 'md:hover:shadow-blue-200/50'
                  }`}
              >
                {/* Banner Image */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-[300px] md:h-[500px] object-contain md:object-cover transition duration-700 md:group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${banner.gradientColor} to-transparent opacity-80 md:group-hover:opacity-90 transition-opacity duration-500`}>
                  {/* Content Container */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 transform md:translate-y-6 md:group-hover:translate-y-0 transition-transform duration-500">
                    {/* Title */}
                    <h2 className={`text-4xl md:text-5xl font-light ${theme === 'tet' ? 'text-yellow-300' : 'text-white'} mb-4 drop-shadow-lg`}
                      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                      {banner.title}
                    </h2>

                    {/* Description */}
                    <p className={`${banner.textColor} text-lg md:text-xl mb-6 md:opacity-0 opacity-100 md:group-hover:opacity-100 transition-opacity duration-500 delay-100`}>
                      {banner.description}
                    </p>

                    {/* Button */}
                    <Link
                      to={banner.link}
                      className={`inline-flex items-center px-6 py-3 rounded-full ${theme === 'tet'
                          ? 'bg-yellow-400 text-red-700 hover:bg-yellow-300'
                          : 'bg-white/90 hover:bg-white'
                        } transition-all duration-300 transform md:-translate-y-2 md:group-hover:translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg`}
                    >
                      <span className="font-medium">{banner.buttonText}</span>
                      <FaArrowRight className={`ml-2 transform md:group-hover:translate-x-1 transition-transform duration-300 ${theme === 'tet' ? 'text-red-700' : 'text-blue-600'
                        }`} />
                    </Link>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-32 h-32 transform rotate-45 translate-x-16 -translate-y-16 ${theme === 'tet'
                    ? 'bg-gradient-to-br from-yellow-400/20 to-red-500/20'
                    : 'bg-gradient-to-br from-blue-400/20 to-purple-500/20'
                  }`} />
                <div className={`absolute bottom-0 left-0 w-24 h-24 transform rotate-45 -translate-x-12 translate-y-12 ${theme === 'tet'
                    ? 'bg-gradient-to-tr from-red-500/20 to-yellow-400/20'
                    : 'bg-gradient-to-tr from-purple-500/20 to-blue-400/20'
                  }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className={`py-12 md:py-20 ${theme === 'tet'
          ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}>
        <div className="container mx-auto px-4">
          {/* Header Flash Sale */}
          <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl md:text-4xl">{theme === 'tet' ? '🧧' : '⚡'}</span>
              <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'tet' ? 'text-red-700' : 'text-indigo-600'
                }`}>
                {theme === 'tet' ? 'FLASH SALE TẾT' : 'FLASH SALE'}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-lg md:text-xl mb-2">
              {isFlashSaleActive ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Kết thúc sau:</span>
                  <CountdownTimer targetDate={flashSaleInfo?.endTime} />
                </div>
              ) : flashSaleInfo?.nextStart && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Bắt đầu sau:</span>
                  <CountdownTimer targetDate={flashSaleInfo?.nextStart} />
                </div>
              )}
            </div>
            <p className={`text-base md:text-lg mt-1 ${theme === 'tet' ? 'text-red-500' : 'text-indigo-500'
              }`}>
              {theme === 'tet' ? 'Săn deal hot - Đón Tết sang' : 'Săn deal hot - Giá sốc mỗi ngày'}
            </p>
          </div>

          {/* Grid sản phẩm với loading skeleton */}
          {loadingFlashSale ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="h-[300px] md:h-[400px] xl:h-[500px] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : flashSaleProducts.length > 0 && (
            <>
              {/* Grid sản phẩm - hiển thị 4 sản phẩm ngẫu nhiên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {flashSaleProducts.map((product) => (
                  <Link
                    key={product.productID}
                    to={`/product/${product.productID}`}
                    className="group"
                  >
                    <div className={`group-hover:shadow-xl transition-all duration-300 ${theme === 'tet'
                        ? 'hover:shadow-red-100'
                        : 'hover:shadow-blue-100'
                      } relative mb-4 overflow-hidden rounded-lg`}>
                      <img
                        src={product.thumbnail || (product.images && product.images[0]) || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-[300px] md:h-[400px] xl:h-[500px] object-cover transition duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      {/* Label SALE */}
                      <div className={`absolute top-0 left-0 ${theme === 'tet' ? 'bg-red-600' : 'bg-indigo-600'
                        } text-white px-2 md:px-3 py-1 rounded-tl-lg rounded-br-lg`}>
                        {theme === 'tet' ? 'SALE TẾT' : 'FLASH SALE'}
                      </div>
                      {/* Label giảm giá */}
                      {isFlashSaleActive ? (
                        <div className={`absolute top-0 right-0 ${theme === 'tet' ? 'bg-yellow-500' : 'bg-indigo-500'
                          } text-white px-2 md:px-3 py-1 rounded font-medium text-sm md:text-base`}>
                          -{product.discountPercent}%
                        </div>
                      ) : (
                        <div className="absolute top-0 right-0 bg-gray-600 text-white px-2 md:px-3 py-1 rounded font-medium text-sm md:text-base">
                          Sắp giảm {flashSaleInfo?.discountPercent}%
                        </div>
                      )}
                      {/* Overlay khi hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                        <div className="absolute bottom-2 md:bottom-4 left-0 right-0 text-center">
                          <button className={`${theme === 'tet'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white px-4 md:px-6 py-2 rounded-full font-medium transition duration-300 text-sm md:text-base`}>
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="text-center">
                      <p className="text-xs md:text-sm text-gray-500 mb-1">
                        {product.category}
                      </p>
                      <h3 className="text-base md:text-lg mb-2 text-gray-800 font-medium line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Giá sản phẩm */}
                      <div className="space-x-2 mb-2">
                        {/* Giá sau khi giảm */}
                        <span className={`text-base md:text-lg ${theme === 'tet' ? 'text-red-600' : 'text-indigo-500'} font-bold`}>
                          {formatPrice(product.discountedPrice)}đ
                        </span>

                        {/* Giá gốc */}
                        {isFlashSaleActive && (
                          <span className="text-xs md:text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}đ
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div
                          className={`h-full ${theme === 'tet' ? 'bg-red-600' : 'bg-indigo-600'
                            } transition-all duration-300`}
                          style={{
                            width: `${Math.min((product.soldQuantity / product.totalQuantity) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Đã bán: {product.soldQuantity}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Nút xem tất cả */}
              <div className="text-center mt-8 md:mt-12">
                <Link
                  to="/sale"
                  className={`inline-flex items-center ${theme === 'tet'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-indigo-600 hover:bg-white border-2 border-indigo-600 hover:text-indigo-600'
                    } text-white px-6 md:px-8 py-2 md:py-3 rounded-full transition-colors text-sm md:text-base`}
                >
                  {theme === 'tet' ? 'XEM TẤT CẢ FLASH SALE TẾT' : 'XEM TẤT CẢ FLASH SALE'}
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className={`py-12 md:py-20 ${flashSaleData.featuredStyle.bg}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold ${flashSaleData.featuredStyle.title} text-center mb-3 md:mb-4`}>
            {flashSaleData.featuredTitle}
          </h2>
          <p className={`${flashSaleData.featuredStyle.subtitle} text-center mb-8 md:mb-12`}>
            {flashSaleData.featuredSubtitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {loadingFeatured ? (
              // Featured Products loading skeleton
              Array(4).fill(null).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-[300px] md:h-[400px] xl:h-[500px] rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              newProducts.map((product) => (
                <Link key={product._id} to={`/product/${product.productID}`} className="group" onClick={() => window.scrollTo(0, 0)}>
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={product.thumbnail || (product.images && product.images[0]) || '/placeholder-image.jpg'}
                      alt={product.name}
                      className="w-full h-[300px] md:h-[400px] xl:h-[500px] object-cover transition duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    {product.promotion && (
                      <div className={`absolute top-0 left-0 ${flashSaleData.style.labelBg} ${flashSaleData.style.labelText} px-2 md:px-3 py-1 rounded-tl-lg rounded-br-lg`}>
                        -{product.promotion.discountPercent}%
                      </div>
                    )}
                    {product.tag && (
                      <div className={`absolute top-0 right-0 ${flashSaleData.style.discountBg} ${flashSaleData.style.discountText} px-2 md:px-3 py-1 rounded font-medium text-sm md:text-base`}>
                        {product.tag}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="absolute bottom-2 md:bottom-4 left-0 right-0 text-center">
                        <button className={`${flashSaleData.style.buttonBg} ${flashSaleData.style.buttonText} px-4 md:px-6 py-2 rounded-full font-medium ${flashSaleData.style.buttonHoverBg} transition duration-300 text-sm md:text-base`}>
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs md:text-sm ${flashSaleData.featuredStyle.subtitle} mb-1`}>
                      {product.category}
                    </p>
                    <h3 className="text-base md:text-lg mb-2 text-gray-800 font-medium">
                      {product.name}
                    </h3>
                    <div className="space-x-2">
                      <span className={`text-base md:text-lg ${flashSaleData.style.buttonBg} ${flashSaleData.style.buttonText} font-bold`}>
                        {product.promotion ? calculateDiscountPrice(product.price, product.promotion.discountPercent) : product.price}đ
                      </span>
                      {product.promotion && (
                        <span className="text-xs md:text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}đ
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="text-center mt-8 md:mt-12">
            <Link
              to={flashSaleData.featuredButtonLink}
              className={`inline-flex items-center ${flashSaleData.featuredStyle.button} px-6 md:px-8 py-2 md:py-3 transition duration-300 text-sm md:text-base rounded-full`}
            >
              {flashSaleData.featuredButtonText}
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ưu đãi Section - Lì xì đầu năm */}
      <section className={`py-20 ${theme === 'tet'
          ? 'bg-gradient-to-br from-red-50 via-white to-red-50'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
        }`}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block mb-6">
              <div className={`inline-flex items-center justify-center px-6 py-2 rounded-full ${theme === 'tet'
                  ? 'bg-red-100'
                  : 'bg-blue-100'
                }`}>
                {theme === 'tet' ? (
                  <RiRedPacketLine className="text-3xl text-red-600 mr-2" />
                ) : (
                  <MdCelebration className="text-3xl text-blue-600 mr-2" />
                )}
                <span className={`text-lg font-medium ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                  {theme === 'tet' ? 'Khuyến mãi Tết 2025' : 'Summer Sale 2025'}
                </span>
              </div>
            </div>

            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'tet'
                ? 'bg-gradient-to-r from-red-600 via-yellow-500 to-red-600'
                : 'bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600'
              } bg-clip-text text-transparent`}>
              {theme === 'tet' ? 'LÌ XÌ MAY MẮN ĐẦU NĂM' : 'SUMMER SALE 2025'}
            </h2>

            <p className={`text-xl ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'
              }`}>
              {theme === 'tet'
                ? 'Mừng Xuân Ất Tỵ, KTT Store gửi tặng những phần quà đặc biệt:'
                : 'Đón hè rực rỡ với những ưu đãi hấp dẫn từ KTT Store:'}
            </p>
          </div>

          {/* Content Grid */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ưu đãi Cards */}
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden p-8 rounded-2xl transition-all duration-500 ${theme === 'tet'
                      ? 'hover:bg-gradient-to-br from-red-100 to-yellow-50 bg-white'
                      : 'hover:bg-gradient-to-br from-blue-100 to-purple-50 bg-white'
                    } border-2 ${theme === 'tet'
                      ? 'border-red-100 hover:border-red-200'
                      : 'border-blue-100 hover:border-blue-200'
                    }`}
                >
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 transition-all duration-500 ${theme === 'tet'
                        ? 'bg-red-50 group-hover:bg-red-100'
                        : 'bg-blue-50 group-hover:bg-blue-100'
                      }`}>
                      {index === 0 ? (
                        <RiVipCrownLine className={`text-3xl ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                      ) : index === 1 ? (
                        <RiCoupon3Line className={`text-3xl ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                      ) : (
                        <FaGift className={`text-3xl ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                      )}
                    </div>

                    <h3 className={`text-2xl font-bold mb-4 ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                      {benefit.value}
                    </h3>

                    <p className={`${theme === 'tet' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter & CTA Section */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Newsletter */}
              <div className={`p-8 rounded-2xl ${theme === 'tet'
                  ? 'bg-gradient-to-br from-white to-red-50 border-2 border-red-100'
                  : 'bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100'
                }`}>
                <div className="flex items-center space-x-4 mb-6">
                  <FaEnvelope className={`text-3xl ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                    }`} />
                  <div>
                    <h3 className={`text-2xl font-bold mb-1 ${theme === 'tet' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                      {subscriptionContent.title}
                    </h3>
                    <p className={`${theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                      {subscriptionContent.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={subscriptionContent.placeholder}
                    className={`flex-1 px-6 py-3 rounded-xl focus:outline-none border-2 transition-all ${theme === 'tet'
                        ? 'border-red-200 focus:border-red-400 bg-red-50'
                        : 'border-blue-200 focus:border-blue-400 bg-blue-50'
                      }`}
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center whitespace-nowrap ${theme === 'tet'
                        ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-red-200'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-200'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      'Đang xử lý...'
                    ) : (
                      <>
                        <span>{subscriptionContent.buttonText}</span>
                        <FaPaperPlane className="ml-2" />
                      </>
                    )}
                  </button>
                </div>

                {theme === 'tet' && (
                  <p className={`mt-4 text-sm ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                    * Áp dụng cho khách hàng đăng ký mới từ nay đến mùng 5 Tết
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className={`p-8 rounded-2xl flex flex-col justify-center items-center text-center ${theme === 'tet'
                  ? 'bg-gradient-to-br from-red-600 to-yellow-500'
                  : 'bg-gradient-to-br from-blue-600 to-purple-500'
                }`}>
                <h3 className="text-3xl font-bold text-white mb-6">
                  {theme === 'tet'
                    ? 'Săn lì xì may mắn ngay!'
                    : 'Khám phá ưu đãi mùa hè!'}
                </h3>
                <Link
                  to="/promotion"
                  className={`inline-flex items-center px-8 py-4 rounded-xl text-lg font-medium transition-all ${theme === 'tet'
                      ? 'bg-white text-red-600 hover:bg-red-50 hover:text-blue-600'
                      : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-red-600'
                    }`}
                >
                  {theme === 'tet' ? 'NHẬN LÌ XÌ NGAY' : 'KHÁM PHÁ NGAY'}
                  <FaArrowRight className="ml-2" />
                </Link>
                <p className="mt-4 text-sm text-white/80">
                  {theme === 'tet'
                    ? '* Áp dụng từ 25/01/2025 đến hết mùng 5 Tết'
                    : '* Áp dụng từ 01/06/2025 đến 31/08/2025'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
