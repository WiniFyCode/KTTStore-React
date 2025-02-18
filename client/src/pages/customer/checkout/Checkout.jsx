// Checkout.jsx - Trang thanh toán đơn hàng
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import { FaMapMarkerAlt, FaPhone, FaUser, FaTruck, FaCreditCard, FaMoneyBill, FaCheck, FaArrowLeft, FaStar, FaGift } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../../utils/axios';
import axiosInstance from '../../../utils/axios';
import PageBanner from '../../../components/PageBanner';


// Phí vận chuyển cố định
const SHIPPING_FEE = 0;

const Checkout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State quản lý thông tin đơn hàng
  const [cart, setCart] = useState(null); // Thông tin giỏ hàng
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [orderLoading, setOrderLoading] = useState(false); // Loading khi đặt hàng
  const [savedAddresses, setSavedAddresses] = useState([]); // Danh sách địa chỉ đã lưu
  const [selectedAddressId, setSelectedAddressId] = useState(null); // Địa chỉ được chọn
  const [showNewAddressForm, setShowNewAddressForm] = useState(false); // Hiển thị form địa chỉ mới

  // State quản lý thông tin giao hàng
  const [shippingInfo, setShippingInfo] = useState({
    fullname: '',
    phone: '',
    address: '',
    note: '',
    email: ''
  });

  // State quản lý thanh toán
  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('paymentMethod') || 'cod';
  });
  const [step, setStep] = useState(1); // Bước hiện tại trong quy trình thanh toán
  const [errors, setErrors] = useState({}); // Lỗi validation
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false); // Hiển thị animation thành công
  const [isPaying, setIsPaying] = useState(false); // Trạng thái đang thanh toán
  const [isLoadingLocation, setIsLoadingLocation] = useState(false); // Loading khi lấy vị trí

  // Thêm state cho payment info
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Lấy thông tin người dùng từ localStorage khi component mount
  useEffect(() => {
    const customerInfo = localStorage.getItem('customerInfo');
    if (customerInfo) {
      const parsedInfo = JSON.parse(customerInfo);
      setShippingInfo(prev => ({
        ...prev,
        fullname: parsedInfo.fullname || '',
        phone: parsedInfo.phone || '',
        email: parsedInfo.email || ''
      }));
    }
  }, []);

  // Fetch thông tin giỏ hàng từ localStorage
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const checkoutData = localStorage.getItem('checkoutItems');
        if (!checkoutData) {
          toast.error('Không tìm thấy thông tin đơn hàng');
          navigate('/cart');
          return;
        }

        const parsedData = JSON.parse(checkoutData);
        console.log('Dữ liệu sau khi parse(Checkout.jsx):', parsedData);

        // Validate dữ liệu đơn hàng
        if (!parsedData.items || !Array.isArray(parsedData.items) || parsedData.items.length === 0) {
          toast.error('Dữ liệu đơn hàng không hợp lệ');
          navigate('/cart');
          return;
        }

        // Chuyển đổi các giá trị sang số
        const validatedData = {
          ...parsedData,
          items: parsedData.items.map(item => ({
            ...item,
            subtotal: Number(item.subtotal),
            quantity: Number(item.quantity),
            price: item.product.price ? Number(item.product.price.replace(/\./g, '')) : 0
          })),
          subtotal: Number(parsedData.subtotal),
          discount: Number(parsedData.discount || 0),
          finalTotal: Number(parsedData.finalTotal),
          totalQuantity: Number(parsedData.totalQuantity)
        };

        setCart(validatedData);
      } catch (error) {
        console.error('Lỗi khi tải thông tin đơn hàng(Checkout.jsx):', error);
        toast.error('Có lỗi khi tải thông tin đơn hàng');
        navigate('/cart');
      }
    };

    fetchCart();
  }, [navigate]);

  // Fetch danh sách địa chỉ đã lưu
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get('/api/address');
        if (response.data && Array.isArray(response.data)) {
          setSavedAddresses(response.data);
          // Tự động chọn địa chỉ mặc định nếu có
          const defaultAddress = response.data.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.addressID);
            setShippingInfo(prev => ({
              ...prev,
              address: defaultAddress.address
            }));
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách địa chỉ(Checkout.jsx):', error);
        toast.error('Không thể tải danh sách địa chỉ');
      }
    };

    fetchAddresses();
  }, []);

  // Format giá tiền
  const formatPrice = (price) => {
    if (!price) return "0";
    // Chuyển đổi sang số nếu là string
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/\D/g, '')) : price;
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Hiển thị danh sách sản phẩm
  const renderOrderItems = () => {
    if (!cart?.items) return null;

    return (
      <div className="space-y-4">
        {cart.items.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden">
              <img
                src={item.product.imageURL}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.product.name}</h3>
              <p className="text-sm text-gray-500">
                {item.product.color} - Size {item.product.size}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm">
                  SL: {item.quantity}
                </p>
                <p className="font-medium">
                  {formatPrice(item.subtotal)}đ
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Hiển thị tổng tiền
  const renderOrderSummary = () => {
    try {
      const checkoutItemsStr = localStorage.getItem('checkoutItems');
      if (!checkoutItemsStr) {
        navigate('/cart');
        return null;
      }

      const checkoutItems = JSON.parse(checkoutItemsStr);
      if (!checkoutItems || !checkoutItems.items || checkoutItems.items.length === 0) {
        navigate('/cart');
        return null;
      }

      return (
        <div className="space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính:</span>
            <span>{formatPrice(checkoutItems.subtotal)}đ</span>
          </div>

          {checkoutItems.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá:</span>
              <span>-{formatPrice(checkoutItems.discount)}đ</span>
            </div>
          )}

          {checkoutItems.coupon && (
            <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
              <FaGift className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">
                  Mã giảm giá: {checkoutItems.coupon.code}
                </p>
                <p>
                  {checkoutItems.coupon.discountType === 'percentage'
                    ? `Giảm ${checkoutItems.coupon.discountValue}% tối đa ${formatPrice(checkoutItems.coupon.maxDiscountAmount)}đ`
                    : `Giảm ${formatPrice(checkoutItems.coupon.discountValue)}đ`
                  }
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển:</span>
            <span>{formatPrice(SHIPPING_FEE)}đ</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Tổng cộng:</span>
            <span>{formatPrice(checkoutItems.finalTotal + SHIPPING_FEE)}đ</span>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Lỗi khi hiển thị tổng tiền(Checkout.jsx):', error);
      navigate('/cart');
      return null;
    }
  };

  // Kiểm tra email
  const validateEmail = (email) => {
    if (!email) return true; // Email là tùy chọn
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Kiểm tra số điện thoại
  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  // Kiểm tra thông tin giao hàng
  const validateShipping = () => {
    const newErrors = {};

    if (!shippingInfo.fullname.trim()) {
      newErrors.fullname = 'Vui lòng nhập họ tên';
    }

    if (!shippingInfo.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhone(shippingInfo.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (shippingInfo.email && !validateEmail(shippingInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Định dạng số điện thoại trong quá trình nhập
  const formatPhoneNumber = (value) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 10) {
      return phone;
    }
    return phone.slice(0, 10);
  };

  // Xử lý thay đổi thông tin giao hàng
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }

    setShippingInfo(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Kiểm tra phương thức thanh toán
  const validatePayment = () => {
    if (!paymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return false;
    }
    return true;
  };

  // Xử lý chuyển sang bước tiếp theo với kiểm tra
  const handleNextStep = () => {
    if (step === 1) {
      if (validateShipping()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validatePayment()) {
        handlePlaceOrderCOD();
      }
    } else {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePlaceOrderCOD = async () => {
    try {
      // Kiểm tra thông tin giao hàng
      if (!validateShipping()) {
        setStep(1);
        return;
      }

      // Kiểm tra phương thức thanh toán
      if (!validatePayment()) {
        return;
      }

      setOrderLoading(true);
      setShowSuccessAnimation(true);

      // Kiểm tra dữ liệu thanh toán
      const checkoutData = JSON.parse(localStorage.getItem('checkoutItems'));
      if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        throw new Error('Không có sản phẩm nào để thanh toán');
      }

      // Chuẩn bị dữ liệu theo cấu trúc API mới
      const orderData = {
        // Thông tin người nhận
        fullname: shippingInfo.fullname,
        phone: shippingInfo.phone,
        email: shippingInfo.email || '',
        address: shippingInfo.address,
        note: shippingInfo.note || '',

        // Chuyển đổi paymentMethod thành đúng format
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'banking',

        // Thông tin sản phẩm - Chỉ lấy SKU và quantity
        items: checkoutData.items.map(item => ({
          SKU: item.SKU,
          quantity: item.quantity
        })),

        // ID của coupon nếu có
        userCouponsID: checkoutData.coupon?.userCouponsID || null
      };

      console.log('Dữ liệu gửi lên API(Checkout.jsx):', orderData);

      // Gọi API tạo đơn hàng
      const response = await axiosInstance.post('/api/order/create', orderData);

      // Xử lý response thành công
      if (response.status === 201) {
        const { order } = response.data;

        // Xóa thông tin giỏ hàng
        localStorage.removeItem('checkoutItems');
        localStorage.removeItem('paymentMethod');

        // Cập nhật UI giỏ hàng
        window.dispatchEvent(new Event('cartChange'));

         // Gửi email thông báo cho cả COD và banking
         try {
          await axiosInstance.post(`/api/order/confirm-payment/${order.orderID}`, {
            userEmail: shippingInfo.email
          });
          console.log('Đã gửi email thông báo đơn hàng thành công');
        } catch (emailError) {
          console.error('Lỗi khi gửi email thông báo:', emailError);
        }

        toast.success('Đặt hàng thành công!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng(Checkout.jsx):', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng';
      toast.error(errorMessage);
      setShowSuccessAnimation(false);
    } finally {
      setOrderLoading(false);
    }
  };

  // Xử lý lựa chọn địa chỉ
  const handleAddressSelect = (addressID) => {
    const selectedAddress = savedAddresses.find(addr => addr.addressID === addressID);
    if (selectedAddress) {
      setSelectedAddressId(addressID);
      setShippingInfo(prev => ({
        ...prev,
        address: selectedAddress.address
      }));
      setShowNewAddressForm(false);
    }
  };

  // Chuyển đổi hiển thị form địa chỉ mới
  const toggleNewAddressForm = () => {
    setShowNewAddressForm(prev => !prev);
    if (!showNewAddressForm) {
      setSelectedAddressId(null);
      setShippingInfo(prev => ({
        ...prev,
        address: ''
      }));
    }
  };

  // Thêm hàm lấy địa chỉ từ tọa độ
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      // Format địa chỉ từ dữ liệu OpenStreetMap
      const address = data.address;
      const formattedAddress = [
        address.house_number, // Số nhà
        address.road, // Đường
        address.suburb, // Phường/xã
        address.city_district, // Quận/huyện
        address.city || address.town, // Thành phố/thị xã
        address.state, // Tỉnh/thành phố
        'Việt Nam'
      ].filter(Boolean).join(', ');

      return formattedAddress;
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ từ tọa độ(Checkout.jsx):', error);
      throw new Error('Không thể lấy địa chỉ từ tọa độ');
    }
  };

  // Thêm hàm lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Kiểm tra hỗ trợ Geolocation
      if (!navigator.geolocation) {
        throw new Error('Trình duyệt không hỗ trợ định vị');
      }

      // Lấy tọa độ hiện tại
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // Độ chính xác cao hơn
          timeout: 5000, // Thời gian chờ tối đa là 5 giây
          maximumAge: 0 // Không sử dụng cache
        });
      });

      // Lấy vĩ độ và kinh độ
      const { latitude, longitude } = position.coords;

      // Lấy địa chỉ từ tọa độ
      const address = await getAddressFromCoords(latitude, longitude);

      // Cập nhật form với địa chỉ mới
      setShippingInfo(prev => ({
        ...prev,
        address: address
      }));

      // Hiển thị form địa chỉ mới
      setShowNewAddressForm(true);
      setSelectedAddressId(null);

      toast.success('Đã lấy địa chỉ hiện tại thành công!');
    } catch (error) {
      console.error('Lỗi khi lấy vị trí hiện tại(Checkout.jsx):', error);
      toast.error(error.message || 'Không thể lấy vị trí hiện tại');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Hàm xử lý thanh toán PayOS
  const handlePayOSPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Validate thông tin giao hàng trước
      if (!validateShipping()) {
        setStep(1);
        return;
      }

      // Lấy dữ liệu từ localStorage
      const checkoutItemsStr = localStorage.getItem('checkoutItems');
      if (!checkoutItemsStr) {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }

      const checkoutItems = JSON.parse(checkoutItemsStr);
      
      // Tính tổng tiền cuối cùng
      const finalTotalAndShip = checkoutItems.finalTotal + SHIPPING_FEE;

      // Lưu thông tin đơn hàng
      const orderInfo = {
        fullname: shippingInfo.fullname,
        phone: shippingInfo.phone,
        email: shippingInfo.email || '',
        address: shippingInfo.address,
        note: shippingInfo.note || '',
        paymentMethod: 'banking',
        items: checkoutItems.items.map(item => ({
          SKU: item.SKU,
          quantity: item.quantity
        })),
        userCouponsID: checkoutItems.coupon?.userCouponsID || null
      };

      // Lưu thông tin đơn hàng vào localStorage
      localStorage.setItem('pendingOrderInfo', JSON.stringify(orderInfo));

      // Tạo dữ liệu thanh toán PayOS
      const paymentData = {
        amount: finalTotalAndShip,
        description: `THANH TOAN DON HANG`,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: window.location.href,
      };

      // Gọi API tạo link thanh toán PayOS
      const response = await axiosInstance.post('/api/payos/create', paymentData);

      if (response.data.error === 0 && response.data.data) {
        window.location.href = response.data.data.checkoutUrl;
      } else {
        throw new Error(response.data.message || 'Không thể tạo link thanh toán');
      }

    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán PayOS:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Cập nhật cả state và localStorage khi thay đổi phương thức
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method.toLowerCase());
    localStorage.setItem('paymentMethod', method.toLowerCase());
  };

  // Trạng thái loading
  if (loading) {
    return ( 
      <div className={`min-h-screen ${
        theme === 'tet' 
          ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <PageBanner
          theme={theme}
          icon={FaCreditCard}
          title="Thanh toán đơn hàng"
          breadcrumbText="Thanh toán"
          extraContent={
            <div className="flex items-center justify-center gap-3 text-xl text-white/90">
              <FaCreditCard className="w-6 h-6" />
              <p>Đang tải...</p>
            </div>
          }
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  // Giỏ hàng trống
  if (!cart?.items?.length) {
    return (
      <div className={`min-h-screen ${
        theme === 'tet' 
          ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <PageBanner
          theme={theme}
          icon={FaCreditCard}
          title="Thanh toán đơn hàng"
          breadcrumbText="Thanh toán"
          extraContent={
            <div className="flex items-center justify-center gap-3 text-xl text-white/90">
              <FaCreditCard className="w-6 h-6" />
              <p>Giỏ hàng trống</p>
            </div>
          }
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
            <Link
              to="/products"
              className={`inline-block px-6 py-3 rounded-xl font-medium text-white ${theme === 'tet'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'tet' 
        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <PageBanner
        theme={theme}
        icon={FaCreditCard}
        title="Thanh toán đơn hàng"
        breadcrumbText="Thanh toán"
        extraContent={
          <div className="flex items-center justify-center gap-3 text-xl text-white/90">
            <FaCreditCard className="w-6 h-6" />
            <p>Hoàn tất đơn hàng của bạn</p>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">

        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-8">
          {/* Progress Steps - Hiển thị các bước thanh toán */}
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <div className="min-w-[300px] px-4">
              {/* Progress Bar with Labels */}
              <div className="relative">
                {/* Background Line */}
                <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200" />

                {/* Progress Line */}
                <div
                  className={`absolute top-3 left-0 h-0.5 transition-all duration-500 ease-in-out ${theme === 'tet' ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-1.5 transition-colors ${step >= 1
                          ? theme === 'tet'
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-300'
                        }`}
                    >
                      {step > 1 ? <FaCheck className="w-3 h-3" /> : 1}
                    </div>
                    {/* Label */}
                    <span
                      className={`text-xs font-medium text-center ${step >= 1
                          ? theme === 'tet'
                            ? 'text-red-600'
                            : 'text-blue-600'
                          : 'text-gray-400'
                        }`}
                    >
                      Thông tin giao hàng
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-1.5 transition-colors ${step >= 2
                          ? theme === 'tet'
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-300'
                        }`}
                    >
                      {step > 2 ? <FaCheck className="w-3 h-3" /> : 2}
                    </div>
                    {/* Label */}
                    <span
                      className={`text-xs font-medium text-center ${step >= 2
                          ? theme === 'tet'
                            ? 'text-red-600'
                            : 'text-blue-600'
                          : 'text-gray-400'
                        }`}
                    >
                      Phương thức thanh toán
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-1.5 transition-colors ${step >= 3
                          ? theme === 'tet'
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-300'
                        }`}
                    >
                      {step > 3 ? <FaCheck className="w-3 h-3" /> : 3}
                    </div>
                    {/* Label */}
                    <span
                      className={`text-xs font-medium text-center ${step >= 3
                          ? theme === 'tet'
                            ? 'text-red-600'
                            : 'text-blue-600'
                          : 'text-gray-400'
                        }`}
                    >
                      Xác nhận đơn hàng
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {step === 3 ? (
            // Bước 3: Xác nhận đơn hàng thành công
            <div className="text-center py-8 sm:py-12">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto flex items-center justify-center mb-4 sm:mb-6 ${theme === 'tet' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                <FaCheck className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Đặt hàng thành công!</h2>
              <p className="text-gray-600 mb-6 sm:mb-8">
                Cảm ơn bạn đã mua hàng. Chúng tôi sẽ sớm liên hệ với bạn.
              </p>
              <div className="max-w-md mx-auto p-4 sm:p-6 bg-gray-100 rounded-xl">
                <h3 className="font-semibold mb-4">Thông tin đơn hàng:</h3>
                <div className="space-y-2 text-left">
                  <p><span className="text-gray-500">Họ tên:</span> {shippingInfo.fullname}</p>
                  <p><span className="text-gray-500">Số điện thoại:</span> {shippingInfo.phone}</p>
                  <p><span className="text-gray-500">Địa chỉ:</span> {shippingInfo.address}</p>
                  <p><span className="text-gray-500">Phương thức thanh toán:</span> {
                    paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
                  }</p>
                  <p><span className="text-gray-500">Tổng tiền:</span> {formatPrice(cart.finalTotal + SHIPPING_FEE)}đ</p>
                </div>
              </div>
            </div>
          ) : (
            // Bước 1 & 2: Form thông tin giao hàng và thanh toán
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
              {/* Cột trái - Form thông tin */}
              <div className="flex-1 space-y-6 sm:space-y-8">
                {step === 1 && (
                  // Form thông tin giao hàng
                  <section className="bg-gray-100 rounded-2xl p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                      <FaTruck className="text-gray-400" />
                      Thông tin giao hàng
                    </h2>

                    {/* Form thông tin giao hàng */}
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <FaUser className="text-gray-400" />
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          name="fullname"
                          value={shippingInfo.fullname}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.fullname ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                          placeholder="Nhập họ và tên người nhận"
                        />
                        {errors.fullname && (
                          <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>
                        )}
                      </div>

                      {/* Số điện thoại */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <FaPhone className="text-gray-400" />
                          Số điện thoại *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            value={shippingInfo.phone}
                            onChange={handleShippingChange}
                            className={`w-full px-4 py-3 pl-10 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'
                              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${shippingInfo.phone ? 'bg-gray-50' : ''
                              }`}
                            placeholder="Nhập số điện thoại"
                            maxLength="10"
                            readOnly
                          />
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">+84</span>
                          </div>
                          {shippingInfo.phone && (
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                              }`}>
                              <FaCheck className="w-4 h-4" />
                              <span className="hidden sm:inline">Đã xác thực</span>
                            </div>
                          )}
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Số điện thoại được lấy từ thông tin tài khoản của bạn
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={shippingInfo.email}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                          placeholder="Nhập email (không bắt buộc)"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          Địa chỉ giao hàng *
                        </label>

                        {/* Địa chỉ đã lưu */}
                        {savedAddresses.length > 0 && (
                          <div className="mb-4 space-y-3">
                            {savedAddresses.map((addr) => (
                              <label
                                key={addr.addressID}
                                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.addressID
                                    ? theme === 'tet'
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="savedAddress"
                                  checked={selectedAddressId === addr.addressID}
                                  onChange={() => handleAddressSelect(addr.addressID)}
                                  className="mt-1"
                                />
                                <div className="ml-3 flex-1">
                                  <p className="font-medium text-gray-900">{addr.address}</p>
                                  {addr.isDefault && (
                                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full ${theme === 'tet' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                      }`}>
                                      Địa chỉ mặc định
                                    </span>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Nút chuyển đổi địa chỉ mới */}
                        <button
                          type="button"
                          onClick={toggleNewAddressForm}
                          className={`w-full mb-4 px-4 py-3 rounded-xl border-2 border-dashed font-medium transition-all ${showNewAddressForm
                              ? theme === 'tet'
                                ? 'border-red-500 bg-red-50 text-red-600'
                                : 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'
                            }`}
                        >
                          {showNewAddressForm ? '← Quay lại chọn địa chỉ có sẵn' : '+ Thêm địa chỉ mới'}
                        </button>

                        {/* Form địa chỉ mới */}
                        {showNewAddressForm && (
                          <div className="space-y-3">
                            <div className="relative">
                              <input
                                type="text"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleShippingChange}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300'
                                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                placeholder="Nhập địa chỉ giao hàng mới"
                              />
                              <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={isLoadingLocation}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                  ${theme === 'tet'
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                  }
                                  ${isLoadingLocation ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                              >
                                {isLoadingLocation ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang lấy...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <FaMapMarkerAlt />
                                    <span>Vị trí hiện tại</span>
                                  </div>
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">
                              Nhấn vào nút "Vị trí hiện tại" để tự động điền địa chỉ của bạn
                            </p>
                          </div>
                        )}

                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Ghi chú
                        </label>
                        <textarea
                          name="note"
                          value={shippingInfo.note}
                          onChange={handleShippingChange}
                          rows="3"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                        />
                      </div>
                    </div>
                  </section>
                )}

                {step === 2 && (
                  // Form phương thức thanh toán
                  <section className="bg-gray-100 rounded-2xl p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                      <FaCreditCard className="text-gray-400" />
                      Phương thức thanh toán
                    </h2>

                    <div className="space-y-3">
                      {/* COD */}
                      <label className="flex items-center p-3 sm:p-4 bg-white border rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => handlePaymentMethodChange(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="ml-4 flex items-center gap-3 flex-1">
                          <FaMoneyBill className="text-gray-400 text-xl" />
                          <div className="flex-1">
                            <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                            <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                          </div>
                        </div>
                      </label>

                      {/* Banking */}
                      <label className="flex items-center p-3 sm:p-4 bg-white border rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                        <input
                          type="radio"
                          name="payment"
                          value="banking"
                          checked={paymentMethod === 'banking'}
                          onChange={(e) => handlePaymentMethodChange(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="ml-4 flex items-center gap-3 flex-1">
                          <FaCreditCard className="text-gray-400 text-xl" />
                          <div className="flex-1">
                            <p className="font-medium">Chuyển khoản ngân hàng</p>
                            <p className="text-sm text-gray-500">Thanh toán qua cổng PayOS</p>
                          </div>
                        </div>
                      </label>

                      {/* Nút thanh toán PayOS chỉ hiển thị khi chọn banking */}
                      {paymentMethod === 'banking' && (
                        <div className="mt-4">
                          <p className="mt-2 text-sm text-gray-500 text-center">
                            Bạn sẽ được chuyển đến cổng thanh toán PayOS
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Nút chuyển bước */}
                <div className="flex gap-4">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 font-medium transition-colors hover:bg-gray-50"
                    >
                      Quay lại
                    </button>
                  )}
                  {step < 2 ? (
                    <button
                      onClick={handleNextStep}
                      className={`flex-1 py-2.5 sm:py-3 rounded-xl text-white font-medium transition-all duration-300 ${theme === 'tet'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                      Tiếp tục
                    </button>
                  ) : (
                    <button
                      onClick={paymentMethod === 'banking' ? handlePayOSPayment : handlePlaceOrderCOD}
                      disabled={orderLoading}
                      className={`flex-1 py-2.5 sm:py-3 rounded-xl text-white font-medium transition-all duration-300 ${theme === 'tet'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                        } ${orderLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {orderLoading ? 'Đang xử lý...' : paymentMethod === 'banking' 
                        ? `Thanh toán qua PayOS (${formatPrice(cart.finalTotal + SHIPPING_FEE)}đ)`
                        : `Đặt hàng (${formatPrice(cart.finalTotal + SHIPPING_FEE)}đ)`
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* Cột phải - Tổng quan đơn hàng */}
              <div className="lg:w-[400px]">
                <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 sticky top-24">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Tổng kết đơn hàng</h2>

                  {/* Danh sách sản phẩm */}
                  <div className="mb-6">
                    {renderOrderItems()}
                  </div>

                  {/* Tổng kết */}
                  {renderOrderSummary()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Animation overlay khi đặt hàng thành công */}
        {showSuccessAnimation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center max-w-sm w-full">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${theme === 'tet' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                <FaCheck className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-base sm:text-lg font-medium text-center">Đang xử lý đơn hàng...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
