// NotFound.jsx - Trang 404 Not Found
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaShoppingBag, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Hình ảnh 404 */}
        <div className="relative">
          {/* Background circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-red-100 rounded-full opacity-50 animate-ping delay-150"></div>
          </div>
          
          {/* 404 Text */}
          <div className="relative z-10">
            <h1 className="text-[150px] font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-600 leading-none select-none">
              404
            </h1>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
            <div className="w-16 h-16 bg-yellow-100 rounded-full opacity-50 animate-bounce delay-300"></div>
          </div>
          <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2">
            <div className="w-16 h-16 bg-green-100 rounded-full opacity-50 animate-bounce delay-500"></div>
          </div>
        </div>

        {/* Thông báo lỗi */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">
            Oops! Trang không tồn tại
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến một địa chỉ khác.
          </p>
        </div>

        {/* Gợi ý */}
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bạn có thể thử:
          </h3>
          <ul className="space-y-3 text-left">
            <li className="flex items-center text-gray-600">
              <FaSearch className="w-5 h-5 mr-3 text-blue-500" />
              Kiểm tra lại đường dẫn URL
            </li>
            <li className="flex items-center text-gray-600">
              <FaShoppingBag className="w-5 h-5 mr-3 text-green-500" />
              Khám phá các sản phẩm mới
            </li>
            <li className="flex items-center text-gray-600">
              <FaHome className="w-5 h-5 mr-3 text-red-500" />
              Quay về trang chủ
            </li>
          </ul>
        </div>

        {/* Các nút điều hướng */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center px-8 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 w-full sm:w-auto"
          >
            <FaHome className="mr-2" />
            Về trang chủ
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center px-8 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 w-full sm:w-auto"
          >
            <FaShoppingBag className="mr-2" />
            Xem sản phẩm
          </Link>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          Nếu bạn cho rằng đây là lỗi, vui lòng{' '}
          <Link to="/support" className="font-medium text-blue-600 hover:text-blue-500 underline">
            liên hệ với chúng tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
