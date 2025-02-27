// ForgotPassword.jsx - Trang quên mật khẩu
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaKey, FaSpinner, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axios';
import { useTheme } from '../../../contexts/CustomerThemeContext';

const ForgotPassword = () => {
  // Lấy theme từ context để áp dụng giao diện theo chủ đề
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State quản lý form và loading
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State quản lý lỗi validation
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Hàm validate email
  const validateEmail = () => {
    let isValid = true;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Vui lòng nhập email' }));
      isValid = false;
    } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }));
      isValid = false;
    }
    return isValid;
  };

  // Hàm validate OTP và mật khẩu mới
  const validateResetPassword = () => {
    let isValid = true;
    const newErrors = {
      otp: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!otp) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
      isValid = false;
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'Mã OTP phải có 6 chữ số';
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Hàm xử lý gửi email để nhận mã OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', {
        email
      });

      setStep('otp');
      toast.success('Mã OTP đã được gửi đến email của bạn!');
    } catch (error) {
      if (error.response?.data) {
        const { message } = error.response.data;
        if (message.includes('email')) {
          setErrors(prev => ({ ...prev, email: message }));
        } else {
          toast.error(message);
        }
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
    
    if (!validateResetPassword()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });

      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/login');
    } catch (error) {
      if (error.response?.data) {
        const { message } = error.response.data;
        if (message.includes('OTP')) {
          setErrors(prev => ({ ...prev, otp: message }));
        } else {
          toast.error(message);
        }
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
        return (
          <form className="mt-8 space-y-6 animate-fade-in" onSubmit={handleSendOTP}>
            {/* Input nhập email */}
            <div className="relative animate-slide-up">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`h-5 w-5 transition-colors duration-200 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`pl-10 block w-full px-3 py-3 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-shake">
                  <FaTimes className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Nút gửi OTP */}
            <div className="animate-slide-up animation-delay-200">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                  theme === 'tet'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } disabled:opacity-50 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    <span className="animate-pulse">Đang gửi...</span>
                  </div>
                ) : 'Gửi mã OTP'}
              </button>
            </div>
          </form>
        );

      case 'otp':
        return (
          <form className="mt-8 space-y-6 animate-fade-in" onSubmit={handleResetPassword}>
            {/* Input nhập mã OTP */}
            <div className="relative animate-slide-up">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className={`h-5 w-5 transition-colors duration-200 ${errors.otp ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                  }}
                  className={`pl-10 block w-full px-3 py-3 border ${errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Nhập mã OTP"
                  maxLength={6}
                />
              </div>
              {errors.otp && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-shake">
                  <FaTimes className="w-4 h-4" />
                  {errors.otp}
                </p>
              )}
            </div>

            {/* Input nhập mật khẩu mới */}
            <div className="relative animate-slide-up animation-delay-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 transition-colors duration-200 ${errors.newPassword ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  className={`pl-10 pr-12 block w-full px-3 py-3 border ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 z-10 ${errors.newPassword ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                    } transform hover:scale-110`}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-shake">
                  <FaTimes className="w-4 h-4" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Input xác nhận mật khẩu mới */}
            <div className="relative animate-slide-up animation-delay-400">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 transition-colors duration-200 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`pl-10 pr-12 block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Xác nhận mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 z-10 ${errors.confirmPassword ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                    } transform hover:scale-110`}
                  title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-shake">
                  <FaTimes className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Nút đặt lại mật khẩu */}
            <div className="animate-slide-up animation-delay-600">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                  theme === 'tet'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } disabled:opacity-50 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    <span className="animate-pulse">Đang xử lý...</span>
                  </div>
                ) : 'Đặt lại mật khẩu'}
              </button>
            </div>

            {/* Nút gửi lại mã OTP */}
            <div className="text-center animate-slide-up animation-delay-800">
              <button
                type="button"
                onClick={() => setStep('email')}
                className={`font-medium transition-all duration-200 ${
                  theme === 'tet'
                    ? 'text-red-600 hover:text-red-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                } transform hover:translate-x-1`}
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
      {/* Các vòng tròn trang trí với hiệu ứng blur và animation mượt mà */}
      <div className={`absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow ${
        theme === 'tet' ? 'bg-red-200' : 'bg-purple-200'
      }`}></div>
      <div className={`absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-2000 ${
        theme === 'tet' ? 'bg-orange-200' : 'bg-yellow-200'
      }`}></div>
      <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-4000 ${
        theme === 'tet' ? 'bg-yellow-200' : 'bg-pink-200'
      }`}></div>

      {/* Form container với hiệu ứng hover và shadow */}
      <div className="max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative z-10 transform transition-all duration-300 hover:shadow-3xl">
        <div className="animate-fade-in">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2 animate-slide-down">
            Quên mật khẩu?
          </h2>
          <p className="text-center text-gray-600 animate-slide-down animation-delay-200">
            {step === 'email' 
              ? 'Nhập email của bạn để nhận mã OTP'
              : 'Nhập mã OTP và mật khẩu mới của bạn'
            }
          </p>
        </div>

        {/* Render form tương ứng với bước hiện tại */}
        {renderForm()}

        <div className="text-center animate-slide-up animation-delay-1000">
          <Link
            to="/login"
            className={`font-medium transition-all duration-200 ${
              theme === 'tet'
                ? 'text-red-600 hover:text-red-500'
                : 'text-indigo-600 hover:text-indigo-500'
            } transform hover:translate-x-1`}
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
