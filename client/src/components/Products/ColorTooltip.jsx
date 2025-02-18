// ColorTooltip.jsx - Component hiển thị tooltip cho màu sắc sản phẩm
import React from 'react';

// Props:
// - isVisible: Boolean - Trạng thái hiển thị của tooltip (true: hiện, false: ẩn)
// - colorName: String - Tên màu sắc cần hiển thị
// - theme: String - Theme hiện tại ('tet' hoặc 'normal', mặc định là 'normal')
const ColorTooltip = ({ 
  isVisible, 
  colorName,
  theme = 'normal' // Giá trị mặc định cho theme
}) => {
  return (
    // Container chính của tooltip
    <div 
      // Áp dụng các class động dựa trên props
      className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded transition-all ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      // Ngăn chặn sự kiện click lan truyền
      onClick={(e) => {
        e.preventDefault();    // Ngăn chặn hành vi mặc định
        e.stopPropagation();  // Ngăn chặn sự kiện lan truyền
      }}
    >
      {/* Hiển thị tên màu sắc */}
      {colorName}
    </div>
  );
};

export default ColorTooltip;