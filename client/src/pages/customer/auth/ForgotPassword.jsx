// ForgotPassword.jsx - Trang quên mật khẩu
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaKey, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axios';
import { useTheme } from '../../../contexts/CustomerThemeContext';

const ForgotPassword = () => {
  // Lấy theme từ context để áp dụng giao diện theo chủ đề
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Khởi tạo các state cần thiết
  const [email, setEmail] = useState(''); // State lưu email người dùng
  const [loading, setLoading] = useState(false); // State xử lý trạng thái loading
  const [step, setStep] = useState('email'); // State quản lý các bước: nhập email -> nhập OTP -> đặt mật khẩu mới
  const [otp, setOtp] = useState(''); // State lưu mã OTP
  const [newPassword, setNewPassword] = useState(''); // State lưu mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(''); // State lưu mật khẩu xác nhận

  // Hàm xử lý gửi email để nhận mã OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API gửi email chứa mã OTP
      const response = await axiosInstance.post('/api/auth/forgot-password', {
        email
      });

      setStep('otp'); // Chuyển sang bước nhập OTP
      toast.success('Mã OTP đã được gửi đến email của bạn!');
    } catch (error) {
      // Xử lý các trường hợp lỗi
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xác thực OTP và đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      // Gọi API đặt lại mật khẩu với OTP
      const response = await axiosInstance.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });

      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/login'); // Chuyển hướng về trang đăng nhập
    } catch (error) {
      // Xử lý các trường hợp lỗi
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm render form theo từng bước
  const renderForm = () => {
    switch (step) {
      case 'email':
        // Form nhập email để nhận OTP
        return (
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            {/* Input nhập email với icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Email"
              />
            </div>

            {/* Nút gửi OTP */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                  theme === 'tet'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } disabled:opacity-50 transform transition-transform duration-200 hover:scale-[1.02]`}
              >
                {/* Hiển thị loading spinner khi đang xử lý */}
                {loading ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Đang gửi...
                  </div>
                ) : 'Gửi mã OTP'}
              </button>
            </div>
          </form>
        );

      case 'otp':
        // Form nhập OTP và mật khẩu mới
        return (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {/* Input nhập mã OTP */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Nhập mã OTP"
                maxLength={6}
              />
            </div>

            {/* Input nhập mật khẩu mới */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Mật khẩu mới"
              />
            </div>

            {/* Input xác nhận mật khẩu mới */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>

            {/* Nút đặt lại mật khẩu */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                  theme === 'tet'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } disabled:opacity-50 transform transition-transform duration-200 hover:scale-[1.02]`}
              >
                {/* Hiển thị loading spinner khi đang xử lý */}
                {loading ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Đang xử lý...
                  </div>
                ) : 'Đặt lại mật khẩu'}
              </button>
            </div>

            {/* Nút gửi lại mã OTP */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className={`font-medium hover:opacity-80 ${
                  theme === 'tet'
                    ? 'text-red-600 hover:text-red-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                Gửi lại mã OTP
              </button>
            </div>
          </form>
        );
    }
  };

  // Render giao diện chính
  return (
    // Container chính với gradient background theo theme
    <div className={`min-h-screen ${
      theme === 'tet' 
        ? 'bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100'
        : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'
    } flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      {/* Các vòng tròn trang trí với hiệu ứng blur */}
      <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${
        theme === 'tet' ? 'bg-red-200' : 'bg-purple-200'
      }`}></div>
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${
        theme === 'tet' ? 'bg-orange-200' : 'bg-yellow-200'
      }`}></div>
      <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${
        theme === 'tet' ? 'bg-yellow-200' : 'bg-pink-200'
      }`}></div>

      {/* Form container với hiệu ứng kính mờ */}
      <div className="max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative z-10">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Quên mật khẩu?
          </h2>
          <p className="text-center text-gray-600">
            {step === 'email' 
              ? 'Nhập email của bạn để nhận mã OTP'
              : 'Nhập mã OTP và mật khẩu mới của bạn'
            }
          </p>
        </div>

        {/* Render form tương ứng với bước hiện tại */}
        {renderForm()}

        <div className="text-center">
          <Link
            to="/login"
            className={`font-medium hover:opacity-80 ${
              theme === 'tet'
                ? 'text-red-600 hover:text-red-500'
                : 'text-indigo-600 hover:text-indigo-500'
            }`}
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
