// OrderDetail.jsx - Trang chi tiết đơn hàng
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axios';
import { 
  FaBox, 
  FaTruck, 
  FaCheck, 
  FaTimes, 
  FaArrowLeft,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaShippingFast
} from 'react-icons/fa';
import PageBanner from '../../../components/PageBanner';

// Hàm format số với dấu chấm phân cách hàng nghìn
const formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const OrderDetail = () => {
  // Lấy ID đơn hàng từ URL
  const { id } = useParams();

  // Các state quản lý dữ liệu
  const [order, setOrder] = useState(null); // Thông tin đơn hàng
  const [orderDetails, setOrderDetails] = useState([]); // Chi tiết các sản phẩm trong đơn
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [theme, setTheme] = useState('tet'); // Theme hiện tại

  // Fetch dữ liệu khi component mount hoặc id thay đổi
  useEffect(() => {
    fetchOrderData();
  }, [id]);

  // Hàm lấy thông tin đơn hàng và chi tiết đơn hàng
  const fetchOrderData = async () => {
    try {
      // Gọi API để lấy thông tin đơn hàng
      const response = await axiosInstance.get(`/api/order/my-orders/${id}`);
      
      // Cập nhật state order với toàn bộ thông tin đơn hàng
      setOrder({
        ...response.data,
        // Đảm bảo các trường quan trọng luôn có giá trị
        orderID: response.data.orderID,
        fullname: response.data.fullname,
        phone: response.data.phone,
        address: response.data.address,
        totalPrice: response.data.totalPrice,
        paymentPrice: response.data.paymentPrice,
        orderStatus: response.data.orderStatus,
        shippingStatus: response.data.shippingStatus,
        isPayed: response.data.isPayed,
        createdAt: response.data.createdAt,
        userCouponsID: response.data.userCouponsID
      });

      // Cập nhật state orderDetails với thông tin chi tiết sản phẩm
      setOrderDetails(response.data.orderDetails.map(detail => ({
        orderDetailID: detail.orderDetailID,
        quantity: detail.quantity,
        productInfo: {
          productID: detail.product.productID,
          name: detail.product.name,
          price: detail.product.price,
          colorName: detail.product.colorName,
          size: detail.size,
          thumbnail: detail.product.image
        }
      })));

    } catch (error) {
      console.error('Lỗi khi lấy thông tin đơn hàng(OrderDetail.jsx):', error);
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    // Xác nhận trước khi hủy
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    
    try {
      await axiosInstance.post(`/api/order/cancel/${id}`);
      toast.success('Đã hủy đơn hàng thành công');
      fetchOrderData(); // Tải lại dữ liệu sau khi hủy
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng(OrderDetail.jsx):', error);
      toast.error('Không thể hủy đơn hàng');
    }
  };

  // Hàm lấy thông tin hiển thị theo trạng thái đơn hàng
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: <FaShoppingBag className="text-yellow-500 text-xl" />,
          text: 'Chờ xác nhận',
          color: 'bg-yellow-100 text-yellow-700',
          borderColor: 'border-yellow-500'
        };
      case 'confirmed':
        return {
          icon: <FaCheck className="text-blue-500 text-xl" />,
          text: 'Đã xác nhận',
          color: 'bg-blue-100 text-blue-700',
          borderColor: 'border-blue-500'
        };
      case 'processing':
        return {
          icon: <FaTruck className="text-blue-500 text-xl" />,
          text: 'Đang xử lý',
          color: 'bg-blue-100 text-blue-700',
          borderColor: 'border-blue-500'
        };
      case 'completed':
        return {
          icon: <FaCheck className="text-green-500 text-xl" />,
          text: 'Hoàn thành',
          color: 'bg-green-100 text-green-700',
          borderColor: 'border-green-500'
        };
      case 'cancelled':
        return {
          icon: <FaTimes className="text-red-500 text-xl" />,
          text: 'Đã hủy',
          color: 'bg-red-100 text-red-700',
          borderColor: 'border-red-500'
        };
      default:
        return {
          icon: null,
          text: status,
          color: 'bg-gray-100 text-gray-700',
          borderColor: 'border-gray-500'
        };
    }
  };

  // Hiển thị loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
  
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          {/* Header với nút quay lại và trạng thái */}
          <div className="flex justify-between items-center mb-6">
            <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="w-40 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="backdrop-blur-md bg-white/50 rounded-2xl p-6 mb-6 border border-white/50 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Grid thông tin chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột thông tin người nhận */}
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center group">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                    <div className="ml-4 flex-1">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cột thông tin đơn hàng */}
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center group">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                    <div className="ml-4 flex-1">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-40 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bảng chi tiết sản phẩm */}
          <div className="backdrop-blur-md bg-white/50 rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="w-48 h-7 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4">
                      <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </th>
                    <th className="text-center py-4">
                      <div className="w-20 h-5 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </th>
                    <th className="text-right py-4">
                      <div className="w-20 h-5 bg-gray-200 rounded animate-pulse ml-auto"></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(3)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse mr-4"></div>
                          <div className="flex-1">
                            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="w-16 h-5 bg-gray-200 rounded animate-pulse mx-auto"></div>
                      </td>
                      <td className="text-right">
                        <div className="w-24 h-5 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {[...Array(4)].map((_, index) => (
                    <tr key={index} className={index === 3 ? 'border-t border-gray-200' : ''}>
                      <td colSpan="2" className="text-right py-4 px-6">
                        <div className="w-32 h-5 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                      <td className="text-right py-4 px-6">
                        <div className="w-36 h-6 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không tìm thấy đơn hàng
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">
            <FaBox />
          </div>
          <p className="text-gray-500 mb-4 text-lg">Không tìm thấy đơn hàng</p>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  // Lấy thông tin trạng thái đơn hàng
  const statusInfo = getStatusInfo(order.orderStatus);

  // Giao diện chính
  return (
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} py-8`}>
      {/* Các phần tử trang trí nền */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${
          theme === 'tet' ? 'bg-red-200' : 'bg-blue-200'
        }`}></div>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${
          theme === 'tet' ? 'bg-orange-200' : 'bg-indigo-200'
        }`}></div>
        <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${
          theme === 'tet' ? 'bg-yellow-200' : 'bg-purple-200'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Phần header với nút quay lại và trạng thái */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/orders"
            className={`inline-flex items-center px-4 py-2 rounded-xl backdrop-blur-md bg-white/30 border border-white/50 transition-all duration-300 ${
              theme === 'tet' ? 'hover:bg-red-50' : 'hover:bg-blue-50'
            }`}
          >
            <FaArrowLeft className="mr-2" />
            Quay lại
          </Link>
          <div className={`px-6 py-2 rounded-xl backdrop-blur-md ${statusInfo.color} border ${statusInfo.borderColor} flex items-center shadow-lg`}>
            {statusInfo.icon}
            <span className="ml-2 font-medium">{statusInfo.text}</span>
          </div>
        </div>

        {/* Phần thông tin đơn hàng */}
        <div className="backdrop-blur-md bg-white/50 rounded-2xl p-6 mb-6 border border-white/50 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Đơn hàng #{order.orderID}</h2>
            {/* Hiển thị nút hủy đơn chỉ khi đơn hàng đang chờ xác nhận */}
            {order.orderStatus === 'pending' && (
              <button
                onClick={handleCancelOrder}
                className={`px-6 py-2.5 rounded-xl text-white transition-all duration-300 ${
                  theme === 'tet'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                } shadow-lg hover:shadow-xl`}
              >
                Hủy đơn hàng
              </button>
            )}
          </div>

          {/* Grid thông tin chi tiết */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột thông tin người nhận */}
            <div className="space-y-6">
              {/* Thông tin người nhận */}
              <div className="flex items-center group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <FaUser className={`text-xl ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Người nhận</p>
                  <p className="font-medium mt-1">{order.fullname}</p>
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="flex items-center group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'tet' ? 'bg-orange-100' : 'bg-indigo-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <FaPhoneAlt className={`text-xl ${theme === 'tet' ? 'text-orange-500' : 'text-indigo-500'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium mt-1">{order.phone}</p>
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div className="flex items-center group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'tet' ? 'bg-yellow-100' : 'bg-purple-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <FaMapMarkerAlt className={`text-xl ${theme === 'tet' ? 'text-yellow-500' : 'text-purple-500'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                  <p className="font-medium mt-1">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Cột thông tin đơn hàng */}
            <div className="space-y-6">
              {/* Ngày đặt hàng */}
              <div className="flex items-center group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <FaCalendarAlt className={`text-xl ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Ngày đặt</p>
                  <p className="font-medium mt-1">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Trạng thái vận chuyển */}
              <div className="flex items-center group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'tet' ? 'bg-orange-100' : 'bg-indigo-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <FaShippingFast className={`text-xl ${theme === 'tet' ? 'text-orange-500' : 'text-indigo-500'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Trạng thái vận chuyển</p>
                  <p className="font-medium mt-1">
                    {order.shippingStatus === 'preparing' && 'Đang chuẩn bị'}
                    {order.shippingStatus === 'shipping' && 'Đang giao hàng'}
                    {order.shippingStatus === 'delivered' && 'Đã giao hàng'}
                    {order.shippingStatus === 'returned' && 'Đã hoàn trả'}
                  </p>
                </div>
              </div>

              {/* Trạng thái thanh toán */}
              <div className="flex items-center group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'tet' ? 'bg-yellow-100' : 'bg-purple-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <FaMoneyBillWave className={`text-xl ${theme === 'tet' ? 'text-yellow-500' : 'text-purple-500'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                  <p className={`font-medium mt-1 ${order.isPayed ? 'text-green-500' : 'text-yellow-500'}`}>
                    {order.isPayed ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng chi tiết sản phẩm */}
        <div className="backdrop-blur-md bg-white/50 rounded-2xl p-6 border border-white/50 shadow-lg">
          <h3 className="text-xl font-bold mb-6">Chi tiết sản phẩm</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 font-medium text-gray-500">Sản phẩm</th>
                  <th className="text-center py-4 font-medium text-gray-500">Số lượng</th>
                  <th className="text-right py-4 font-medium text-gray-500">Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                {/* Danh sách sản phẩm */}
                {orderDetails.map((item) => (
                  <tr key={item.orderDetailID} className="border-b border-gray-200 hover:bg-white/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center">
                        {item.productInfo?.thumbnail && (
                          <img 
                            src={`${item.productInfo.thumbnail}`}
                            alt={item.productInfo.name}
                            className="w-20 h-20 object-cover rounded-xl mr-4 hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div>
                          <p className="font-medium hover:text-blue-500 transition-colors">
                            {item.productInfo?.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.productInfo?.colorName} - {item.productInfo?.size}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatNumber(item.productInfo?.price)}đ</td>
                  </tr>
                ))}
              </tbody>
              {/* Footer với tổng tiền */}
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="text-right py-4 px-6 font-medium">
                    Tổng tiền hàng:
                  </td>
                  <td className="text-right py-4 px-6">
                    <span className="text-gray-900 font-medium">
                      {formatNumber(order.totalProductPrice)}đ
                    </span>
                  </td>
                </tr>
                {/* Chỉ hiển thị dòng khuyến mãi khi có giảm giá */}
                {(order.totalProductPrice - order.totalPrice) > 0 && (
                  <tr>
                    <td colSpan="3" className="text-right py-4 px-6 font-medium">
                      Khuyến mãi:
                    </td>
                    <td className="text-right py-4 px-6">
                      <span className="text-purple-900 font-medium">
                        -{formatNumber(order.totalProductPrice - order.totalPrice)}đ
                      </span>
                    </td>
                  </tr>
                )}

                {order.totalPrice !== order.paymentPrice && (
                  <tr>
                    <td colSpan="3" className="text-right py-4 px-6 text-gray-600">
                      Áp dụng giảm giá:
                    </td>
                    <td className="text-right py-4 px-6 text-green-500 font-medium">
                      -{formatNumber(order.totalPrice - order.paymentPrice)}đ
                    </td>
                  </tr>
                )}

                {order.userCouponsID && (
                  <tr>
                    <td colSpan="3" className="text-right py-4 px-6 text-gray-600">
                      Mã giảm giá:
                    </td>
                    <td className="text-right py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        theme === 'tet' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        Đã áp dụng
                      </span>
                    </td>
                  </tr>
                )}

                <tr className="border-t border-gray-200">
                  <td colSpan="3" className="text-right py-4 px-6 font-bold">
                    Thành tiền:
                  </td>
                  <td className="text-right py-4 px-6">
                    <span className={`text-xl font-bold ${
                      theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {formatNumber(order.paymentPrice)}đ
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
