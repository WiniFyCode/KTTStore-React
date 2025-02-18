import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axios';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // 1. Lấy orderCode và status từ URL
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const orderCode = params.get('orderCode');

        // Kiểm tra status và orderCode
        if (!status || !orderCode) {
          toast.error('Thông tin thanh toán không hợp lệ');
          navigate('/checkout');
          return;
        }

        // 2. Kiểm tra trạng thái thanh toán với PayOS
        const paymentResponse = await axiosInstance.get(`/api/payos/${orderCode}`);

        if (paymentResponse.data.error !== 0 || paymentResponse.data.data.status !== 'PAID') {
          toast.error('Thanh toán không thành công');
          navigate('/checkout');
          return;
        }

        // 3. Kiểm tra thông tin đơn hàng trong localStorage
        const orderInfoStr = localStorage.getItem('pendingOrderInfo');
        if (!orderInfoStr) {
          toast.error('Thông tin đơn hàng không tồn tại');
          navigate('/checkout');
          return;
        }

        // 4. Parse và kiểm tra dữ liệu
        const orderInfo = JSON.parse(orderInfoStr);

        // 5. Gọi API tạo đơn hàng
        const response = await axiosInstance.post('/api/order/create', {
          fullname: orderInfo.fullname,
          phone: orderInfo.phone,
          email: orderInfo.email || '',
          address: orderInfo.address,
          note: orderInfo.note || '',
          paymentMethod: 'banking',
          isPaid: true,
          items: orderInfo.items.map(item => ({
            SKU: item.SKU,
            quantity: item.quantity
          })),
          userCouponsID: orderInfo.userCouponsID || null
        });

        // 6. Xử lý kết quả
        if (response.status === 201) {
          const { order } = response.data;

          // Gửi email xác nhận thanh toán
          try {
            await axiosInstance.post(`/api/order/confirm-payment/${order.orderID}`, {
              userEmail: orderInfo.email
            });
            console.log('Đã gửi email xác nhận thanh toán thành công');
          } catch (emailError) {
            console.error('Lỗi khi gửi email xác nhận:', emailError);
          }

          localStorage.removeItem('pendingOrderInfo');
          localStorage.removeItem('checkoutItems');
          window.dispatchEvent(new Event('cartChange'));

          toast.success('Đơn hàng đã được tạo thành công!');

          setTimeout(() => {
            navigate('/orders');
          }, 5000);
        }
      } catch (error) {
        console.error('Lỗi xử lý thanh toán:', error);
        toast.error('Có lỗi xảy ra khi xử lý thanh toán');
        setTimeout(() => {
          navigate('/checkout');
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handlePaymentSuccess();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {isProcessing ? (
          <>
            <FaSpinner className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
            <h2 className="mt-4 text-xl font-semibold">Đang xử lý đơn hàng...</h2>
            <p className="mt-2 text-gray-500">Vui lòng không tắt trình duyệt</p>
          </>
        ) : (
          <>
            <FaCheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="mt-4 text-xl font-semibold">Thanh toán thành công!</h2>
            <p className="mt-2 text-gray-500">Đơn hàng của bạn đã được xác nhận</p>
            <p className="mt-4 text-sm text-gray-400">
              Bạn sẽ được chuyển hướng đến trang đơn hàng sau 5 giây...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 