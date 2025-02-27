// Register.jsx - Trang đăng ký tài khoản khách hàng
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axios';
import { useTheme } from '../../../contexts/CustomerThemeContext';

const Register = () => {
  // Lấy theme từ context để áp dụng giao diện
  const { theme } = useTheme();
  // Hook điều hướng trang
  const navigate = useNavigate();
  // State quản lý trạng thái loading khi đăng ký
  const [loading, setLoading] = useState(false);
  // State quản lý hiển thị/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State quản lý dữ liệu form đăng ký
  const [formData, setFormData] = useState({
    fullname: '', // Họ tên người dùng
    email: '', // Email đăng ký
    password: '', // Mật khẩu
    confirmPassword: '', // Xác nhận mật khẩu
    phone: '', // Số điện thoại
    gender: 'male' // Giới tính, mặc định là nam
  });

  // Thêm state quản lý lỗi validation
  const [errors, setErrors] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  // Hàm validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    };

    // Validate họ tên
    if (!formData.fullname) {
      newErrors.fullname = 'Vui lòng nhập họ tên';
      isValid = false;
    } else if (formData.fullname.length < 2) {
      newErrors.fullname = 'Họ tên phải có ít nhất 2 ký tự';
      isValid = false;
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate số điện thoại
    if (!formData.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    // Validate mật khẩu
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    // Validate xác nhận mật khẩu
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Hàm xử lý khi người dùng thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset lỗi khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Hàm xử lý khi submit form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form trước khi gửi request
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Gọi API đăng ký tài khoản
      const response = await axiosInstance.post('/api/auth/register', {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender
      });

      // Thông báo đăng ký thành công và chuyển hướng đến trang đăng nhập
      toast.success('Đăng ký thành công!');
      navigate('/login');
    } catch (error) {
      // Xử lý các trường hợp lỗi
      if (error.response?.data) {
        const { message } = error.response.data;
        // Xử lý các lỗi cụ thể từ server
        if (message.includes('email')) {
          setErrors(prev => ({ ...prev, email: message }));
        } else if (message.includes('số điện thoại')) {
          setErrors(prev => ({ ...prev, phone: message }));
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

      {/* Container chính với hiệu ứng hover và shadow */}
      <div className="max-w-4xl w-full flex rounded-2xl shadow-2xl bg-white/80 backdrop-blur-sm relative z-10 transform transition-all duration-300 hover:shadow-3xl">
        {/* Phần bên trái - Form đăng ký */}
        <div className="w-full lg:w-1/2 p-8 animate-fade-in">
          {/* Tiêu đề form */}
          <div className="text-center mb-8 animate-slide-down">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h2>
            <p className="text-gray-600">Nhập thông tin để tạo tài khoản mới</p>
          </div>

          {/* Form đăng ký */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input họ tên */}
            <div className="relative animate-slide-up animation-delay-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className={`h-5 w-5 transition-colors duration-200 ${errors.fullname ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={handleChange}
                  className={`pl-10 block w-full px-3 py-3 border ${errors.fullname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Họ và tên"
                />
              </div>
              {errors.fullname && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-shake">
                  <FaTimes className="w-4 h-4" />
                  {errors.fullname}
                </p>
              )}
            </div>

            {/* Input email */}
            <div className="relative animate-slide-up animation-delay-400">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`h-5 w-5 transition-colors duration-200 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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

            {/* Input số điện thoại */}
            <div className="relative animate-slide-up animation-delay-600">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className={`h-5 w-5 transition-colors duration-200 ${errors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`pl-10 block w-full px-3 py-3 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Số điện thoại"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-shake">
                  <FaTimes className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Radio buttons chọn giới tính với animation */}
            <div className="grid grid-cols-2 gap-4 animate-slide-up animation-delay-800">
              {/* Option Nam */}
              <label className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                formData.gender === 'male'
                  ? theme === 'tet'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-indigo-500 text-white border-indigo-500'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span>Nam</span>
              </label>
              {/* Option Nữ */}
              <label className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                formData.gender === 'female'
                  ? theme === 'tet'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-indigo-500 text-white border-indigo-500'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span>Nữ</span>
              </label>
            </div>

            {/* Input mật khẩu */}
            <div className="relative animate-slide-up animation-delay-800">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 transition-colors duration-200 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-12 block w-full px-3 py-3 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 z-10 ${errors.password ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-shake">
                  <FaTimes className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Input xác nhận mật khẩu */}
            <div className="relative animate-slide-up animation-delay-1000">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 transition-colors duration-200 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-12 block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                    theme === 'tet'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-indigo-500'
                  } focus:border-transparent bg-white/60 transition-all duration-200 transform hover:translate-y-[-1px]`}
                  placeholder="Xác nhận mật khẩu"
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

            {/* Nút đăng ký với hiệu ứng loading và hover */}
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
              } disabled:opacity-50 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-slide-up animation-delay-1400`}
            >
              {loading ? (
                <div className="flex items-center">
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  <span className="animate-pulse">Đang đăng ký...</span>
                </div>
              ) : 'Đăng ký'}
            </button>

            {/* Link đăng nhập */}
            <div className="text-center mt-4 animate-slide-up animation-delay-1600">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link 
                  to="/login" 
                  className={`font-medium transition-all duration-200 ${
                    theme === 'tet'
                      ? 'text-red-600 hover:text-red-500'
                      : 'text-indigo-600 hover:text-indigo-500'
                  } transform hover:translate-x-1`}
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Phần bên phải - Thông tin và ưu đãi */}
        <div className={`hidden lg:block w-1/2 p-12 rounded-r-2xl relative overflow-hidden ${
          theme === 'tet'
            ? 'bg-gradient-to-br from-red-600 to-orange-600'
            : 'bg-gradient-to-br from-indigo-600 to-purple-600'
        }`}>
          {/* Lớp overlay gradient với animation */}
          <div className={`absolute inset-0 ${
            theme === 'tet'
              ? 'bg-gradient-to-br from-red-600/90 to-orange-600/90'
              : 'bg-gradient-to-br from-indigo-600/90 to-purple-600/90'
          } animate-gradient`}></div>

          {/* Nội dung bên phải với animation */}
          <div className="relative z-10 h-full flex flex-col justify-between animate-fade-in">
            {/* Phần tiêu đề và mô tả */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 animate-slide-down">
                {theme === 'tet' ? 'Chào Mừng Năm Mới!' : 'Chào mừng bạn đến với KTT Store!'}
              </h2>
              <p className={`${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'} mb-8 animate-slide-down animation-delay-200`}>
                Đăng ký để trở thành thành viên và nhận nhiều ưu đãi hấp dẫn
              </p>
            </div>

            {/* Danh sách các ưu đãi với animation */}
            <div className="space-y-4">
              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'} animate-slide-up animation-delay-400`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                } transform transition-transform duration-300 hover:scale-110`}>
                  ✓
                </span>
                <span>Tích điểm với mỗi đơn hàng</span>
              </div>

              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'} animate-slide-up animation-delay-600`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                } transform transition-transform duration-300 hover:scale-110`}>
                  ✓
                </span>
                <span>Cập nhật xu hướng thời trang mới nhất</span>
              </div>

              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'} animate-slide-up animation-delay-800`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                } transform transition-transform duration-300 hover:scale-110`}>
                  ✓
                </span>
                <span>Ưu đãi sinh nhật đặc biệt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
