import React from "react";

// SizeTooltip.jsx - Component hiển thị tooltip cho size sản phẩm

// Props:
// - isVisible: Boolean - Trạng thái hiển thị của tooltip
// - stock: Number - Số lượng tồn kho của size
// - colorName: String - Tên màu sắc đang được chọn
// - theme: String - Theme hiện tại ('tet' hoặc 'normal')
const SizeTooltip = ({
  isVisible,
  stock,
  colorName,
  theme = "normal", // Mặc định là theme normal
}) => {
  return (
    // Container chính của tooltip
    <div
      // Áp dụng các class động dựa trên props
      className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white rounded-lg whitespace-nowrap transition-all ${
        // Thay đổi màu nền dựa trên tình trạng stock và theme
        stock > 0
          ? theme === "tet"
            ? "bg-red-500" // Theme Tết và còn hàng
            : "bg-blue-500" // Theme thường và còn hàng
          : "bg-gray-700" // Hết hàng
        } 
        ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}
      `}
      // Ngăn chặn sự kiện click lan truyền
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Nội dung tooltip */}
      <div
        className="font-medium"
        // Ngăn chặn sự kiện click lan truyền
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Hiển thị thông tin tồn kho */}
        {stock > 0 ? (
          <>
            Còn {stock} sản phẩm
            {/* Hiển thị tên màu */}
            <div className="text-xs opacity-75 mt-0.5">{colorName}</div>
          </>
        ) : (
          <>
            Hết hàng
            {/* Hiển thị tên màu */}
            <div className="text-xs opacity-75 mt-0.5">{colorName}</div>
          </>
        )}
      </div>

      {/* Mũi tên chỉ xuống của tooltip */}
      <div
        className={`
        absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
          // Thay đổi màu mũi tên theo tình trạng stock và theme
          stock > 0
            ? theme === "tet"
              ? "border-t-red-500" // Theme Tết và còn hàng
              : "border-t-blue-500" // Theme thường và còn hàng
            : "border-t-gray-700" // Hết hàng
          }
      `}
      ></div>
    </div>
  );
};

export default SizeTooltip;
