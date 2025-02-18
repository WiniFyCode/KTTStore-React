import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiUsers, FiPackage, FiShoppingCart, FiSettings, FiSun, FiMoon, FiLogOut, FiTag, FiBell } from 'react-icons/fi';
import { BsShop } from 'react-icons/bs';

// Danh sách các mục menu trong sidebar
const menuItems = [
   {
      title: 'Tổng quan', // Trang tổng quan hệ thống
      icon: <BsShop />,
      path: '/admin/dashboard'
   },
   {
      title: 'Quản lý khách hàng', // Quản lý thông tin khách hàng
      icon: <FiUsers />,
      path: '/admin/customers'
   },
   {
      title: 'Quản lý sản phẩm', // Quản lý danh sách sản phẩm
      icon: <FiPackage />,
      path: '/admin/products'
   },
   {
      title: 'Quản lý đơn hàng', // Quản lý đơn đặt hàng
      icon: <FiShoppingCart />,
      path: '/admin/orders'
   },
   {
      title: 'Quản lý mã giảm giá', // Quản lý mã giảm giá
      icon: <FiTag />,
      path: '/admin/coupons'
   },
   {
      title: 'Quản lý khuyến mãi', // Quản lý khuyến mãi
      icon: <FiTag />,
      path: '/admin/promotions'
   },
   {
      title: 'Quản lý thông báo', // Quản lý thông báo hệ thống
      icon: <FiBell />,
      path: '/admin/notifications'
   },
   {
      title: 'Cài đặt hệ thống', // Thiết lập cấu hình hệ thống
      icon: <FiSettings />,
      path: '/admin/settings'
   }
];

const Sidebar = ({ isDarkMode, toggleTheme, handleLogout }) => {
   // Hook lấy thông tin về route hiện tại
   const location = useLocation();

   return (
      <div className={`w-64 h-screen fixed left-0 top-0 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'
         } shadow-lg transition-colors duration-200`}>
         {/* Logo và tên cửa hàng */}
         <div className="flex items-center justify-center h-20 border-b">
            <Link to="/admin/dashboard" className="flex items-center">
               <div className="logo-container flex items-center">
                  <BsShop className="logo-icon text-4xl" />
                  <h1 className="text-4xl font-bold text-center logo-text ml-2">
                     KTT STORE
                  </h1>
                  <div className="logo-shine" />
               </div>
            </Link>
         </div>

         {/* Danh sách menu */}
         <nav className="mt-6">
            {menuItems.map((item, index) => {
               // Kiểm tra xem menu có đang được chọn không
               const isActive = location.pathname === item.path;
               return (
                  <Link
                     key={index}
                     to={item.path}
                     className={`flex items-center px-6 py-3 ${isActive
                           ? isDarkMode
                              ? 'bg-green-600 text-white'
                              : 'bg-green-500 text-white'
                           : isDarkMode
                              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        } transition-colors duration-200`}
                  >
                     <span className={`text-xl ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                     <span className="ml-4">{item.title}</span>
                  </Link>
               );
            })}
         </nav>

         {/* Phần cuối sidebar */}
         <div className="absolute bottom-0 w-full p-4 border-t">
            {/* Nút chuyển đổi theme sáng/tối */}
            <button
               onClick={toggleTheme}
               className={`flex items-center w-full px-4 py-2 rounded-md ${isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
                  } transition-colors duration-200`}
            >
               {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
               <span className="ml-4">
                  {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
               </span>
            </button>

            {/* Nút đăng xuất */}
            <button
               onClick={handleLogout}
               className={`flex items-center w-full px-4 py-2 mt-2 rounded-md ${isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
                  } transition-colors duration-200`}
            >
               <FiLogOut className="text-xl" />
               <span className="ml-4">Đăng xuất</span>
            </button>
         </div>
      </div>
   );
};

export default Sidebar;