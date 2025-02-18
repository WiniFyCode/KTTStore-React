// ProductThumbnails.jsx - Component hiển thị các ảnh thumbnail của sản phẩm
import React from 'react';

// Props:
// - images: Array - Mảng chứa đường dẫn các hình ảnh thumbnail
// - productID: String/Number - ID của sản phẩm
// - productName: String - Tên sản phẩm (dùng cho alt của ảnh)
// - selectedImages: Object - Object lưu trữ thông tin ảnh đang được chọn
// - theme: String - Theme hiện tại ('tet' hoặc 'normal', mặc định là 'normal')
// - onThumbnailClick: Function - Hàm xử lý khi click vào thumbnail
const ProductThumbnails = ({ 
  images, 
  productID, 
  productName,
  selectedImages,
  theme = 'normal',
  onThumbnailClick 
}) => {
  return (
    // Container chính của thumbnails
    <div
      // Styling cho container
      className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
      // Ngăn chặn sự kiện click lan truyền lên Link container
      onClick={e => e.preventDefault()} 
    >
      {/* Hiển thị tối đa 4 thumbnail */}
      {images.slice(0, 4).map((image, index) => (
        <div
          key={index}
          // Xử lý click vào thumbnail
          onClick={(e) => onThumbnailClick(e, productID, index)}
          // Styling cho từng thumbnail container
          className={`
            w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
              // Thêm hiệu ứng viền khi thumbnail được chọn
              selectedImages[productID]?.imageIndex === index
                ? 'border-2 border-white ring-2 ring-offset-2 ' + 
                  (theme === 'tet' ? 'ring-red-500' : 'ring-blue-500')
                : 'border-2 border-white hover:border-gray-300'
            }
          `}
        >
          {/* Hình ảnh thumbnail */}
          <img
            src={image}
            alt={`${productName} - ${index + 1}`}
            className="w-full h-full object-cover"
            // Ngăn chặn sự kiện click lan truyền từ img
            onClick={e => e.preventDefault()} 
          />
        </div>
      ))}
    </div>
  );
};

export default ProductThumbnails; 