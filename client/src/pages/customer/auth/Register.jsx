// Register.jsx - Trang đăng ký tài khoản khách hàng
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
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

  // Hàm xử lý khi người dùng thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm xử lý khi submit form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Kiểm tra mật khẩu xác nhận có trùng khớp không
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không trùng khớp!');
      setLoading(false);
      return;
    }

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
      if (error.response) {
        toast.error(error.response.data.message);
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

      {/* Container chính chứa form đăng ký */}
      <div className="max-w-4xl w-full flex rounded-2xl shadow-2xl bg-white/80 backdrop-blur-sm relative z-10">
        {/* Phần bên trái - Form đăng ký */}
        <div className="w-full lg:w-1/2 p-8">
          {/* Tiêu đề form */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h2>
            <p className="text-gray-600">Nhập thông tin để tạo tài khoản mới</p>
          </div>

          {/* Form đăng ký */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input họ tên */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                value={formData.fullname}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Họ và tên"
              />
            </div>

            {/* Input email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Email"
              />
            </div>

            {/* Input số điện thoại */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Số điện thoại"
              />
            </div>

            {/* Radio buttons chọn giới tính */}
            <div className="grid grid-cols-2 gap-4">
              {/* Option Nam */}
              <label className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
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
              <label className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Mật khẩu"
              />
              {/* Nút ẩn/hiện mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Input xác nhận mật khẩu */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
                  theme === 'tet'
                    ? 'focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                } focus:border-transparent bg-white/60`}
                placeholder="Xác nhận mật khẩu"
              />
              {/* Nút ẩn/hiện mật khẩu xác nhận */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Nút đăng ký */}
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
              } disabled:opacity-50 transform transition-transform duration-200 hover:scale-[1.02]`}
            >
              {/* Hiển thị loading spinner hoặc text tùy trạng thái */}
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng ký...
                </div>
              ) : 'Đăng ký'}
            </button>

            {/* Link chuyển đến trang đăng nhập */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className={`font-medium hover:opacity-80 ${
                  theme === 'tet'
                    ? 'text-red-600 hover:text-red-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}>
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Phần bên phải - Hình ảnh và thông tin (ẩn trên mobile) */}
        <div className={`hidden lg:block w-1/2 p-12 rounded-r-2xl relative overflow-hidden ${
          theme === 'tet'
            ? 'bg-gradient-to-br from-red-600 to-orange-600'
            : 'bg-gradient-to-br from-indigo-600 to-purple-600'
        }`}>
          {/* Lớp overlay gradient */}
          <div className={`absolute inset-0 ${
            theme === 'tet'
              ? 'bg-gradient-to-br from-red-600/90 to-orange-600/90'
              : 'bg-gradient-to-br from-indigo-600/90 to-purple-600/90'
          }`}></div>

          {/* Nội dung bên phải */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Phần tiêu đề và mô tả */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                {theme === 'tet' ? 'Chào Mừng Năm Mới!' : 'Chào mừng bạn đến với KTT Store!'}
              </h2>
              <p className={`${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'} mb-8`}>
                Đăng ký để trở thành thành viên và nhận nhiều ưu đãi hấp dẫn
              </p>
            </div>

            {/* Danh sách các ưu đãi */}
            <div className="space-y-4">
              {/* Ưu đãi 1 - Tích điểm */}
              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                }`}>
                  ✓
                </span>
                <span>Tích điểm với mỗi đơn hàng</span>
              </div>

              {/* Ưu đãi 2 - Cập nhật xu hướng */}
              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                }`}>
                  ✓
                </span>
                <span>Cập nhật xu hướng thời trang mới nhất</span>
              </div>

              {/* Ưu đãi 3 - Ưu đãi sinh nhật */}
              <div className={`flex items-center ${theme === 'tet' ? 'text-orange-100' : 'text-indigo-100'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  theme === 'tet' ? 'bg-orange-500/30' : 'bg-indigo-500/30'
                }`}>
                  ✓
                </span>
                <span>Ưu đãi sinh nhật đặc biệt</span>
              </div>
            </div>
          </div>

          {/* Họa tiết trang trí */}
          <div className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2">
            <div className={`w-64 h-64 border-8 rounded-full ${
              theme === 'tet' ? 'border-orange-400/30' : 'border-indigo-400/30'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
