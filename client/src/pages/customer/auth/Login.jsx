// Login.jsx - Trang đăng nhập
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaEnvelope, FaLock, FaSpinner, FaGamepad, FaTimes, FaCheck } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { FcGoogle } from "react-icons/fc";
import axiosInstance from '../../../utils/axios'
import { useTheme } from '../../../contexts/CustomerThemeContext'
import { useGoogleLogin } from '@react-oauth/google'

const Login = () => {
  // Khởi tạo các state cần thiết cho form đăng nhập
  const [formData, setFormData] = useState({
    email: '', // Email đăng nhập
    password: '', // Mật khẩu
    rememberMe: true // Tùy chọn ghi nhớ đăng nhập
  })
  const [showPassword, setShowPassword] = useState(false) // State để ẩn/hiện mật khẩu
  const [loading, setLoading] = useState(false) // State xử lý trạng thái loading
  const navigate = useNavigate() // Hook điều hướng
  const { theme } = useTheme() // Lấy theme từ context

  // Thêm state errors để quản lý lỗi validation
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Hàm xử lý khi người dùng thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Xử lý riêng cho input type checkbox
    }))
  }

  // Hàm validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Hàm xử lý khi submit form đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form trước khi gửi request
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Gọi API đăng nhập
      const response = await axiosInstance.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;

      // Reset errors nếu đăng nhập thành công
      setErrors({
        email: '',
        password: ''
      });

      // Xử lý phân quyền và lưu thông tin đăng nhập
      if (user.role === 'admin') {
        // Nếu là admin
        if (formData.rememberMe) {
          // Nếu chọn ghi nhớ đăng nhập thì lưu vào localStorage
          localStorage.setItem('adminToken', token)
          localStorage.setItem('adminInfo', JSON.stringify({
            userID: user.userID,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            role: 'admin'
          }))
          localStorage.setItem('role', 'admin')
        } else {
          // Nếu không chọn ghi nhớ đăng nhập thì lưu vào sessionStorage (sẽ mất khi đóng tab/trình duyệt)
          sessionStorage.setItem('adminToken', token)
          sessionStorage.setItem('adminInfo', JSON.stringify({
            userID: user.userID,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            role: 'admin'
          }))
          sessionStorage.setItem('role', 'admin')
        }
        navigate('/admin/dashboard') // Chuyển đến trang quản trị
      } else {
        // Nếu là khách hàng
        if (formData.rememberMe) {
          // Nếu chọn ghi nhớ đăng nhập thì lưu vào localStorage
          localStorage.setItem('customerToken', token)
          localStorage.setItem('customerInfo', JSON.stringify({
            userID: user.userID,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            gender: user.gender
          }))
        } else {
          // Nếu không chọn ghi nhớ đăng nhập thì lưu vào sessionStorage
          sessionStorage.setItem('customerToken', token)
          sessionStorage.setItem('customerInfo', JSON.stringify({
            userID: user.userID,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            gender: user.gender
          }))
        }
        // Kích hoạt sự kiện thay đổi trạng thái đăng nhập
        window.dispatchEvent(new Event('authChange'))
        navigate('/') // Chuyển về trang chủ
      }

      toast.success('Đăng nhập thành công!');

    } catch (error) {
      // Xử lý các loại lỗi khác nhau
      const newErrors = {
        email: '',
        password: ''
      };

      if (error.response?.data) {
        const { message, attemptsLeft } = error.response.data;

        // Nếu là lỗi đăng nhập sai
        if (attemptsLeft !== undefined) {
          newErrors.email = 'Email hoặc mật khẩu không đúng';
          newErrors.password = `Còn ${attemptsLeft} lần thử trước khi tài khoản bị khóa`;
        }
        // Nếu tài khoản bị khóa
        else if (message.includes('Tài khoản đang bị khóa')) {
          newErrors.password = message;
        }
        // Nếu tài khoản bị vô hiệu hóa
        else if (message.includes('Tài khoản đã bị vô hiệu hóa')) {
          newErrors.email = message;
        }
        // Các lỗi khác
        else {
          newErrors.password = message;
        }
      } else {
        newErrors.password = 'Có lỗi xảy ra, vui lòng thử lại sau';
      }

      // Cập nhật errors state một lần duy nhất
      setErrors(newErrors);

      // Hiển thị toast thông báo
      toast.error(error.response?.data.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý đăng nhập Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setLoading(true);
        // Gọi API để xác thực với backend
        const result = await axiosInstance.post('/api/auth/google-login', {
          access_token: response.access_token,
        });

        const { token, user } = result.data;

        // Xử lý đăng nhập thành công
        if (user.role === 'admin') {
          if (formData.rememberMe) {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminInfo', JSON.stringify(user));
            localStorage.setItem('role', 'admin');
          } else {
            sessionStorage.setItem('adminToken', token);
            sessionStorage.setItem('adminInfo', JSON.stringify(user));
            sessionStorage.setItem('role', 'admin');
          }
          navigate('/admin/dashboard');
        } else {
          if (formData.rememberMe) {
            localStorage.setItem('customerToken', token);
            localStorage.setItem('customerInfo', JSON.stringify(user));
          } else {
            sessionStorage.setItem('customerToken', token);
            sessionStorage.setItem('customerInfo', JSON.stringify(user));
          }
          window.dispatchEvent(new Event('authChange'));
          navigate('/');
        }

        toast.success('Đăng nhập thành công!');
      } catch (error) {
        console.error('Lỗi đăng nhập Google:', error);
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.error ||
          'Đăng nhập Google thất bại';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Lỗi OAuth Google:', error);
      toast.error('Không thể kết nối với Google. Vui lòng thử lại sau.');
    }
  });

  return (
    // Container chính với gradient background theo theme
    <div className={`min-h-screen ${theme === 'tet'
        ? 'bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100'
        : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'
      } flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      {/* Các vòng tròn trang trí với hiệu ứng blur */}
      <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${theme === 'tet' ? 'bg-red-200' : 'bg-purple-200'
        }`}></div>
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${theme === 'tet' ? 'bg-orange-200' : 'bg-yellow-200'
        }`}></div>
      <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${theme === 'tet' ? 'bg-yellow-200' : 'bg-pink-200'
        }`}></div>

      {/* Container chính chứa form đăng nhập */}
      <div className="max-w-4xl w-full flex rounded-2xl shadow-2xl bg-white/80 backdrop-blur-sm relative z-10">
        {/* Phần bên trái - Hình ảnh và thông tin (ẩn trên mobile) */}
        <div className={`hidden lg:block w-1/2 p-12 rounded-l-2xl relative overflow-hidden ${theme === 'tet'
            ? 'bg-gradient-to-br from-red-600 to-orange-600'
            : 'bg-gradient-to-br from-indigo-600 to-purple-600'
          }`}>
          {/* Lớp overlay gradient */}
          <div className={`absolute inset-0 ${theme === 'tet'
              ? 'bg-gradient-to-br from-red-600/90 to-orange-600/90'
              : 'bg-gradient-to-br from-indigo-600/90 to-purple-600/90'
            }`}></div>

          {/* Nội dung bên trái */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Phần tiêu đề và mô tả */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                {theme === 'tet' ? 'Chào Mừng Năm Mới!' : 'Chào mừng trở lại!'}
              </h2>
              <p className={`${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'} mb-8`}>
                Đăng nhập để tiếp tục mua sắm và nhận nhiều ưu đãi hấp dẫn
              </p>
            </div>

            {/* Danh sách các ưu đãi */}
            <div className="space-y-4">
              {/* Ưu đãi 1 - Miễn phí vận chuyển */}
              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                  }`}>
                  ✓
                </span>
                <span>Miễn phí vận chuyển cho đơn hàng từ 500K</span>
              </div>

              {/* Ưu đãi 2 - Tích điểm */}
              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                  }`}>
                  ✓
                </span>
                <span>Tích điểm đổi quà hấp dẫn</span>
              </div>

              {/* Ưu đãi 3 - Ưu đãi thành viên */}
              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                  }`}>
                  ✓
                </span>
                <span>Ưu đãi độc quyền cho thành viên</span>
              </div>
            </div>
          </div>

          {/* Họa tiết trang trí */}
          <div className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2">
            <div className={`w-64 h-64 border-8 rounded-full ${theme === 'tet' ? 'border-orange-400/30' : 'border-indigo-400/30'
              }`}></div>
          </div>
        </div>

        {/* Phần bên phải - Form đăng nhập */}
        <div className="w-full lg:w-1/2 p-8">
          {/* Tiêu đề form */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
            <p className="text-gray-600">Nhập thông tin tài khoản của bạn</p>
          </div>

          {/* Form đăng nhập */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <FaEnvelope className="h-5 w-5 text-gray-400 transform translate-y-0.5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <FaTimes className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Input mật khẩu */}
            <div className="relative">
              {/* Icon khóa */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 ">
                <FaLock className="h-5 w-5 text-gray-400 transform translate-y-0.5" />
              </div>

              {/* Input field */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-12 block w-full px-3 py-3 border ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${theme === 'tet'
                      ? 'focus:ring-red-500/50'
                      : 'focus:ring-indigo-500/50'
                    } focus:border-transparent bg-white/60 transition-all duration-200`}
                  placeholder="Mật khẩu"
                  autoComplete="current-password"
                />

                {/* Nút hiện/ẩn mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 z-10 ${errors.password ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 transform translate-y-0.5" />
                  ) : (
                    <FaEye className="h-5 w-5 transform translate-y-0.5" />
                  )}
                </button>
              </div>

              {/* Thông báo lỗi */}
              {errors.password && (
                <div className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5 animate-slideDown">
                  <FaTimes className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{errors.password}</span>
                </div>
              )}
            </div>

            {/* Phần ghi nhớ đăng nhập và quên mật khẩu */}
            <div className="flex items-center justify-between">
              {/* Checkbox ghi nhớ đăng nhập */}
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className={`h-4 w-4 focus:ring-offset-2 border-gray-300 rounded ${theme === 'tet'
                      ? 'text-red-600 focus:ring-red-500'
                      : 'text-indigo-600 focus:ring-indigo-500'
                    }`}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Link quên mật khẩu */}
              <div className="text-sm">
                <Link to="/forgot-password" className={`font-medium hover:opacity-80 ${theme === 'tet'
                    ? 'text-red-600 hover:text-red-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                  }`}>
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${theme === 'tet'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'tet'
                  ? 'focus:ring-red-500'
                  : 'focus:ring-indigo-500'
                } disabled:opacity-50 transform transition-transform duration-200 hover:scale-[1.02]`}
            >
              {/* Hiển thị loading spinner khi đang xử lý */}
              {loading ? (
                <div className="flex items-center">
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Đang đăng nhập...
                </div>
              ) : 'Đăng nhập'}
            </button>

            {/* Link đăng ký tài khoản mới */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className={`font-medium hover:opacity-80 ${theme === 'tet'
                    ? 'text-red-600 hover:text-red-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                  }`}>
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </form>

          {/* Sau nút đăng nhập thông thường, thêm phần sau */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FcGoogle className="w-5 h-5 text-red-500" />
                Đăng nhập với Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login
