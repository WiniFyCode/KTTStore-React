// Pagination.jsx - Component phân trang đơn giản và dễ tái sử dụng
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Props:
// - currentPage: Number - Trang hiện tại đang được chọn
// - totalPages: Number - Tổng số trang
// - onPageChange: Function - Hàm callback khi người dùng chuyển trang
// - theme: String - Theme màu sắc (default, pink, red, blue, gray)
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  theme = 'default' 
}) => {
  // Nếu chỉ có 1 trang thì không hiển thị pagination
  if (totalPages <= 1) return null;

  // Hàm lấy màu sắc dựa theo theme
  const getThemeColor = () => {
    const themeColors = {
      pink: 'bg-pink-500',
      red: 'bg-red-500', 
      blue: 'bg-blue-500',
      gray: 'bg-gray-500',
      default: 'bg-gray-900'
    };
    return themeColors[theme] || themeColors.default;
  };

  // Hàm tạo mảng số trang cần hiển thị
  const getPageNumbers = () => {
    const pages = [];
    
    // Luôn hiển thị trang đầu
    pages.push(1);
    
    // Thêm dấu ... nếu khoảng cách từ đầu > 2 trang
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Thêm các trang xung quanh trang hiện tại
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Thêm dấu ... nếu khoảng cách đến cuối > 2 trang
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Luôn hiển thị trang cuối
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    // Container chính của pagination
    <div className="flex items-center justify-center mt-8">
      {/* Navigation bar */}
      <nav className="inline-flex items-center bg-white rounded-lg shadow-sm">
        {/* Nút Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center h-10 px-4 border-r ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'  // Style khi disabled
              : 'text-gray-700 hover:bg-gray-100'   // Style khi active
          }`}
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>

        {/* Các nút số trang */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              // Hiển thị dấu ...
              <span className="flex items-center justify-center h-10 px-4 text-gray-400 border-r">
                ...
              </span>
            ) : (
              // Hiển thị nút số trang
              <button
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center h-10 w-10 text-sm font-medium border-r transition-colors ${
                  currentPage === page
                    ? `${getThemeColor()} text-white`  // Style cho trang hiện tại
                    : 'text-gray-700 hover:bg-gray-100' // Style cho các trang khác
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Nút Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center h-10 px-4 ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'  // Style khi disabled
              : 'text-gray-700 hover:bg-gray-100'   // Style khi active
          }`}
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;